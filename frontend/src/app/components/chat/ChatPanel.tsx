'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { askQuestion } from '@/lib/api';

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: { start: number; end: number; text: string }[];
}

interface ChatPanelProps {
  videoId: string;
  onTimestampClick: (timestamp: number) => void;
  onSourcesUpdate: (timestamps: number[]) => void;
}

export default function ChatPanel({ videoId, onTimestampClick, onSourcesUpdate }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!input.trim() || !videoId || isLoading) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const result = await askQuestion(input, videoId);
      const aiMessage: Message = {
        role: 'ai',
        content: result.answer,
        sources: result.sources,
      };
      setMessages(prev => [...prev, aiMessage]);
      if (result.sources) {
        onSourcesUpdate(result.sources.map((s: any) => s.start));
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Something went wrong. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      width: '380px',
      minWidth: '380px',
      maxWidth: '380px',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Ask anything</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Grounded to this lecture
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        overflowY: 'auto',
        minHeight: 0,
      }}>
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                color: 'var(--text-muted)',
                fontSize: '12px',
                textAlign: 'center',
                marginTop: '24px',
                lineHeight: 1.6,
              }}
            >
              Ask a question about the lecture to get started
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '5px',
              }}
            >
              <div style={{
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                border: msg.role === 'ai' ? '1px solid var(--border-subtle)' : 'none',
                color: msg.role === 'user' ? 'white' : 'var(--text-mono)',
                padding: '9px 12px',
                borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '3px 14px 14px 14px',
                fontSize: '12px',
                lineHeight: '1.6',
                maxWidth: '88%',
              }}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={{ margin: '0 0 6px 0' }}>{children}</p>,
                      strong: ({ children }) => <strong style={{ color: 'var(--accent)', fontWeight: 500 }}>{children}</strong>,
                      code: ({ children }) => <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>{children}</code>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : msg.content}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}
                >
                  {msg.sources.map((source, j) => (
                    <motion.button
                      key={j}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: j * 0.05 }}
                      whileHover={{ scale: 1.05, backgroundColor: 'var(--accent)', color: 'white' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onTimestampClick(source.start)}
                      style={{
                        background: 'var(--accent-dim)',
                        color: 'var(--accent)',
                        border: '1px solid var(--accent-border)',
                        borderRadius: '10px',
                        padding: '2px 9px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      ↗ {formatTime(source.start)}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px 14px 14px 14px',
                padding: '10px 14px',
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    style={{ width: '5px', height: '5px', background: 'var(--accent)', borderRadius: '50%', opacity: 0.7 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: '6px',
        flexShrink: 0,
      }}>
        <input
          type="text"
          placeholder={videoId ? 'Ask about the lecture...' : 'Load a lecture first...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={!videoId}
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
          }}
        />
        <motion.button
          onClick={handleSend}
          disabled={!videoId || isLoading}
          whileHover={{ scale: videoId ? 1.05 : 1 }}
          whileTap={{ scale: videoId ? 0.95 : 1 }}
          style={{
            background: videoId ? 'var(--accent)' : 'var(--border)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            width: '34px',
            height: '34px',
            cursor: videoId ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ↑
        </motion.button>
      </div>
    </div>
  );
}