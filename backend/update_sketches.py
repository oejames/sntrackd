import os
import sys
import json
from datetime import datetime
import scrapetube
from pymongo import MongoClient
from dotenv import load_dotenv

def connect_to_mongodb():
    client = MongoClient(os.getenv('MONGODB_URI'))
    return client.snl_tracker

def is_video_long_enough(duration_str):
    try:
        minutes, seconds = map(int, duration_str.split(':'))
        total_seconds = minutes * 60 + seconds
        return total_seconds >= 60
    except:
        return False



def check_for_new_sketches():
    print(" Checking for new sketches...")
    
    try:
        db = connect_to_mongodb()
        videos = scrapetube.get_channel("UCqFzWxSCi39LnW1JKFR3efg")
        
        for video in videos:
            try:
                # Check if video exists
                existing_video = db.sketches.find_one({'videoId': video['videoId']})
                if existing_video:
                    print(f"Video already exists: {video['title']['runs'][0]['text']}")
                    return
                
                # Check duration
                duration = video['lengthText']['simpleText']
                if not is_video_long_enough(duration):
                    print(f"Video too short: {video['title']['runs'][0]['text']}")
                    continue


                
                # Process new video
                video_data = {
                    'videoId': video['videoId'],
                    'title': video['title']['runs'][0]['text'],
                    'description': video['descriptionSnippet']['runs'][0]['text'] if video.get('descriptionSnippet') else '',
                    'publishedTime': datetime.now().isoformat(),  # Store as ISO format
                    'thumbnails': video['thumbnail']['thumbnails'],
                    'duration': video['lengthText']['simpleText'],
                    'viewCount': video['viewCountText']['simpleText'],
                    'channelTitle': "Saturday Night Live",
                    # 'importDate': datetime.now().isoformat(),
                    'importDate': (datetime.now().replace(year=datetime.now().year - 17)).isoformat(), ## changing to [whatever imiport year is] ]years ago bc order of og imports was latest to newest so the new sketches show up as 'newest'
                    'importMethod': 'auto-update'
                }

                
                # Save to database
                db.sketches.insert_one(video_data)
                print(f"Added new sketch: {video_data['title']}")
                
                # Return success
                print(json.dumps({
                    'success': True,
                    'video': video_data
                }))
                return
                
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