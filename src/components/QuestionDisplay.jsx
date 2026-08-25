export function QuestionDisplay({ titre, questionIndex, totalQuestions, situation }) {
  return (
    <div>
      <div className="plai-banner" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
        {titre}
      </div>
      <div className="plai-card">
        <p style={{ fontSize: '0.9rem', color: 'var(--text2)' }}>
          Question {questionIndex + 1} / {totalQuestions}
        </p>
        <p style={{ fontSize: '1.4rem', lineHeight: '1.5' }}>{situation}</p>
      </div>
    </div>
  );
}
