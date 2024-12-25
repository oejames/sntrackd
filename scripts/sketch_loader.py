# sketch_loader.py
import os
import sys
import scrapetube
import json
from datetime import datetime
from googleapiclient.discovery import build
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_logging():
    current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = f"sketch_loader_{current_time}.log"
    
    # Log to both file and console
    class Logger:
        def __init__(self, filename):
            self.terminal = sys.stdout
            self.log = open(filename, 'w', encoding='utf-8')

        def write(self, message):
            self.terminal.write(message)
            self.log.write(message)
            self.flush()

        def flush(self):
            self.terminal.flush()
            self.log.flush()

    sys.stdout = Logger(log_file)

def log_step(step_name, data=None):
    print(f"\n{'='*50}")
    print(f"🔍 STEP: {step_name}")
    print(f"⏰ TIME: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    if data:
        print(f"📋 DATA: {json.dumps(data, indent=2, ensure_ascii=False)}")
    print(f"{'='*50}\n")

def connect_to_mongodb():
    log_step("Connecting to MongoDB")
    try:
        client = MongoClient(os.getenv('MONGODB_URI'))
        db = client.snl_tracker  # or whatever your database name is
        print("✅ Successfully connected to MongoDB")
        return db
    except Exception as e:
        print(f"❌ MongoDB connection error: {str(e)}")
        raise

def method1_youtube_api():
    log_step("Starting YouTube API Method")
    
    try:
        print("🔑 Initializing YouTube API with key...")
        youtube = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))
        print("✅ YouTube API initialized successfully")

        videos = []
        next_page_token = None
        
        while True:
            log_step("Fetching next page of videos")
            try:
                # First get video IDs from search
                search_response = youtube.search().list(
                    part='snippet',
                    channelId='UCqFzWxSCi39LnW1JKFR3efg',  # SNL channel
                    maxResults=50,
                    pageToken=next_page_token,
                    type='video',
                    order='date'
                ).execute()
                
                video_ids = [item['id']['videoId'] for item in search_response['items']]
                
                # Then get detailed video info including duration
                videos_response = youtube.videos().list(
                    part=['contentDetails', 'snippet', 'statistics'],
                    id=','.join(video_ids)
                ).execute()

                # Filter out shorts (videos under 60 seconds)
                for video in videos_response['items']:
                    duration = video['contentDetails']['duration']  # Format: PT1M30S
                    # Convert duration to seconds
                    import isodate
                    duration_seconds = isodate.parse_duration(duration).total_seconds()
                    
                    if duration_seconds >= 180:  # Not a short
                        video_data = {
                            'videoId': video['id'],
                            'title': video['snippet']['title'],
                            'description': video['snippet']['description'],
                            'publishedTime': video['snippet']['publishedAt'],
                            'thumbnails': video['snippet']['thumbnails'],
                            'duration': duration,
                            'viewCount': video['statistics'].get('viewCount'),
                            'channelTitle': video['snippet']['channelTitle']
                        }
                        videos.append(video_data)
                        print(f"✅ Added video: {video_data['title']} (Duration: {duration})")
                    else:
                        print(f"⏭️ Skipped short video: {video['snippet']['title']} (Duration: {duration})")

                next_page_token = search_response.get('nextPageToken')
                if not next_page_token:
                    break

            except Exception as e:
                print(f"❌ Error during API request: {str(e)}")
                raise

        print(f"✅ Successfully fetched {len(videos)} non-short videos")
        return videos

    except Exception as e:
        print(f"❌ YouTube API method failed: {str(e)}")
        return None
    
def is_video_long_enough(duration_str):
    """
    Check if video duration is at least 3 minutes
    
    Args:
    duration_str (str): Duration in format like "6:04"
    
    Returns:
    bool: True if video is 3 minutes or longer, False otherwise
    """
    try:
        # Split the duration string into minutes and seconds
        minutes, seconds = map(int, duration_str.split(':'))
        
        # Convert to total seconds
        total_seconds = minutes * 60 + seconds
        
        # Return True if 1.5 minutes or longer
        return total_seconds >= 60
    except:
        # If parsing fails, return False
        return False
    
