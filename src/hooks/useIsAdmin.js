import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Whether the current authenticated user is a QuizzPLAI admin (row present in
 * quizz_admins). Admins see every agent's sessions/responses, not just their own.
 */
export function useIsAdmin(userId) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    supabase
      .from('quizz_admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setIsAdmin(!!data);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { isAdmin, loading };
}
