import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'

// ==================== 类型定义 ====================
type GameStage = 'menu' | 'two-syllable' | 'three-syllable' | 'drag-game' | 'evaluation'
type Difficulty = 'easy' | 'medium' | 'hard'

interface SpellingProgress {
  twoSyllable: { completed: number; total: number; bestScore: number }
  threeSyllable: { completed: number; total: number; bestScore: number }
  dragGame: { completed: number; total: number; bestScore: number }
  evaluation: { score: number; lastTest: string }
}

interface DragItem {
  id: string
  type: 'initial' | 'final' | 'medial'
  symbol: string
  color: string
}

interface DropZone {
  id: string
  type: 'initial' | 'final' | 'medial'
  acceptedItem: string | null
}

// ==================== 声母数据 ====================
const INITIALS = [
  { symbol: 'b', color: '#FF6B6B' },
  { symbol: 'p', color: '#FF8E72' },
  { symbol: 'm', color: '#4ECDC4' },
  { symbol: 'f', color: '#45B7D1' },
  { symbol: 'd', color: '#96CEB4' },
  { symbol: 't', color: '#88D8B0' },
  { symbol: 'n', color: '#FFEAA7' },
  { symbol: 'l', color: '#DDA0DD' },
  { symbol: 'g', color: '#98D8C8' },
  { symbol: 'k', color: '#F7DC6F' },
  { symbol: 'h', color: '#BB8FCE' },
  { symbol: 'j', color: '#85C1E2' },
  { symbol: 'q', color: '#F8B739' },
  { symbol: 'x', color: '#52B788' },
  { symbol: 'zh', color: '#E17055' },
  { symbol: 'ch', color: '#6C5CE7' },
  { symbol: 'sh', color: '#A29BFE' },
  { symbol: 'r', color: '#FD79A8' },
  { symbol: 'z', color: '#FDCB6E' },
  { symbol: 'c', color: '#6C5CE7' },
  { symbol: 's', color: '#00B894' },
  { symbol: 'y', color: '#E84393' },
  { symbol: 'w', color: '#0984E3' },
]

// ==================== 韵母数据 ====================
const FINALS = [
  { symbol: 'a', color: '#FF6B6B' },
  { symbol: 'o', color: '#4ECDC4' },
  { symbol: 'e', color: '#FFE66D' },
  { symbol: 'i', color: '#95E1D3' },
  { symbol: 'u', color: '#F38181' },
  { symbol: 'ü', color: '#AA96DA' },
  { symbol: 'ai', color: '#FF6B6B' },
  { symbol: 'ei', color: '#4ECDC4' },
  { symbol: 'ui', color: '#FFE66D' },
  { symbol: 'ao', color: '#95E1D3' },
  { symbol: 'ou', color: '#F38181' },
  { symbol: 'iu', color: '#AA96DA' },
  { symbol: 'ie', color: '#FF6B6B' },
  { symbol: 'üe', color: '#4ECDC4' },
  { symbol: 'er', color: '#FFE66D' },
  { symbol: 'an', color: '#95E1D3' },
  { symbol: 'en', color: '#F38181' },
  { symbol: 'in', color: '#AA96DA' },
  { symbol: 'un', color: '#FF6B6B' },
  { symbol: 'ün', color: '#4ECDC4' },
  { symbol: 'ang', color: '#FFE66D' },
  { symbol: 'eng', color: '#95E1D3' },
  { symbol: 'ing', color: '#F38181' },
  { symbol: 'ong', color: '#AA96DA' },
]

// ==================== 介母数据 ====================
const MEDIALS = [
  { symbol: 'i', color: '#95E1D3' },
  { symbol: 'u', color: '#F38181' },
  { symbol: 'ü', color: '#AA96DA' },
]

