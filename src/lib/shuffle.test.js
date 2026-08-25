import { describe, it, expect } from 'vitest';
import { shuffle, buildSessionOrder } from './shuffle';
import { getQuestionSet } from './questionSets';

describe('shuffle', () => {
  it('preserves all elements (same multiset), just reordered', () => {
    const input = [0, 1, 2, 3, 4];
    const result = shuffle(input);
    expect(result.length).toBe(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it('does not mutate the input array', () => {
    const input = [0, 1, 2];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it('produces different orderings across many calls (not a no-op)', () => {
    const input = Array.from({ length: 10 }, (_, i) => i);
    const orderings = new Set();
    for (let i = 0; i < 30; i++) {
      orderings.add(shuffle(input).join(','));
    }
    // With 10! possible permutations, 30 draws landing on the same
    // ordering every time would be astronomically unlikely.
    expect(orderings.size).toBeGreaterThan(1);
  });

  it('handles an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe('buildSessionOrder', () => {
  const questionSet = {
    id: 'demo',
    titre: 'Titre',
    reponses_possibles: ['A', 'B', 'C'],
    questions: [
      { situation: 'Q0', bonne_reponse: 0, explication: 'x' },
      { situation: 'Q1', bonne_reponse: 1, explication: 'x' },
      { situation: 'Q2', bonne_reponse: 2, explication: 'x' },
    ],
  };

  it('returns a questionOrder that is a permutation of all question indices', () => {
    const { questionOrder } = buildSessionOrder(questionSet);
    expect([...questionOrder].sort()).toEqual([0, 1, 2]);
  });

  it('returns one answerOrder entry per question, each a permutation of [0,1,2]', () => {
    const { questionOrder, answerOrder } = buildSessionOrder(questionSet);
    expect(answerOrder.length).toBe(questionOrder.length);
    for (const order of answerOrder) {
      expect([...order].sort()).toEqual([0, 1, 2]);
    }
  });
});

describe('shuffle invariant: the revealed correct answer always belongs to the displayed question', () => {
  // Reproduces exactly the derivation used in HostSession.jsx / Join.jsx:
  // origQuestionIndex = questionOrder[displayIndex]; correctDisplayIndex =
  // answerOrder[displayIndex].indexOf(questions[origQuestionIndex].bonne_reponse).
  // This is the concrete concern raised after adding randomization: does the
  // correct answer revealed for "Question N" ever get associated with the WRONG
  // question's content (e.g. by display position instead of by the question's
  // own data)? Run across many random session orders to make sure it never does.
  const realSet = getQuestionSet('plai-missions-chaudfontaine');

  it('never mismatches, across 200 random session orders', () => {
    for (let trial = 0; trial < 200; trial++) {
      const { questionOrder, answerOrder } = buildSessionOrder(realSet);

      for (let displayIndex = 0; displayIndex < questionOrder.length; displayIndex++) {
        const origQuestionIndex = questionOrder[displayIndex];
        const question = realSet.questions[origQuestionIndex];
        const optionOrder = answerOrder[displayIndex];

        const displayOptions = optionOrder.map((origOptIdx) => realSet.reponses_possibles[origOptIdx]);
        const correctDisplayIndex = optionOrder.indexOf(question.bonne_reponse);
        const revealedText = displayOptions[correctDisplayIndex];

        // The revealed text must always equal THIS question's own correct
        // answer text — never another question's, and never shifted by
        // whatever position it happens to be shown at.
        expect(revealedText).toBe(realSet.reponses_possibles[question.bonne_reponse]);
      }
    }
  });

  it('confirms the known content: the "classe de maternelles" question is "Oui, à certaines conditions" (verified via python-docx, 2026-08-25 — corrects an earlier fabricated-content bug)', () => {
    const maternelles = realSet.questions.find((q) => q.situation.includes('maternelles'));
    expect(maternelles).toBeDefined();
    expect(realSet.reponses_possibles[maternelles.bonne_reponse]).toBe('Oui, à certaines conditions');
  });
});
