import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { isValidSessionCode } from '../lib/sessionCode';
import { JoinedSession } from '../components/JoinedSession';

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
