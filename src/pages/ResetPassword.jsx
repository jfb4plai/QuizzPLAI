import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError("Lien de réinitialisation invalide ou expiré. Redemandez un lien depuis « Mot de passe oublié ».");
      return;
    }

    navigate('/host/dashboard');
  }

  return (
    <div className="plai-section">
      <form className="plai-card" onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1>Choisir un nouveau mot de passe</h1>

        <label htmlFor="password">Nouveau mot de passe</label>
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
        <p style={{ fontSize: '0.85rem' }}>Au moins 8 caractères. Remplace définitivement votre ancien mot de passe.</p>

        <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
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
          {submitting ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
        </button>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          <Link to="/login">Retour à la connexion</Link>
        </p>
      </form>
    </div>
  );
}
