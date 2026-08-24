import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { generateSessionCode } from '../lib/sessionCode';
import { loadQuestionSets } from '../lib/questionSets';

const MAX_ATTEMPTS = 5;

export function HostNewSession() {
  const { session: authSession } = useAuth();
  const questionSets = loadQuestionSets();
  const setIds = Object.keys(questionSets);

  const [nom, setNom] = useState('');
  const [dateSession, setDateSession] = useState(() => new Date().toISOString().slice(0, 10));
  const [questionSetId, setQuestionSetId] = useState(setIds[0] ?? '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const code = generateSessionCode();
      const { data, error: insertError } = await supabase
        .from('quizz_sessions')
        .insert({
          code,
          nom,
          date_session: dateSession,
          question_set_id: questionSetId,
          created_by: authSession.user.id,
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

        <label htmlFor="questionSet">Jeu de questions</label>
        <select
          id="questionSet"
          className="plai-input"
          value={questionSetId}
          onChange={(e) => setQuestionSetId(e.target.value)}
        >
          {setIds.map((id) => (
            <option key={id} value={id}>
              {questionSets[id].titre}
            </option>
          ))}
        </select>
        <p style={{ fontSize: '0.85rem' }}>Détermine les questions et les 3 réponses proposées durant toute la session.</p>

        {error && <p className="plai-error">{error}</p>}

        <button className="plai-btn" type="submit" disabled={submitting || setIds.length === 0}>
          {submitting ? 'Création…' : 'Créer la session'}
        </button>
      </form>
    </div>
  );
}
