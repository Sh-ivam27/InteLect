# routers facilitate the communication between the frontend and backend

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.quiz import generate_quiz, evaluate_answer
from services.rag import query_chunks

router = APIRouter()

class QuizRequest(BaseModel):
    video_id: str
    num_questions: int = 5

class EvaluateRequest(BaseModel):
    question: str
    user_answer: str
    correct_answer: str
    explanation: str

@router.post("/quiz/generate")
def generate(request: QuizRequest):
    try:
        chunks = query_chunks("main concepts", request.video_id, n_results=10)
        questions = generate_quiz(chunks, request.num_questions)
        return {
            "success": True,
            "video_id": request.video_id,
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quiz/evaluate")
def evaluate(request: EvaluateRequest):
    try:
        result = evaluate_answer(
            request.question,
            request.user_answer,
            request.correct_answer,
            request.explanation
        )
        return {
            "success": True,
            "is_correct": result["is_correct"],
            "feedback": result["feedback"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))