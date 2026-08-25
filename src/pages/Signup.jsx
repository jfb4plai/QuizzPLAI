import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);

    if (signUpError) {
      setError("Impossible de créer le compte. L'adresse est peut-être déjà utilisée.");
      return;
    }

    if (data.session) {
      // Confirmation e-mail désactivée sur ce projet Supabase : compte actif immédiatement.
      navigate('/host/dashboard');
      return;
    }

    setConfirmationSent(true);
  }

  if (confirmationSent) {
    return (
      <div className="plai-section">
        <div className="plai-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <p className="plai-success">
            Compte créé. Vérifiez votre boîte e-mail ({email}) et cliquez sur le lien de confirmation avant de vous
            connecter.
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
        <h1>Créer un compte agent du pôle</h1>

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
          Sert d'identifiant de connexion pour créer et retrouver vos sessions QuizzPLAI.
        </p>

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          className="plai-input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <p style={{ fontSize: '0.85rem' }}>Au moins 8 caractères. Choisissez un mot de passe que vous seul connaissez.</p>

        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
        <input
          id="confirmPassword"
          className="plai-input"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <p style={{ fontSize: '0.85rem' }}>Ressaisissez le même mot de passe pour éviter une faute de frappe.</p>

        {error && <p className="plai-error">{error}</p>}

        <button className="plai-btn" type="submit" disabled={submitting}>
          {submitting ? 'Création…' : 'Créer le compte'}
        </button>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          <Link to="/login">Déjà un compte ? Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
