from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.transcription import transcribe_audio
from services.rag import store_chunks

router = APIRouter()

class TranscribeRequest(BaseModel):
    youtube_url: str
    video_id: str

@router.post("/transcribe")
def transcribe(request: TranscribeRequest):
    try:
        chunks = transcribe_audio(request.youtube_url)
        num_chunks = store_chunks(chunks, request.video_id)
        return {
            "success": True,
            "video_id": request.video_id,
            "chunks": chunks,
            "num_chunks": num_chunks
        }
    except Exception as e:
        print(f"TRANSCRIPTION ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))