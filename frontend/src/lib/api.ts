import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transcribe a YouTube video
export const transcribeVideo = async (youtubeUrl: string, videoId: string) => {
  const response = await api.post('/transcribe', {
    youtube_url: youtubeUrl,
    video_id: videoId,
  });
  return response.data;
};

// Ask a question about the lecture
export const askQuestion = async (question: string, videoId: string) => {
  const response = await api.post('/ask', {
    question,
    video_id: videoId,
  });
  return response.data;
};

// Generate quiz questions
export const generateQuiz = async (videoId: string, numQuestions: number = 5) => {
  const response = await api.post('/quiz/generate', {
    video_id: videoId,
    num_questions: numQuestions,
  });
  return response.data;
};

// Evaluate a quiz answer
export const evaluateAnswer = async (
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