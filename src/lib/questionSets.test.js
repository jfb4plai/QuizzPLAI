import { describe, it, expect } from 'vitest';
import { validateQuestionSet, loadQuestionSets, getQuestionSet, buildQuestionSetIndex } from './questionSets';

const validSet = {
  id: 'demo',
  titre: 'Titre',
  reponses_possibles: ['A', 'B', 'C'],
  questions: [{ situation: 'Une situation', bonne_reponse: 0, explication: 'Car oui' }],
};

describe('validateQuestionSet', () => {
  it('accepts a well-formed question set', () => {
    expect(() => validateQuestionSet(validSet)).not.toThrow();
  });

  it('rejects a set without exactly 3 reponses_possibles', () => {
    const bad = { ...validSet, reponses_possibles: ['A', 'B'] };
    expect(() => validateQuestionSet(bad)).toThrow(/reponses_possibles/);
  });

  it('rejects a set with no questions', () => {
    const bad = { ...validSet, questions: [] };
    expect(() => validateQuestionSet(bad)).toThrow(/questions/);
  });

  it('rejects a question whose bonne_reponse is out of range', () => {
    const bad = {
      ...validSet,
      questions: [{ situation: 'X', bonne_reponse: 5, explication: 'Y' }],
    };
    expect(() => validateQuestionSet(bad)).toThrow(/bonne_reponse/);
  });

  it('rejects a question missing a situation', () => {
    const bad = { ...validSet, questions: [{ bonne_reponse: 0, explication: 'Y' }] };
    expect(() => validateQuestionSet(bad)).toThrow(/situation/);
  });

  it('accepts a question with no explication (optional field)', () => {
    const ok = { ...validSet, questions: [{ situation: 'X', bonne_reponse: 0 }] };
    expect(() => validateQuestionSet(ok)).not.toThrow();
  });

  it('rejects a question with a non-string explication', () => {
    const bad = {
      ...validSet,
      questions: [{ situation: 'X', bonne_reponse: 0, explication: 42 }],
    };
    expect(() => validateQuestionSet(bad)).toThrow(/explication/);
  });
});

describe('buildQuestionSetIndex', () => {
  it('builds a map keyed by registry id for well-formed entries', () => {
    const entries = [
      { registryEntry: { id: 'demo', fichier: 'demo.json' }, rawSet: validSet },
    ];
    const sets = buildQuestionSetIndex(entries);
    expect(sets.demo).toBeDefined();
    expect(sets.demo.questions).toHaveLength(1);
  });

  it('throws a clear error when two registry entries share the same id', () => {
    const entries = [
      { registryEntry: { id: 'demo', fichier: 'demo.json' }, rawSet: validSet },
      { registryEntry: { id: 'demo', fichier: 'demo2.json' }, rawSet: { ...validSet } },
    ];
    expect(() => buildQuestionSetIndex(entries)).toThrow(/demo/);
  });

  it('throws when the registry id does not match the raw set\'s internal id', () => {
    const entries = [
      { registryEntry: { id: 'demo', fichier: 'demo.json' }, rawSet: { ...validSet, id: 'other' } },
    ];
    expect(() => buildQuestionSetIndex(entries)).toThrow(/demo/);
  });
});

describe('loadQuestionSets / getQuestionSet', () => {
  it('loads the Chaudfontaine example set from the registry', () => {
    const sets = loadQuestionSets();
    expect(sets['plai-missions-chaudfontaine']).toBeDefined();
    expect(sets['plai-missions-chaudfontaine'].questions).toHaveLength(9);
  });

  it('getQuestionSet returns the same set by id', () => {
    const set = getQuestionSet('plai-missions-chaudfontaine');
    expect(set.titre).toMatch(/pôle/);
  });

  it('getQuestionSet throws for an unknown id', () => {
    expect(() => getQuestionSet('does-not-exist')).toThrow(/does-not-exist/);
  });

  it('Chaudfontaine set: matches the source docx exactly (verified via python-docx, 2026-08-25)', () => {
    const set = getQuestionSet('plai-missions-chaudfontaine');
    // index -> expected bonne_reponse (0=Oui, 1=Non, 2=Oui, à certaines conditions)
    const expected = [0, 0, 0, 2, 2, 2, 2, 1, 1];
    expect(set.questions.map((q) => q.bonne_reponse)).toEqual(expected);
  });
});
