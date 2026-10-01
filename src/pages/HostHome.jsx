import { Link } from 'react-router-dom';
import { loadQuestionSets } from '../lib/questionSets';

export function HostHome() {
  const questionSets = loadQuestionSets();
  return (
    <div className="plai-section">
      <h1>Mes quiz</h1>
      <p>Choisissez un quiz pour voir ses sessions ou en créer une nouvelle.</p>
      {Object.values(questionSets).map((set) => (
        <div key={set.id} className="plai-card" style={{ marginTop: '0.75rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>{set.nom ?? set.titre}</h2>
          <p style={{ fontSize: '0.85rem' }}>{set.questions.length} questions</p>
          <Link className="plai-btn" to={`/host/dashboard/${set.id}`}>
            Ouvrir le tableau de bord
          </Link>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <Link className="plai-btn" to="/host/report">
          Rapport (tous les quiz)
        </Link>
      </div>
    </div>
  );
}
