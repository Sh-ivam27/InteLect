from anthropic import Anthropic
import json

client = Anthropic()

def generate_quiz(chunks: list, num_questions: int = 5):
    bucket_size = max(1, len(chunks) // num_questions)
    buckets = [chunks[i:i+bucket_size] for i in range(0, len(chunks), bucket_size)]
    while len(buckets) > num_questions:
        buckets[-2].extend(buckets[-1])
        buckets.pop()

    questions = []
    for bucket in buckets[:num_questions]:
        context = ""
        for chunk in bucket:
            start = int(chunk["start"])
            context += f"[{start//60}:{start%60:02d}] {chunk['text']}\n\n"

        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=600,
            system="""You are an expert educator creating quiz questions from lecture content.
Generate questions that test UNDERSTANDING not recall.
Wrong answers must represent real misconceptions.
Never create questions answerable by keyword matching.""",
            messages=[{
                "role": "user",
                "content": f"""Create exactly 1 multiple choice question from this lecture segment.
Use the timestamp of the most important concept in the segment.

{context}

Return ONLY a JSON object, no markdown:
{{
    "question": "question text",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correct": "A",
    "explanation": "why correct and others wrong",
    "timestamp": 14.22
}}"""
            }]
        )

        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        questions.append({
            **json.loads(raw),
            "timestamp": bucket[0]["start"]
        })

    return questions


def evaluate_answer(question: str, user_answer: str, correct_answer: str, explanation: str):
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=500,
        system="""You are a helpful tutor evaluating a student's answer.
Be encouraging but honest. Explain why they got it right or wrong.
Do not use markdown formatting. Write in plain text only.""",
        messages=[{
            "role": "user",
            "content": f"""Question: {question}
Student answered: {user_answer}
Correct answer: {correct_answer}
Explanation: {explanation}

Give brief feedback to the student."""
        }]
    )

    is_correct = user_answer.upper() == correct_answer.upper()

    return {
        "is_correct": is_correct,
        "feedback": response.content[0].text
    }