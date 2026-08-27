import { loadQuestionSets } from '../lib/questionSets';
import { QRCodeBlock } from '../components/QRCodeBlock';

/**
 * Standalone page to grab a question set's stable join QR/link ahead of any
 * training — for printing, or embedding in slides — without needing to
 * create a session first. Only lists question sets opted into stableJoin.
 */
export function HostStableLinks() {
  const questionSets = loadQuestionSets();
  const stableSets = Object.values(questionSets).filter((set) => set.stableJoin);

  return (
    <div className="plai-section">
      <h1>Liens stables (QR réutilisables)</h1>
      <p style={{ fontSize: '0.85rem' }}>
        Pour les jeux de questions marqués comme réutilisables : un même QR pour toutes les sessions futures de ce
        jeu, à imprimer ou intégrer une fois pour toutes. Il redirige automatiquement vers la session en cours au
        moment du scan.
      </p>

      {stableSets.length === 0 && (
        <p className="plai-empty">Aucun jeu de questions n'est configuré en lien stable pour l'instant.</p>
      )}

      {stableSets.map((set) => {
        const url = `${window.location.origin}/join-set/${set.id}`;
        return (
          <div key={set.id} style={{ marginTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem' }}>{set.titre}</h2>
            <QRCodeBlock url={url} />
          </div>
        );
      })}
    </div>
  );
}
