import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { Chapter, Achievement } from '../types'
import { chapters as defaultChapters, achievements as defaultAchievements } from '../data/phonemes'
import { loadStoredValue, saveStoredValue } from '../utils/storage'

// ==================== 类型定义 ====================

interface UserProfile {
  id: string
  nickname: string
  avatar?: string
  totalStars: number
  streakDays: number
  lastStudyDate: string
}

interface GameSettings {
  soundEnabled: boolean
  musicEnabled: boolean
}

interface GameState {
  user: UserProfile
  chapters: Chapter[]
  achievements: Achievement[]
  settings: GameSettings
  dailyActivity: {
    date: string
    completed: number
  }
}

type GameAction =
  | { type: 'INIT_STATE'; payload: GameState }
  | { type: 'COMPLETE_LEVEL'; payload: { levelId: string; chapterId: string; stars: number } }
  | { type: 'UNLOCK_CHAPTER'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'ADD_STARS'; payload: number }
  | { type: 'RESET_PROGRESS' }

// ==================== 初始状态 ====================

const STORAGE_KEY = 'pinyin-adventure-game-state-v2'
const LEGACY_STORAGE_KEY = 'pinyin-adventure-game-state-v1'

const getToday = () => new Date().toISOString().slice(0, 10)

const createInitialState = (): GameState => ({
  user: {
    id: `user-${Date.now()}`,
    nickname: '小探险家',
    totalStars: 0,
    streakDays: 1,
    lastStudyDate: '',
  },
  chapters: defaultChapters.map(ch => ({
    ...ch,
    levels: ch.levels.map(l => ({
      ...l,
      completed: false,
      starsEarned: 0,
      bestScore: 0,
    }))
  })),
  achievements: defaultAchievements.map(a => ({ ...a, unlocked: false })),
  settings: {
    soundEnabled: true,
    musicEnabled: true,
  },
  dailyActivity: {
    date: getToday(),
    completed: 0,
  },
})

const isStoredGameState = (value: unknown): value is Partial<GameState> => (
  typeof value === 'object'
  && value !== null
  && 'user' in value
  && 'chapters' in value
)

const mergeStoredState = (stored: Partial<GameState> | null): GameState => {
  const initial = createInitialState()
  if (!stored) return initial

  const storedChapters = Array.isArray(stored.chapters) ? stored.chapters : []
  const chapters = initial.chapters.map((chapter) => {
    const storedChapter = storedChapters.find((candidate) => candidate.id === chapter.id)
    const levels = chapter.levels.map((level) => {
      const storedLevel = storedChapter?.levels?.find((candidate) => candidate.id === level.id)
      return storedLevel ? { ...level, ...storedLevel } : level
    })

    return storedChapter
      ? { ...chapter, ...storedChapter, levels }
      : chapter
  })

  const storedAchievements = Array.isArray(stored.achievements) ? stored.achievements : []
  const achievements = initial.achievements.map((achievement) => {
    const storedAchievement = storedAchievements.find(
      (candidate) => candidate.id === achievement.id,
    )
    return storedAchievement ? { ...achievement, ...storedAchievement } : achievement
  })

  return {
    ...initial,
    ...stored,
    user: { ...initial.user, ...stored.user },
    settings: { ...initial.settings, ...stored.settings },
    dailyActivity: { ...initial.dailyActivity, ...stored.dailyActivity },
    chapters,
    achievements,
  }
}

const loadInitialState = (): GameState => {
  const current = loadStoredValue<Partial<GameState> | null>(
    STORAGE_KEY,
    null,
    (value): value is Partial<GameState> | null => value === null || isStoredGameState(value),
  )
  if (current) return mergeStoredState(current)

  const legacy = loadStoredValue<Partial<GameState> | null>(
    LEGACY_STORAGE_KEY,
    null,
    (value): value is Partial<GameState> | null => value === null || isStoredGameState(value),
  )
  return mergeStoredState(legacy)
}

const getStreakDays = (lastStudyDate: string, currentStreak: number, today: string) => {
  if (!lastStudyDate || lastStudyDate === today) return currentStreak

  const previousDay = new Date(`${today}T00:00:00Z`)
  previousDay.setUTCDate(previousDay.getUTCDate() - 1)
  return lastStudyDate === previousDay.toISOString().slice(0, 10) ? currentStreak + 1 : 1
}

const updateAchievements = (
  achievements: Achievement[],
  chapters: Chapter[],
  totalStars: number,
  streakDays: number,
): Achievement[] => {
  const completedLevels = chapters.flatMap((chapter) => chapter.levels)
    .filter((level) => level.completed)
  const toneCompleted = chapters.find((chapter) => chapter.id === 'tone-valley')?.completed
  const hasPerfectScore = completedLevels.some((level) => level.bestScore >= 100)

  return achievements.map((achievement) => {
    const shouldUnlock = (
      (achievement.id === 'first-step' && completedLevels.length >= 1)
      || (achievement.id === 'tone-master' && toneCompleted)
      || (achievement.id === 'star-collector' && totalStars >= 50)
      || (achievement.id === 'study-streak' && streakDays >= 3)
      || (achievement.id === 'perfect-score' && hasPerfectScore)
    )

    return shouldUnlock && !achievement.unlocked
      ? { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() }
      : achievement
  })
}

