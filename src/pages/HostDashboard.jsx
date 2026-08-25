import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useIsAdmin } from '../hooks/useIsAdmin';

export function HostDashboard() {
  const { session: authSession } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(authSession.user.id);
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
    if (adminLoading) return;
    let cancelled = false;
    let query = supabase.from('quizz_sessions').select('*').order('date_session', { ascending: false });
    if (!isAdmin) {
      query = query.eq('created_by', authSession.user.id);
    }
    query.then(({ data, error: fetchError }) => {
      if (cancelled) return;
      if (fetchError) {
        console.error('quizz_sessions fetch error', fetchError);
        setError(`Impossible de charger les sessions. ${fetchError.message ?? ''}`);
        return;
      }
      setSessions(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [authSession.user.id, isAdmin, adminLoading]);

  // Sessions arrivent déjà triées par date décroissante : en regroupant par
  // ordre de première rencontre, chaque groupe (= école, via le champ "nom")
  // se retrouve naturellement trié par session la plus récente.
  const groups = [];
  if (sessions) {
    const byNom = new Map();
    for (const s of sessions) {
      if (!byNom.has(s.nom)) {
        const group = { nom: s.nom, items: [] };
        byNom.set(s.nom, group);
        groups.push(group);
      }
      byNom.get(s.nom).items.push(s);
    }
  }

  return (
    <div className="plai-section">
      <h1>{isAdmin ? 'Toutes les sessions (vue admin)' : 'Mes sessions'}</h1>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link className="plai-btn" to="/host/new">
          Nouvelle session
        </Link>
        <Link className="plai-btn" to="/host/report">
          Rapport imprimable
        </Link>
      </div>

      {error && <p className="plai-error">{error}</p>}
      {!error && sessions === null && <p>Chargement…</p>}
      {!error && sessions?.length === 0 && <p className="plai-empty">Aucune session pour l'instant.</p>}

      {!error && groups.map((group) => (
        <div key={group.nom} style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>{group.nom}</h2>
          {group.items.map((s) => {
            const isOwn = s.created_by === authSession.user.id;
            return (
              <div
                key={s.id}
                className="plai-card"
                style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
              >
                <Link to={`/host/session/${s.id}`} style={{ flex: 1 }}>
                  {s.date_session} — {s.statut}
                  {isAdmin && !isOwn && s.created_by_email && (
                    <span style={{ color: 'var(--text3)' }}> — créé par {s.created_by_email}</span>
                  )}
                </Link>
                {isOwn && (
                  <button
                    type="button"
                    className="plai-btn"
                    onClick={() => handleDelete(s.id, s.nom)}
                    disabled={deletingId === s.id}
                  >
                    {deletingId === s.id ? 'Suppression…' : 'Supprimer'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
