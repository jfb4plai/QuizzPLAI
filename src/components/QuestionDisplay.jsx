export function QuestionDisplay({ questionIndex, totalQuestions, situation }) {
  return (
    <div className="plai-card">
      <p style={{ fontSize: '0.9rem', color: 'var(--text2)' }}>
        Question {questionIndex + 1} / {totalQuestions}
      </p>
      <p style={{ fontSize: '1.4rem', lineHeight: '1.5' }}>{situation}</p>
    </div>
  );
}
