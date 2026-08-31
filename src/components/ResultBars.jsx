const LABELS = ['A', 'B', 'C'];

export function ResultBars({ options, counts, revealed, correctIndices }) {
  const total = counts.reduce((sum, c) => sum + c, 0);

  return (
    <div className="plai-card">
      {/* Pulse joue 2 fois puis s'arrête (pas un clignotement continu, pour rester
          confortable pour les personnes sensibles aux animations/photosensibles). */}
      <style>{`
        @keyframes quizzplai-correct-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(10, 147, 112, 0.45); }
          50% { box-shadow: 0 0 0 10px rgba(10, 147, 112, 0); }
        }
      `}</style>
      {options.map((option, i) => {
        const pct = total === 0 ? 0 : Math.round((counts[i] / total) * 100);
        const isCorrect = revealed && correctIndices.includes(i);
        const isWrong = revealed && !correctIndices.includes(i);
        return (
          <div
            key={i}
            style={{
              marginBottom: '0.75rem',
              padding: '0.5rem',
              borderRadius: '6px',
              border: isCorrect ? '2px solid #0a9370' : '2px solid transparent',
              background: isCorrect ? 'rgba(10, 147, 112, 0.1)' : 'transparent',
              opacity: isWrong ? 0.45 : 1,
              animation: isCorrect ? 'quizzplai-correct-pulse 0.8s ease-out 2' : 'none',
              transition: 'opacity 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {isCorrect && <span aria-hidden="true">✓ </span>}
                <strong>{LABELS[i]}.</strong> {option}
                {isCorrect && (
                  <span
                    style={{
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clip: 'rect(0,0,0,0)',
                    }}
                  >
                    {' '}— bonne réponse
                  </span>
                )}
              </span>
              <span>{counts[i]} ({pct}%)</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: '4px', height: '12px', marginTop: '0.25rem' }}>
              <div
                style={{
                  width: `${pct}%`,
                  background: isCorrect ? '#0a9370' : isWrong ? '#9ca3af' : '#f97316',
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease, background 0.3s ease',
                }}
              />
            </div>
          </div>
        );
      })}
      <p style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>{total} réponse{total !== 1 ? 's' : ''}</p>
    </div>
  );
}
