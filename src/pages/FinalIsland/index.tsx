import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { singleFinals } from '../../data/phonemes'
import type { Phoneme } from '../../types'

// ==================== 类型定义 ====================
type LearningStage = 'intro' | 'learn' | 'practice' | 'test' | 'aquarium' | 'spelling'
type WritingStep = 'stroke1' | 'stroke2' | 'complete'

interface FinalProgress {
  id: string
  collected: boolean
  mastered: boolean
  practiceCount: number
  testScore: number
  writingCompleted: boolean
}

interface AquariumState {
  fish: { id: string; finalId: string; x: number; y: number; speed: number; size: number }[]
  decorations: { id: string; type: string; x: number; y: number }[]
}

// ==================== 单韵母完整数据 ====================
const FINALS_DATA: Phoneme[] = [
  {
    id: 'a',
    symbol: 'a',
    category: 'final',
    pronunciation: '啊',
    mouthShape: '嘴巴张大，舌头放平，声音响亮',
    examples: ['妈(mā)', '爸(bà)', '大(dà)', '花(huā)', '家(jiā)'],
    difficulty: 1,
    color: '#FF6B6B',
    icon: '🐟',
  },
  {
    id: 'o',
    symbol: 'o',
    category: 'final',
    pronunciation: '喔',
    mouthShape: '嘴巴圆圆，嘴唇收拢，声音圆润',
    examples: ['波(bō)', '佛(fó)', '我(wǒ)', '摸(mō)', '坡(pō)'],
    difficulty: 1,
    color: '#4ECDC4',
    icon: '🐙',
  },
  {
    id: 'e',
    symbol: 'e',
    category: 'final',
    pronunciation: '鹅',
    mouthShape: '嘴巴扁扁，嘴角向两边展开',
    examples: ['哥(gē)', '得(dé)', '了(le)', '车(chē)', '河(hé)'],
    difficulty: 1,
    color: '#FFE66D',
    icon: '🦀',
  },
  {
    id: 'i',
    symbol: 'i',
    category: 'final',
    pronunciation: '衣',
    mouthShape: '嘴巴扁小，嘴角向两边，牙齿对齐',
    examples: ['一(yī)', '你(nǐ)', '四(sì)', '七(qī)', '鸡(jī)'],
    difficulty: 1,
    color: '#95E1D3',
    icon: '🐠',
  },
  {
    id: 'u',
    symbol: 'u',
    category: 'final',
    pronunciation: '乌',
    mouthShape: '嘴巴圆圆，嘴唇收拢突出',
    examples: ['五(wǔ)', '路(lù)', '书(shū)', '猪(zhū)', '哭(kū)'],
    difficulty: 1,
    color: '#F38181',
    icon: '🐡',
  },
  {
    id: 'ü',
    symbol: 'ü',
    category: 'final',
    pronunciation: '鱼',
    mouthShape: '嘴巴圆圆，舌头抵住下齿，嘴唇撮圆',
    examples: ['鱼(yú)', '女(nǚ)', '去(qù)', '句(jù)', '雨(yǔ)'],
    difficulty: 2,
    color: '#AA96DA',
    icon: '🦑',
  },
]