def method2_scrapetube():
    log_step("Starting Scrapetube Method")
    
    try:
        videos = []
        print("⏳ Initializing scrapetube scraper...")
        
        # Initialize scraper
        video_generator = scrapetube.get_channel("UCqFzWxSCi39LnW1JKFR3efg")
        
        print("✅ Scraper initialized, starting to fetch videos...")
        
        # Counter for logging
        count = 0
        filtered_count = 0
        
        for video in video_generator:
            try:
                count += 1
                if count % 10 == 0:
                    print(f"📊 Processed {count} videos so far...")

                # Check duration before processing
                duration = video['lengthText']['simpleText']
                if not is_video_long_enough(duration):
                    print(f"⏭️ Skipping short video: {video['title']['runs'][0]['text']} (Duration: {duration})")
                    continue
                
                # Extract relevant information
                video_data = {
                    'videoId': video['videoId'],  # "EWEX2jXSyFY"
                    'title': video['title']['runs'][0]['text'],  # "Poetry Class - Saturday Night Live"
                    'description': video['descriptionSnippet']['runs'][0]['text'],  # Starts with "Subscribe to SaturdayNightLive: ..."
                    'publishedTime': video['publishedTimeText']['simpleText'],  # "11 years ago"
                    'thumbnails': video['thumbnail']['thumbnails'],  # List of thumbnail objects with url, width, height
                    'duration': video['lengthText']['simpleText'],  # "6:04"
                    'viewCount': video['viewCountText']['simpleText'],  # "1,538,052 views"
                    'channelTitle': "Saturday Night Live"  # Note: This isn't directly in the JSON, so I added it manually
                }
                
                filtered_count += 1
                
                if filtered_count <= 1:  # Log first video as sample
                    print("\n📹 Sample Video Data:")
                    print(json.dumps(video_data, indent=2, ensure_ascii=False))
                    print("\n🔍 Raw Video Data (for debugging):")
                    print(json.dumps(video, indent=2, ensure_ascii=False))
                
                
                videos.append(video_data)
                
            except Exception as e:
                print(f"⚠️ Error processing video: {str(e)}")
                print(f"Raw video data: {json.dumps(video, indent=2)}")
                continue
        
        print(f"✅ Successfully scraped {len(videos)} videos")
        return videos

    except Exception as e:
        print(f"❌ Scrapetube method failed: {str(e)}")
        return None

def transform_youtube_video(video):
    """Transform YouTube API response structure to our schema"""
    try:
        print(f"\n🔄 Transforming video: {video['snippet']['title']}")
        return {
            'videoId': video['id']['videoId'],
            'title': video['snippet']['title'],
            'description': video['snippet']['description'],
            'publishedTime': video['snippet']['publishedAt'],
            'thumbnails': {
                'default': video['snippet']['thumbnails']['default']['url'],
                'medium': video['snippet']['thumbnails']['medium']['url'],
                'high': video['snippet']['thumbnails']['high']['url']
            },
            'duration': video.get('duration'),  # Added duration field
            'viewCount': int(video['statistics'].get('viewCount', 0)) if video.get('statistics') else 0,
            'channelTitle': video['snippet']['channelTitle']
        }
    except Exception as e:
        print(f"❌ Error transforming video: {str(e)}")
        print(f"Raw video data: {json.dumps(video, indent=2)}")
        return None

def method1_youtube_api():
    log_step("Starting YouTube API Method")
    
    try:
        print("🔑 Initializing YouTube API with key...")
        youtube = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))
        print("✅ YouTube API initialized successfully")

        videos = []
        next_page_token = None
        
        while True:
            log_step("Fetching next page of videos")
            try:
                # First get video IDs from search
                search_request = youtube.search().list(
                    part='snippet',
                    channelId='UCqFzWxSCi39LnW1JKFR3efg',  # SNL channel
                    maxResults=50,
                    pageToken=next_page_token,
                    type='video',
                    order='date'
                )
                
                print("⏳ Executing search API request...")
                search_response = search_request.execute()
                
                print(f"✅ Received {len(search_response['items'])} videos")
                
                # Get video IDs for content details request
                video_ids = [item['id']['videoId'] for item in search_response['items']]
                
                # Get detailed info including duration for these videos
                print("⏳ Fetching video details...")
                video_details = youtube.videos().list(
                    part=['contentDetails', 'snippet', 'statistics'],
                    id=','.join(video_ids)
                ).execute()
                
                # Create a map of video details
                video_details_map = {
                    video['id']: video for video in video_details['items']
                }
                
                # Transform videos and include duration
                transformed_videos = []
                for video in search_response['items']:
                    video_id = video['id']['videoId']
                    details = video_details_map.get(video_id)
                    
                    if details:
                        # Parse duration
                        import isodate
                        duration_str = details['contentDetails']['duration']
                        duration_seconds = int(isodate.parse_duration(duration_str).total_seconds())
                        
                        # Add duration and details to the video object before transformation
                        video['duration'] = duration_seconds
                        video['statistics'] = details['statistics']
                        
                        transformed = transform_youtube_video(video)
                        if transformed:
                            transformed_videos.append(transformed)
                
                print(f"✅ Transformed {len(transformed_videos)} videos successfully")
                if transformed_videos:
                    print("Sample transformed video:")
                    print(json.dumps(transformed_videos[0], indent=2))
                
                videos.extend(transformed_videos)
                next_page_token = search_response.get('nextPageToken')
                
                if not next_page_token:
                    print("🏁 No more pages to fetch")
                    break
                    
            except Exception as e:
                print(f"❌ Error during API request: {str(e)}")
                raise

        print(f"✅ Total videos collected: {len(videos)}")
        return videos

    except Exception as e:
        print(f"❌ YouTube API method failed: {str(e)}")
        return None


    

