import assemblyai as aai
import os
import tempfile
from dotenv import load_dotenv
from pytubefix import YouTube

load_dotenv()

aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

def download_audio(youtube_url: str) -> str:
    temp_dir = tempfile.mkdtemp()
    
    yt = YouTube(youtube_url)
    audio_stream = yt.streams.filter(only_audio=True).first()
    audio_path = audio_stream.download(output_path=temp_dir, filename="audio.mp4")
    
    return audio_path

def transcribe_audio(youtube_url: str) -> list:
    print("Downloading audio...")
    audio_path = download_audio(youtube_url)
    
    print("Transcribing...")
    transcriber = aai.Transcriber()
    transcript = transcriber.transcribe(audio_path)
    
    if transcript.status == aai.TranscriptStatus.error:
        raise Exception(f"Transcription failed: {transcript.error}")
    
    sentence_chunks = []
    current_chunk = {"start": None, "end": None, "text": ""}
    
    for i, word in enumerate(transcript.words):
        if current_chunk["start"] is None:
            current_chunk["start"] = word.start / 1000
        
        current_chunk["text"] += " " + word.text
        current_chunk["end"] = word.end / 1000
        
        if (i + 1) % 20 == 0:
            sentence_chunks.append({
                "start": current_chunk["start"],
                "end": current_chunk["end"],
                "text": current_chunk["text"].strip()
            })
            current_chunk = {"start": None, "end": None, "text": ""}
    
    if current_chunk["text"].strip():
        sentence_chunks.append({
            "start": current_chunk["start"],
            "end": current_chunk["end"],
            "text": current_chunk["text"].strip()
        })
    
    return sentence_chunks