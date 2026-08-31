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
      { situation: 'Q0', bonnes_reponses: [0] },
      { situation: 'Q1', bonnes_reponses: [1] },
      { situation: 'Q2', bonnes_reponses: [0, 2] },
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

describe('shuffle invariant: the revealed correct answer(s) always belong to the displayed question', () => {
  // Reproduces exactly the derivation used in HostSession.jsx: origQuestionIndex =
  // questionOrder[displayIndex]; correctDisplayIndices = positions in
  // answerOrder[displayIndex] whose original option index is in bonnes_reponses.
  // Run across many random session orders to make sure the revealed correct
  // answer(s) never get associated with the WRONG question — including for
  // questions with two valid answers.
  const realSet = getQuestionSet('quizz-rentree-equipes-educatives-2026');

  it('never mismatches, across 200 random session orders', () => {
    for (let trial = 0; trial < 200; trial++) {
      const { questionOrder, answerOrder } = buildSessionOrder(realSet);

      for (let displayIndex = 0; displayIndex < questionOrder.length; displayIndex++) {
        const origQuestionIndex = questionOrder[displayIndex];
        const question = realSet.questions[origQuestionIndex];
        const optionOrder = answerOrder[displayIndex];

        const displayOptions = optionOrder.map((origOptIdx) => realSet.reponses_possibles[origOptIdx]);
        const correctDisplayIndices = optionOrder
          .map((origOptIdx, pos) => (question.bonnes_reponses.includes(origOptIdx) ? pos : -1))
          .filter((pos) => pos !== -1);
        const revealedTexts = correctDisplayIndices.map((pos) => displayOptions[pos]).sort();

        // The revealed text(s) must always equal THIS question's own correct
        // answer text(s) — never another question's, never missing one of two
        // valid answers, and never shifted by whatever position they're shown at.
        const expectedTexts = question.bonnes_reponses
          .map((origIdx) => realSet.reponses_possibles[origIdx])
          .sort();
        expect(revealedTexts).toEqual(expectedTexts);
      }
    }
  });

  it('confirms the known content: 4 questions accept both "Oui" and "Oui, à certaines conditions"', () => {
    const doubleAnswerCount = realSet.questions.filter((q) => q.bonnes_reponses.length === 2).length;
    expect(doubleAnswerCount).toBe(4);
  });

  it('confirms the "comportement violent" question accepts only "Oui, à certaines conditions"', () => {
    const q = realSet.questions.find((q) => q.situation.includes('comportement violent'));
    expect(q).toBeDefined();
    expect(q.bonnes_reponses.map((i) => realSet.reponses_possibles[i])).toEqual(['Oui, à certaines conditions']);
  });
});
