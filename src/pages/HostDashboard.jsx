import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function HostDashboard() {
  const { session: authSession } = useAuth();
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState(null);

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
        <Link key={s.id} to={`/host/session/${s.id}`} className="plai-card" style={{ display: 'block', marginTop: '0.75rem' }}>
          <strong>{s.nom}</strong> — {s.date_session} — {s.statut}
        </Link>
      ))}
    </div>
  );
}
