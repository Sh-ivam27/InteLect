'use client';

import { motion } from 'framer-motion';

interface Concept {
  name: string;
  status: 'unseen' | 'shaky' | 'confident';
}

interface ProgressPanelProps {
  concepts: Concept[];
  totalChunks: number;
  answeredQuestions: number;
  correctAnswers: number;
}

export default function ProgressPanel({
  concepts,
  totalChunks,
  answeredQuestions,
  correctAnswers,
}: ProgressPanelProps) {
  const confident = concepts.filter(c => c.status === 'confident').length;
  const shaky = concepts.filter(c => c.status === 'shaky').length;
  const unseen = concepts.filter(c => c.status === 'unseen').length;
  const accuracy = answeredQuestions > 0
    ? Math.round((correctAnswers / answeredQuestions) * 100)
    : 0;

  const statusColor = {
    confident: 'var(--success)',
    shaky: '#F59E0B',
    unseen: 'var(--text-muted)',
  };

  const statusBg = {
    confident: 'var(--success-bg)',
    shaky: '#2B1F0D',
    unseen: 'var(--bg-card)',
  };

  const statusBorder = {
    confident: 'var(--success-border)',
    shaky: '#854F0B',
    unseen: 'var(--border-subtle)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {[
          { label: 'Confident', value: confident, color: 'var(--success)' },
          { label: 'Shaky', value: shaky, color: '#F59E0B' },
          { label: 'Unseen', value: unseen, color: 'var(--text-muted)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '22px', fontWeight: 600, color: stat.color, fontFamily: 'var(--font-mono)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', letterSpacing: '0.3px' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Accuracy bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>QUIZ ACCURACY</span>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: accuracy >= 70 ? 'var(--success)' : accuracy >= 40 ? '#F59E0B' : 'var(--danger)',
            fontFamily: 'var(--font-mono)',
          }}>
            {accuracy}%
          </span>
        </div>
        <div style={{ height: '4px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${accuracy}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: accuracy >= 70 ? 'var(--success)' : accuracy >= 40 ? '#F59E0B' : 'var(--danger)',
              borderRadius: '4px',
            }}
          />
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
          {correctAnswers} correct out of {answeredQuestions} answered
        </div>
      </div>

      {/* Concepts list */}
      {concepts.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '12px',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.3px' }}>
            CONCEPTS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {concepts.map((concept, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  background: statusBg[concept.status],
                  borderRadius: '6px',
                  border: `1px solid ${statusBorder[concept.status]}`,
                }}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{concept.name}</span>
                <span style={{
                  fontSize: '10px',
                  color: statusColor[concept.status],
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.3px',
                }}>
                  {concept.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {concepts.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
          Complete some quizzes to track your progress
        </div>
      )}
    </div>
  );
}