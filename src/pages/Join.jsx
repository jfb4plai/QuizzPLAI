import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSessionRealtime } from '../hooks/useSessionRealtime';
import { getQuestionSet } from '../lib/questionSets';
import { isValidSessionCode } from '../lib/sessionCode';
import { QuestionDisplay } from '../components/QuestionDisplay';
import { AnswerButtons } from '../components/AnswerButtons';

function votedKey(sessionId, questionIndex) {
  return `quizz_voted_${sessionId}_${questionIndex}`;
}

export function Join() {
  const { code } = useParams();
  const [sessionId, setSessionId] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const normalizedCode = code.toUpperCase();

  useEffect(() => {
    if (!isValidSessionCode(normalizedCode)) {
      setLookupError(true);
      return;
    }
    let cancelled = false;
    supabase
      .from('quizz_sessions')
      .select('id')
      .eq('code', normalizedCode)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setLookupError(true);
        } else {
          setSessionId(data.id);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [normalizedCode]);

  if (lookupError) {
    return <div className="plai-section plai-error">Code de session inconnu : {code}</div>;
  }
  if (!sessionId) {
    return <div className="plai-section">Recherche de la session…</div>;
  }

  return <JoinedSession sessionId={sessionId} />;
}

function JoinedSession({ sessionId }) {
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
