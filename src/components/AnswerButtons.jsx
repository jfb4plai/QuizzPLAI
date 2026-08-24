const LABELS = ['A', 'B', 'C'];

export function AnswerButtons({ options, onVote, disabled }) {
  return (
    <div className="plai-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {options.map((option, i) => (
        <button
          key={i}
          type="button"
          className="plai-btn"
          style={{ minHeight: '44px', fontSize: '1.1rem', textAlign: 'left' }}
          disabled={disabled}
          onClick={() => onVote(i)}
        >
          <strong>{LABELS[i]}.</strong> {option}
        </button>
      ))}
    </div>
  );
}
