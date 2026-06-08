'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
  onVideoSubmit: (url: string, videoId: string) => void;
  isLoading: boolean;
}

export default function Navbar({ onVideoSubmit, isLoading }: NavbarProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (!url.trim()) return;
    const videoId = extractVideoId(url);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }
    onVideoSubmit(url, videoId);
  };

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'fit-content' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '6px',
            height: '6px',
            background: 'var(--accent)',
            borderRadius: '50%',
            boxShadow: '0 0 8px var(--accent)',
          }}
        />
        <span style={{ fontSize: '15px', fontWeight: 600, color: 'white', letterSpacing: '-0.3px' }}>
          Inte<span style={{ color: 'var(--accent)' }}>Lect</span>
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>
          Stop watching. Start understanding.
        </span>
      </div>

      {/* URL Input */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '8px',
        maxWidth: '580px',
        margin: '0 auto',
        alignItems: 'center',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '0 8px 0 12px',
        height: '34px',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#334155" stroke="none"/>
        </svg>
        <input
          type="text"
          placeholder="Paste a YouTube lecture URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            fontSize: '12px',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'var(--font-mono)',
          }}
        />
        <motion.button
          onClick={handleSubmit}
          disabled={isLoading}
          whileHover={{ scale: isLoading ? 1 : 1.03 }}
          whileTap={{ scale: isLoading ? 1 : 0.97 }}
          style={{
            background: isLoading ? 'var(--border)' : 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0 14px',
            height: '26px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '0.2px',
          }}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-block', fontSize: '10px' }}
              >
                ⟳
              </motion.span>
              Processing
            </span>
          ) : 'Load Lecture'}
        </motion.button>
      </div>
    </nav>
  );
}