import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (resetError) {
      setError('Impossible d\'envoyer le lien de réinitialisation. Réessayez.');
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="plai-section">
        <div className="plai-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <p className="plai-success">
            Si un compte existe pour {email}, un lien de réinitialisation vient d'être envoyé. Vérifiez votre boîte
            e-mail.
          </p>
          <Link className="plai-btn" to="/login" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="plai-section">
      <form className="plai-card" onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1>Mot de passe oublié</h1>

        <label htmlFor="email">Adresse e-mail</label>
        <input
          id="email"
          className="plai-input"
          type="email"
          placeholder="prenom.nom@ens.ecl.be"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p style={{ fontSize: '0.85rem' }}>
          L'adresse utilisée pour votre compte agent PLAI. Vous recevrez un lien pour choisir un nouveau mot de
          passe.
        </p>

        {error && <p className="plai-error">{error}</p>}

        <button className="plai-btn" type="submit" disabled={submitting}>
          {submitting ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
        </button>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </form>
    </div>
  );
}
