'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import VideoPlayer from './components/video/VideoPlayer';
import ChatPanel from './components/chat/ChatPanel';
import QuizPanel from './components/quiz/QuizPanel';
import ProgressPanel from './components/progress/ProgressPanel';
import { transcribeVideo } from '@/lib/api';

interface Chunk {
  start: number;
  end: number;
  text: string;
}

interface Concept {
  name: string;
  status: 'unseen' | 'shaky' | 'confident';
}

const TABS = ['quiz', 'progress', 'transcript'] as const;
type Tab = typeof TABS[number];

export default function Home() {
  const [videoId, setVideoId] = useState('');
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [player, setPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedTimestamps, setHighlightedTimestamps] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('quiz');
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const handleVideoSubmit = async (url: string, vid: string) => {
    setIsLoading(true);
    setVideoId(vid);
    setChunks([]);
    setHighlightedTimestamps([]);
    setAnsweredQuestions(0);
    setCorrectAnswers(0);
    setConcepts([]);
    try {
      const result = await transcribeVideo(url, vid);
      setChunks(result.chunks);
    } catch (error) {
      console.error('Transcription failed:', error);
      alert('Failed to process video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimestampClick = (timestamp: number) => {
    if (player) player.seekTo(timestamp, true);
  };

  const handleSourcesUpdate = (timestamps: number[]) => {
    setHighlightedTimestamps(timestamps);
  };

  const handleQuizAnswer = (isCorrect: boolean, conceptName: string) => {
    setAnsweredQuestions(prev => prev + 1);
    if (isCorrect) setCorrectAnswers(prev => prev + 1);
    setConcepts(prev => {
      const existing = prev.find(c => c.name === conceptName);
      if (existing) {
        return prev.map(c =>
          c.name === conceptName
            ? { ...c, status: isCorrect ? 'confident' : 'shaky' }
            : c
        );
      }
      return [...prev, { name: conceptName, status: isCorrect ? 'confident' : 'shaky' }];
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      <Navbar onVideoSubmit={handleVideoSubmit} isLoading={isLoading} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Top — Video + Chat */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{ flex: 1, display: 'flex', minHeight: 0, maxHeight: '380px' }}
        >
          <VideoPlayer
            videoId={videoId}
            chunks={chunks}
            highlightedTimestamps={highlightedTimestamps}
            onPlayerReady={setPlayer}
            onTimestampClick={handleTimestampClick}
          />
          <ChatPanel
            videoId={videoId}
            onTimestampClick={handleTimestampClick}
            onSourcesUpdate={handleSourcesUpdate}
          />
        </motion.div>

        {/* Bottom — Tabs */}
        <div style={{
          flex: 1,
          background: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
            padding: '0 4px',
            position: 'relative',
          }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '9px 20px',
                  fontSize: '12px',
                  fontWeight: activeTab === tab ? 500 : 400,
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  position: 'relative',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.2px',
                  transition: 'color 0.15s',
                }}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-indicator"
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--accent)',
                      borderRadius: '2px 2px 0 0',
                      boxShadow: '0 0 8px var(--accent-glow)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
            <div style={{ display: activeTab === 'quiz' ? 'block' : 'none' }}>
              <QuizPanel
                videoId={videoId}
                onTimestampClick={handleTimestampClick}
                onAnswer={handleQuizAnswer}
              />
            </div>
            <div style={{ display: activeTab === 'progress' ? 'block' : 'none' }}>
              <ProgressPanel
                concepts={concepts}
                totalChunks={chunks.length}
                answeredQuestions={answeredQuestions}
                correctAnswers={correctAnswers}
              />
            </div>
            <div style={{ display: activeTab === 'transcript' ? 'block' : 'none' }}>
              {chunks.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
                  Load a lecture to see the transcript
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {chunks.map((chunk, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ backgroundColor: 'var(--bg-card)', x: 2 }}
                      onClick={() => handleTimestampClick(chunk.start)}
                      style={{
                        display: 'flex',
                        gap: '14px',
                        padding: '5px 8px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{
                        color: 'var(--accent)',
                        minWidth: '44px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        paddingTop: '1px',
                        flexShrink: 0,
                      }}>
                        {Math.floor(chunk.start / 60)}:{String(Math.floor(chunk.start % 60)).padStart(2, '0')}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{chunk.text}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}