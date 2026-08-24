export function validateQuestionSet(set) {
  if (!Array.isArray(set.reponses_possibles) || set.reponses_possibles.length !== 3) {
    throw new Error(`reponses_possibles doit contenir exactement 3 réponses (set "${set.id}")`);
  }
  if (!Array.isArray(set.questions) || set.questions.length === 0) {
    throw new Error(`questions ne peut pas être vide (set "${set.id}")`);
  }
  set.questions.forEach((q, i) => {
    if (!q.situation || typeof q.situation !== 'string') {
      throw new Error(`question ${i} : situation manquante ou invalide (set "${set.id}")`);
    }
    if (
      typeof q.bonne_reponse !== 'number' ||
      q.bonne_reponse < 0 ||
      q.bonne_reponse >= set.reponses_possibles.length
    ) {
      throw new Error(`question ${i} : bonne_reponse hors limites (set "${set.id}")`);
    }
  });
  return set;
}

const modules = import.meta.glob('../question-sets/*.json', { eager: true });

function fileNameToKey(path) {
  return path.split('/').pop();
}

export function loadQuestionSets() {
  const byFile = {};
  for (const [path, mod] of Object.entries(modules)) {
    byFile[fileNameToKey(path)] = mod.default ?? mod;
  }

  const registry = byFile['index.json'];
  const sets = {};
  for (const entry of registry) {
    const raw = byFile[entry.fichier];
    if (!raw) {
      throw new Error(`Jeu de questions introuvable pour l'entrée de registre "${entry.id}" (fichier ${entry.fichier})`);
    }
    sets[entry.id] = validateQuestionSet(raw);
  }
  return sets;
}

export function getQuestionSet(id) {
  const sets = loadQuestionSets();
  const set = sets[id];
  if (!set) throw new Error(`Jeu de questions inconnu : ${id}`);
  return set;
}