def save_to_mongodb(db, videos, method):
    log_step(f"Saving videos to MongoDB (Method: {method})")
    
    if not videos:
        print("⚠️ No videos to save")
        return
        
    try:
        collection = db.sketches
        saved_count = 0
        error_count = 0
        
        for video in videos:
            try:
                # Verify required fields
                if not video.get('videoId'):
                    print(f"⚠️ Skipping video without videoId: {json.dumps(video, indent=2)}")
                    error_count += 1
                    continue

                # Add metadata about the import
                video['importMethod'] = method
                video['importDate'] = datetime.now()
                
                result = collection.update_one(
                    {'videoId': video['videoId']},
                    {'$set': video},
                    upsert=True
                )
                
                if result.modified_count > 0:
                    print(f"✏️ Updated video: {video['title']}")
                    saved_count += 1
                elif result.upserted_id:
                    print(f"➕ Inserted new video: {video['title']}")
                    saved_count += 1
                    
            except Exception as e:
                print(f"❌ Error saving video {video.get('videoId', 'unknown')}: {str(e)}")
                error_count += 1
                continue
                
        print(f"✅ Finished saving videos to MongoDB")
        print(f"📊 Summary: Saved {saved_count} videos, {error_count} errors")
        
    except Exception as e:
        print(f"❌ MongoDB save operation failed: {str(e)}")

def save_to_mongodb(db, videos, method):
    log_step(f"Saving videos to MongoDB (Method: {method})")
    
    try:
        collection = db.sketches
        
        for video in videos:
            try:
                # Add metadata about the import
                video['importMethod'] = method
                video['importDate'] = datetime.now()
                
                # Use videoId as unique identifier
                result = collection.update_one(
                    {'videoId': video['videoId']},
                    {'$set': video},
                    upsert=True
                )
                
                if result.modified_count > 0:
                    print(f"✏️ Updated video: {video['title']}")
                elif result.upserted_id:
                    print(f"➕ Inserted new video: {video['title']}")
                    
            except Exception as e:
                print(f"❌ Error saving video {video.get('videoId', 'unknown')}: {str(e)}")
                continue
                
        print(f"✅ Finished saving videos to MongoDB")
        
    except Exception as e:
        print(f"❌ MongoDB save operation failed: {str(e)}")

def main():
    setup_logging()
    print("🚀 Starting SNL Sketch Loader Script")
    print(f"⏰ Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        db = connect_to_mongodb()
        
   
        # Try YouTube API method
        # print("\n📺 Attempting YouTube API Method...")
        # youtube_videos = method1_youtube_api()
        # if youtube_videos:
        #     print(f"Found {len(youtube_videos)} videos via YouTube API")
        #     save_to_mongodb(db, youtube_videos, 'youtube_api')
        # else:
        #     print("⚠️ No videos retrieved from YouTube API")
        
        # Uncomment if you want to try scrapetube as well
        print("\n🌐 Attempting Scrapetube Method...")
        scraped_videos = method2_scrapetube()
        if scraped_videos:
            save_to_mongodb(db, scraped_videos, 'scrapetube')
            
    except Exception as e:
        print(f"❌ Script failed: {str(e)}")
    finally:
        print(f"\n⏰ End Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()