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
  it('counts correct and incorrect votes per école + question', () => {
    const rows = buildQuestionAnalysisRows(
      [
        { ecole: 'Chaudfontaine', question_set_id: 'demo', question_index: 0, choice: 0 }, // correct
        { ecole: 'Chaudfontaine', question_set_id: 'demo', question_index: 0, choice: 1 }, // wrong
        { ecole: 'Chaudfontaine', question_set_id: 'demo', question_index: 0, choice: 0 }, // correct
      ],
      questionSets
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      ecole: 'Chaudfontaine',
      jeu: 'Le pôle peut-il intervenir ?',
      question: 'Question A',
      total: 3,
      correct: 2,
      incorrect: 1,
      pctCorrect: 67,
    });
  });

  it('groups the same question separately per école', () => {
    const rows = buildQuestionAnalysisRows(
      [
        { ecole: 'Chaudfontaine', question_set_id: 'demo', question_index: 0, choice: 0 }, // correct
        { ecole: 'Perron', question_set_id: 'demo', question_index: 0, choice: 1 }, // wrong
      ],
      questionSets
    );
    expect(rows).toHaveLength(2);
    const chaudfontaine = rows.find((r) => r.ecole === 'Chaudfontaine');
    const perron = rows.find((r) => r.ecole === 'Perron');
    expect(chaudfontaine.pctCorrect).toBe(100);
    expect(perron.pctCorrect).toBe(0);
  });

  it('sorts by école (alphabétique) then worst-first within each école', () => {
    const rows = buildQuestionAnalysisRows(
      [
        // Perron, Question A: 100% correct
        { ecole: 'Perron', question_set_id: 'demo', question_index: 0, choice: 0 },
        // Perron, Question B: 0% correct
        { ecole: 'Perron', question_set_id: 'demo', question_index: 1, choice: 0 },
        // Chaudfontaine, Question A: 100% correct
        { ecole: 'Chaudfontaine', question_set_id: 'demo', question_index: 0, choice: 0 },
      ],
      questionSets
    );
    expect(rows.map((r) => `${r.ecole}/${r.question}`)).toEqual([
      'Chaudfontaine/Question A',
      'Perron/Question B',
      'Perron/Question A',
    ]);
  });

  it('groups separately per question_set_id even if question_index collides', () => {
    const twoSets = {
      ...questionSets,
      other: { titre: 'Autre jeu', questions: [{ situation: 'Autre question 0', bonne_reponse: 0 }] },
    };
    const rows = buildQuestionAnalysisRows(
      [
        { ecole: 'Perron', question_set_id: 'demo', question_index: 0, choice: 0 },
        { ecole: 'Perron', question_set_id: 'other', question_index: 0, choice: 1 },
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
      [{ ecole: 'Perron', question_set_id: 'unknown-set', question_index: 0, choice: 0 }],
      questionSets
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].jeu).toBe('unknown-set');
    expect(rows[0].correct).toBe(0);
    expect(rows[0].incorrect).toBe(1);
  });
});
