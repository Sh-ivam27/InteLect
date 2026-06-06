'use client';

import { useState } from 'react';
import { generateQuiz, evaluateAnswer } from '@/lib/api';

interface Question {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  timestamp: number;
}

interface QuizPanelProps {
  videoId: string;
  onTimestampClick: (timestamp: number) => void;
}

export default function QuizPanel({ videoId, onTimestampClick }: QuizPanelProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    if (!videoId || isGenerating) return;
    setIsGenerating(true);
    setAnswers({});
    setFeedback({});
    try {
      const result = await generateQuiz(videoId, numQuestions);
      setQuestions(result.questions);
    } catch (error) {
      console.error('Quiz generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = async (questionIndex: number, answer: string) => {
    if (answers[questionIndex]) return;
    const q = questions[questionIndex];
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    try {
      const result = await evaluateAnswer(
        q.question,
        answer,
        q.correct,
        q.explanation
      );
      setFeedback(prev => ({ ...prev, [questionIndex]: result.feedback }));
    } catch (error) {
      console.error('Evaluation failed:', error);
    }
  };

  const getOptionStyle = (questionIndex: number, option: string) => {
    const letter = option.charAt(0);
    const userAnswer = answers[questionIndex];
    const correct = questions[questionIndex].correct;

    if (!userAnswer) return {
      background: 'var(--bg-secondary)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    };

    if (letter === correct) return {
      background: '#0D2B1F',
      color: '#10B981',
      border: '1px solid #10B981',
    };

    if (letter === userAnswer && letter !== correct) return {
      background: '#2B0D0D',
      color: '#EF4444',
      border: '1px solid #EF4444',
    };

    return {
      background: 'var(--bg-secondary)',
      color: 'var(--text-muted)',
      border: '1px solid var(--border)',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '6px 10px',
            fontSize: '12px',
            color: 'var(--text-primary)',
          }}
        >
          <option value={3}>3 questions</option>
          <option value={5}>5 questions</option>
          <option value={10}>10 questions</option>
        </select>

        <button
          onClick={handleGenerate}
          disabled={!videoId || isGenerating}
          style={{
            background: videoId ? 'var(--accent)' : 'var(--border)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 16px',
            fontSize: '12px',
            cursor: videoId ? 'pointer' : 'not-allowed',
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>

      {questions.map((q, i) => (
        <div key={i} style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>
              {i + 1}. {q.question}
            </div>
            <button
              onClick={() => onTimestampClick(q.timestamp)}
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--accent)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '10px',
                cursor: 'pointer',
                marginLeft: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              ↗ {formatTime(q.timestamp)}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {q.options.map((option, j) => (
              <button
                key={j}
                onClick={() => handleAnswer(i, option.charAt(0))}
                disabled={!!answers[i]}
                style={{
                  ...getOptionStyle(i, option),
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: answers[i] ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {feedback[i] && (
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              {feedback[i]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}