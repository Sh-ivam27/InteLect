'use client';

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
  const confident = concepts.filter(c => c.status === 'confident').length; // green -> got questions right about this concept
  const shaky = concepts.filter(c => c.status === 'shaky').length; // amber -> got questions wrong about this concept
  const unseen = concepts.filter(c => c.status === 'unseen').length; // gray -> havent been tested on this yet 
  const accuracy = answeredQuestions > 0
    ? Math.round((correctAnswers / answeredQuestions) * 100)
    : 0; // shows a progress bar where colour changes based on score 

  const statusColor = {
    confident: '#10B981',
    shaky: '#F59E0B',
    unseen: 'var(--text-muted)',
  };

  const statusBg = {
    confident: '#0D2B1F',
    shaky: '#2B1F0D',
    unseen: 'var(--bg-secondary)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>{confident}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Confident</div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#F59E0B' }}>{shaky}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Shaky</div>
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-muted)' }}>{unseen}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Unseen</div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Quiz Accuracy
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            flex: 1,
            height: '6px',
            background: 'var(--bg-tertiary)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${accuracy}%`,
              height: '100%',
              background: accuracy >= 70 ? '#10B981' : accuracy >= 40 ? '#F59E0B' : '#EF4444',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {accuracy}%
          </span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
          {correctAnswers} correct out of {answeredQuestions} answered
        </div>
      </div>

      {concepts.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Concepts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {concepts.map((concept, i) => (  // each concept shown with its status colour, confident <- green, shaky <- amber, unseen <- gray
              <div key={i} style={{
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                background: statusBg[concept.status],
                borderRadius: '6px',
                border: `1px solid ${statusColor[concept.status]}33`,
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                  {concept.name} {/* name of the concept */}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: statusColor[concept.status],
                  textTransform: 'capitalize',
                }}>
                  {concept.status} {/* confident / shaky / unseen */}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {concepts.length === 0 && (
        <div style={{
          color: 'var(--text-muted)',
          fontSize: '12px',
          textAlign: 'center',
          marginTop: '20px',
        }}>
          Complete some quizzes to track your progress
        </div>
      )}
    </div>
  );
}