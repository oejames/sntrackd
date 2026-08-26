import os
import sys
import json
from datetime import datetime
from googleapiclient.discovery import build
from pymongo import MongoClient
from dotenv import load_dotenv

def connect_to_mongodb():
    client = MongoClient(os.getenv('MONGODB_URI'))
    return client.snl_tracker

def get_youtube_client():
    return build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))

def parse_duration(iso_duration):
    """Convert ISO 8601 duration (PT4M13S) to MM:SS string."""
    import re
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_duration)
    if not match:
        return '0:00'
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    if hours:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    return f"{minutes}:{seconds:02d}"

def is_video_long_enough(iso_duration):
    import re
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_duration)
    if not match:
        return False
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds >= 60

def get_channel_videos(youtube):
    channel_resp = youtube.channels().list(
        part='contentDetails',
        id='UCqFzWxSCi39LnW1JKFR3efg'
    ).execute()
    uploads_playlist = channel_resp['items'][0]['contentDetails']['relatedPlaylists']['uploads']

    video_ids = []
    next_page_token = None

    while True:
        playlist_resp = youtube.playlistItems().list(
            part='contentDetails',
            playlistId=uploads_playlist,
            maxResults=50,
            pageToken=next_page_token
        ).execute()
        video_ids += [item['contentDetails']['videoId'] for item in playlist_resp['items']]
        next_page_token = playlist_resp.get('nextPageToken')
        if not next_page_token:
            break

    # YouTube API only allows 50 IDs per videos().list call
    all_videos = []
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i+50]
        videos_resp = youtube.videos().list(
            part='snippet,contentDetails,statistics',
            id=','.join(batch)
        ).execute()
        all_videos += videos_resp['items']

    return all_videos

def check_for_new_sketches():
    print(" Checking for new sketches...")
    
    try:
        db = connect_to_mongodb()
        youtube = get_youtube_client()
        videos = get_channel_videos(youtube)

        
        for video in videos:
            try:
                video_id = video['id']
                title = video['snippet']['title']
                iso_duration = video['contentDetails']['duration']

                # Check if video exists
                existing_video = db.sketches.find_one({'videoId': video_id})
                if existing_video:
                    print(f"Video already exists: {title}")
                    return
                
                # Check duration
                if not is_video_long_enough(iso_duration):
                    print(f"Video too short: {title}")
                    continue
                # Check duration

                # Exclude Shorts
                if '#Shorts' in title or '#Shorts' in video['snippet'].get('description', ''):
                    print(f"Skipping Short: {title}")
                    continue

                # Exclude Shorts
                tags = video['snippet'].get('tags', [])
                description = video['snippet'].get('description', '')
                if (
                    '#shorts' in title.lower() or
                    '#shorts' in description.lower() or
                    any('#shorts' in tag.lower() for tag in tags)
                ):
                    print(f"Skipping Short: {title}")
                    continue

                # Exclude lowercase titles (Shorts)
                if title[0].islower():
                    print(f"Skipping lowercase title: {title}")
                    continue

                
                # Process new video
                video_data = {
                    'videoId': video_id,
                    'title': title,
                    'description': video['snippet'].get('description', ''),
                    'publishedTime': datetime.now().isoformat(),
                    'thumbnails': list(video['snippet']['thumbnails'].values()),
                    'duration': parse_duration(iso_duration),
                    'viewCount': video['statistics'].get('viewCount', '0'),
                    'channelTitle': "Saturday Night Live",
                    'importDate': (datetime.now().replace(year=datetime.now().year - 88)).isoformat(),
                    'importMethod': 'auto-update'
                }
                
                # Save to database
                db.sketches.insert_one(video_data)
                print(f"Added new sketch: {video_data['title']}")
                
                # Return success
                print(json.dumps({
                    'success': True,
                    'video': {k: v for k, v in video_data.items() if k != '_id'}
                }))
                continue
                
            except Exception as e:
                print(f"Error processing video: {str(e)}")
                continue
        
        print(json.dumps({
            'success': True,
            'message': 'No new sketches found'
        }))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))

if __name__ == "__main__":
    load_dotenv()
    check_for_new_sketches()


# from googleapiclient.discovery import build
# from dotenv import load_dotenv
# import os

# load_dotenv()
# youtube = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))

# channel_resp = youtube.channels().list(
#     part='contentDetails',
#     id='UCqFzWxSCi39LnW1JKFR3efg'
# ).execute()
# uploads_playlist = channel_resp['items'][0]['contentDetails']['relatedPlaylists']['uploads']

# playlist_resp = youtube.playlistItems().list(
#     part='contentDetails',
#     playlistId=uploads_playlist,
#     maxResults=3
# ).execute()

# for item in playlist_resp['items']:
#     print(item['contentDetails']['videoId'])


## SCRAPETUBE ##

# import os
# import sys
# import json
# from datetime import datetime
# import scrapetube
# from pymongo import MongoClient
# from dotenv import load_dotenv

# def connect_to_mongodb():
#     client = MongoClient(os.getenv('MONGODB_URI'))
#     return client.snl_tracker

# def is_video_long_enough(duration_str):
#     try:
#         minutes, seconds = map(int, duration_str.split(':'))
#         total_seconds = minutes * 60 + seconds
#         return total_seconds >= 60
#     except:
#         return False



# def check_for_new_sketches():
#     print(" Checking for new sketches...")
    
#     try:
#         db = connect_to_mongodb()
#         videos = scrapetube.get_channel("UCqFzWxSCi39LnW1JKFR3efg")
        
#         for video in videos:
#             try:
#                 # Check if video exists
#                 existing_video = db.sketches.find_one({'videoId': video['videoId']})
#                 if existing_video:
#                     print(f"Video already exists: {video['title']['runs'][0]['text']}")
#                     return
                
#                 # Check duration
#                 duration = video['lengthText']['simpleText']
#                 if not is_video_long_enough(duration):
#                     print(f"Video too short: {video['title']['runs'][0]['text']}")
#                     continue


                
#                 # Process new video
#                 video_data = {
#                     'videoId': video['videoId'],
#                     'title': video['title']['runs'][0]['text'],
#                     'description': video['descriptionSnippet']['runs'][0]['text'] if video.get('descriptionSnippet') else '',
#                     'publishedTime': datetime.now().isoformat(),  # Store as ISO format
#                     'thumbnails': video['thumbnail']['thumbnails'],
#                     'duration': video['lengthText']['simpleText'],
#                     'viewCount': video['viewCountText']['simpleText'],
#                     'channelTitle': "Saturday Night Live",
#                     # 'importDate': datetime.now().isoformat(),
#                     'importDate': (datetime.now().replace(year=datetime.now().year - 72)).isoformat(), ## changing to [whatever imiport year is] ]years ago bc order of og imports was latest to newest so the new sketches show up as 'newest'
#                     'importMethod': 'auto-update'
#                 }

                
#                 # Save to database
#                 db.sketches.insert_one(video_data)
#                 print(f"Added new sketch: {video_data['title']}")
                
#                 # Return success
#                 print(json.dumps({
#                     'success': True,
#                     'video': video_data
#                 }))
#                 return
                
#             except Exception as e:
#                 print(f"Error processing video: {str(e)}")
#                 continue
        
#         print(json.dumps({
#             'success': True,
#             'message': 'No new sketches found'
#         }))
        
#     except Exception as e:
#         print(json.dumps({
#             'success': False,
#             'error': str(e)
#         }))

# if __name__ == "__main__":
#     load_dotenv()
#     check_for_new_sketches()
