export function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildSessionOrder(questionSet) {
  const questionOrder = shuffle(questionSet.questions.map((_, i) => i));
  const answerOrder = questionOrder.map(() =>
    shuffle(questionSet.reponses_possibles.map((_, i) => i))
  );
  return { questionOrder, answerOrder };
}
