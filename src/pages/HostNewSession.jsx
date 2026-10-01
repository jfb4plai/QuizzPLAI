import { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { generateSessionCode } from '../lib/sessionCode';
import { loadQuestionSets } from '../lib/questionSets';
import { buildSessionOrder } from '../lib/shuffle';

const MAX_ATTEMPTS = 5;

export function HostNewSession() {
  const { session: authSession } = useAuth();
  const questionSets = loadQuestionSets();
  const [searchParams] = useSearchParams();
  const questionSetId = searchParams.get('set');

  const [nom, setNom] = useState('');
  const [dateSession, setDateSession] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { questionOrder, answerOrder } = buildSessionOrder(questionSets[questionSetId]);

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const code = generateSessionCode();
      const { data, error: insertError } = await supabase
        .from('quizz_sessions')
        .insert({
          code,
          nom,
          date_session: dateSession,
          question_set_id: questionSetId,
          question_order: questionOrder,
          answer_order: answerOrder,
          created_by: authSession.user.id,
          created_by_email: authSession.user.email,
        })
        .select()
        .single();

      if (!insertError) {
        navigate(`/host/session/${data.id}`);
        return;
      }
      // Unique violation on `code` — retry with a new code. Any other error, stop.
      if (insertError.code !== '23505') {
        setError("Impossible de créer la session. Réessayez.");
        setSubmitting(false);
        return;
      }
    }
    setError('Impossible de générer un code de session unique. Réessayez.');
    setSubmitting(false);
  }

  if (!questionSets[questionSetId]) {
    return <Navigate to="/host/dashboard" replace />;
  }

  return (
    <div className="plai-section">
      <form className="plai-card" onSubmit={handleSubmit} style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h1>Nouvelle session</h1>

        <label htmlFor="nom">Nom de la session</label>
        <input
          id="nom"
          className="plai-input"
          type="text"
          placeholder="École de Chaudfontaine"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
        <p style={{ fontSize: '0.85rem' }}>Sert à retrouver cette présentation dans le tableau de bord (école, contexte).</p>

        <label htmlFor="date">Date</label>
        <input
          id="date"
          className="plai-input"
          type="date"
          value={dateSession}
          onChange={(e) => setDateSession(e.target.value)}
          required
        />
        <p style={{ fontSize: '0.85rem' }}>Date réelle de la présentation en classe : sert à trier et identifier cette session dans l'historique du tableau de bord.</p>

        <p>Quiz : <strong>{questionSets[questionSetId].nom ?? questionSets[questionSetId].titre}</strong></p>
        <p style={{ fontSize: '0.85rem' }}>
          L'ordre des questions et des réponses est tiré au hasard à chaque nouvelle session, pour éviter que les
          participants retiennent des repères de position.
        </p>

        {error && <p className="plai-error">{error}</p>}

        <button className="plai-btn" type="submit" disabled={submitting}>
          {submitting ? 'Création…' : 'Créer la session'}
        </button>
      </form>
    </div>
  );
}
