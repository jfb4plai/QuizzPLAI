/**
 * Aggregates raw votes into a per-question success rate, across every session
 * that used a given question set. Rows are sorted worst-first (lowest % de bonnes
 * réponses) so the questions that cause the most confusion surface immediately.
 *
 * `responseRows`: array of { question_set_id, question_index, choice } — `choice`
 * and `question_index` are ORIGINAL indices (order-independent, see src/lib/shuffle.js).
 * `questionSets`: the object returned by loadQuestionSets(), `{ [id]: questionSet }`.
 */
export function buildQuestionAnalysisRows(responseRows, questionSets) {
  const groups = new Map();

  for (const r of responseRows) {
    const key = `${r.question_set_id}::${r.question_index}`;
    if (!groups.has(key)) {
      groups.set(key, { question_set_id: r.question_set_id, question_index: r.question_index, total: 0, correct: 0 });
    }
    const group = groups.get(key);
    group.total += 1;

    const question = questionSets[r.question_set_id]?.questions?.[r.question_index];
    if (question && r.choice === question.bonne_reponse) {
      group.correct += 1;
    }
  }

  const rows = [...groups.values()].map((group) => {
    const set = questionSets[group.question_set_id];
    const question = set?.questions?.[group.question_index];
    return {
      jeu: set?.titre ?? group.question_set_id,
      question: question?.situation ?? `Question ${group.question_index + 1}`,
      total: group.total,
      correct: group.correct,
      incorrect: group.total - group.correct,
      pctCorrect: group.total === 0 ? 0 : Math.round((group.correct / group.total) * 100),
    };
  });

  rows.sort((a, b) => a.pctCorrect - b.pctCorrect);
  return rows;
}
