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
  const currentQuestion = questionSet.questions[session.current_question_index];

  async function handleVote(choice) {
    await supabase.from('quizz_responses').insert({
      session_id: session.id,
      question_index: session.current_question_index,
      choice,
    });
    sessionStorage.setItem(votedKey(session.id, session.current_question_index), '1');
    setVoted(true);
  }

  return (
    <div className="plai-section">
      <QuestionDisplay
        questionIndex={session.current_question_index}
        totalQuestions={questionSet.questions.length}
        situation={currentQuestion.situation}
      />
      {voted ? (
        <p className="plai-success">Réponse enregistrée — en attente de la suite.</p>
      ) : (
        <AnswerButtons options={questionSet.reponses_possibles} onVote={handleVote} disabled={false} />
      )}
    </div>
  );
}
