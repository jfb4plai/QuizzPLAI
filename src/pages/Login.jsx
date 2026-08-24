import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError('Connexion impossible. Vérifiez votre adresse et votre mot de passe.');
      return;
    }
    navigate('/host/dashboard');
  }

  return (
    <div className="plai-section">
      <form className="plai-card" onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h1>Connexion agent du pôle</h1>
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
        <p style={{ fontSize: '0.85rem' }}>Utilisée uniquement pour identifier l'agent créant la session.</p>

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          className="plai-input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p style={{ fontSize: '0.85rem' }}>Votre mot de passe de compte PLAI, partagé par les applications du pôle.</p>

        {error && <p className="plai-error">{error}</p>}

        <button className="plai-btn" type="submit" disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
