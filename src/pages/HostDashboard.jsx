import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function HostDashboard() {
  const { session: authSession } = useAuth();
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(id, nom) {
    const confirmed = window.confirm(
      `Supprimer définitivement la session "${nom}" et toutes ses réponses ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);
    const { error: deleteError } = await supabase.from('quizz_sessions').delete().eq('id', id);
    setDeletingId(null);

    if (deleteError) {
      setError('Suppression impossible. Réessayez.');
      return;
    }
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('quizz_sessions')
      .select('*')
      .eq('created_by', authSession.user.id)
      .order('date_session', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError('Impossible de charger vos sessions. Réessayez.');
          return;
        }
        setSessions(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [authSession.user.id]);

  return (
    <div className="plai-section">
      <h1>Mes sessions</h1>
      <Link className="plai-btn" to="/host/new">
        Nouvelle session
      </Link>

      {error && <p className="plai-error">{error}</p>}
      {!error && sessions === null && <p>Chargement…</p>}
      {!error && sessions?.length === 0 && <p className="plai-empty">Aucune session pour l'instant.</p>}

      {!error && sessions?.map((s) => (
        <div
          key={s.id}
          className="plai-card"
          style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
        >
          <Link to={`/host/session/${s.id}`} style={{ flex: 1 }}>
            <strong>{s.nom}</strong> — {s.date_session} — {s.statut}
          </Link>
          <button
            type="button"
            className="plai-btn"
            onClick={() => handleDelete(s.id, s.nom)}
            disabled={deletingId === s.id}
          >
            {deletingId === s.id ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      ))}
    </div>
  );
}
