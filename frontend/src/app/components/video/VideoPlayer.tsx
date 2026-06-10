'use client';

import YouTube from 'react-youtube';
import { motion, useReducedMotion } from 'framer-motion';

interface Chunk { start: number; end: number; text: string; }

interface VideoPlayerProps {
  videoId: string;
  chunks: Chunk[];
  highlightedTimestamps: number[];
  onPlayerReady: (player: any) => void;
  onTimestampClick: (timestamp: number) => void;
}

export default function VideoPlayer({ videoId, onPlayerReady }: VideoPlayerProps) {
  const reduce = useReducedMotion();

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: { autoplay: 0 },
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: '#060810',
      position: 'relative',
    }}>
      {videoId ? (
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={(e) => onPlayerReady(e.target)}
          style={{ width: '100%', height: '100%', display: 'block' }}
          iframeClassName="yt-iframe"
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          <motion.div
            animate={reduce ? {} : { scale: [1, 1.06, 1], opacity: [0.35, 0.65, 0.35] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 52, height: 52, borderRadius: '50%',
              border: '1.5px solid var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </motion.div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
            Paste a YouTube URL to get started
          </span>
        </div>
      )}
    </div>
  );
}