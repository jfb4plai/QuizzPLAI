import { useParams } from 'react-router-dom';
import { useActiveSessionForQuestionSet } from '../hooks/useActiveSessionForQuestionSet';
import { getQuestionSet } from '../lib/questionSets';
import { JoinedSession } from '../components/JoinedSession';

/**
 * Stable participant entry point, tied to a question set rather than one
 * session: the QR/link never changes across trainings, and always resolves
 * to whichever session is currently active for that question set.
 */
export function JoinBySet() {
  const { questionSetId } = useParams();

  let questionSet;
  try {
    questionSet = getQuestionSet(questionSetId);
  } catch {
    return <div className="plai-section plai-error">Jeu de questions inconnu : {questionSetId}</div>;
  }

  return <JoinBySetInner questionSet={questionSet} />;
}

function JoinBySetInner({ questionSet }) {
  const { sessionId, loading } = useActiveSessionForQuestionSet(questionSet.id);

  if (loading) return <div className="plai-section">Recherche d'une session en cours…</div>;
  if (!sessionId) {
    return (
      <div className="plai-section">
        <p className="plai-empty">
          Aucune session « {questionSet.titre} » en cours pour le moment. Attendez que l'agent en démarre une —
          cette page se met à jour automatiquement.
        </p>
      </div>
    );
  }

  return <JoinedSession sessionId={sessionId} />;
}
