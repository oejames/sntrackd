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
    
def method2_scrapetube(): ## THIS IS ONLY GETTING THE SINGLE LATEST VIDEO!!!!
    log_step("Starting Scrapetube Method - Single Latest Video")
    
    try:
        print("⏳ Initializing scrapetube scraper...")
        
        # Initialize scraper
        video_generator = scrapetube.get_channel("UCqFzWxSCi39LnW1JKFR3efg")
        
        print("✅ Scraper initialized, fetching latest video...")
        
        # We'll only process the first valid video
        for video in video_generator:
            try:
                # Check duration before processing
                duration = video['lengthText']['simpleText']
                if not is_video_long_enough(duration):
                    print(f"⏭️ Skipping short video: {video['title']['runs'][0]['text']} (Duration: {duration})")
                    continue
                
                video_id = video['videoId']
                
                # Check if video already exists in database
                existing_video = db.sketches.find_one({'videoId': video_id})
                if existing_video:
                    print(f"⏭️ Video already exists in database: {video['title']['runs'][0]['text']}")
                    return []
                
                # Extract relevant information
                video_data = {
                    'videoId': video_id,
                    'title': video['title']['runs'][0]['text'],
                    'description': video['descriptionSnippet']['runs'][0]['text'],
                    'publishedTime': video['publishedTimeText']['simpleText'],
                    'thumbnails': video['thumbnail']['thumbnails'],
                    'duration': video['lengthText']['simpleText'],
                    'viewCount': video['viewCountText']['simpleText'],
                    'channelTitle': "Saturday Night Live"
                }
                
                print(f"✅ Found new video: {video_data['title']}")
                return [video_data]  # Return list with single video
                
            except Exception as e:
                print(f"⚠️ Error processing video: {str(e)}")
                print(f"Raw video data: {json.dumps(video, indent=2)}")
                continue
        
        print("✅ No new videos found")
        return []

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



# Modify main function to use database connection in scraper
def main():
    setup_logging()
    print("🚀 Starting SNL Sketch Loader Script")
    print(f"⏰ Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        global db  # Make db global so method2_scrapetube can access it
        db = connect_to_mongodb()
        
        print("\n🌐 Checking for new latest video...")
        scraped_videos = method2_scrapetube()
        if scraped_videos and len(scraped_videos) > 0:
            save_to_mongodb(db, scraped_videos, 'scrapetube')
            print("✅ Successfully processed latest video")
        else:
            print("ℹ️ No new videos to process")
            
    except Exception as e:
        print(f"❌ Script failed: {str(e)}")
    finally:
        print(f"\n⏰ End Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()