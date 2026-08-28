export const shuffle = <T>(items: readonly T[], random = Math.random): T[] => {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }

  return result
}

export const isToneSpellAnswer = (
  answer: number | string,
  options: readonly (number | string)[],
  toneIndex: number,
): boolean => options[toneIndex] === answer

export const starsForScore = (score: number): number => {
  if (score >= 90) return 3
  if (score >= 70) return 2
  if (score > 0) return 1
  return 0
}
