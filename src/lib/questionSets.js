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
    if (q.explication != null && typeof q.explication !== 'string') {
      throw new Error(`question ${i} : explication invalide, doit être une chaîne si présente (set "${set.id}")`);
    }
    if (!Array.isArray(q.bonnes_reponses) || q.bonnes_reponses.length === 0) {
      throw new Error(`question ${i} : bonnes_reponses doit être une liste non vide (set "${set.id}")`);
    }
    const seen = new Set();
    q.bonnes_reponses.forEach((idx) => {
      if (typeof idx !== 'number' || idx < 0 || idx >= set.reponses_possibles.length) {
        throw new Error(`question ${i} : bonnes_reponses contient un index hors limites (set "${set.id}")`);
      }
      if (seen.has(idx)) {
        throw new Error(`question ${i} : bonnes_reponses contient un doublon (set "${set.id}")`);
      }
      seen.add(idx);
    });
  });
  return set;
}

const modules = import.meta.glob('../question-sets/*.json', { eager: true });

function fileNameToKey(path) {
  return path.split('/').pop();
}

export function buildQuestionSetIndex(entries) {
  const sets = {};
  for (const { registryEntry, rawSet } of entries) {
    if (registryEntry.id !== rawSet.id) {
      throw new Error(
        `Incohérence d'id : le registre déclare "${registryEntry.id}" mais le fichier ${registryEntry.fichier ?? ''} contient l'id "${rawSet.id}"`
      );
    }
    if (Object.prototype.hasOwnProperty.call(sets, registryEntry.id)) {
      throw new Error(`Id de jeu de questions dupliqué dans le registre : "${registryEntry.id}"`);
    }
    sets[registryEntry.id] = validateQuestionSet(rawSet);
  }
  return sets;
}

export function loadQuestionSets() {
  const byFile = {};
  for (const [path, mod] of Object.entries(modules)) {
    byFile[fileNameToKey(path)] = mod.default ?? mod;
  }

  const registry = byFile['index.json'];
  const entries = registry.map((registryEntry) => {
    const raw = byFile[registryEntry.fichier];
    if (!raw) {
      throw new Error(`Jeu de questions introuvable pour l'entrée de registre "${registryEntry.id}" (fichier ${registryEntry.fichier})`);
    }
    return { registryEntry, rawSet: raw };
  });

  return buildQuestionSetIndex(entries);
}

export function getQuestionSet(id) {
  const sets = loadQuestionSets();
  const set = sets[id];
  if (!set) throw new Error(`Jeu de questions inconnu : ${id}`);
  return set;
}