// ==================== 声母数据（用于拼读练习） ====================
const INITIALS_FOR_PRACTICE = [
  { symbol: 'b', examples: ['ba', 'bo', 'bi', 'bu'] },
  { symbol: 'p', examples: ['pa', 'po', 'pi', 'pu'] },
  { symbol: 'm', examples: ['ma', 'mo', 'me', 'mi', 'mu'] },
  { symbol: 'f', examples: ['fa', 'fo', 'fu'] },
  { symbol: 'd', examples: ['da', 'de', 'di', 'du'] },
  { symbol: 't', examples: ['ta', 'te', 'ti', 'tu'] },
  { symbol: 'n', examples: ['na', 'ne', 'ni', 'nu', 'nü'] },
  { symbol: 'l', examples: ['la', 'le', 'li', 'lu', 'lü'] },
  { symbol: 'g', examples: ['ga', 'ge', 'gu'] },
  { symbol: 'k', examples: ['ka', 'ke', 'ku'] },
  { symbol: 'h', examples: ['ha', 'he', 'hu'] },
  { symbol: 'j', examples: ['ji', 'ju'] },
  { symbol: 'q', examples: ['qi', 'qu'] },
  { symbol: 'x', examples: ['xi', 'xu'] },
  { symbol: 'zh', examples: ['zha', 'zhe', 'zhi', 'zhu'] },
  { symbol: 'ch', examples: ['cha', 'che', 'chi', 'chu'] },
  { symbol: 'sh', examples: ['sha', 'she', 'shi', 'shu'] },
  { symbol: 'r', examples: ['re', 'ri', 'ru'] },
  { symbol: 'z', examples: ['za', 'ze', 'zi', 'zu'] },
  { symbol: 'c', examples: ['ca', 'ce', 'ci', 'cu'] },
  { symbol: 's', examples: ['sa', 'se', 'si', 'su'] },
  { symbol: 'y', examples: ['ya', 'ye', 'yi', 'yo', 'yu'] },
  { symbol: 'w', examples: ['wa', 'wo', 'wu'] },
]

// ==================== 口型动画组件 ====================
const MouthShapeAnimation = ({ final, isPlaying }: { final: Phoneme; isPlaying: boolean }) => {
  const getMouthPath = () => {
    switch (final.id) {
      case 'a':
        return 'M 30 50 Q 50 80 70 50 Q 50 20 30 50' // 张大
      case 'o':
      case 'u':
      case 'ü':
        return 'M 35 50 Q 50 70 65 50 Q 50 30 35 50' // 圆形
      case 'e':
        return 'M 30 50 L 70 50' // 扁形
      case 'i':
        return 'M 40 50 L 60 50' // 扁小
      default:
        return 'M 35 50 Q 50 65 65 50 Q 50 35 35 50'
    }
  }

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 脸部轮廓 */}
        <ellipse cx="50" cy="50" rx="45" ry="45" fill="#FDBCB4" stroke="#E8A598" strokeWidth="2" />
        {/* 眼睛 */}
        <circle cx="35" cy="35" r="5" fill="#333" />
        <circle cx="65" cy="35" r="5" fill="#333" />
        {/* 嘴巴动画 */}
        <motion.path
          d={getMouthPath()}
          fill="#FF6B6B"
          stroke="#D64545"
          strokeWidth="2"
          animate={isPlaying ? {
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </svg>
      <motion.div
        className="absolute -top-2 -right-2 text-2xl"
        animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        👄
      </motion.div>
    </div>
  )
}

