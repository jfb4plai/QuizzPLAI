import { describe, it, expect } from 'vitest';
import { shuffle, buildSessionOrder } from './shuffle';

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
