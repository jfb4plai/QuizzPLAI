import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { countVotes } from '../lib/voteTally';

export function useResponseCounts(sessionId, questionIndex, numOptions) {
  const [counts, setCounts] = useState(new Array(numOptions).fill(0));

  useEffect(() => {
    if (!sessionId || questionIndex == null || questionIndex < 0) return;
    let cancelled = false;

    async function fetchCounts() {
      const { data, error } = await supabase
        .from('quizz_responses')
        .select('question_index, choice')
        .eq('session_id', sessionId)
        .eq('question_index', questionIndex);
      if (!cancelled && !error) {
        setCounts(countVotes(data, questionIndex, numOptions));
      }
    }

    fetchCounts();

    const channel = supabase
      .channel(`quizz_responses_${sessionId}_${questionIndex}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quizz_responses',
          filter: `session_id=eq.${sessionId}`,
        },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId, questionIndex, numOptions]);

  return counts;
}
