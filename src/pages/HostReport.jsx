import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeBlock } from '../components/QRCodeBlock';

export function HostReport() {
  const { session: authSession } = useAuth();
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('quizz_sessions')
      .select('*, quizz_responses(count)')
      .eq('created_by', authSession.user.id)
      .order('date_session', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError('Impossible de charger le rapport. Réessayez.');
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
      <h1>Rapport des sessions</h1>
      <p className="no-print" style={{ fontSize: '0.85rem' }}>
        École, date, statut, QR code de la session et nombre de réponses collectées. Utilisez « Imprimer »
        pour obtenir une version papier ou PDF (via l'aperçu d'impression du navigateur).
      </p>

      <style>{'@media print { .no-print { display: none; } }'}</style>

      {error && <p className="plai-error">{error}</p>}
      {!error && sessions === null && <p>Chargement…</p>}
      {!error && sessions?.length === 0 && <p className="plai-empty">Aucune session à inclure dans le rapport.</p>}

      {!error && sessions?.length > 0 && (
        <>
          <button className="plai-btn no-print" type="button" onClick={() => window.print()}>
            Imprimer
          </button>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', padding: '0.5rem' }}>École</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', padding: '0.5rem' }}>Date</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', padding: '0.5rem' }}>Statut</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', padding: '0.5rem' }}>QR code</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', padding: '0.5rem' }}>Réponses</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>{s.nom}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>{s.date_session}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>{s.statut}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                    <QRCodeBlock url={`${window.location.origin}/join/${s.code}`} size={96} compact />
                  </td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                    {s.quizz_responses?.[0]?.count ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
