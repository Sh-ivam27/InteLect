'use client';

import { useState } from 'react';
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

export default function Home() {
  const [videoId, setVideoId] = useState('');
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [player, setPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedTimestamps, setHighlightedTimestamps] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'quiz' | 'progress' | 'transcript'>('quiz');
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const handleVideoSubmit = async (url: string, vid: string) => { // kicks off the entire pipeline : user pastes URL -> hits "Load Lecture" button -> setVideoId(vid) -> VideoPlayer loads -> trannscribeVideo(url, vid) -> backend runs Whisper -> setChunks(result.chunks) -> transcript tab ready -> isLoading = false -> button goes back to normal
    setIsLoading(true);
    setVideoId(vid);
    setChunks([]);
    setHighlightedTimestamps([]);
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

  const handleTimestampClick = (timestamp: number) => { // seeks the video : called from either ChatPanel, QuizPanel or Transcript Tab -> uses the YouTube remote (player) to jump to that moment
    if (player) {
      player.seekTo(timestamp, true);
    }
  };

  const handleSourcesUpdate = (timestamps: number[]) => { // updates timestamp chips : called by ChatPanel after eveery Claude answer -> updates the chips shown below the video player
    setHighlightedTimestamps(timestamps);
  };

  const tabs = ['quiz', 'progress', 'transcript'] as const;

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      <Navbar
        onVideoSubmit={handleVideoSubmit}
        isLoading={isLoading}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        {/* Top section - Video + Chat */}
        <div style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
        }}>
          <VideoPlayer
            videoId={videoId}
            chunks={chunks}
            highlightedTimestamps={highlightedTimestamps}
            onPlayerReady={setPlayer}
          />
          <ChatPanel
            videoId={videoId}
            onTimestampClick={handleTimestampClick}
            onSourcesUpdate={handleSourcesUpdate}
          />
        </div>

        {/* Bottom section - Tabs */}
        <div style={{
          height: '220px',
          background: 'var(--bg-tertiary)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
          }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 20px',
                  fontSize: '12px',
                  color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
          }}>
            {activeTab === 'quiz' && (
              <QuizPanel
                videoId={videoId}
                onTimestampClick={handleTimestampClick}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressPanel
                concepts={concepts}
                totalChunks={chunks.length}
                answeredQuestions={answeredQuestions}
                correctAnswers={correctAnswers}
              />
            )}

            {activeTab === 'transcript' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {chunks.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
                    Load a lecture to see the transcript
                  </div>
                ) : (
                  chunks.map((chunk, i) => (
                    <div
                      key={i}
                      onClick={() => handleTimestampClick(chunk.start)}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ color: 'var(--accent)', minWidth: '40px', fontSize: '11px' }}>
                        {Math.floor(chunk.start / 60)}:{String(Math.floor(chunk.start % 60)).padStart(2, '0')}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{chunk.text}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}