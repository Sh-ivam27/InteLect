'use client';

import YouTube from 'react-youtube';

interface Chunk {
  start: number;
  end: number;
  text: string;
}

interface VideoPlayerProps {
  videoId: string;
  chunks: Chunk[];
  highlightedTimestamps: number[];
  onPlayerReady: (player: any) => void;
}

export default function VideoPlayer({
  videoId,
  chunks,
  highlightedTimestamps,
  onPlayerReady,
}: VideoPlayerProps) {
  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      flex: 1,
      background: 'var(--bg-tertiary)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border)',
    }}>
      <div style={{ flex: 1, background: '#000', minHeight: 0 }}>
        {videoId ? (
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={(e) => onPlayerReady(e.target)} // YouTube passes on the player to VideoPlayer which in turn passes the player to "page.tsx", then whenever user clicks on a particular timestamp, "page.tsx" triggers seekTo() and the video jumps to that moment
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '14px',
          }}>
            Paste a YouTube URL above to get started
          </div>
        )}
      </div>

      {highlightedTimestamps.length > 0 && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sources →</span>
          {highlightedTimestamps.map((ts, i) => (
            <button
              key={i}
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--accent)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '3px 10px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {formatTime(ts)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}