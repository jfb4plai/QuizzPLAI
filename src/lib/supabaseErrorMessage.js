import { supabase } from '../supabaseClient';

function isSessionExpiredError(error) {
  return !!error?.message && error.message.toLowerCase().includes('jwt expired');
}

/**
 * Turns a Supabase fetch error into a user-facing message. If the error is an
 * expired session (a long-idle browser tab can miss its automatic token
 * refresh — see src/main.jsx for the visibility-based mitigation), signs the
 * user out and sends them back to /login instead of showing a cryptic error.
 */
export function friendlyFetchError(error, fallbackMessage) {
  if (isSessionExpiredError(error)) {
    supabase.auth.signOut().finally(() => {
      window.location.href = '/login';
    });
    return 'Votre session a expiré. Reconnexion…';
  }
  return `${fallbackMessage} ${error?.message ?? ''}`;
}
