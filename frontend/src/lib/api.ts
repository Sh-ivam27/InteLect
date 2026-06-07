import axios from 'axios';

const API_BASE = 'https://intelect-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transcribe a YouTube video
export const transcribeVideo = async (youtubeUrl: string, videoId: string) => { // sends the URL to the "/api/transcribe" door, backend then downloads the .mp3 file, transcribes it and stores meaningful chunks in ChromaDB, returns the chunks back to the frontend
  const response = await api.post('/transcribe', {
    youtube_url: youtubeUrl,
    video_id: videoId,
  });
  return response.data;
};

// Ask a question about the lecture
export const askQuestion = async (question: string, videoId: string) => { // frontend sends the question to the "/api/ask" door, backend finds relevant chunks from ChromaDB and then sends them to Claude, returns the answer received from Claude + timestamp back to frontend
  const response = await api.post('/ask', {
    question,
    video_id: videoId,
  });
  return response.data;
};

// Generate quiz questions
export const generateQuiz = async (videoId: string, numQuestions: number = 5) => { // frontend sends the video ID to "/api/quiz/generate" door, backend pulls chunks from ChromaDB and sends them to Claude to generate questions, returns the questions back to the frontend
  const response = await api.post('/quiz/generate', {
    video_id: videoId,
    num_questions: numQuestions,
  });
  return response.data;
};

// Evaluate a quiz answer
export const evaluateAnswer = async ( // frontend sends the answer to "/api/quiz/evaluate" door, backend checks if correct, Claude gives feedback, returns result + feedback to the frontend
  question: string,
  userAnswer: string,
  correctAnswer: string,
  explanation: string
) => {
  const response = await api.post('/quiz/evaluate', {
    question,
    user_answer: userAnswer,
    correct_answer: correctAnswer,
    explanation,
  });
  return response.data;
};