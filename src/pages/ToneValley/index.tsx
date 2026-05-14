import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tones } from '../../data/phonemes'
import { useGame } from '../../context/GameContext'

// ==================== 类型定义 ====================

type GameMode = 'menu' | 'train' | 'runner' | 'match' | 'challenge'
type GameScreen = 'start' | 'playing' | 'result'

interface GameStats {
  score: number
  stars: number
  combo: number
  maxCombo: number
  correctCount: number
  totalCount: number
  timeBonus: number
}

interface ToneCard {
  id: number
  toneIndex: number
  isFlipped: boolean
  isMatched: boolean
}

// ==================== 常量 ====================

const TONE_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3']
const TONE_NAMES = ['第一声', '第二声', '第三声', '第四声']
const TONE_DESCRIPTIONS = ['高平调', '升调', '降升调', '降调']

// ==================== 辅助函数 ====================

const playTone = (toneIndex: number) => {
  const utterance = new SpeechSynthesisUtterance(`${TONE_NAMES[toneIndex]}，${TONE_DESCRIPTIONS[toneIndex]}`)
  utterance.lang = 'zh-CN'
  utterance.rate = 0.8
  utterance.pitch = 1 + toneIndex * 0.1
  speechSynthesis.speak(utterance)
}

const generateCards = (): ToneCard[] => {
  const cards: ToneCard[] = []
  const pairs = 8 // 4x4 grid = 16 cards = 8 pairs
  
  for (let i = 0; i < pairs; i++) {
    const toneIndex = i % 4
    cards.push({ id: i * 2, toneIndex, isFlipped: false, isMatched: false })
    cards.push({ id: i * 2 + 1, toneIndex, isFlipped: false, isMatched: false })
  }
  
  // Shuffle
  return cards.sort(() => Math.random() - 0.5)
}

// ==================== 游戏模式组件 ====================

