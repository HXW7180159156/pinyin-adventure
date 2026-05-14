// 拼音类型
export type PhonemeCategory = 'tone' | 'initial' | 'final' | 'compound' | 'whole';

export interface Phoneme {
  id: string;
  symbol: string;
  category: PhonemeCategory;
  pronunciation: string;
  mouthShape: string;
  examples: string[];
  difficulty: number;
  color: string;
  icon: string;
}

// 关卡类型
export type LevelType = 'learn' | 'practice' | 'challenge';

export interface Level {
  id: string;
  chapterId: string;
  name: string;
  type: LevelType;
  description: string;
  phonemes: string[];
  unlockRequirement?: string;
  starsRequired: number;
  completed: boolean;
  starsEarned: number;
  bestScore: number;
}

// 章节类型
export interface Chapter {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  levels: Level[];
  unlocked: boolean;
  completed: boolean;
  progress: number;
}

// 成就类型
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: {
    type: 'stars' | 'levels' | 'streak' | 'score';
    value: number;
  };
}

// 用户进度类型
export interface DailyStat {
  date: string;
  duration: number;
  lessonsCompleted: number;
  starsEarned: number;
  accuracy: number;
}

export interface UserProgress {
  userId: string;
  nickname: string;
  avatar: string;
  level: number;
  stars: number;
  totalStars: number;
  achievements: string[];
  unlockedChapters: string[];
  completedLevels: string[];
  phonemeMastery: Record<string, number>;
  dailyStats: DailyStat[];
  streak: number;
  lastStudyDate: string;
  studyTimeToday: number;
  settings: UserSettings;
}

// 用户设置
export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  dailyGoal: number;
  timeLimit: number;
  disableHours: {
    start: string;
    end: string;
  };
}

// 游戏状态
export interface GameState {
  currentChapter: string | null;
  currentLevel: string | null;
  score: number;
  stars: number;
  isPlaying: boolean;
  isPaused: boolean;
}

// 发音评测结果
export interface EvaluationResult {
  score: number;
  phonemeScores: {
    phoneme: string;
    score: number;
    feedback: string;
  }[];
  toneScore: number;
  suggestions: string[];
}

// 每日任务
export interface DailyTask {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  reward: number;
  type: 'practice' | 'learn' | 'challenge';
}

// 游戏道具
export interface GameItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  quantity: number;
  type: 'consumable' | 'decoration' | 'character';
}
