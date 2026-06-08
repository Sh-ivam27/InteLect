'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  onAnswer: (isCorrect: boolean, conceptName: string) => void;
}

export default function QuizPanel({ videoId, onTimestampClick, onAnswer }: QuizPanelProps) {
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
    const isCorrect = answer.toUpperCase() === q.correct.toUpperCase();
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    onAnswer(isCorrect, q.question.slice(0, 30));
    try {
      const result = await evaluateAnswer(q.question, answer, q.correct, q.explanation);
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
      background: 'var(--bg-card)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)',
    };
    if (letter === correct) return {
      background: 'var(--success-bg)',
      color: 'var(--success)',
      border: '1px solid var(--success-border)',
    };
    if (letter === userAnswer && letter !== correct) return {
      background: 'var(--danger-bg)',
      color: 'var(--danger)',
      border: '1px solid var(--danger-border)',
    };
    return {
      background: 'var(--bg-card)',
      color: 'var(--text-muted)',
      border: '1px solid var(--border-subtle)',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '7px',
            padding: '6px 10px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
        >
          <option value={3}>3 questions</option>
          <option value={5}>5 questions</option>
          <option value={10}>10 questions</option>
        </select>

        <motion.button
          onClick={handleGenerate}
          disabled={!videoId || isGenerating}
          whileHover={{ scale: videoId ? 1.03 : 1 }}
          whileTap={{ scale: videoId ? 0.97 : 1 }}
          style={{
            background: videoId ? 'var(--accent)' : 'var(--border)',
            color: 'white',
            border: 'none',
            borderRadius: '7px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: videoId ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isGenerating ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block' }}
              >⟳</motion.span>
              Generating...
            </>
          ) : 'Generate Quiz'}
        </motion.button>
      </div>

      {/* Questions */}
      <AnimatePresence>
        {questions.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.25 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Question header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-mono)', marginRight: '6px' }}>
                  Q{i + 1}
                </span>
                {q.question}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTimestampClick(q.timestamp)}
                style={{
                  background: 'var(--accent-dim)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: '12px',
                  padding: '3px 9px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                ↗ {formatTime(q.timestamp)}
              </motion.button>
            </div>

            {/* Options — 2 column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {q.options.map((option, j) => (
                <motion.button
                  key={j}
                  onClick={() => handleAnswer(i, option.charAt(0))}
                  disabled={!!answers[i]}
                  whileHover={!answers[i] ? { scale: 1.02, borderColor: 'var(--accent)' } : {}}
                  whileTap={!answers[i] ? { scale: 0.98 } : {}}
                  style={{
                    ...getOptionStyle(i, option),
                    borderRadius: '7px',
                    padding: '8px 10px',
                    fontSize: '11px',
                    cursor: answers[i] ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.4,
                    transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                  }}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback[i] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '7px',
                    padding: '8px 12px',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                  }}
                >
                  {feedback[i]}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}