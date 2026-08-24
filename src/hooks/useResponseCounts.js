import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { countVotes } from '../lib/voteTally';

/**
 * Tallies votes for one question, in *display* order.
 *
 * `quizz_responses.choice` always stores the ORIGINAL option index (stable across
 * sessions with different shuffles, so results stay comparable — see src/lib/shuffle.js).
 * `optionOrder` is this session's display order for the question (an array of original
 * option indices), used to remap each stored choice to the position it's shown at
 * (A/B/C) before counting, so the returned counts line up with `options` as rendered.
 */
export function useResponseCounts(sessionId, origQuestionIndex, optionOrder) {
  const numOptions = optionOrder.length;
  const [counts, setCounts] = useState(new Array(numOptions).fill(0));

  useEffect(() => {
    if (!sessionId || origQuestionIndex == null || origQuestionIndex < 0) return;
    let cancelled = false;

    async function fetchCounts() {
      const { data, error } = await supabase
        .from('quizz_responses')
        .select('question_index, choice')
        .eq('session_id', sessionId)
        .eq('question_index', origQuestionIndex);
      if (!cancelled && !error) {
        const displayRows = data.map((r) => ({
          question_index: origQuestionIndex,
          choice: optionOrder.indexOf(r.choice),
        }));
        setCounts(countVotes(displayRows, origQuestionIndex, numOptions));
      }
    }

    fetchCounts();

    const channel = supabase
      .channel(`quizz_responses_${sessionId}_${origQuestionIndex}`)
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
  }, [sessionId, origQuestionIndex, optionOrder, numOptions]);

  return counts;
}
