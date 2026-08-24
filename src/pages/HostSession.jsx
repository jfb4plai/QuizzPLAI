import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useSessionRealtime } from '../hooks/useSessionRealtime';
import { useResponseCounts } from '../hooks/useResponseCounts';
import { getQuestionSet } from '../lib/questionSets';
import { QRCodeBlock } from '../components/QRCodeBlock';
import { QuestionDisplay } from '../components/QuestionDisplay';
import { ResultBars } from '../components/ResultBars';

export function HostSession() {
  const { id } = useParams();
  const { session, loading, error } = useSessionRealtime(id);
  const [actionError, setActionError] = useState(null);

  if (loading) return <div className="plai-section">Chargement…</div>;
  if (error || !session) return <div className="plai-section plai-error">Session introuvable.</div>;

  const questionSet = getQuestionSet(session.question_set_id);
  const joinUrl = `${window.location.origin}/join/${session.code}`;

  async function startSession() {
    setActionError(null);
    const { error } = await supabase
      .from('quizz_sessions')
      .update({ current_question_index: 0, statut: 'en_cours' })
      .eq('id', session.id);
    if (error) setActionError('Action impossible. Réessayez.');
  }

  async function reveal() {
    setActionError(null);
    const { error } = await supabase
      .from('quizz_sessions')
      .update({ revealed: true })
      .eq('id', session.id);
    if (error) setActionError('Action impossible. Réessayez.');
  }

  async function nextQuestion() {
    setActionError(null);
    const nextIndex = session.current_question_index + 1;
    if (nextIndex >= questionSet.questions.length) {
      const { error } = await supabase
        .from('quizz_sessions')
        .update({ statut: 'terminee' })
        .eq('id', session.id);
      if (error) setActionError('Action impossible. Réessayez.');
    } else {
      const { error } = await supabase
        .from('quizz_sessions')
        .update({ current_question_index: nextIndex, revealed: false })
        .eq('id', session.id);
      if (error) setActionError('Action impossible. Réessayez.');
    }
  }

  async function endSession() {
    setActionError(null);
    const { error } = await supabase
      .from('quizz_sessions')
      .update({ statut: 'terminee' })
      .eq('id', session.id);
    if (error) setActionError('Action impossible. Réessayez.');
  }

  if (session.statut === 'en_attente') {
    return (
      <div className="plai-section">
        <h1 style={{ textAlign: 'center' }}>{session.nom}</h1>
        <QRCodeBlock url={joinUrl} />
        <p>Code de session : <strong>{session.code}</strong></p>
        {actionError && <p className="plai-error">{actionError}</p>}
        <button className="plai-btn" type="button" onClick={startSession}>
          Démarrer la session
        </button>
      </div>
    );
  }

  const currentQuestion = questionSet.questions[session.current_question_index];
  const isLive = session.statut === 'en_cours';

  return (
    <div className="plai-section">
      <h1>{session.nom}</h1>
      {isLive && <QRCodeBlock url={joinUrl} />}
      <QuestionDisplay
        questionIndex={session.current_question_index}
        totalQuestions={questionSet.questions.length}
        situation={currentQuestion.situation}
      />
      <LiveResults
        sessionId={session.id}
        questionIndex={session.current_question_index}
        options={questionSet.reponses_possibles}
        revealed={session.revealed}
        correctIndex={currentQuestion.bonne_reponse}
      />
      {session.revealed && <p className="plai-card">{currentQuestion.explication}</p>}

      {isLive && (
        <>
        {actionError && <p className="plai-error">{actionError}</p>}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!session.revealed && (
            <button className="plai-btn" type="button" onClick={reveal}>
              Révéler la réponse
            </button>
          )}
          <button className="plai-btn" type="button" onClick={nextQuestion}>
            Question suivante
          </button>
          <button className="plai-btn" type="button" onClick={endSession}>
            Terminer la session
          </button>
        </div>
        </>
      )}
    </div>
  );
}

function LiveResults({ sessionId, questionIndex, options, revealed, correctIndex }) {
  const counts = useResponseCounts(sessionId, questionIndex, options.length);
  return <ResultBars options={options} counts={counts} revealed={revealed} correctIndex={correctIndex} />;
}