// ==================== 书写练习组件 ====================
const WritingPractice = ({ final, onComplete }: { final: Phoneme; onComplete: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)
  const [showGuide, setShowGuide] = useState(true)

  const getStrokeGuide = () => {
    switch (final.id) {
      case 'a':
        return ['画一个左半圆', '再画一个竖右弯']
      case 'o':
        return ['从左上方开始', '画一个完整的圆']
      case 'e':
        return ['先画一横', '再画半圆加横']
      case 'i':
        return ['画一竖', '再画上面的小点']
      case 'u':
        return ['先画竖右弯', '再画竖']
      case 'ü':
        return ['先画u', '再画上面两点']
      default:
        return ['跟着虚线写']
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    ctx.strokeStyle = final.color
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const handleComplete = () => {
    setStrokeCount(prev => prev + 1)
    if (strokeCount >= 1) {
      onComplete()
    } else {
      clearCanvas()
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl">
      <h3 className="text-xl font-bold mb-4 text-center">书写练习：{final.symbol}</h3>
      
      {/* 笔画指导 */}
      {showGuide && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 rounded-xl p-4 mb-4"
        >
          <p className="text-lg font-medium text-yellow-800">
            第 {strokeCount + 1} 步：{getStrokeGuide()[strokeCount] || '完成书写'}
          </p>
        </motion.div>
      )}

      {/* 书写区域 */}
      <div className="relative mx-auto w-64 h-64 bg-gray-50 rounded-2xl border-4 border-dashed border-gray-300 overflow-hidden">
        {/* 示范字 */}
        <div 
          className="absolute inset-0 flex items-center justify-center text-9xl font-bold opacity-10 pointer-events-none"
          style={{ color: final.color }}
        >
          {final.symbol}
        </div>
        {/* 米字格 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#999" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#999" strokeWidth="1" strokeDasharray="5,5" />
        </svg>
        {/* 画布 */}
        <canvas
          ref={canvasRef}
          width={256}
          height={256}
          className="absolute inset-0 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* 控制按钮 */}
      <div className="flex gap-3 mt-4 justify-center">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-medium hover:bg-blue-200 transition-colors"
        >
          {showGuide ? '隐藏' : '显示'}指导
        </button>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          重写
        </button>
        <button
          onClick={handleComplete}
          className="px-6 py-2 text-white rounded-xl font-medium transition-colors"
          style={{ backgroundColor: final.color }}
        >
          {strokeCount >= 1 ? '完成' : '下一步'}
        </button>
      </div>
    </div>
  )
}

// ==================== 水族馆组件 ====================
const Aquarium = ({ 
  collectedFinals, 
  onClose 
}: { 
  collectedFinals: string[] 
  onClose: () => void 
}) => {
  const [fish, setFish] = useState<{ id: string; finalId: string; x: number; y: number; speed: number; size: number }[]>([])

  useEffect(() => {
    const newFish = collectedFinals.map((finalId, index) => ({
      id: `fish-${finalId}`,
      finalId,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      speed: Math.random() * 2 + 1,
      size: Math.random() * 0.5 + 0.8,
    }))
    setFish(newFish)
  }, [collectedFinals])

  const getFinalData = (id: string) => FINALS_DATA.find(f => f.id === id)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-cyan-400 to-blue-600 z-50 overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 气泡 */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white/20"
            style={{
              width: Math.random() * 30 + 10,
              height: Math.random() * 30 + 10,
              left: `${Math.random() * 100}%`,
              bottom: -50,
            }}
            animate={{
              y: -window.innerHeight - 100,
              x: [0, Math.random() * 50 - 25, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
        {/* 海草 */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`seaweed-${i}`}
            className="absolute bottom-0 w-8 bg-gradient-to-t from-green-600 to-green-400 rounded-t-full"
            style={{
              height: Math.random() * 150 + 100,
              left: `${i * 18 + 5}%`,
            }}
            animate={{
              skewX: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* 头部 */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="btn-kid-secondary"
        >
          ← 返回
        </button>
        <h1 className="text-2xl font-bold text-white">🐠 韵母水族馆</h1>
        <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2 text-white">
          {collectedFinals.length}/6
        </div>
      </div>

      {/* 水族馆区域 */}
      <div className="relative z-10 h-[calc(100vh-120px)] mx-4">
        <AnimatePresence>
          {fish.map((f) => {
            const finalData = getFinalData(f.finalId)
            if (!finalData) return null
            return (
              <motion.div
                key={f.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                }}
                animate={{
                  x: [0, 100, 0, -100, 0],
                  y: [0, -30, 0, 30, 0],
                }}
                transition={{
                  duration: 10 / f.speed,
                  repeat: Infinity,
                  ease: "linear",
                }}
                whileHover={{ scale: 1.2 }}
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance(finalData.pronunciation)
                  utterance.lang = 'zh-CN'
                  speechSynthesis.speak(utterance)
                }}
              >
                <div
                  className="relative"
                  style={{ transform: `scale(${f.size})` }}
                >
                  <span className="text-5xl">{finalData.icon}</span>
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ backgroundColor: finalData.color }}
                  >
                    {finalData.symbol}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* 空状态 */}
        {collectedFinals.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/70">
              <span className="text-6xl">🌊</span>
              <p className="mt-4 text-xl">还没有收集到韵母</p>
              <p>快去学习中收集吧！</p>
            </div>
          </div>
        )}
      </div>

      {/* 收集展示栏 */}
      <div className="relative z-10 absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-2xl p-4">
        <div className="flex justify-center gap-3">
          {FINALS_DATA.map((final) => (
            <motion.div
              key={final.id}
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                collectedFinals.includes(final.id)
                  ? 'shadow-lg'
                  : 'bg-gray-200 text-gray-400'
              }`}
              style={{
                backgroundColor: collectedFinals.includes(final.id) ? final.color : undefined,
                color: collectedFinals.includes(final.id) ? 'white' : undefined,
              }}
              whileHover={collectedFinals.includes(final.id) ? { scale: 1.1 } : {}}
            >
              {collectedFinals.includes(final.id) ? final.symbol : '?'}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 拼读练习组件 ====================
const SpellingPractice = ({ 
  currentFinal, 
  onBack 
}: { 
  currentFinal: Phoneme
  onBack: () => void 
}) => {
  const [selectedInitial, setSelectedInitial] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)

  const validCombinations = INITIALS_FOR_PRACTICE.filter(initial => 
    initial.examples.some(ex => ex.includes(currentFinal.symbol))
  )

  const handleSpell = (initial: string) => {
    setSelectedInitial(initial)
    setShowResult(true)
    
    const isValid = validCombinations.find(v => v.symbol === initial)?.examples.some(
      ex => ex.includes(currentFinal.symbol)
    )
    
    if (isValid) {
      setScore(prev => prev + 10 + combo * 2)
      setCombo(prev => prev + 1)
      const utterance = new SpeechSynthesisUtterance(initial + currentFinal.pronunciation)
      utterance.lang = 'zh-CN'
      speechSynthesis.speak(utterance)
    } else {
      setCombo(0)
    }

    setTimeout(() => {
      setShowResult(false)
      setSelectedInitial(null)
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-kid-secondary">← 返回</button>
        <div className="flex gap-4">
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

      {/* 拼读区域 */}
      <div className="bg-white rounded-3xl p-8 shadow-xl mb-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* 声母选择 */}
          <motion.div
            className="w-32 h-32 rounded-2xl bg-gray-100 flex items-center justify-center text-5xl font-bold"
            animate={selectedInitial ? { scale: [1, 1.2, 1] } : {}}
          >
            {selectedInitial || '?'}
          </motion.div>
          
          <span className="text-4xl text-gray-400">+</span>
          
          {/* 韵母 */}
          <motion.div
            className="w-32 h-32 rounded-2xl flex items-center justify-center text-5xl font-bold text-white"
            style={{ backgroundColor: currentFinal.color }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {currentFinal.symbol}
          </motion.div>
          
          <span className="text-4xl text-gray-400">=</span>
          
          {/* 结果 */}
          <AnimatePresence mode="wait">
            {showResult && selectedInitial && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className={`w-32 h-32 rounded-2xl flex items-center justify-center text-4xl font-bold text-white ${
                  validCombinations.find(v => v.symbol === selectedInitial)?.examples.some(
                    ex => ex.includes(currentFinal.symbol)
                  ) ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {validCombinations.find(v => v.symbol === selectedInitial)?.examples.some(
                  ex => ex.includes(currentFinal.symbol)
                ) ? '✓' : '✗'}
              </motion.div>
            )}
            {!showResult && (
              <div className="w-32 h-32 rounded-2xl bg-gray-100 flex items-center justify-center text-4xl text-gray-300">
                ?
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* 声母选择区 */}
        <div className="grid grid-cols-6 gap-3">
          {INITIALS_FOR_PRACTICE.map((initial) => {
            const isValid = initial.examples.some(ex => ex.includes(currentFinal.symbol))
            return (
              <motion.button
                key={initial.symbol}
                onClick={() => !showResult && handleSpell(initial.symbol)}
                disabled={showResult}
                className={`aspect-square rounded-xl text-2xl font-bold transition-all ${
                  isValid 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {initial.symbol}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* 提示 */}
      <div className="bg-blue-50 rounded-2xl p-4 text-center">
        <p className="text-blue-700">
          点击声母与 "{currentFinal.symbol}" 拼读，绿色表示可以拼读，灰色表示不能拼读
        </p>
      </div>
    </div>
  )
}

// ==================== 测试组件 ====================
const FinalTest = ({ 
  final, 
  onComplete 
}: { 
  final: Phoneme
  onComplete: (score: number) => void 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const questions = [
    {
      type: 'pronunciation',
      question: `"${final.symbol}" 的发音是什么？`,
      options: ['啊', '喔', '鹅', '衣', '乌', '鱼'].map((p, i) => ({ 
        label: p, 
        value: ['a', 'o', 'e', 'i', 'u', 'ü'][i] 
      })),
      correct: final.id,
    },
    {
      type: 'example',
      question: `下面哪个词语包含 "${final.symbol}"？`,
      options: final.examples.slice(0, 4).map(ex => {
        const match = ex.match(/([\u4e00-\u9fa5])\(/)
        return { label: match ? match[1] : ex, value: ex }
      }),
      correct: final.examples[0],
    },
    {
      type: 'mouth',
      question: `发 "${final.symbol}" 音时，口型应该是？`,
      options: [
        { label: '嘴巴张大', value: 'a' },
        { label: '嘴巴圆圆', value: 'o' },
        { label: '嘴巴扁扁', value: 'e' },
        { label: final.mouthShape.slice(0, 6), value: final.id },
      ],
      correct: final.id,
    },
  ]

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)
    
    const isCorrect = answer === questions[currentQuestion].correct
    if (isCorrect) setScore(prev => prev + 1)

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setShowFeedback(false)
      } else {
        onComplete(Math.round((score + (isCorrect ? 1 : 0)) / questions.length * 100))
      }
    }, 1500)
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto">
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>问题 {currentQuestion + 1}/{questions.length}</span>
          <span>得分: {score}</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 问题卡片 */}
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="bg-white rounded-3xl p-8 shadow-xl"
      >
        <div className="text-center mb-8">
          <div
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl font-bold text-white"
            style={{ backgroundColor: final.color }}
          >
            {final.symbol}
          </div>
          <h3 className="text-2xl font-bold">{currentQ.question}</h3>
        </div>

        {/* 选项 */}
        <div className="grid grid-cols-2 gap-4">
          {currentQ.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => !showFeedback && handleAnswer(option.value)}
              disabled={showFeedback}
              className={`p-6 rounded-2xl text-xl font-bold transition-all ${
                showFeedback
                  ? option.value === currentQ.correct
                    ? 'bg-green-500 text-white'
                    : option.value === selectedAnswer
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  : 'bg-gray-100 hover:bg-blue-100 text-gray-700'
              }`}
              whileHover={!showFeedback ? { scale: 1.05 } : {}}
              whileTap={!showFeedback ? { scale: 0.95 } : {}}
            >
              {option.label}
            </motion.button>
          ))}
        </div>

        {/* 反馈 */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-6 text-center p-4 rounded-xl ${
                selectedAnswer === currentQ.correct
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {selectedAnswer === currentQ.correct ? (
                <span className="text-2xl">🎉 回答正确！</span>
              ) : (
                <span className="text-2xl">😅 再想想~</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ==================== 主组件 ====================
export default function FinalIsland({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<LearningStage>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState<Record<string, FinalProgress>>({})
  const [showAquarium, setShowAquarium] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const currentFinal = FINALS_DATA[currentIndex]

  // 从 localStorage 加载进度
  useEffect(() => {
    const saved = localStorage.getItem('final-island-progress')
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
    localStorage.setItem('final-island-progress', JSON.stringify(progress))
  }, [progress])

  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }, [])

  const handleCollect = () => {
    setProgress(prev => ({
      ...prev,
      [currentFinal.id]: {
        ...prev[currentFinal.id],
        id: currentFinal.id,
        collected: true,
        practiceCount: (prev[currentFinal.id]?.practiceCount || 0) + 1,
      }
    }))
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 2000)
  }

  const handleTestComplete = (score: number) => {
    setProgress(prev => ({
      ...prev,
      [currentFinal.id]: {
        ...prev[currentFinal.id],
        id: currentFinal.id,
        testScore: Math.max(prev[currentFinal.id]?.testScore || 0, score),
        mastered: score >= 80,
      }
    }))
    setStage('intro')
  }

  const handleWritingComplete = () => {
    setProgress(prev => ({
      ...prev,
      [currentFinal.id]: {
        ...prev[currentFinal.id],
        id: currentFinal.id,
        writingCompleted: true,
      }
    }))
    setStage('learn')
  }

  const collectedFinals = Object.values(progress).filter(p => p.collected).map(p => p.id)
  const masteredFinals = Object.values(progress).filter(p => p.mastered).map(p => p.id)

  // ==================== 介绍阶段 ====================
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-cyan-100 p-4">
        {/* 头部 */}
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => onBack()}
            className="btn-kid-secondary"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🌊 单韵母岛</h1>
          <button
            onClick={() => setShowAquarium(true)}
            className="bg-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <span className="text-blue-600 font-bold">🐟 {collectedFinals.length}/6</span>
          </button>
        </header>

        {/* 进度概览 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">学习进度</h2>
              <span className="text-blue-600 font-medium">
                已掌握: {masteredFinals.length}/6
              </span>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {FINALS_DATA.map((final, index) => {
                const p = progress[final.id]
                return (
                  <motion.button
                    key={final.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                      currentIndex === index
                        ? 'ring-4 ring-blue-400'
                        : ''
                    } ${
                      p?.mastered
                        ? 'bg-green-400 text-white'
                        : p?.collected
                        ? 'bg-blue-400 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-2xl font-bold">{final.symbol}</span>
                    {p?.mastered && <span className="text-xs">⭐</span>}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* 当前韵母卡片 */}
          <motion.div
            key={currentFinal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            <div className="text-center">
              <motion.div
                className="text-8xl mb-4 inline-block"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentFinal.icon}
              </motion.div>
              
              <motion.div
                className="text-9xl font-bold mb-4"
                style={{ color: currentFinal.color }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentFinal.symbol}
              </motion.div>

              <p className="text-2xl text-gray-600 mb-2">{currentFinal.pronunciation}</p>
              
              {/* 功能按钮 */}
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                <motion.button
                  onClick={() => {
                    setIsPlaying(true)
                    speak(currentFinal.pronunciation)
                    setTimeout(() => setIsPlaying(false), 1000)
                  }}
                  className="btn-kid-accent"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🔊 听发音
                </motion.button>
                
                <motion.button
                  onClick={() => setStage('learn')}
                  className="btn-kid-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📚 开始学习
                </motion.button>

                {progress[currentFinal.id]?.collected && (
                  <>
                    <motion.button
                      onClick={() => setStage('practice')}
                      className="btn-kid-success"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ✏️ 书写练习
                    </motion.button>
                    <motion.button
                      onClick={() => setStage('spelling')}
                      className="btn-kid-secondary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🧩 拼读练习
                    </motion.button>
                    <motion.button
                      onClick={() => setStage('test')}
                      className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-200 transform active:scale-95 hover:scale-105 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎯 测试
                    </motion.button>
                  </>
                )}

                {!progress[currentFinal.id]?.collected && (
                  <motion.button
                    onClick={handleCollect}
                    className="btn-kid-success"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎣 收集韵母
                  </motion.button>
                )}
              </div>
            </div>

            {/* 示例词语 */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold mb-4 text-center">示例词语</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {currentFinal.examples.map((example, index) => (
                  <motion.span
                    key={index}
                    className="px-4 py-2 rounded-full text-lg font-medium cursor-pointer"
                    style={{ 
                      backgroundColor: `${currentFinal.color}20`,
                      color: currentFinal.color 
                    }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => {
                      const match = example.match(/\(([a-zāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]+)\)/)
                      if (match) speak(match[1])
                    }}
                  >
                    {example}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 庆祝动画 */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-4xl"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    rotate: 0 
                  }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 500,
                    y: (Math.random() - 0.5) * 500,
                    scale: [0, 1.5, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  {['⭐', '🎉', '🎊', '✨', currentFinal.icon][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 水族馆弹窗 */}
        <AnimatePresence>
          {showAquarium && (
            <Aquarium 
              collectedFinals={collectedFinals} 
              onClose={() => setShowAquarium(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ==================== 学习阶段 ====================
  if (stage === 'learn') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-cyan-100 p-4">
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => setStage('intro')} className="btn-kid-secondary">
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">📚 学习：{currentFinal.symbol}</h1>
          <div className="w-20" />
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 发音示范 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 shadow-xl"
            >
              <h3 className="text-xl font-bold mb-4">🔊 发音示范</h3>
              <div className="text-center">
                <motion.div
                  className="text-8xl font-bold mb-4"
                  style={{ color: currentFinal.color }}
                  animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                >
                  {currentFinal.symbol}
                </motion.div>
                <p className="text-2xl text-gray-600 mb-4">{currentFinal.pronunciation}</p>
                <button
                  onClick={() => {
                    setIsPlaying(true)
                    speak(currentFinal.pronunciation)
                    setTimeout(() => setIsPlaying(false), 1000)
                  }}
                  className="btn-kid-accent w-full"
                >
                  🔊 播放发音
                </button>
              </div>
            </motion.div>

            {/* 口型演示 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 shadow-xl"
            >
              <h3 className="text-xl font-bold mb-4">👄 口型演示</h3>
              <MouthShapeAnimation final={currentFinal} isPlaying={isPlaying} />
              <p className="text-center text-gray-600 mt-4">{currentFinal.mouthShape}</p>
              <button
                onClick={() => {
                  setIsPlaying(true)
                  setTimeout(() => setIsPlaying(false), 2000)
                }}
                className="btn-kid-primary w-full mt-4"
              >
                {isPlaying ? '👄 演示中...' : '▶️ 演示口型'}
              </button>
            </motion.div>
          </div>

          {/* 示例词语 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-xl mt-6"
          >
            <h3 className="text-xl font-bold mb-4">📝 示例词语</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentFinal.examples.map((example, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-4 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    const match = example.match(/\(([a-zāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]+)\)/)
                    if (match) speak(match[1])
                  }}
                >
                  <p className="text-2xl font-bold text-gray-800">
                    {example.match(/([\u4e00-\u9fa5]+)/)?.[0]}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {example.match(/\(([a-zāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]+)\)/)?.[0]}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 下一步 */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setStage('practice')}
              className="btn-kid-success"
            >
              继续：书写练习 →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ==================== 书写练习阶段 ====================
  if (stage === 'practice') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-cyan-100 p-4">
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => setStage('learn')} className="btn-kid-secondary">
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">✏️ 书写练习</h1>
          <div className="w-20" />
        </header>

        <WritingPractice
          final={currentFinal}
          onComplete={handleWritingComplete}
        />
      </div>
    )
  }

  // ==================== 测试阶段 ====================
  if (stage === 'test') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => setStage('intro')} className="btn-kid-secondary">
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🎯 测试：{currentFinal.symbol}</h1>
          <div className="w-20" />
        </header>

        <FinalTest
          final={currentFinal}
          onComplete={handleTestComplete}
        />
      </div>
    )
  }

  // ==================== 拼读练习阶段 ====================
  if (stage === 'spelling') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-teal-100 p-4">
        <SpellingPractice
          currentFinal={currentFinal}
          onBack={() => setStage('intro')}
        />
      </div>
    )
  }

  return null
}
