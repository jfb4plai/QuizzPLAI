import { describe, it, expect } from 'vitest';
import { buildQuestionAnalysisRows } from './questionAnalysis';

const questionSets = {
  demo: {
    titre: 'Le pôle peut-il intervenir ?',
    questions: [
      { situation: 'Question A', bonne_reponse: 0 },
      { situation: 'Question B', bonne_reponse: 1 },
    ],
  },
};

describe('buildQuestionAnalysisRows', () => {
  it('counts correct and incorrect votes per question', () => {
    const rows = buildQuestionAnalysisRows(
      [
        { question_set_id: 'demo', question_index: 0, choice: 0 }, // correct
        { question_set_id: 'demo', question_index: 0, choice: 1 }, // wrong
        { question_set_id: 'demo', question_index: 0, choice: 0 }, // correct
      ],
      questionSets
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      jeu: 'Le pôle peut-il intervenir ?',
      question: 'Question A',
      total: 3,
      correct: 2,
      incorrect: 1,
      pctCorrect: 67,
    });
  });

  it('sorts worst-first (lowest % de bonnes réponses)', () => {
    const rows = buildQuestionAnalysisRows(
      [
        // Question A: 100% correct
        { question_set_id: 'demo', question_index: 0, choice: 0 },
        // Question B: 0% correct
        { question_set_id: 'demo', question_index: 1, choice: 0 },
      ],
      questionSets
    );
    expect(rows.map((r) => r.question)).toEqual(['Question B', 'Question A']);
  });

  it('groups separately per question_set_id even if question_index collides', () => {
    const twoSets = {
      ...questionSets,
      other: { titre: 'Autre jeu', questions: [{ situation: 'Autre question 0', bonne_reponse: 0 }] },
    };
    const rows = buildQuestionAnalysisRows(
      [
        { question_set_id: 'demo', question_index: 0, choice: 0 },
        { question_set_id: 'other', question_index: 0, choice: 1 },
      ],
      twoSets
    );
    expect(rows).toHaveLength(2);
  });

  it('returns an empty array for no responses', () => {
    expect(buildQuestionAnalysisRows([], questionSets)).toEqual([]);
  });

  it('falls back gracefully when a question set or question is missing', () => {
    const rows = buildQuestionAnalysisRows(
      [{ question_set_id: 'unknown-set', question_index: 0, choice: 0 }],
      questionSets
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].jeu).toBe('unknown-set');
    expect(rows[0].correct).toBe(0);
    expect(rows[0].incorrect).toBe(1);
  });
});