// ==================== 两拼练习题 ====================
const TWO_SYLLABLE_QUESTIONS = [
  { initial: 'b', final: 'a', answer: 'ba', word: '爸', tone: 'bà' },
  { initial: 'p', final: 'a', answer: 'pa', word: '怕', tone: 'pà' },
  { initial: 'm', final: 'a', answer: 'ma', word: '妈', tone: 'mā' },
  { initial: 'd', final: 'a', answer: 'da', word: '大', tone: 'dà' },
  { initial: 't', final: 'a', answer: 'ta', word: '他', tone: 'tā' },
  { initial: 'n', final: 'a', answer: 'na', word: '拿', tone: 'ná' },
  { initial: 'l', final: 'a', answer: 'la', word: '拉', tone: 'lā' },
  { initial: 'g', final: 'e', answer: 'ge', word: '哥', tone: 'gē' },
  { initial: 'k', final: 'e', answer: 'ke', word: '科', tone: 'kē' },
  { initial: 'h', final: 'e', answer: 'he', word: '河', tone: 'hé' },
  { initial: 'j', final: 'i', answer: 'ji', word: '鸡', tone: 'jī' },
  { initial: 'q', final: 'i', answer: 'qi', word: '七', tone: 'qī' },
  { initial: 'x', final: 'i', answer: 'xi', word: '西', tone: 'xī' },
  { initial: 'zh', final: 'u', answer: 'zhu', word: '猪', tone: 'zhū' },
  { initial: 'ch', final: 'u', answer: 'chu', word: '出', tone: 'chū' },
  { initial: 'sh', final: 'u', answer: 'shu', word: '书', tone: 'shū' },
  { initial: 'r', final: 'u', answer: 'ru', word: '入', tone: 'rù' },
  { initial: 'z', final: 'u', answer: 'zu', word: '足', tone: 'zú' },
  { initial: 'c', final: 'u', answer: 'cu', word: '粗', tone: 'cū' },
  { initial: 's', final: 'u', answer: 'su', word: '苏', tone: 'sū' },
]

// ==================== 三拼练习题 ====================
const THREE_SYLLABLE_QUESTIONS = [
  { initial: 'j', medial: 'i', final: 'a', answer: 'jia', word: '家', tone: 'jiā' },
  { initial: 'q', medial: 'i', final: 'a', answer: 'qia', word: '恰', tone: 'qià' },
  { initial: 'x', medial: 'i', final: 'a', answer: 'xia', word: '下', tone: 'xià' },
  { initial: 'j', medial: 'i', final: 'e', answer: 'jie', word: '姐', tone: 'jiě' },
  { initial: 'q', medial: 'i', final: 'e', answer: 'qie', word: '切', tone: 'qiē' },
  { initial: 'x', medial: 'i', final: 'e', answer: 'xie', word: '写', tone: 'xiě' },
  { initial: 'g', medial: 'u', final: 'a', answer: 'gua', word: '瓜', tone: 'guā' },
  { initial: 'k', medial: 'u', final: 'a', answer: 'kua', word: '夸', tone: 'kuā' },
  { initial: 'h', medial: 'u', final: 'a', answer: 'hua', word: '花', tone: 'huā' },
  { initial: 'g', medial: 'u', final: 'o', answer: 'guo', word: '国', tone: 'guó' },
  { initial: 'k', medial: 'u', final: 'o', answer: 'kuo', word: '阔', tone: 'kuò' },
  { initial: 'h', medial: 'u', final: 'o', answer: 'huo', word: '火', tone: 'huǒ' },
  { initial: 'zh', medial: 'u', final: 'a', answer: 'zhua', word: '抓', tone: 'zhuā' },
  { initial: 'ch', medial: 'u', final: 'a', answer: 'chua', word: '欻', tone: 'chuā' },
  { initial: 'sh', medial: 'u', final: 'a', answer: 'shua', word: '刷', tone: 'shuā' },
  { initial: 'j', medial: 'ü', final: 'e', answer: 'jue', word: '觉', tone: 'jué' },
  { initial: 'q', medial: 'ü', final: 'e', answer: 'que', word: '缺', tone: 'quē' },
  { initial: 'x', medial: 'ü', final: 'e', answer: 'xue', word: '学', tone: 'xué' },
]