// ==================== Reducer ====================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_STATE':
      return action.payload

    case 'COMPLETE_LEVEL': {
      const { levelId, chapterId, stars } = action.payload

      const completedChapters = state.chapters.map((chapter) => {
        if (chapter.id !== chapterId) return chapter

        const updatedLevels = chapter.levels.map((level) => {
          if (level.id !== levelId) return level

          return {
            ...level,
            starsEarned: Math.max(level.starsEarned, stars),
            completed: true,
            bestScore: Math.max(level.bestScore, stars === 3 ? 100 : stars * 30),
          }
        })

        const allCompleted = updatedLevels.length > 0 && updatedLevels.every((l) => l.completed)

        return {
          ...chapter,
          levels: updatedLevels,
          completed: allCompleted,
          progress: Math.round((updatedLevels.filter(l => l.completed).length / updatedLevels.length) * 100),
        }
      })

      const currentChapterIndex = completedChapters.findIndex((ch) => ch.id === chapterId)
      const shouldUnlockNext = (
        currentChapterIndex >= 0
        && currentChapterIndex < completedChapters.length - 1
        && completedChapters[currentChapterIndex].completed
      )
      const updatedChapters = completedChapters.map((chapter, index) => (
        shouldUnlockNext && index === currentChapterIndex + 1
          ? { ...chapter, unlocked: true }
          : chapter
      ))

      const totalStars = updatedChapters.reduce(
        (sum, ch) => sum + ch.levels.reduce((s, l) => s + l.starsEarned, 0),
        0
      )
      const today = getToday()
      const streakDays = getStreakDays(state.user.lastStudyDate, state.user.streakDays, today)
      const dailyActivity = state.dailyActivity.date === today
        ? { date: today, completed: state.dailyActivity.completed + 1 }
        : { date: today, completed: 1 }

      return {
        ...state,
        chapters: updatedChapters,
        dailyActivity,
        achievements: updateAchievements(
          state.achievements,
          updatedChapters,
          totalStars,
          streakDays,
        ),
        user: {
          ...state.user,
          totalStars,
          streakDays,
          lastStudyDate: today,
        },
      }
    }

    case 'UNLOCK_CHAPTER':
      return {
        ...state,
        chapters: state.chapters.map((ch) =>
          ch.id === action.payload ? { ...ch, unlocked: true } : ch
        ),
      }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }

    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }

    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map((a) =>
          a.id === action.payload ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
        ),
      }

    case 'ADD_STARS':
      return {
        ...state,
        user: {
          ...state.user,
          totalStars: state.user.totalStars + action.payload,
        },
      }

    case 'RESET_PROGRESS':
      return createInitialState()

    default:
      return state
  }
}

// ==================== Context ====================

interface GameContextType {
  state: GameState
  dispatch: Dispatch<GameAction>
  completeLevel: (levelId: string, chapterId: string, stars: number) => void
  unlockChapter: (chapterId: string) => void
  updateSettings: (settings: Partial<GameSettings>) => void
  updateProfile: (profile: Partial<UserProfile>) => void
  unlockAchievement: (achievementId: string) => void
  addStars: (stars: number) => void
  resetProgress: () => void
  getChapterProgress: (chapterId: string) => number
  isLevelUnlocked: (levelId: string, chapterId: string) => boolean
}

const GameContext = createContext<GameContextType | undefined>(undefined)

// ==================== Provider ====================

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadInitialState)

  useEffect(() => {
    saveStoredValue(STORAGE_KEY, state)
  }, [state])

  const completeLevel = (levelId: string, chapterId: string, stars: number) => {
    dispatch({ type: 'COMPLETE_LEVEL', payload: { levelId, chapterId, stars } })
  }

  const unlockChapter = (chapterId: string) => {
    dispatch({ type: 'UNLOCK_CHAPTER', payload: chapterId })
  }

  const updateSettings = (settings: Partial<GameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
  }

  const updateProfile = (profile: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile })
  }

  const unlockAchievement = (achievementId: string) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievementId })
  }

  const addStars = (stars: number) => {
    dispatch({ type: 'ADD_STARS', payload: stars })
  }

  const resetProgress = () => {
    dispatch({ type: 'RESET_PROGRESS' })
  }

  const getChapterProgress = (chapterId: string): number => {
    const chapter = state.chapters.find((ch) => ch.id === chapterId)
    if (!chapter) return 0
    const completed = chapter.levels.filter((l) => l.completed).length
    if (chapter.levels.length === 0) return 0
    return Math.round((completed / chapter.levels.length) * 100)
  }

  const isLevelUnlocked = (levelId: string, chapterId: string): boolean => {
    const chapter = state.chapters.find((ch) => ch.id === chapterId)
    if (!chapter || !chapter.unlocked) return false

    const levelIndex = chapter.levels.findIndex((l) => l.id === levelId)
    if (levelIndex === -1) return false

    if (levelIndex === 0) return true

    return chapter.levels[levelIndex - 1]?.completed ?? false
  }

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        completeLevel,
        unlockChapter,
        updateSettings,
        updateProfile,
        unlockAchievement,
        addStars,
        resetProgress,
        getChapterProgress,
        isLevelUnlocked,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

// ==================== Hook ====================

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
