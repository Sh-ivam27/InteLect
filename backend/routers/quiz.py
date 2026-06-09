from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.quiz import generate_quiz, evaluate_answer
from services.rag import get_all_chunks

router = APIRouter()

class QuizRequest(BaseModel):
    video_id: str
    num_questions: int = 5

class EvaluateRequest(BaseModel):
    question: str
    user_answer: str
    correct_answer: str
    explanation: str

def _uniform_sample(chunks: list, n: int) -> list:
    if len(chunks) <= n:
        return chunks
    indices = [round(i * (len(chunks) - 1) / (n - 1)) for i in range(n)]
    seen = set()
    result = []
    for idx in indices:
        if idx not in seen:
            seen.add(idx)
            result.append(chunks[idx])
    return result

@router.post("/quiz/generate")
def generate(request: QuizRequest):
    try:
        all_chunks = get_all_chunks(request.video_id)

        if not all_chunks:
            raise Exception("No chunks found for this video. Please transcribe first.")

        all_chunks.sort(key=lambda x: x["start"])
        print([(c["start"], c["end"]) for c in all_chunks[:5]])
        print(f"total: {len(all_chunks)}, last start: {all_chunks[-1]['start']}")

        sampled = _uniform_sample(all_chunks, min(20, len(all_chunks)))
        questions = generate_quiz(sampled, request.num_questions)

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