'use client';

import { useState } from 'react';
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
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      width: '320px',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--border)',
    }}>
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Ask anything</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Grounded to this lecture
        </div>
      </div>

      <div style={{
        flex: 1,
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        overflowY: 'auto',
      }}>
        {messages.length === 0 && (
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '12px',
            textAlign: 'center',
            marginTop: '20px',
          }}>
            Ask a question about the lecture to get started
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: '4px',
          }}>
            <div style={{
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              padding: '8px 12px',
              borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              fontSize: '12px',
              lineHeight: '1.5',
              maxWidth: '85%',
            }}>
              {msg.content}
            </div>

            {msg.sources && msg.sources.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {msg.sources.map((source, j) => (
                  <button
                    key={j}
                    onClick={() => onTimestampClick(source.start)}
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--accent)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    ↗ {formatTime(source.start)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '12px',
            alignSelf: 'flex-start',
          }}>
            Thinking...
          </div>
        )}
      </div>

      <div style={{
        padding: '10px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: '6px',
      }}>
        <input
          type="text"
          placeholder={videoId ? "Ask about the lecture..." : "Load a lecture first..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={!videoId}
          style={{
            flex: 1,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px 10px',
            fontSize: '12px',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!videoId || isLoading}
          style={{
            background: videoId ? 'var(--accent)' : 'var(--border)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            cursor: videoId ? 'pointer' : 'not-allowed',
            fontSize: '16px',
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}