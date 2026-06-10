'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function ChatPanel({ videoId, onTimestampClick, onSourcesUpdate }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || !videoId || isLoading) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const result = await askQuestion(input, videoId);
      const aiMessage: Message = {
        role: 'ai',
        content: result.answer,
        sources: result.sources,
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (result.sources) onSourcesUpdate(result.sources.map((s: any) => s.start));
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      width: 360, minWidth: 360, maxWidth: 360,
      background: 'var(--bg-secondary)',
      display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid var(--border)',
      height: '100%',              
      justifyContent: 'space-between',  
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', borderBottom: '1px solid var(--border)',
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Ask anything
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, letterSpacing: '0.3px' }}>
            GROUNDED TO THIS LECTURE
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 10,
        overflowY: 'auto', minHeight: 0,
      }}>
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}
            >
              Ask a question about the lecture to get started
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 5,
              }}
            >
              <div style={{
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                border: msg.role === 'ai' ? '1px solid var(--border-subtle)' : 'none',
                color: msg.role === 'user' ? '#fff' : 'var(--text-mono)',
                padding: '8px 12px',
                borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '3px 14px 14px 14px',
                fontSize: 12, lineHeight: 1.65, maxWidth: '90%',
              }}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={{ margin: '0 0 6px 0' }}>{children}</p>,
                      strong: ({ children }) => <strong style={{ color: 'var(--accent)', fontWeight: 500 }}>{children}</strong>,
                      code: ({ children }) => (
                        <code style={{
                          fontFamily: 'var(--font-mono)',
                          background: 'var(--bg-secondary)',
                          padding: '1px 5px', borderRadius: 3, fontSize: 11,
                        }}>{children}</code>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : msg.content}
              </div>

              {/* Timestamp source pills */}
              {msg.sources && msg.sources.length > 0 && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ display: 'flex', gap: 4, flexWrap: 'wrap', paddingLeft: 4 }}
                >
                  {msg.sources.map((src, j) => (
                    <motion.button
                      key={j}
                      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: j * 0.05 }}
                      whileHover={reduce ? {} : { scale: 1.06, background: 'var(--accent)', color: '#fff' }}
                      whileTap={reduce ? {} : { scale: 0.95 }}
                      onClick={() => onTimestampClick(src.start)}
                      style={{
                        background: 'var(--accent-dim)', color: 'var(--accent)',
                        border: '1px solid var(--accent-border)',
                        borderRadius: 10, padding: '2px 8px',
                        fontSize: 10, fontFamily: 'var(--font-mono)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
                        transition: 'background 0.15s, color 0.15s',
                      }}
                    >
                      ↗ {fmt(src.start)}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              key="loading"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: '3px 14px 14px 14px',
                padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center',
              }}>
                {[0, 1, 2].map((k) => (
                  <motion.div
                    key={k}
                    animate={reduce ? {} : { y: [0, -4, 0] }}
                    transition={{ duration: 0.55, repeat: Infinity, delay: k * 0.14 }}
                    style={{ width: 5, height: 5, background: 'var(--accent)', borderRadius: '50%', opacity: 0.7 }}
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
        padding: '8px 10px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 6, flexShrink: 0, alignItems: 'flex-end',
      }}>
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={videoId ? 'Ask about the lecture...' : 'Load a lecture first...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={!videoId}
          style={{
            flex: 1, background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)', borderRadius: 8,
            padding: '7px 11px', fontSize: 12,
            color: 'var(--text-primary)', outline: 'none',
            fontFamily: 'var(--font-sans)', resize: 'none',
            lineHeight: 1.5, minHeight: 34, maxHeight: 96,
            overflowY: 'auto',
          }}
        />
        <motion.button
          onClick={handleSend}
          disabled={!videoId || isLoading}
          whileHover={videoId && !isLoading ? (reduce ? {} : { scale: 1.06 }) : {}}
          whileTap={videoId && !isLoading ? (reduce ? {} : { scale: 0.94 }) : {}}
          style={{
            background: videoId ? 'var(--accent)' : 'var(--border)',
            color: '#fff', border: 'none', borderRadius: 8,
            width: 34, height: 34, cursor: videoId ? 'pointer' : 'not-allowed',
            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          ↑
        </motion.button>
      </div>
    </div>
  );
}