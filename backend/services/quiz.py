from anthropic import Anthropic
import json

client = Anthropic()

def generate_quiz(chunks: list, num_questions: int = 5):
    """
    Takes lecture chunks, formats them with timestamps and sends them 
    to Claude (with very specific instructions) to generate questions 
    (by default 5).
    """
    
    context = ""
    for chunk in chunks:
        start = int(chunk["start"])
        context += f"[{start//60}:{start%60:02d}] {chunk['text']}\n\n"
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        system="""You are an expert educator creating quiz questions from lecture content.
        
        Rules for generating questions:
        1. Questions must test UNDERSTANDING not just recall
        2. Each question must require knowing WHY not just WHAT
        3. Wrong answers must represent real misconceptions students have
        4. Never create questions that can be answered by keyword matching
        5. Always reference the timestamp where the concept was taught""",
        messages=[{
            "role": "user",
            "content": f"""Create {num_questions} multiple choice questions from this lecture content:

{context}

Return ONLY a JSON array with no markdown, no code blocks, no extra text. Just the raw JSON array:
[
    {{
        "question": "question text here",
        "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
        "correct": "A",
        "explanation": "why this is correct and others are wrong",
        "timestamp": 14.22
    }}
]"""
        }]
    )
    
    raw = response.content[0].text
    
    # strip markdown code blocks if Claude wraps in ```json
    clean = raw.strip()
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    clean = clean.strip()
    
    questions = json.loads(clean)
    return questions

def evaluate_answer(question: str, user_answer: str, correct_answer: str, explanation: str):
    """
    Called whenever a user clicks an option button, checks if the user's 
    answer matches the correct answer, also sends to Claude to generate 
    encouraging personalized feedback.
    """
    
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