// ==================== 两拼练习组件 ====================
const TwoSyllablePractice = ({ 
  onBack, 
  onComplete 
}: { 
  onBack: () => void
  onComplete: (score: number) => void 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [combo, setCombo] = useState(0)
  const [questions] = useState(() => [...TWO_SYLLABLE_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10))

  const currentQ = questions[currentIndex]

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)
    
    const isCorrect = answer === currentQ.answer
    if (isCorrect) {
      setScore(prev => prev + 10 + combo * 2)
      setCombo(prev => prev + 1)
      speak(currentQ.word)
    } else {
      setCombo(0)
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        onComplete(score + (isCorrect ? 10 + combo * 2 : 0))
      }
    }, 1500)
  }

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    speechSynthesis.speak(utterance)
  }

  // 生成选项
  const generateOptions = () => {
    const correct = currentQ.answer
    const wrongOptions = TWO_SYLLABLE_QUESTIONS
      .filter(q => q.answer !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(q => q.answer)
    return [correct, ...wrongOptions].sort(() => Math.random() - 0.5)
  }

  const options = generateOptions()

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-kid-secondary">← 返回</button>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{currentIndex + 1}/{questions.length}</span>
          <div className="bg-yellow-100 px-4 py-2 rounded-full">
            <span className="text-yellow-700 font-bold">⭐ {score}</span>
          </div>
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-orange-100 px-4 py-2 rounded-full"
            >
              <span className="text-orange-700 font-bold">🔥 x{combo}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar mb-8">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 题目区域 */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl p-8 shadow-xl mb-6"
      >
        <div className="text-center mb-8">
          <p className="text-gray-500 mb-4">请拼读下面的音节</p>
          
          {/* 拼音分解 */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              className="w-24 h-32 rounded-2xl flex flex-col items-center justify-center text-4xl font-bold text-white"
              style={{ backgroundColor: INITIALS.find(i => i.symbol === currentQ.initial)?.color || '#999' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span>{currentQ.initial}</span>
              <span className="text-sm font-normal mt-2">声母</span>
            </motion.div>
            
            <span className="text-4xl text-gray-400">+</span>
            
            <motion.div
              className="w-24 h-32 rounded-2xl flex flex-col items-center justify-center text-4xl font-bold text-white"
              style={{ backgroundColor: FINALS.find(f => f.symbol === currentQ.final)?.color || '#999' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            >
              <span>{currentQ.final}</span>
              <span className="text-sm font-normal mt-2">韵母</span>
            </motion.div>
            
            <span className="text-4xl text-gray-400">=</span>
            
            <motion.div
              className={`w-24 h-32 rounded-2xl flex flex-col items-center justify-center text-4xl font-bold text-white ${
                showResult ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span>{showResult ? currentQ.answer : '?'}</span>
              <span className="text-sm font-normal mt-2">{showResult ? currentQ.word : '答案'}</span>
            </motion.div>
          </div>

          {/* 播放按钮 */}
          <button
            onClick={() => speak(`${currentQ.initial} ${currentQ.final} ${currentQ.word}`)}
            className="btn-kid-accent"
          >
            🔊 听发音
          </button>
        </div>

        {/* 选项 */}
        <div className="grid grid-cols-2 gap-4">
          {options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => !showResult && handleAnswer(option)}
              disabled={showResult}
              className={`p-6 rounded-2xl text-3xl font-bold transition-all ${
                showResult
                  ? option === currentQ.answer
                    ? 'bg-green-500 text-white'
                    : option === selectedAnswer
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
              }`}
              whileHover={!showResult ? { scale: 1.05 } : {}}
              whileTap={!showResult ? { scale: 0.95 } : {}}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* 反馈 */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 text-center p-4 rounded-xl ${
                selectedAnswer === currentQ.answer
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {selectedAnswer === currentQ.answer ? (
                <span className="text-2xl">🎉 拼读正确！{currentQ.word} ({currentQ.tone})</span>
              ) : (
                <span className="text-2xl">😅 正确答案是 {currentQ.answer} ({currentQ.word})</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ==================== 三拼练习组件 ====================
const ThreeSyllablePractice = ({ 
  onBack, 
  onComplete 
}: { 
  onBack: () => void
  onComplete: (score: number) => void 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [combo, setCombo] = useState(0)
  const [questions] = useState(() => [...THREE_SYLLABLE_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10))

  const currentQ = questions[currentIndex]

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)
    
    const isCorrect = answer === currentQ.answer
    if (isCorrect) {
      setScore(prev => prev + 15 + combo * 3)
      setCombo(prev => prev + 1)
      speak(currentQ.word)
    } else {
      setCombo(0)
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        onComplete(score + (isCorrect ? 15 + combo * 3 : 0))
      }
    }, 1500)
  }

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    speechSynthesis.speak(utterance)
  }

  // 生成选项
  const generateOptions = () => {
    const correct = currentQ.answer
    const wrongOptions = THREE_SYLLABLE_QUESTIONS
      .filter(q => q.answer !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(q => q.answer)
    return [correct, ...wrongOptions].sort(() => Math.random() - 0.5)
  }

  const options = generateOptions()

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-kid-secondary">← 返回</button>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{currentIndex + 1}/{questions.length}</span>
          <div className="bg-yellow-100 px-4 py-2 rounded-full">
            <span className="text-yellow-700 font-bold">⭐ {score}</span>
          </div>
          {combo > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-orange-100 px-4 py-2 rounded-full"
            >
              <span className="text-orange-700 font-bold">🔥 x{combo}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar mb-8">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 题目区域 */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl p-8 shadow-xl mb-6"
      >
        <div className="text-center mb-8">
          <p className="text-gray-500 mb-4">请拼读下面的三拼音节</p>
          
          {/* 拼音分解 */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-6 flex-wrap">
            <motion.div
              className="w-20 h-28 md:w-24 md:h-32 rounded-2xl flex flex-col items-center justify-center text-2xl md:text-4xl font-bold text-white"
              style={{ backgroundColor: INITIALS.find(i => i.symbol === currentQ.initial)?.color || '#999' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span>{currentQ.initial}</span>
              <span className="text-xs md:text-sm font-normal mt-1 md:mt-2">声母</span>
            </motion.div>
            
            <span className="text-2xl md:text-4xl text-gray-400">+</span>
            
            <motion.div
              className="w-20 h-28 md:w-24 md:h-32 rounded-2xl flex flex-col items-center justify-center text-2xl md:text-4xl font-bold text-white"
              style={{ backgroundColor: MEDIALS.find(m => m.symbol === currentQ.medial)?.color || '#999' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            >
              <span>{currentQ.medial}</span>
              <span className="text-xs md:text-sm font-normal mt-1 md:mt-2">介母</span>
            </motion.div>
            
            <span className="text-2xl md:text-4xl text-gray-400">+</span>
            
            <motion.div
              className="w-20 h-28 md:w-24 md:h-32 rounded-2xl flex flex-col items-center justify-center text-2xl md:text-4xl font-bold text-white"
              style={{ backgroundColor: FINALS.find(f => f.symbol === currentQ.final)?.color || '#999' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
            >
              <span>{currentQ.final}</span>
              <span className="text-xs md:text-sm font-normal mt-1 md:mt-2">韵母</span>
            </motion.div>
            
            <span className="text-2xl md:text-4xl text-gray-400">=</span>
            
            <motion.div
              className={`w-20 h-28 md:w-24 md:h-32 rounded-2xl flex flex-col items-center justify-center text-2xl md:text-4xl font-bold text-white ${
                showResult ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span>{showResult ? currentQ.answer : '?'}</span>
              <span className="text-xs md:text-sm font-normal mt-1 md:mt-2">{showResult ? currentQ.word : '答案'}</span>
            </motion.div>
          </div>

          {/* 播放按钮 */}
          <button
            onClick={() => speak(`${currentQ.initial} ${currentQ.medial} ${currentQ.final} ${currentQ.word}`)}
            className="btn-kid-accent"
          >
            🔊 听发音
          </button>
        </div>

        {/* 选项 */}
        <div className="grid grid-cols-2 gap-4">
          {options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => !showResult && handleAnswer(option)}
              disabled={showResult}
              className={`p-6 rounded-2xl text-3xl font-bold transition-all ${
                showResult
                  ? option === currentQ.answer
                    ? 'bg-green-500 text-white'
                    : option === selectedAnswer
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
              }`}
              whileHover={!showResult ? { scale: 1.05 } : {}}
              whileTap={!showResult ? { scale: 0.95 } : {}}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* 反馈 */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 text-center p-4 rounded-xl ${
                selectedAnswer === currentQ.answer
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {selectedAnswer === currentQ.answer ? (
                <span className="text-2xl">🎉 拼读正确！{currentQ.word} ({currentQ.tone})</span>
              ) : (
                <span className="text-2xl">😅 正确答案是 {currentQ.answer} ({currentQ.word})</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ==================== 拖拽拼读游戏组件 ====================
const DragSpellingGame = ({ 
  onBack, 
  onComplete 
}: { 
  onBack: () => void
  onComplete: (score: number) => void 
}) => {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [score, setScore] = useState(0)
  const [draggedItems, setDraggedItems] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const levels = [
    { target: 'ba', parts: ['b', 'a'], word: '爸' },
    { target: 'ma', parts: ['m', 'a'], word: '妈' },
    { target: 'hua', parts: ['h', 'u', 'a'], word: '花' },
    { target: 'jia', parts: ['j', 'i', 'a'], word: '家' },
    { target: 'guo', parts: ['g', 'u', 'o'], word: '国' },
    { target: 'xue', parts: ['x', 'u', 'e'], word: '学' },
  ]

  const currentLevelData = levels[currentLevel]

  const handleDrop = (slotId: string, itemSymbol: string) => {
    setDraggedItems(prev => ({ ...prev, [slotId]: itemSymbol }))
  }

  const checkAnswer = () => {
    const answer = currentLevelData.parts.map((_, index) => draggedItems[`slot-${index}`] || '').join('')
    const correct = answer === currentLevelData.target
    setIsCorrect(correct)
    setShowResult(true)
    
    if (correct) {
      setScore(prev => prev + 20)
      speak(currentLevelData.word)
    }

    setTimeout(() => {
      if (currentLevel < levels.length - 1) {
        setCurrentLevel(prev => prev + 1)
        setDraggedItems({})
        setShowResult(false)
      } else {
        onComplete(score + (correct ? 20 : 0))
      }
    }, 2000)
  }

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    speechSynthesis.speak(utterance)
  }

  // 生成可拖拽的选项
  const generateDraggables = () => {
    const needed = currentLevelData.parts
    const extras = ['c', 'd', 'f', 'e', 'i', 'o'].filter(x => !needed.includes(x)).slice(0, 4)
    return [...needed, ...extras].sort(() => Math.random() - 0.5)
  }

  const draggables = generateDraggables()

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-kid-secondary">← 返回</button>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{currentLevel + 1}/{levels.length}</span>
          <div className="bg-yellow-100 px-4 py-2 rounded-full">
            <span className="text-yellow-700 font-bold">⭐ {score}</span>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar mb-8">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${((currentLevel + 1) / levels.length) * 100}%` }}
        />
      </div>

      {/* 游戏区域 */}
      <motion.div
        key={currentLevel}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 shadow-xl"
      >
        <div className="text-center mb-8">
          <p className="text-gray-500 mb-4">拖拽拼音组成正确的音节</p>
          <div className="text-4xl font-bold text-purple-600">
            {currentLevelData.word} ({currentLevelData.target})
          </div>
        </div>

        {/* 放置区域 */}
        <div className="flex justify-center gap-4 mb-8">
          {currentLevelData.parts.map((part, index) => (
            <DropZone
              key={`slot-${index}`}
              id={`slot-${index}`}
              expected={part}
              current={draggedItems[`slot-${index}`]}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* 可拖拽选项 */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {draggables.map((symbol, index) => (
            <DraggableItem
              key={index}
              symbol={symbol}
              color={INITIALS.find(i => i.symbol === symbol)?.color || FINALS.find(f => f.symbol === symbol)?.color || '#999'}
              isUsed={Object.values(draggedItems).includes(symbol)}
            />
          ))}
        </div>

        {/* 检查按钮 */}
        <div className="text-center">
          <button
            onClick={checkAnswer}
            disabled={Object.keys(draggedItems).length !== currentLevelData.parts.length || showResult}
            className={`btn-kid-primary ${
              Object.keys(draggedItems).length !== currentLevelData.parts.length || showResult
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            ✅ 检查答案
          </button>
        </div>

        {/* 反馈 */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 text-center p-4 rounded-xl ${
                isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {isCorrect ? (
                <span className="text-2xl">🎉 拼读正确！</span>
              ) : (
                <span className="text-2xl">😅 再试一次</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ==================== 可拖拽组件 ====================
const DraggableItem = ({ symbol, color, isUsed }: { symbol: string; color: string; isUsed: boolean }) => {
  return (
    <motion.div
      drag={!isUsed}
      dragSnapToOrigin
      whileDrag={{ scale: 1.2, zIndex: 100 }}
      className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white cursor-grab active:cursor-grabbing transition-opacity ${
        isUsed ? 'opacity-30 cursor-not-allowed' : ''
      }`}
      style={{ backgroundColor: color }}
    >
      {symbol}
    </motion.div>
  )
}

// ==================== 放置区域组件 ====================
const DropZone = ({ 
  id, 
  expected, 
  current, 
  onDrop 
}: { 
  id: string
  expected: string
  current: string | undefined
  onDrop: (slotId: string, item: string) => void 
}) => {
  const [isOver, setIsOver] = useState(false)

  return (
    <motion.div
      className={`w-20 h-24 rounded-2xl border-4 border-dashed flex items-center justify-center text-3xl font-bold transition-all ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
      } ${current ? 'border-solid' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsOver(false)
        const item = e.dataTransfer.getData('text/plain')
        if (item) onDrop(id, item)
      }}
      animate={current ? { scale: [1, 1.1, 1] } : {}}
    >
      {current || '?'}
    </motion.div>
  )
}

// ==================== 拼读评测组件 ====================
const SpellingEvaluation = ({ 
  onBack 
}: { 
  onBack: () => void
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [testComplete, setTestComplete] = useState(false)

  const questions = [
    { word: '爸爸', pinyin: 'bàba', hint: 'b + a' },
    { word: '妈妈', pinyin: 'māma', hint: 'm + a' },
    { word: '花朵', pinyin: 'huāduǒ', hint: 'h + u + a' },
    { word: '国家', pinyin: 'guójiā', hint: 'g + u + o, j + i + a' },
    { word: '学校', pinyin: 'xuéxiào', hint: 'x + ü + e, x + i + ao' },
  ]

  const currentQ = questions[currentQuestion]

  const handleAnswer = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedAnswer(difficulty)
    setShowResult(true)
    
    const points = { easy: 10, medium: 15, hard: 20 }
    setScore(prev => prev + points[difficulty])

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        setTestComplete(true)
      }
    }, 1500)
  }

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    speechSynthesis.speak(utterance)
  }

  if (testComplete) {
    const totalPossible = questions.length * 20
    const percentage = Math.round((score / totalPossible) * 100)
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-8xl mb-6"
        >
          {percentage >= 80 ? '🏆' : percentage >= 60 ? '🥈' : '🥉'}
        </motion.div>
        
        <h2 className="text-3xl font-bold mb-4">评测完成！</h2>
        
        <div className="text-6xl font-bold text-purple-600 mb-4">
          {percentage}分
        </div>
        
        <p className="text-gray-600 mb-8">
          {percentage >= 80 
            ? '太棒了！你是拼读小达人！' 
            : percentage >= 60 
            ? '不错哦！继续加油！' 
            : '还需要多练习哦！'}
        </p>

        <div className="flex gap-4 justify-center">
          <button onClick={onBack} className="btn-kid-secondary">
            ← 返回
          </button>
          <button 
            onClick={() => {
              setCurrentQuestion(0)
              setScore(0)
              setTestComplete(false)
              setSelectedAnswer(null)
              setShowResult(false)
            }}
            className="btn-kid-primary"
          >
            🔄 再测一次
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-kid-secondary">← 返回</button>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{currentQuestion + 1}/{questions.length}</span>
          <div className="bg-yellow-100 px-4 py-2 rounded-full">
            <span className="text-yellow-700 font-bold">⭐ {score}</span>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="progress-bar mb-8">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* 题目区域 */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl p-8 shadow-xl mb-6"
      >
        <div className="text-center mb-8">
          <p className="text-gray-500 mb-4">请拼读下面的词语</p>
          
          <motion.div
            className="text-8xl font-bold text-purple-600 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currentQ.word}
          </motion.div>

          <div className="bg-blue-50 rounded-xl p-4 inline-block">
            <p className="text-blue-700">💡 提示：{currentQ.hint}</p>
          </div>
        </div>

        {/* 播放按钮 */}
        <div className="text-center mb-8">
          <button
            onClick={() => speak(currentQ.word)}
            className="btn-kid-accent"
          >
            🔊 听标准发音
          </button>
        </div>

        {/* 难度选择 */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'easy', label: '简单', desc: '需要提示', color: 'bg-green-100 text-green-700' },
            { key: 'medium', label: '中等', desc: '有点困难', color: 'bg-yellow-100 text-yellow-700' },
            { key: 'hard', label: '困难', desc: '完全掌握', color: 'bg-red-100 text-red-700' },
          ].map((level) => (
            <motion.button
              key={level.key}
              onClick={() => !showResult && handleAnswer(level.key as 'easy' | 'medium' | 'hard')}
              disabled={showResult}
              className={`p-6 rounded-2xl text-center transition-all ${
                showResult && selectedAnswer === level.key
                  ? 'ring-4 ring-blue-400'
                  : ''
              } ${level.color}`}
              whileHover={!showResult ? { scale: 1.05 } : {}}
              whileTap={!showResult ? { scale: 0.95 } : {}}
            >
              <div className="text-2xl font-bold mb-2">{level.label}</div>
              <div className="text-sm opacity-70">{level.desc}</div>
            </motion.button>
          ))}
        </div>

        {/* 反馈 */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center p-4 rounded-xl bg-purple-100 text-purple-700"
            >
              <span className="text-2xl">📝 正确答案：{currentQ.pinyin}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ==================== 主组件 ====================
export default function SpellingCave({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<GameStage>('menu')
  const [progress, setProgress] = useState<SpellingProgress>({
    twoSyllable: { completed: 0, total: 10, bestScore: 0 },
    threeSyllable: { completed: 0, total: 10, bestScore: 0 },
    dragGame: { completed: 0, total: 6, bestScore: 0 },
    evaluation: { score: 0, lastTest: '' },
  })

  // 从 localStorage 加载进度
  useEffect(() => {
    const saved = localStorage.getItem('spelling-cave-progress')
    if (saved) {
      try {
        setProgress(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load progress:', e)
      }
    }
  }, [])

  // 保存进度
  useEffect(() => {
    localStorage.setItem('spelling-cave-progress', JSON.stringify(progress))
  }, [progress])

  const handleComplete = (type: 'twoSyllable' | 'threeSyllable' | 'dragGame', score: number) => {
    setProgress(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        completed: prev[type].completed + 1,
        bestScore: Math.max(prev[type].bestScore, score),
      }
    }))
    setStage('menu')
  }

  const handleEvaluationComplete = (score: number) => {
    setProgress(prev => ({
      ...prev,
      evaluation: {
        score,
        lastTest: new Date().toISOString(),
      }
    }))
  }

  // ==================== 菜单阶段 ====================
  if (stage === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
        {/* 头部 */}
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => onBack()}
            className="btn-kid-secondary"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🔮 拼读洞</h1>
          <div className="w-24" />
        </header>

        {/* 主菜单 */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 两拼练习 */}
            <motion.button
              onClick={() => setStage('two-syllable')}
              className="bg-white rounded-3xl p-8 shadow-xl text-left hover:shadow-2xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-5xl mb-4">🧩</div>
              <h2 className="text-2xl font-bold mb-2">两拼练习</h2>
              <p className="text-gray-600 mb-4">声母 + 韵母 = 音节</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${(progress.twoSyllable.completed / progress.twoSyllable.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {progress.twoSyllable.completed}/{progress.twoSyllable.total}
                </span>
              </div>
              {progress.twoSyllable.bestScore > 0 && (
                <p className="text-sm text-yellow-600 mt-2">
                  最高分: {progress.twoSyllable.bestScore}⭐
                </p>
              )}
            </motion.button>

            {/* 三拼练习 */}
            <motion.button
              onClick={() => setStage('three-syllable')}
              className="bg-white rounded-3xl p-8 shadow-xl text-left hover:shadow-2xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-2">三拼练习</h2>
              <p className="text-gray-600 mb-4">声母 + 介母 + 韵母 = 音节</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${(progress.threeSyllable.completed / progress.threeSyllable.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {progress.threeSyllable.completed}/{progress.threeSyllable.total}
                </span>
              </div>
              {progress.threeSyllable.bestScore > 0 && (
                <p className="text-sm text-yellow-600 mt-2">
                  最高分: {progress.threeSyllable.bestScore}⭐
                </p>
              )}
            </motion.button>

            {/* 拖拽拼读 */}
            <motion.button
              onClick={() => setStage('drag-game')}
              className="bg-white rounded-3xl p-8 shadow-xl text-left hover:shadow-2xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold mb-2">拖拽拼读</h2>
              <p className="text-gray-600 mb-4">拖拽拼音组成正确的词语</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 progress-bar">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${(progress.dragGame.completed / progress.dragGame.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {progress.dragGame.completed}/{progress.dragGame.total}
                </span>
              </div>
              {progress.dragGame.bestScore > 0 && (
                <p className="text-sm text-yellow-600 mt-2">
                  最高分: {progress.dragGame.bestScore}⭐
                </p>
              )}
            </motion.button>

            {/* 拼读评测 */}
            <motion.button
              onClick={() => setStage('evaluation')}
              className="bg-white rounded-3xl p-8 shadow-xl text-left hover:shadow-2xl transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-2">拼读评测</h2>
              <p className="text-gray-600 mb-4">测试你的拼读掌握程度</p>
              {progress.evaluation.score > 0 && (
                <p className="text-sm text-purple-600">
                  上次得分: {progress.evaluation.score}分
                </p>
              )}
            </motion.button>
          </div>

          {/* 总体进度 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-xl mt-6"
          >
            <h3 className="text-xl font-bold mb-4">📈 总体进度</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {progress.twoSyllable.completed + progress.threeSyllable.completed + progress.dragGame.completed}
                </div>
                <div className="text-sm text-gray-500">已完成练习</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">
                  {Math.max(progress.twoSyllable.bestScore, progress.threeSyllable.bestScore, progress.dragGame.bestScore)}
                </div>
                <div className="text-sm text-gray-500">最高得分</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {progress.evaluation.score > 0 ? `${progress.evaluation.score}分` : '-'}
                </div>
                <div className="text-sm text-gray-500">评测成绩</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ==================== 两拼练习阶段 ====================
  if (stage === 'two-syllable') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-cyan-100 p-4">
        <TwoSyllablePractice
          onBack={() => setStage('menu')}
          onComplete={(score) => handleComplete('twoSyllable', score)}
        />
      </div>
    )
  }

  // ==================== 三拼练习阶段 ====================
  if (stage === 'three-syllable') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-teal-100 p-4">
        <ThreeSyllablePractice
          onBack={() => setStage('menu')}
          onComplete={(score) => handleComplete('threeSyllable', score)}
        />
      </div>
    )
  }

  // ==================== 拖拽游戏阶段 ====================
  if (stage === 'drag-game') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-100 to-amber-100 p-4">
        <DragSpellingGame
          onBack={() => setStage('menu')}
          onComplete={(score) => handleComplete('dragGame', score)}
        />
      </div>
    )
  }

  // ==================== 评测阶段 ====================
  if (stage === 'evaluation') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
        <SpellingEvaluation
          onBack={() => setStage('menu')}
        />
      </div>
    )
  }

  return null
}
