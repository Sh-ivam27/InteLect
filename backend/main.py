from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import transcription as transcription_router
from routers import rag as rag_router
from routers import quiz as quiz_router

load_dotenv()

app = FastAPI(
    title="InteLect API",
    description="AI that turns any YouTube lecture into an interactive course",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transcription_router.router, prefix="/api")
app.include_router(rag_router.router, prefix="/api")
app.include_router(quiz_router.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Welcome to InteLect API"}

@app.get("/health")
def health():
    return {"status": "healthy"}