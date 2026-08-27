import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useSessionRealtime } from '../hooks/useSessionRealtime';
import { getQuestionSet } from '../lib/questionSets';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerButtons } from './AnswerButtons';

function votedKey(sessionId, questionIndex) {
  return `quizz_voted_${sessionId}_${questionIndex}`;
}

/**
 * The participant-facing live view once a specific session id is known —
 * shared by src/pages/Join.jsx (join by per-session code) and
 * src/pages/JoinBySet.jsx (join by stable per-question-set link).
 */
export function JoinedSession({ sessionId }) {
  const { session, loading } = useSessionRealtime(sessionId);
  const [voted, setVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voteError, setVoteError] = useState(null);

  useEffect(() => {
    if (!session) return;
    setVoted(!!sessionStorage.getItem(votedKey(session.id, session.current_question_index)));
  }, [session?.id, session?.current_question_index]);

  if (loading || !session) return <div className="plai-section">Chargement…</div>;

  if (session.statut === 'en_attente') {
    return <div className="plai-section">La session va commencer…</div>;
  }
  if (session.statut === 'terminee') {
    return <div className="plai-section">Merci pour votre participation !</div>;
  }

  const questionSet = getQuestionSet(session.question_set_id);

  // Sessions créées avant l'ajout du mélange aléatoire n'ont pas ces colonnes :
  // on retombe sur l'ordre naturel (identité) pour rester compatible.
  const questionOrder =
    session.question_order ?? questionSet.questions.map((_, i) => i);
  const answerOrder =
    session.answer_order ?? questionOrder.map(() => questionSet.reponses_possibles.map((_, i) => i));

  const displayIndex = session.current_question_index;
  const origQuestionIndex = questionOrder[displayIndex];
  const currentQuestion = questionSet.questions[origQuestionIndex];
  const optionOrder = answerOrder[displayIndex];
  const displayOptions = optionOrder.map((origOptIdx) => questionSet.reponses_possibles[origOptIdx]);

  async function handleVote(displayChoice) {
    if (submitting) return;
    setSubmitting(true);
    setVoteError(null);
    const { error } = await supabase.from('quizz_responses').insert({
      session_id: session.id,
      question_index: origQuestionIndex,
      choice: optionOrder[displayChoice],
    });
    if (error) {
      setVoteError('Vote non enregistré. Réessayez.');
      setSubmitting(false);
      return;
    }
    sessionStorage.setItem(votedKey(session.id, displayIndex), '1');
    setVoted(true);
    setSubmitting(false);
  }

  return (
    <div className="plai-section">
      <QuestionDisplay
        titre={questionSet.titre}
        questionIndex={displayIndex}
        totalQuestions={questionSet.questions.length}
        situation={currentQuestion.situation}
      />
      {voted ? (
        <p className="plai-success">Réponse enregistrée — en attente de la suite.</p>
      ) : (
        <>
          <AnswerButtons options={displayOptions} onVote={handleVote} disabled={submitting} />
          {voteError && <p className="plai-error">{voteError}</p>}
        </>
      )}
    </div>
  );
}