// 1. 声调小火车游戏
const ToneTrainGame = ({ onComplete, onScoreUpdate }: { onComplete: (stats: GameStats) => void; onScoreUpdate: (score: number) => void }) => {
  const [screen, setScreen] = useState<GameScreen>('start')
  const [currentTone, setCurrentTone] = useState(0)
  const [trainPosition, setTrainPosition] = useState(0)
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    stars: 0,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    totalCount: 0,
    timeBonus: 0
  })
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const maxQuestions = 10

  const startGame = () => {
    setScreen('playing')
    setCurrentTone(Math.floor(Math.random() * 4))
    setTrainPosition(0)
    setStats({
      score: 0,
      stars: 0,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      totalCount: 0,
      timeBonus: 0
    })
    setQuestionCount(0)
  }

  const handleToneClick = (index: number) => {
    if (showResult) return
    
    const correct = index === currentTone
    setIsCorrect(correct)
    setShowResult(true)
    
    setStats(prev => {
      const newCombo = correct ? prev.combo + 1 : 0
      const comboBonus = correct ? Math.min(newCombo * 5, 25) : 0
      const points = correct ? 10 + comboBonus : 0
      
      return {
        ...prev,
        score: prev.score + points,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        correctCount: prev.correctCount + (correct ? 1 : 0),
        totalCount: prev.totalCount + 1
      }
    })

    if (correct) {
      setTrainPosition(prev => Math.min(prev + 10, 100))
    }

    setTimeout(() => {
      setShowResult(false)
      const newCount = questionCount + 1
      setQuestionCount(newCount)
      
      if (newCount >= maxQuestions) {
        const finalStats = {
          ...stats,
          correctCount: stats.correctCount + (correct ? 1 : 0),
          totalCount: stats.totalCount + 1,
          score: stats.score + (correct ? 10 + Math.min((stats.combo + 1) * 5, 25) : 0)
        }
        finalStats.stars = Math.ceil((finalStats.correctCount / maxQuestions) * 3)
        onComplete(finalStats)
        setScreen('result')
      } else {
        setCurrentTone(Math.floor(Math.random() * 4))
      }
    }, 1500)
  }

  useEffect(() => {
    onScoreUpdate(stats.score)
  }, [stats.score, onScoreUpdate])

  if (screen === 'start') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <motion.div 
          animate={{ x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-8xl mb-6"
        >
          🚂
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">声调小火车</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          听音选择正确的声调，帮助小火车前进！<br/>
          答对越多，火车跑得越快！
        </p>
        <div className="flex gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-pink-500">{maxQuestions}</div>
            <div className="text-sm text-gray-500">题目数量</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-yellow-500">3</div>
            <div className="text-sm text-gray-500">最多星星</div>
          </div>
        </div>
        <button onClick={startGame} className="btn-kid-primary text-xl">
          开始游戏
        </button>
      </motion.div>
    )
  }

  if (screen === 'result') {
    const accuracy = Math.round((stats.correctCount / maxQuestions) * 100)
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <div className="text-6xl mb-4">
          {stats.stars === 3 ? '🏆' : stats.stars === 2 ? '🥈' : stats.stars === 1 ? '🥉' : '💪'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">游戏结束</h2>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((star) => (
            <motion.span 
              key={star}
              initial={{ scale: 0 }}
              animate={{ scale: star <= stats.stars ? 1 : 0.5 }}
              className={`text-5xl ${star <= stats.stars ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-blue-500">{stats.score}</div>
            <div className="text-sm text-gray-500">总得分</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-green-500">{accuracy}%</div>
            <div className="text-sm text-gray-500">正确率</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-purple-500">{stats.maxCombo}</div>
            <div className="text-sm text-gray-500">最高连击</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-orange-500">{stats.correctCount}/{maxQuestions}</div>
            <div className="text-sm text-gray-500">答对题数</div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setScreen('start')} className="btn-kid-secondary">
            返回菜单
          </button>
          <button onClick={startGame} className="btn-kid-primary">
            再玩一次
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>进度</span>
          <span>{questionCount + 1}/{maxQuestions}</span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(questionCount / maxQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 火车轨道 */}
      <div className="relative h-24 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <div className="absolute inset-0 flex items-center px-4">
          <div className="w-full h-2 bg-gray-400 rounded-full" />
        </div>
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 text-5xl"
          animate={{ left: `${trainPosition}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          🚂
        </motion.div>
        <motion.div 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl"
          animate={{ scale: trainPosition >= 100 ? [1, 1.2, 1] : 1 }}
          transition={{ repeat: trainPosition >= 100 ? Infinity : 0, duration: 0.5 }}
        >
          🏁
        </motion.div>
      </div>

      {/* 连击显示 */}
      <AnimatePresence>
        {stats.combo > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mb-4"
          >
            <span className="text-2xl font-bold text-orange-500">
              🔥 {stats.combo} 连击!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 题目区域 */}
      <div className="bg-white rounded-3xl p-8 shadow-xl mb-6 text-center">
        <p className="text-lg text-gray-600 mb-4">请听音选择正确的声调</p>
        <motion.div 
          key={currentTone}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-bold mb-6 pinyin-symbol"
          style={{ color: TONE_COLORS[currentTone] }}
        >
          {tones[currentTone].symbol}
        </motion.div>
        <button
          onClick={() => playTone(currentTone)}
          className="btn-kid-accent"
        >
          🔊 播放发音
        </button>
      </div>

      {/* 选项 */}
      <div className="grid grid-cols-2 gap-4">
        {tones.map((tone, index) => (
          <motion.button
            key={tone.id}
            onClick={() => handleToneClick(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={showResult}
            className={`
              p-6 rounded-2xl font-bold text-4xl transition-all duration-200
              ${showResult && index === currentTone
                ? 'bg-green-400 text-white'
                : showResult && index !== currentTone
                  ? 'bg-red-200 text-gray-400'
                  : 'bg-white shadow-lg hover:shadow-xl'
              }
            `}
            style={{ 
              color: showResult ? undefined : tone.color,
              borderColor: tone.color,
              borderWidth: '4px'
            }}
          >
            {tone.symbol}
            <div className="text-sm mt-2 text-gray-500">{tone.icon}</div>
          </motion.button>
        ))}
      </div>

      {/* 结果弹窗 */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`
                rounded-3xl p-8 text-center
                ${isCorrect ? 'bg-green-100' : 'bg-red-100'}
              `}
            >
              <div className="text-6xl mb-4">{isCorrect ? '🎉' : '😅'}</div>
              <h2 className="text-2xl font-bold mb-2">
                {isCorrect ? '太棒了！' : '再试试'}
              </h2>
              <p className="text-gray-600">
                {isCorrect ? `+${10 + Math.min(stats.combo * 5, 25)} 分` : '正确答案已标出'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 2. 四声跑步赛游戏
const ToneRunnerGame = ({ onComplete, onScoreUpdate }: { onComplete: (stats: GameStats) => void; onScoreUpdate: (score: number) => void }) => {
  const [screen, setScreen] = useState<GameScreen>('start')
  const [runnerPosition, setRunnerPosition] = useState({ x: 10, y: 50 })
  const [currentTone, setCurrentTone] = useState(0)
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    stars: 0,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    totalCount: 0,
    timeBonus: 0
  })
  const [isJumping, setIsJumping] = useState(false)
  const [gameActive, setGameActive] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const maxQuestions = 10

  const startGame = () => {
    setScreen('playing')
    setRunnerPosition({ x: 10, y: 50 })
    setCurrentTone(Math.floor(Math.random() * 4))
    setStats({
      score: 0,
      stars: 0,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      totalCount: 0,
      timeBonus: 0
    })
    setQuestionCount(0)
    setGameActive(true)
  }

  const handleJump = (toneIndex: number) => {
    if (!gameActive || isJumping) return
    
    setIsJumping(true)
    const correct = toneIndex === currentTone
    
    // 根据声调决定跳跃轨迹
    const jumpPaths: Record<number, { x: number; y: number }> = {
      0: { x: 15, y: 0 },   // 一声：平走
      1: { x: 15, y: -20 }, // 二声：上坡
      2: { x: 15, y: 0 },   // 三声：起伏（特殊处理）
      3: { x: 15, y: 20 }   // 四声：下坡
    }

    const path = jumpPaths[toneIndex]
    
    setRunnerPosition(prev => ({
      x: Math.min(prev.x + path.x, 90),
      y: Math.max(10, Math.min(90, prev.y + path.y))
    }))

    setStats(prev => {
      const newCombo = correct ? prev.combo + 1 : 0
      const comboBonus = correct ? Math.min(newCombo * 5, 25) : 0
      const points = correct ? 10 + comboBonus : 0
      
      return {
        ...prev,
        score: prev.score + points,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        correctCount: prev.correctCount + (correct ? 1 : 0),
        totalCount: prev.totalCount + 1
      }
    })

    setTimeout(() => {
      setIsJumping(false)
      const newCount = questionCount + 1
      setQuestionCount(newCount)
      
      if (newCount >= maxQuestions) {
        const finalStats = {
          ...stats,
          correctCount: stats.correctCount + (correct ? 1 : 0),
          totalCount: stats.totalCount + 1,
          score: stats.score + (correct ? 10 + Math.min((stats.combo + 1) * 5, 25) : 0)
        }
        finalStats.stars = Math.ceil((finalStats.correctCount / maxQuestions) * 3)
        setGameActive(false)
        onComplete(finalStats)
        setScreen('result')
      } else {
        setCurrentTone(Math.floor(Math.random() * 4))
      }
    }, 1000)
  }

  useEffect(() => {
    onScoreUpdate(stats.score)
  }, [stats.score, onScoreUpdate])

  if (screen === 'start') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="text-8xl mb-6"
        >
          🏃
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">四声跑步赛</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          根据听到的声调控制小人跳跃！<br/>
          一声平走 / 二声上坡 / 三声起伏 / 四声下坡
        </p>
        <div className="grid grid-cols-4 gap-2 mb-8">
          {['➡️ 平走', '↗️ 上坡', '↘️↗️ 起伏', '↘️ 下坡'].map((desc, i) => (
            <div key={i} className="bg-white rounded-xl p-3 text-center shadow-lg">
              <div className="text-2xl mb-1">{tones[i].symbol}</div>
              <div className="text-xs text-gray-500">{desc}</div>
            </div>
          ))}
        </div>
        <button onClick={startGame} className="btn-kid-primary text-xl">
          开始游戏
        </button>
      </motion.div>
    )
  }

  if (screen === 'result') {
    const accuracy = Math.round((stats.correctCount / maxQuestions) * 100)
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <div className="text-6xl mb-4">
          {stats.stars === 3 ? '🏆' : stats.stars === 2 ? '🥈' : stats.stars === 1 ? '🥉' : '💪'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">游戏结束</h2>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((star) => (
            <motion.span 
              key={star}
              initial={{ scale: 0 }}
              animate={{ scale: star <= stats.stars ? 1 : 0.5 }}
              className={`text-5xl ${star <= stats.stars ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-blue-500">{stats.score}</div>
            <div className="text-sm text-gray-500">总得分</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-green-500">{accuracy}%</div>
            <div className="text-sm text-gray-500">正确率</div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setScreen('start')} className="btn-kid-secondary">
            返回菜单
          </button>
          <button onClick={startGame} className="btn-kid-primary">
            再玩一次
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 进度 */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-600">进度: {questionCount + 1}/{maxQuestions}</div>
        <div className="flex items-center gap-2">
          <span className="text-orange-500 font-bold">
            {stats.combo > 1 && `🔥 ${stats.combo} 连击`}
          </span>
        </div>
      </div>

      {/* 跑道 */}
      <div className="relative h-64 bg-gradient-to-b from-sky-200 to-green-200 rounded-3xl mb-6 overflow-hidden">
        {/* 地形线条 */}
        <svg className="absolute inset-0 w-full h-full">
          <path 
            d="M 0 128 Q 100 128 200 100 T 400 80 T 600 128" 
            fill="none" 
            stroke="rgba(255,255,255,0.5)" 
            strokeWidth="3"
            strokeDasharray="10,5"
          />
        </svg>
        
        {/* 终点 */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl">🏁</div>
        
        {/* 跑步小人 */}
        <motion.div 
          className="absolute text-5xl"
          animate={{ 
            left: `${runnerPosition.x}%`, 
            top: `${runnerPosition.y}%`,
            y: isJumping ? [0, -30, 0] : 0
          }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          {isJumping ? '🏃‍♂️' : '🚶‍♂️'}
        </motion.div>

        {/* 声调路径提示 */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-gray-500">
          <span>➡️ 平</span>
          <span>↗️ 升</span>
          <span>↘️↗️ 曲</span>
          <span>↘️ 降</span>
        </div>
      </div>

      {/* 题目 */}
      <div className="bg-white rounded-3xl p-6 shadow-xl mb-6 text-center">
        <p className="text-lg text-gray-600 mb-4">听到什么声调？选择对应的跳跃方式！</p>
        <button
          onClick={() => playTone(currentTone)}
          className="btn-kid-accent text-xl"
        >
          🔊 播放发音
        </button>
      </div>

      {/* 控制按钮 */}
      <div className="grid grid-cols-4 gap-3">
        {tones.map((tone, index) => (
          <motion.button
            key={tone.id}
            onClick={() => handleJump(index)}
            disabled={isJumping}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-4 rounded-2xl font-bold text-2xl transition-all duration-200
              ${isJumping ? 'opacity-50' : 'shadow-lg hover:shadow-xl'}
              bg-white
            `}
            style={{ 
              color: tone.color,
              borderColor: tone.color,
              borderWidth: '4px'
            }}
          >
            {tone.symbol}
            <div className="text-xs mt-1 text-gray-500">
              {['平走', '上坡', '起伏', '下坡'][index]}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// 3. 声调消消乐游戏
const ToneMatchGame = ({ onComplete, onScoreUpdate }: { onComplete: (stats: GameStats) => void; onScoreUpdate: (score: number) => void }) => {
  const [screen, setScreen] = useState<GameScreen>('start')
  const [cards, setCards] = useState<ToneCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    stars: 0,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    totalCount: 0,
    timeBonus: 0
  })
  const [gameActive, setGameActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startGame = () => {
    setScreen('playing')
    setCards(generateCards())
    setFlippedCards([])
    setTimeLeft(60)
    setStats({
      score: 0,
      stars: 0,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      totalCount: 0,
      timeBonus: 0
    })
    setGameActive(true)
  }

  const endGame = useCallback((completed: boolean) => {
    setGameActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    
    const timeBonus = Math.max(0, timeLeft * 2)
    const finalStats = {
      ...stats,
      timeBonus,
      score: stats.score + timeBonus
    }
    finalStats.stars = completed ? Math.min(3, Math.ceil(finalStats.score / 100)) : Math.min(2, Math.ceil(finalStats.score / 150))
    onComplete(finalStats)
    setScreen('result')
  }, [stats, timeLeft, onComplete])

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameActive, timeLeft, endGame])

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      const firstCard = cards.find(c => c.id === first)
      const secondCard = cards.find(c => c.id === second)
      
      if (firstCard && secondCard && firstCard.toneIndex === secondCard.toneIndex) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second ? { ...c, isMatched: true } : c
          ))
          setFlippedCards([])
          setStats(prev => {
            const newCombo = prev.combo + 1
            const comboBonus = Math.min(newCombo * 5, 25)
            return {
              ...prev,
              score: prev.score + 20 + comboBonus,
              combo: newCombo,
              maxCombo: Math.max(prev.maxCombo, newCombo),
              correctCount: prev.correctCount + 1
            }
          })
        }, 500)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second ? { ...c, isFlipped: false } : c
          ))
          setFlippedCards([])
          setStats(prev => ({ ...prev, combo: 0 }))
        }, 1000)
      }
    }
  }, [flippedCards, cards])

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
      endGame(true)
    }
  }, [cards, endGame])

  useEffect(() => {
    onScoreUpdate(stats.score)
  }, [stats.score, onScoreUpdate])

  const handleCardClick = (cardId: number) => {
    if (!gameActive || flippedCards.length >= 2) return
    
    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return
    
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))
    setFlippedCards(prev => [...prev, cardId])
  }

  if (screen === 'start') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-8xl mb-6"
        >
          🃏
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">声调消消乐</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          找出相同的声调配对！<br/>
          限时60秒，连击有额外奖励！
        </p>
        <div className="flex gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-red-500">60s</div>
            <div className="text-sm text-gray-500">时间限制</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-blue-500">16</div>
            <div className="text-sm text-gray-500">卡片数量</div>
          </div>
        </div>
        <button onClick={startGame} className="btn-kid-primary text-xl">
          开始游戏
        </button>
      </motion.div>
    )
  }

  if (screen === 'result') {
    const allMatched = cards.every(c => c.isMatched)
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <div className="text-6xl mb-4">
          {allMatched ? '🎉' : '⏰'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {allMatched ? '恭喜通关！' : '时间到！'}
        </h2>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((star) => (
            <motion.span 
              key={star}
              initial={{ scale: 0 }}
              animate={{ scale: star <= stats.stars ? 1 : 0.5 }}
              className={`text-5xl ${star <= stats.stars ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-blue-500">{stats.score}</div>
            <div className="text-sm text-gray-500">总得分</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-green-500">+{stats.timeBonus}</div>
            <div className="text-sm text-gray-500">时间奖励</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-purple-500">{stats.maxCombo}</div>
            <div className="text-sm text-gray-500">最高连击</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-orange-500">{cards.filter(c => c.isMatched).length / 2}/8</div>
            <div className="text-sm text-gray-500">配对数</div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setScreen('start')} className="btn-kid-secondary">
            返回菜单
          </button>
          <button onClick={startGame} className="btn-kid-primary">
            再玩一次
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 状态栏 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏰</span>
          <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-2">
          {stats.combo > 1 && (
            <span className="text-orange-500 font-bold">🔥 {stats.combo} 连击</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <span className="text-xl font-bold text-gray-700">{stats.score}</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar mb-6">
        <motion.div 
          className="progress-bar-fill bg-gradient-to-r from-blue-400 to-purple-400"
          animate={{ width: `${(timeLeft / 60) * 100}%` }}
        />
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isMatched || flippedCards.length >= 2}
            whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
            className={`
              aspect-square rounded-2xl font-bold text-3xl transition-all duration-300
              ${card.isMatched 
                ? 'bg-green-200 opacity-50' 
                : card.isFlipped 
                  ? 'bg-white shadow-lg'
                  : 'bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg hover:shadow-xl'
              }
            `}
            style={card.isFlipped || card.isMatched ? {
              color: TONE_COLORS[card.toneIndex],
              borderColor: TONE_COLORS[card.toneIndex],
              borderWidth: '3px'
            } : {}}
          >
            <motion.div
              initial={false}
              animate={{ rotateY: card.isFlipped || card.isMatched ? 0 : 180 }}
              transition={{ duration: 0.3 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {card.isFlipped || card.isMatched ? (
                tones[card.toneIndex].symbol
              ) : (
                <span className="text-white text-2xl">?</span>
              )}
            </motion.div>
          </motion.button>
        ))}
      </div>

      {/* 提示 */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        点击卡片翻开，找到相同的声调配对
      </div>
    </div>
  )
}

// 4. 声调大挑战 (BOSS关)
const ToneChallengeGame = ({ onComplete, onScoreUpdate }: { onComplete: (stats: GameStats) => void; onScoreUpdate: (score: number) => void }) => {
  const [screen, setScreen] = useState<GameScreen>('start')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    stars: 0,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    totalCount: 0,
    timeBonus: 0
  })
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [bossHealth, setBossHealth] = useState(100)
  const [playerHealth, setPlayerHealth] = useState(100)
  const [gameMode, setGameMode] = useState<'listen' | 'identify' | 'spell'>('listen')
  
  const questions = [
    { type: 'listen', tone: 0, question: '听音选择声调', options: [0, 1, 2, 3] },
    { type: 'identify', tone: 1, question: '这个字读什么声调？', symbol: '麻', options: [0, 1, 2, 3] },
    { type: 'spell', tone: 2, question: '选择正确的拼音', symbol: '马', options: ['mā', 'má', 'mǎ', 'mà'] },
    { type: 'listen', tone: 3, question: '听音选择声调', options: [0, 1, 2, 3] },
    { type: 'identify', tone: 0, question: '这个字读什么声调？', symbol: '妈', options: [0, 1, 2, 3] },
    { type: 'spell', tone: 3, question: '选择正确的拼音', symbol: '骂', options: ['mā', 'má', 'mǎ', 'mà'] },
    { type: 'listen', tone: 1, question: '听音选择声调', options: [0, 1, 2, 3] },
    { type: 'identify', tone: 2, question: '这个字读什么声调？', symbol: '法', options: [0, 1, 2, 3] },
  ]

  const startGame = () => {
    setScreen('playing')
    setCurrentQuestion(0)
    setStats({
      score: 0,
      stars: 0,
      combo: 0,
      maxCombo: 0,
      correctCount: 0,
      totalCount: 0,
      timeBonus: 0
    })
    setBossHealth(100)
    setPlayerHealth(100)
    setGameMode('listen')
  }

  const handleAnswer = (answer: number | string) => {
    if (showResult) return
    
    const currentQ = questions[currentQuestion]
    let correct = false
    
    if (currentQ.type === 'spell') {
      correct = answer === tones[currentQ.tone].symbol.toLowerCase().replace(/[^a-z]/g, '') + 
                (currentQ.tone === 0 ? 'a' : currentQ.tone === 1 ? 'a' : currentQ.tone === 2 ? 'a' : 'a')
    } else {
      correct = answer === currentQ.tone
    }
    
    setIsCorrect(correct)
    setShowResult(true)
    
    setStats(prev => {
      const newCombo = correct ? prev.combo + 1 : 0
      const comboBonus = correct ? Math.min(newCombo * 10, 50) : 0
      const points = correct ? 20 + comboBonus : 0
      
      return {
        ...prev,
        score: prev.score + points,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        correctCount: prev.correctCount + (correct ? 1 : 0),
        totalCount: prev.totalCount + 1
      }
    })

    if (correct) {
      setBossHealth(prev => Math.max(0, prev - 12))
    } else {
      setPlayerHealth(prev => Math.max(0, prev - 15))
    }

    setTimeout(() => {
      setShowResult(false)
      const nextQuestion = currentQuestion + 1
      
      if (nextQuestion >= questions.length || bossHealth <= 0 || playerHealth <= 0) {
        const finalStats = {
          ...stats,
          correctCount: stats.correctCount + (correct ? 1 : 0),
          totalCount: stats.totalCount + 1,
          score: stats.score + (correct ? 20 + Math.min((stats.combo + 1) * 10, 50) : 0)
        }
        finalStats.stars = bossHealth <= 0 ? 3 : playerHealth <= 0 ? 1 : Math.ceil((finalStats.correctCount / questions.length) * 3)
        onComplete(finalStats)
        setScreen('result')
      } else {
        setCurrentQuestion(nextQuestion)
        setGameMode(questions[nextQuestion].type as 'listen' | 'identify' | 'spell')
      }
    }, 1500)
  }

  useEffect(() => {
    onScoreUpdate(stats.score)
  }, [stats.score, onScoreUpdate])

  if (screen === 'start') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-8xl mb-6"
        >
          👹
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">声调大挑战</h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          BOSS关卡！综合测试你的声调知识！<br/>
          听音辨调、识别声调、选择拼音<br/>
          击败BOSS获得胜利！
        </p>
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-xl p-3 text-center shadow-lg">
            <div className="text-xl">🔊</div>
            <div className="text-xs text-gray-500">听音辨调</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-lg">
            <div className="text-xl">👀</div>
            <div className="text-xs text-gray-500">识别声调</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-lg">
            <div className="text-xl">✍️</div>
            <div className="text-xs text-gray-500">选择拼音</div>
          </div>
        </div>
        <button onClick={startGame} className="btn-kid-primary text-xl">
          挑战BOSS
        </button>
      </motion.div>
    )
  }

  if (screen === 'result') {
    const victory = bossHealth <= 0 || stats.correctCount >= questions.length * 0.7
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh]"
      >
        <div className="text-6xl mb-4">
          {victory ? '🏆' : '💪'}
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {victory ? '挑战成功！' : '挑战失败'}
        </h2>
        <p className="text-gray-600 mb-6">
          {victory ? '你击败了声调BOSS，成为声调小勇士！' : '别灰心，再试一次！'}
        </p>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((star) => (
            <motion.span 
              key={star}
              initial={{ scale: 0 }}
              animate={{ scale: star <= stats.stars ? 1 : 0.5 }}
              className={`text-5xl ${star <= stats.stars ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ⭐
            </motion.span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-blue-500">{stats.score}</div>
            <div className="text-sm text-gray-500">总得分</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-purple-500">{stats.maxCombo}</div>
            <div className="text-sm text-gray-500">最高连击</div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setScreen('start')} className="btn-kid-secondary">
            返回菜单
          </button>
          <button onClick={startGame} className="btn-kid-primary">
            再次挑战
          </button>
        </div>
      </motion.div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto">
      {/* 血条 */}
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-bold text-blue-600">你</span>
            <span>{playerHealth}/100</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
              animate={{ width: `${playerHealth}%` }}
            />
          </div>
        </div>
        <div className="text-4xl">⚔️</div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span>BOSS</span>
            <span className="font-bold text-red-600">{bossHealth}/100</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-red-500 to-red-700"
              animate={{ width: `${bossHealth}%` }}
            />
          </div>
        </div>
      </div>

      {/* BOSS */}
      <div className="text-center mb-6">
        <motion.div 
          animate={{ 
            x: bossHealth <= 30 ? [0, -5, 5, 0] : 0,
            scale: bossHealth <= 0 ? 0 : 1
          }}
          transition={{ repeat: bossHealth <= 30 ? Infinity : 0, duration: 0.2 }}
          className="text-7xl inline-block"
        >
          {bossHealth <= 0 ? '💀' : '👹'}
        </motion.div>
      </div>

      {/* 连击 */}
      <AnimatePresence>
        {stats.combo > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center mb-4"
          >
            <span className="text-2xl font-bold text-orange-500">
              🔥 {stats.combo} 连击! +{Math.min(stats.combo * 10, 50)}分
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 题目区域 */}
      <div className="bg-white rounded-3xl p-8 shadow-xl mb-6 text-center">
        <div className="text-sm text-gray-500 mb-2">
          第 {currentQuestion + 1}/{questions.length} 题
        </div>
        <p className="text-lg text-gray-600 mb-4">{currentQ.question}</p>
        {currentQ.symbol && (
          <motion.div 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-7xl font-bold mb-4 text-purple-600"
          >
            {currentQ.symbol}
          </motion.div>
        )}
        {currentQ.type === 'listen' && (
          <button
            onClick={() => playTone(currentQ.tone)}
            className="btn-kid-accent"
          >
            🔊 播放发音
          </button>
        )}
      </div>

      {/* 选项 */}
      <div className="grid grid-cols-2 gap-4">
        {currentQ.type === 'spell' ? (
          currentQ.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={showResult}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                p-6 rounded-2xl font-bold text-3xl transition-all duration-200
                ${showResult 
                  ? option === tones[currentQ.tone].symbol.toLowerCase().replace(/[^a-z]/g, '') + 'a'
                    ? 'bg-green-400 text-white'
                    : 'bg-red-200 text-gray-400'
                  : 'bg-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              {option}
            </motion.button>
          ))
        ) : (
          tones.map((tone, index) => (
            <motion.button
              key={tone.id}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                p-6 rounded-2xl font-bold text-4xl transition-all duration-200
                ${showResult && index === currentQ.tone
                  ? 'bg-green-400 text-white'
                  : showResult && index !== currentQ.tone
                    ? 'bg-red-200 text-gray-400'
                    : 'bg-white shadow-lg hover:shadow-xl'
                }
              `}
              style={{ 
                color: showResult ? undefined : tone.color,
                borderColor: tone.color,
                borderWidth: '4px'
              }}
            >
              {tone.symbol}
            </motion.button>
          ))
        )}
      </div>

      {/* 结果弹窗 */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`
                rounded-3xl p-8 text-center
                ${isCorrect ? 'bg-green-100' : 'bg-red-100'}
              `}
            >
              <div className="text-6xl mb-4">{isCorrect ? '⚔️💥' : '🛡️❌'}</div>
              <h2 className="text-2xl font-bold mb-2">
                {isCorrect ? '击中BOSS！' : '被BOSS反击！'}
              </h2>
              <p className="text-gray-600">
                {isCorrect ? `+${20 + Math.min(stats.combo * 10, 50)} 分` : '-15 生命'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== 主组件 ====================

export default function ToneValley({ onBack }: { onBack: () => void }) {
  const [currentMode, setCurrentMode] = useState<GameMode>('menu')
  const [currentScore, setCurrentScore] = useState(0)
  const { state, completeLevel, addStars } = useGame()

  const handleScoreUpdate = (score: number) => {
    setCurrentScore(score)
  }

  const handleGameComplete = (mode: string, stats: GameStats) => {
    // 保存游戏进度到 localStorage
    const savedProgress = localStorage.getItem('tone-valley-progress')
    const progress = savedProgress ? JSON.parse(savedProgress) : {}
    
    progress[mode] = {
      bestScore: Math.max(progress[mode]?.bestScore || 0, stats.score),
      stars: Math.max(progress[mode]?.stars || 0, stats.stars),
      lastPlayed: new Date().toISOString()
    }
    
    localStorage.setItem('tone-valley-progress', JSON.stringify(progress))
    
    // 更新全局游戏状态
    if (stats.stars > 0) {
      addStars(stats.stars)
      
      // 完成对应关卡
      const levelMap: Record<string, string> = {
        'train': 'tone-train',
        'runner': 'tone-runner',
        'match': 'tone-match',
        'challenge': 'tone-challenge'
      }
      
      if (levelMap[mode]) {
        completeLevel(levelMap[mode], 'tone-valley', stats.stars)
      }
    }
  }

  const renderGameMode = () => {
    switch (currentMode) {
      case 'train':
        return (
          <ToneTrainGame 
            onComplete={(stats) => handleGameComplete('train', stats)}
            onScoreUpdate={handleScoreUpdate}
          />
        )
      case 'runner':
        return (
          <ToneRunnerGame 
            onComplete={(stats) => handleGameComplete('runner', stats)}
            onScoreUpdate={handleScoreUpdate}
          />
        )
      case 'match':
        return (
          <ToneMatchGame 
            onComplete={(stats) => handleGameComplete('match', stats)}
            onScoreUpdate={handleScoreUpdate}
          />
        )
      case 'challenge':
        return (
          <ToneChallengeGame 
            onComplete={(stats) => handleGameComplete('challenge', stats)}
            onScoreUpdate={handleScoreUpdate}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 p-4">
      {/* 头部 */}
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => {
            if (currentMode === 'menu') {
              onBack()
            } else {
              setCurrentMode('menu')
              setCurrentScore(0)
            }
          }}
          className="btn-kid-secondary"
        >
          ← {currentMode === 'menu' ? '返回' : '菜单'}
        </button>
        <h1 className="text-2xl font-bold text-gray-800">🌈 声调谷</h1>
        <div className="bg-white rounded-full px-4 py-2 shadow-lg">
          <span className="text-yellow-600 font-bold">⭐ {state.user.totalStars}</span>
        </div>
      </header>

      {/* 主内容区 */}
      <AnimatePresence mode="wait">
        {currentMode === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            {/* 欢迎区域 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl mb-6 text-center">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
              >
                🌈
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">欢迎来到声调谷！</h2>
              <p className="text-gray-600">
                选择你喜欢的游戏模式，开始声调冒险吧！
              </p>
            </div>

            {/* 游戏模式选择 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 声调小火车 */}
              <motion.button
                onClick={() => setCurrentMode('train')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">🚂</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">声调小火车</h3>
                    <p className="text-sm text-gray-500">听音选择声调，火车前进</p>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3].map(i => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* 四声跑步赛 */}
              <motion.button
                onClick={() => setCurrentMode('runner')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">🏃</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">四声跑步赛</h3>
                    <p className="text-sm text-gray-500">根据声调控制跳跃</p>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3].map(i => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* 声调消消乐 */}
              <motion.button
                onClick={() => setCurrentMode('match')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">🃏</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">声调消消乐</h3>
                    <p className="text-sm text-gray-500">4x4卡片配对，限时60秒</p>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3].map(i => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* 声调大挑战 */}
              <motion.button
                onClick={() => setCurrentMode('challenge')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">👹</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">声调大挑战</h3>
                    <p className="text-sm text-purple-100">BOSS关，综合测试</p>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3].map(i => (
                        <span key={i} className="text-yellow-300">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.button>
            </div>

            {/* 声调口诀 */}
            <div className="mt-8 bg-white/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">声调口诀</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">➡️</span>
                  <span>一声高高平又平</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">↗️</span>
                  <span>二声就像上山坡</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">↘️↗️</span>
                  <span>三声下坡又上坡</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">↘️</span>
                  <span>四声就像下山坡</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {renderGameMode()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
