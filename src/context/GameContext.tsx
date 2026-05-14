import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import type { Chapter, Achievement } from '../types'
import { chapters as defaultChapters, achievements as defaultAchievements } from '../data/phonemes'

// ==================== 类型定义 ====================

interface UserProfile {
  id: string
  nickname: string
  avatar?: string
  totalStars: number
  streakDays: number
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

const STORAGE_KEY = 'pinyin-adventure-game-state-v1'

const createInitialState = (): GameState => ({
  user: {
    id: `user-${Date.now()}`,
    nickname: '小探险家',
    totalStars: 0,
    streakDays: 1,
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
})

// ==================== Reducer ====================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_STATE':
      return action.payload

    case 'COMPLETE_LEVEL': {
      const { levelId, chapterId, stars } = action.payload

      const updatedChapters = state.chapters.map((chapter) => {
        if (chapter.id !== chapterId) return chapter

        const updatedLevels = chapter.levels.map((level) => {
          if (level.id !== levelId) return level

          return {
            ...level,
            starsEarned: Math.max(level.starsEarned, stars),
            completed: true,
            bestScore: Math.max(level.bestScore, stars * 100),
          }
        })

        const allCompleted = updatedLevels.every((l) => l.completed)

        return {
          ...chapter,
          levels: updatedLevels,
          completed: allCompleted,
          progress: Math.round((updatedLevels.filter(l => l.completed).length / updatedLevels.length) * 100),
        }
      })

      const totalStars = updatedChapters.reduce(
        (sum, ch) => sum + ch.levels.reduce((s, l) => s + l.starsEarned, 0),
        0
      )

      const currentChapterIndex = updatedChapters.findIndex((ch) => ch.id === chapterId)
      if (currentChapterIndex >= 0 && currentChapterIndex < updatedChapters.length - 1) {
        const currentChapterCompleted = updatedChapters[currentChapterIndex].levels.every(
          (l) => l.completed
        )
        if (currentChapterCompleted) {
          updatedChapters[currentChapterIndex + 1].unlocked = true
        }
      }

      return {
        ...state,
        chapters: updatedChapters,
        user: {
          ...state.user,
          totalStars,
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
  dispatch: React.Dispatch<GameAction>
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
  const [state, dispatch] = useReducer(gameReducer, createInitialState())

  // 从 localStorage 加载
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'INIT_STATE', payload: parsed })
      } catch (e) {
        console.error('Failed to load game state:', e)
      }
    }
  }, [])

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
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
