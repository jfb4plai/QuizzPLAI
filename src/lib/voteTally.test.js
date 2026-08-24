import { describe, it, expect } from 'vitest';
import { countVotes } from './voteTally';

describe('countVotes', () => {
  it('counts votes per option for a given question', () => {
    const responses = [
      { question_index: 0, choice: 0 },
      { question_index: 0, choice: 0 },
      { question_index: 0, choice: 2 },
      { question_index: 1, choice: 1 },
    ];
    expect(countVotes(responses, 0, 3)).toEqual([2, 0, 1]);
  });

  it('returns zeros when there are no responses for that question', () => {
    expect(countVotes([], 0, 3)).toEqual([0, 0, 0]);
  });

  it('ignores responses for other questions', () => {
    const responses = [{ question_index: 5, choice: 1 }];
    expect(countVotes(responses, 0, 3)).toEqual([0, 0, 0]);
  });

  it('ignores out-of-range choice values defensively', () => {
    const responses = [{ question_index: 0, choice: 99 }];
    expect(countVotes(responses, 0, 3)).toEqual([0, 0, 0]);
  });
});
