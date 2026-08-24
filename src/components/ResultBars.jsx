const LABELS = ['A', 'B', 'C'];

export function ResultBars({ options, counts, revealed, correctIndex }) {
  const total = counts.reduce((sum, c) => sum + c, 0);

  return (
    <div className="plai-card">
      {options.map((option, i) => {
        const pct = total === 0 ? 0 : Math.round((counts[i] / total) * 100);
        const isCorrect = revealed && correctIndex === i;
        return (
          <div key={i} style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                <strong>{LABELS[i]}.</strong> {option}
                {isCorrect && <span className="plai-success"> — bonne réponse</span>}
              </span>
              <span>{counts[i]} ({pct}%)</span>
            </div>
            <div style={{ background: 'var(--border)', borderRadius: '4px', height: '12px' }}>
              <div
                style={{
                  width: `${pct}%`,
                  background: isCorrect ? '#0a9370' : '#f97316',
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease',
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
