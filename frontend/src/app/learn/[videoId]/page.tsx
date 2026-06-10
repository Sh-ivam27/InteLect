'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import VideoPlayer from '@/app/components/video/VideoPlayer';
import ChatPanel from '@/app/components/chat/ChatPanel';
import QuizPanel from '@/app/components/quiz/QuizPanel';
import ProgressPanel from '@/app/components/progress/ProgressPanel';
import { transcribeVideo } from '@/lib/api';

interface Chunk { start: number; end: number; text: string; }
interface Concept { name: string; status: 'unseen' | 'shaky' | 'confident'; }

const TABS = ['quiz', 'transcript', 'progress'] as const;
type Tab = typeof TABS[number];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function LearnPage() {
  const params = useParams();
  const videoId = params.videoId as string;
  const reduce = useReducedMotion();

  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [player, setPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [highlightedTimestamps, setHighlightedTimestamps] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('quiz');
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    if (!videoId) return;
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    setIsLoading(true);
    setLoadError('');
    transcribeVideo(url, videoId)
      .then((r) => setChunks(r.chunks))
      .catch(() => setLoadError('Failed to process video.'))
      .finally(() => setIsLoading(false));
  }, [videoId]);

  const handleTimestampClick = (ts: number) => {
    if (player) player.seekTo(ts, true);
  };

  const handleQuizAnswer = (isCorrect: boolean, conceptName: string) => {
    setAnsweredQuestions((p) => p + 1);
    if (isCorrect) setCorrectAnswers((p) => p + 1);
    setConcepts((prev) => {
      const existing = prev.find((c) => c.name === conceptName);
      if (existing) return prev.map((c) => c.name === conceptName ? { ...c, status: isCorrect ? 'confident' : 'shaky' } : c);
      return [...prev, { name: conceptName, status: isCorrect ? 'confident' : 'shaky' }];
    });
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>

      {/* Navbar */}
      <nav style={{
        background: 'rgba(8,9,16,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        flexShrink: 0,
        zIndex: 20,
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
          <motion.span
            animate={reduce ? {} : { scale: [1, 1.25, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 8px var(--accent-glow)' }}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
            Inte<span style={{ color: 'var(--accent)' }}>Lect</span>
          </span>
        </Link>

        <div style={{
          flex: 1, maxWidth: 480, margin: '0 auto',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 8, height: 30,
          display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="var(--text-muted)" stroke="none"/>
          </svg>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            youtube.com/watch?v={videoId}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {isLoading && (
            <>
              <motion.div
                animate={reduce ? {} : { rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid var(--accent-border)', borderTopColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Processing...</span>
            </>
          )}
          {!isLoading && chunks.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
              ● {chunks.length} segments
            </span>
          )}
        </div>
      </nav>

      {/* Body — two column */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Video — fixed 16:9 height */}
          <div style={{
            flexShrink: 0,
            background: '#050608',
            borderBottom: '1px solid var(--border)',
            width: '100%',
            height: 'clamp(200px, 54vh, 540px)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 2,
              background: 'linear-gradient(90deg, var(--accent), transparent)',
            }} />
            <div style={{ position: 'absolute', inset: 0, top: 2 }}>
              <VideoPlayer
                videoId={videoId}
                chunks={chunks}
                highlightedTimestamps={highlightedTimestamps}
                onPlayerReady={setPlayer}
                onTimestampClick={handleTimestampClick}
              />
            </div>
          </div>

          {/* Tab bar */}
          <div style={{
            flexShrink: 0,
            background: 'rgba(8,9,16,0.97)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            padding: '0 8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            zIndex: 10,
          }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '10px 22px',
                  fontSize: 12,
                  fontWeight: activeTab === tab ? 500 : 400,
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                  background: activeTab === tab ? 'var(--accent-dim)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  position: 'relative',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.2px',
                  transition: 'color 0.15s, background 0.15s',
                  borderRadius: '6px 6px 0 0',
                }}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-underline"
                    style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      height: 2, background: 'var(--accent)',
                      borderRadius: '2px 2px 0 0',
                      boxShadow: '0 0 10px var(--accent-glow)',
                    }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content — fills remaining height */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute', inset: 0,
                  overflowY: 'auto',
                  padding: '16px',
                }}
              >
                <div style={{ display: activeTab === 'quiz' ? 'block' : 'none' }}>
                    <SectionHeader label="Quiz" icon="◈" />
                    <div style={{ marginTop: 4 }}>
                      <QuizPanel
                        videoId={videoId}
                        onTimestampClick={handleTimestampClick}
                        onAnswer={handleQuizAnswer}
                      />
                    </div>
                </div>

                <div style={{ display: activeTab === 'transcript' ? 'block' : 'none' }}>
                    <SectionHeader label="Transcript" icon="◎" />
                    <div style={{ marginTop: 12 }}>
                      {chunks.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {isLoading ? 'Transcribing...' : loadError || 'No transcript yet.'}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {chunks.map((chunk, i) => (
                            <motion.div
                              key={i}
                              whileHover={reduce ? {} : { x: 3, backgroundColor: 'var(--bg-card)' }}
                              onClick={() => handleTimestampClick(chunk.start)}
                              style={{
                                display: 'flex', gap: 16, padding: '6px 10px',
                                borderRadius: 6, cursor: 'pointer', fontSize: 13,
                                transition: 'background 0.15s',
                              }}
                            >
                              <span style={{
                                color: 'var(--accent)', minWidth: 44, fontSize: 11,
                                fontFamily: 'var(--font-mono)', paddingTop: 2, flexShrink: 0,
                              }}>
                                {fmt(chunk.start)}
                              </span>
                              <span style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                                {chunk.text}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                </div>

                <div style={{ display: activeTab === 'progress' ? 'block' : 'none' }}>
                    <SectionHeader label="Progress" icon="◉" />
                    <div style={{ marginTop: 12 }}>
                      <ProgressPanel
                        concepts={concepts}
                        totalChunks={chunks.length}
                        answeredQuestions={answeredQuestions}
                        correctAnswers={correctAnswers}
                      />
                    </div>
                </div>
              </motion.div>
          </div>
        </div>

        {/* Right: chat rail */}
        <div style={{
            width: 360,
            flexShrink: 0,
            borderLeft: '1px solid var(--border)',
            background: '#07080F',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            alignSelf: 'stretch',  
        }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', flexShrink: 0 }} />
          <ChatPanel
            videoId={videoId}
            onTimestampClick={handleTimestampClick}
            onSourcesUpdate={setHighlightedTimestamps}
          />
        </div>

      </div>
    </div>
  );
}

function SectionHeader({ label, icon }: { label: string; icon: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
      paddingLeft: 12, borderLeft: '2px solid var(--accent)',
    }}>
      <span style={{ color: 'var(--accent)', fontSize: 13 }}>{icon}</span>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
        color: 'var(--text-primary)', letterSpacing: '-0.3px',
      }}>
        {label}
      </span>
    </div>
  );
}