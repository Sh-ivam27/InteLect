# InteLect
### Stop watching. Start understanding.

InteLect is an AI-powered platform that turns any YouTube lecture into an interactive course. Paste a YouTube URL and get a timestamped transcript, ask questions grounded to specific moments in the video, generate understanding-based quizzes, and track your progress — all in one place.

---

## Features

**Timestamp-grounded Q&A**
Ask any question about the lecture and get answers citing the exact moment in the video where the concept was explained. Click any timestamp to jump there instantly.

**Understanding-based Quiz Generation**
Auto-generated quizzes that test comprehension, not recall. Wrong answers represent real misconceptions, not random noise. Each question links back to the timestamp where the concept was taught.

**Full Transcript with Clickable Timestamps**
Every word transcribed with timestamps. Click any line to jump to that moment in the video.

**Progress Tracking**
Track which concepts you're confident on, shaky on, or haven't seen yet. Quiz accuracy shown with a live progress bar.

---

## Tech Stack

**Backend**
- Python + FastAPI
- AssemblyAI (transcription)
- pytubefix (YouTube audio download)
- ChromaDB (vector database)
- LangChain (RAG pipeline)
- Anthropic Claude API (Q&A + quiz generation)

**Frontend**
- Next.js + TypeScript
- Tailwind CSS
- react-youtube
- react-markdown

**Deployment**
- Frontend: Vercel
- Backend: Railway

---

## Architecture

YouTube URL
↓
pytubefix downloads audio
↓
AssemblyAI transcribes → timestamped chunks
↓
LangChain re-chunks → ChromaDB stores vectors
↓
User asks question → ChromaDB retrieves relevant chunks
↓
Claude answers with timestamp citations
↓
React frontend displays answer + jump-to-timestamp buttons

---

## Local Development

**Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Add your API keys to backend/.env
# ANTHROPIC_API_KEY=...
# ASSEMBLYAI_API_KEY=...

uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Resume

> **InteLect** — AI-powered active learning from YouTube lectures
> Built a RAG pipeline over timestamped transcripts enabling grounded Q&A (answers cite exact video moments), automated quiz generation that tests understanding not recall, and a progress tracking system. Stack: Python, FastAPI, AssemblyAI, ChromaDB, Claude API, Next.js, TypeScript.

---

Built by [Shivam Madan](https://github.com/Sh-ivam27)