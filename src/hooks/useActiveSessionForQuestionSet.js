import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Resolves the most recent non-terminée session for a given question set,
 * and keeps tracking newer ones as they get created. Backs the "stable QR"
 * flow (src/pages/JoinBySet.jsx): a link that's the same across every
 * training run of a given question set, always redirecting participants to
 * whichever session is currently live for it.
 */
export function useActiveSessionForQuestionSet(questionSetId) {
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionSetId) return;
    let cancelled = false;

    supabase
      .from('quizz_sessions')
      .select('id')
      .eq('question_set_id', questionSetId)
      .neq('statut', 'terminee')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setSessionId(data?.id ?? null);
        setLoading(false);
      });

    const channel = supabase
      .channel(`quizz_sessions_active_${questionSetId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quizz_sessions',
          filter: `question_set_id=eq.${questionSetId}`,
        },
        (payload) => {
          if (!cancelled) setSessionId(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [questionSetId]);

  return { sessionId, loading };
}
