'use client';

import { useState } from 'react';

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
    onVideoSubmit(url, videoId); // this function call is received by "page.tsx" which in turn calls transcribeVideo() from "api.ts", then the backend transcribes it and returns the chunks which are received by "page.tsx" which stores the chunks in state and passes chunks down to VideoPlayer, ChatPanel etc. 
    };

  const extractVideoId = (url: string): string | null => { // extracts the video ID from the URL
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
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'fit-content' }}>
        <span style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>
          Inte<span style={{ color: 'var(--accent)' }}>Lect</span>
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Stop watching. Start understanding.
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: '8px', maxWidth: '600px', margin: '0 auto' }}>
        <input
          type="text"
          placeholder="Paste a YouTube lecture URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{
            flex: 1,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '13px',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={{
            background: isLoading ? 'var(--border)' : 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {isLoading ? 'Processing...' : 'Load Lecture'}
        </button>
      </div>
    </nav>
  );
}