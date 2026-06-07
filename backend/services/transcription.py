from youtube_transcript_api import YouTubeTranscriptApi
from dotenv import load_dotenv

load_dotenv()

def transcribe_audio(youtube_url: str) -> list:
    print("Fetching transcript...")
    
    # extract video id from URL
    if "v=" in youtube_url:
        video_id = youtube_url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in youtube_url:
        video_id = youtube_url.split("youtu.be/")[1].split("?")[0]
    else:
        raise Exception("Invalid YouTube URL")
    
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    
    sentence_chunks = []
    current_chunk = {"start": None, "end": None, "text": ""}
    word_count = 0
    
    for entry in transcript:
        if current_chunk["start"] is None:
            current_chunk["start"] = entry["start"]
        
        current_chunk["text"] += " " + entry["text"]
        current_chunk["end"] = entry["start"] + entry["duration"]
        word_count += len(entry["text"].split())
        
        if word_count >= 150:
            sentence_chunks.append({
                "start": current_chunk["start"],
                "end": current_chunk["end"],
                "text": current_chunk["text"].strip()
            })
            current_chunk = {"start": None, "end": None, "text": ""}
            word_count = 0
    
    if current_chunk["text"].strip():
        sentence_chunks.append({
            "start": current_chunk["start"],
            "end": current_chunk["end"],
            "text": current_chunk["text"].strip()
        })
    
    return sentence_chunks