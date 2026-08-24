export function countVotes(responses, questionIndex, numOptions) {
  const counts = new Array(numOptions).fill(0);
  for (const r of responses) {
    if (r.question_index !== questionIndex) continue;
    if (r.choice < 0 || r.choice >= numOptions) continue;
    counts[r.choice] += 1;
  }
  return counts;
}
