import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { QRCodeBlock } from '../components/QRCodeBlock';
import { loadQuestionSets } from '../lib/questionSets';
import { buildQuestionAnalysisRows } from '../lib/questionAnalysis';
import { downloadQuestionAnalysisXlsx } from '../lib/exportXlsx';
import { friendlyFetchError } from '../lib/supabaseErrorMessage';

export function HostReport() {
  const { session: authSession } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin(authSession.user.id);
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  async function handleExportXlsx() {
    setExporting(true);
    setExportError(null);
    const { data, error: fetchError } = await supabase
      .from('quizz_responses')
      .select('question_index, choice, quizz_sessions(nom, question_set_id)');

    if (fetchError) {
      console.error('quizz_responses export fetch error', fetchError);
      setExportError(friendlyFetchError(fetchError, 'Impossible de générer le fichier .xlsx.'));
      setExporting(false);
      return;
    }

    const rows = (data ?? []).map((r) => ({
      ecole: r.quizz_sessions?.nom ?? '(école inconnue)',
      question_set_id: r.quizz_sessions?.question_set_id,
      question_index: r.question_index,
      choice: r.choice,
    }));
    const analysis = buildQuestionAnalysisRows(rows, loadQuestionSets());
    await downloadQuestionAnalysisXlsx(analysis);
    setExporting(false);
  }

  useEffect(() => {
    if (adminLoading) return;
    let cancelled = false;
    let query = supabase
      .from('quizz_sessions')
      .select('*, quizz_responses(count)')
      .order('date_session', { ascending: false });
    if (!isAdmin) {
      query = query.eq('created_by', authSession.user.id);
    }
    query.then(({ data, error: fetchError }) => {
      if (cancelled) return;
      if (fetchError) {
        console.error('quizz_sessions report fetch error', fetchError);
        setError(friendlyFetchError(fetchError, 'Impossible de charger le rapport.'));
        return;
      }
      setSessions(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [authSession.user.id, isAdmin, adminLoading]);

  return (
    <div className="plai-section">
      <h1>{isAdmin ? 'Rapport consolidé (toutes les sessions, tous les agents)' : 'Rapport des sessions'}</h1>
      <p className="no-print" style={{ fontSize: '0.85rem' }}>
        École, date, statut, QR code de la session et nombre de réponses collectées. Utilisez « Imprimer »
        pour obtenir une version papier ou PDF (via l'aperçu d'impression du navigateur), ou « Exporter en .xlsx »
        pour repérer les questions qui posent le plus de difficultés, détaillé par école, sur l'ensemble des
        sessions {isAdmin ? 'de tous les agents du pôle' : 'que vous avez réalisées'} (pas seulement les plus
        récentes).
      </p>

      <style>{'@media print { .no-print { display: none; } }'}</style>

      <button
        className="plai-btn no-print"
        type="button"
        onClick={handleExportXlsx}
        disabled={exporting}
        style={{ marginBottom: '0.5rem' }}
      >
        {exporting ? 'Génération…' : 'Exporter en .xlsx (analyse par question)'}
      </button>
      {exportError && <p className="plai-error no-print">{exportError}</p>}

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
                {isAdmin && (
                  <th style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', padding: '0.5rem' }}>Agent</th>
                )}
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
                  {isAdmin && (
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                      {s.created_by_email ?? '—'}
                    </td>
                  )}
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
