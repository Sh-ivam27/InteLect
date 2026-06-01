import whisper # helps in transcription of the .mp3 file into text with timestamps
import yt_dlp # helps in downloading the YouTube video
import os
import tempfile

def download_audio(youtube_url: str) -> str:
    temp_dir = tempfile.mkdtemp()
    audio_path = os.path.join(temp_dir, "audio.mp3")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': audio_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }],
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])
    
    return audio_path

def transcribe_audio(youtube_url: str) -> list:
    print("Downloading audio...")
    audio_path = download_audio(youtube_url) # .mp3 file obtained
    
    print("Loading Whisper model...")
    model = whisper.load_model("base") # "base" model used
    
    print("Transcribing...")
    result = model.transcribe(audio_path, verbose=False)
    
    chunks = [] # entire transcribed text is broken into chunks, where each chunk has a "start" time, "end" time and "text" associated with it
    for segment in result["segments"]:
        chunks.append({
            "start": segment["start"],
            "end": segment["end"],
            "text": segment["text"].strip()
        })
    
    return chunks