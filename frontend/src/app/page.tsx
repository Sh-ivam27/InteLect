'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

const FEATURES = [
  {
    icon: '◎',
    title: 'AI chat grounded to the lecture',
    body: 'Ask anything. Every answer is anchored to a specific timestamp in the video — not the open web.',
  },
  {
    icon: '◈',
    title: 'Quizzes that test the actual content',
    body: 'Generated from the transcript, not generic templates. Correct answers link back to the moment in the video that explains why.',
  },
  {
    icon: '◉',
    title: 'Full transcript, fully clickable',
    body: 'Every word synced to the video. Click any line to jump there instantly.',
  },
  {
    icon: '◐',
    title: 'Progress tracking per concept',
    body: 'Each quiz answer updates your mastery map. See exactly what you know and what needs another pass.',
  },
];

const DEMOS = [
  { label: 'HTML in 5 minutes', id: 'saIY_Sm6mv4' },
  { label: 'How DNS Works', id: 'uOfonONtIuk' },
  { label: 'Recursion explained', id: 'rf60MdHZdn8' },
];

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const reduce = useReducedMotion();

  const handleSubmit = () => {
    const id = extractVideoId(url.trim());
    if (!id) {
      setError('Paste a valid YouTube URL to continue.');
      return;
    }
    router.push(`/learn/${id}`);
  };

  const fadeUp = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
        };

  return (
    <main style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(8,9,16,0.85)',
        backdropFilter: 'blur(12px)',
        padding: '0 32px', height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.span
            animate={reduce ? {} : { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 10px var(--accent-glow)' }}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.4px' }}>
            Inte<span style={{ color: 'var(--accent)' }}>Lect</span>
          </span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.3px' }}>
          Stop watching. Start understanding.
        </span>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '96px 24px 72px', textAlign: 'center' }}>
        <motion.div {...fadeUp(0)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
          borderRadius: 20, padding: '4px 12px', marginBottom: 28,
          fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          FREE · NO SIGNUP NEEDED
        </motion.div>

        <motion.h1 {...fadeUp(0.08)} style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.04em',
          textWrap: 'balance',
          marginBottom: 20,
        }}>
          Every YouTube lecture,<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #AFA9EC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            made to be learned from.
          </span>
        </motion.h1>

        <motion.p {...fadeUp(0.14)} style={{
          fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7,
          maxWidth: 520, margin: '0 auto 40px', textWrap: 'pretty',
        }}>
          Paste a YouTube lecture URL. Get AI-powered chat, auto-generated quizzes, a searchable transcript, and concept-level progress tracking — all grounded to the video.
        </motion.p>

        {/* URL input */}
        <motion.div {...fadeUp(0.2)} style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center',
            background: 'var(--bg-card)',
            border: `1px solid ${error ? 'var(--danger-border)' : 'var(--border-subtle)'}`,
            borderRadius: 12, padding: '6px 6px 6px 14px',
            transition: 'border-color 0.2s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="var(--text-muted)" stroke="none"/>
            </svg>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
              }}
            />
            <motion.button
              onClick={handleSubmit}
              whileHover={reduce ? {} : { scale: 1.03 }}
              whileTap={reduce ? {} : { scale: 0.97 }}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 18px', fontSize: 13,
                fontWeight: 600, fontFamily: 'var(--font-sans)',
                cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '-0.2px',
              }}
            >
              Start learning →
            </motion.button>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8, textAlign: 'left' }}
            >
              {error}
            </motion.p>
          )}

          {/* Demo links */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>Try a demo:</span>
            {DEMOS.map((d) => (
              <motion.button
                key={d.id}
                onClick={() => router.push(`/learn/${d.id}`)}
                whileHover={reduce ? {} : { scale: 1.04, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                whileTap={reduce ? {} : { scale: 0.97 }}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  borderRadius: 20, padding: '4px 12px', fontSize: 11,
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {d.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 96px' }}>
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 }}
              whileHover={reduce ? {} : { background: 'var(--bg-card)' }}
              style={{
                background: 'var(--bg-secondary)',
                padding: '28px 26px',
                borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 22,
                color: 'var(--accent)', marginBottom: 14, lineHeight: 1,
              }}>
                {f.icon}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: 14, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.2px',
              }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {f.body}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, letterSpacing: '-0.3px' }}>
          Inte<span style={{ color: 'var(--accent)' }}>Lect</span>
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Built at BITS Pilani Hyderabad
        </span>
      </footer>
    </main>
  );
}