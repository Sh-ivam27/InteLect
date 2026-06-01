# routers facilitate the communication between the frontend and backend

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.rag import ask_question

router = APIRouter()

class QuestionRequest(BaseModel):
    question: str
    video_id: str

@router.post("/ask")
def ask(request: QuestionRequest):
    try:
        result = ask_question(request.question, request.video_id)
        return {
            "success": True,
            "question": request.question,
            "answer": result["answer"],
            "sources": result["sources"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))