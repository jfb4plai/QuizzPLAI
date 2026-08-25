import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définis (.env.local)');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Browsers throttle JS timers in background tabs, which can prevent supabase-js's
// automatic token refresh from firing in time on a long-idle tab — the next query
// after coming back then fails with "JWT expired". Forcing a refresh check whenever
// the tab regains visibility closes that gap (recommended by Supabase's own docs).
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
