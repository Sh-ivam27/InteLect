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
  onPlayerReady: (player: any) => void;
}

export default function VideoPlayer({
  videoId,
  chunks,
  onPlayerReady,
}: VideoPlayerProps) {
  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
    },
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
            onReady={(e) => onPlayerReady(e.target)}
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
    </div>
  );
}