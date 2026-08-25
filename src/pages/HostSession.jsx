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

  // Sessions créées avant l'ajout du mélange aléatoire n'ont pas ces colonnes :
  // on retombe sur l'ordre naturel (identité) pour rester compatible.
  const questionOrder =
    session.question_order ?? questionSet.questions.map((_, i) => i);
  const answerOrder =
    session.answer_order ?? questionOrder.map(() => questionSet.reponses_possibles.map((_, i) => i));

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

  const displayIndex = session.current_question_index;
  const origQuestionIndex = questionOrder[displayIndex];
  const currentQuestion = questionSet.questions[origQuestionIndex];
  const optionOrder = answerOrder[displayIndex];
  const displayOptions = optionOrder.map((origOptIdx) => questionSet.reponses_possibles[origOptIdx]);
  const correctDisplayIndex = optionOrder.indexOf(currentQuestion.bonne_reponse);
  const isLive = session.statut === 'en_cours';

  return (
    <div className="plai-section">
      <h1 style={{ textAlign: 'center' }}>{session.nom}</h1>
      {isLive && <QRCodeBlock url={joinUrl} />}
      <QuestionDisplay
        titre={questionSet.titre}
        questionIndex={displayIndex}
        totalQuestions={questionSet.questions.length}
        situation={currentQuestion.situation}
      />
      <LiveResults
        sessionId={session.id}
        origQuestionIndex={origQuestionIndex}
        optionOrder={optionOrder}
        options={displayOptions}
        revealed={session.revealed}
        correctIndex={correctDisplayIndex}
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

function LiveResults({ sessionId, origQuestionIndex, optionOrder, options, revealed, correctIndex }) {
  const counts = useResponseCounts(sessionId, origQuestionIndex, optionOrder);
  return <ResultBars options={options} counts={counts} revealed={revealed} correctIndex={correctIndex} />;
}
