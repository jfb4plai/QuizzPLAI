import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useSessionRealtime(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    async function fetchSession() {
      const { data, error: fetchError } = await supabase
        .from('quizz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (cancelled) return;
      if (fetchError) {
        setError(fetchError);
      } else {
        setSession(data);
      }
      setLoading(false);
    }

    fetchSession();

    const channel = supabase
      .channel(`quizz_sessions_${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'quizz_sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          if (!cancelled) setSession(payload.new);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { session, loading, error };
}
