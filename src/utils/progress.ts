import type { Chapter } from '../types'

export const completeChapterLevel = (
  chapters: readonly Chapter[],
  chapterId: string,
  levelId: string,
  stars: number,
): Chapter[] => {
  const normalizedStars = Math.max(0, Math.min(3, Math.round(stars)))
  const completedChapters = chapters.map((chapter) => {
    if (chapter.id !== chapterId) return chapter

    const levels = chapter.levels.map((level) => (
      level.id === levelId
        ? {
            ...level,
            completed: true,
            starsEarned: Math.max(level.starsEarned, normalizedStars),
            bestScore: Math.max(
              level.bestScore,
              normalizedStars === 3 ? 100 : normalizedStars * 30,
            ),
          }
        : level
    ))
    const completedCount = levels.filter((level) => level.completed).length

    return {
      ...chapter,
      levels,
      completed: levels.length > 0 && completedCount === levels.length,
      progress: levels.length > 0
        ? Math.round((completedCount / levels.length) * 100)
        : 0,
    }
  })

  const chapterIndex = completedChapters.findIndex((chapter) => chapter.id === chapterId)
  const shouldUnlockNext = (
    chapterIndex >= 0
    && chapterIndex < completedChapters.length - 1
    && completedChapters[chapterIndex].completed
  )

  return completedChapters.map((chapter, index) => (
    shouldUnlockNext && index === chapterIndex + 1
      ? { ...chapter, unlocked: true }
      : chapter
  ))
}

export const getTotalStars = (chapters: readonly Chapter[]): number => (
  chapters.reduce(
    (total, chapter) => total + chapter.levels.reduce(
      (chapterTotal, level) => chapterTotal + level.starsEarned,
      0,
    ),
    0,
  )
)
