import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { compoundFinals } from '../../data/phonemes'
import type { Phoneme } from '../../types'

// ==================== 类型定义 ====================
type LearningStage = 'intro' | 'learn' | 'practice' | 'test' | 'aquarium'

interface CompoundProgress {
  id: string
  collected: boolean
  mastered: boolean
  practiceCount: number
  testScore: number
  practiced: boolean
}

interface FishState {
  id: string
  finalId: string
  x: number
  y: number
  speed: number
  size: number
}

// ==================== 复韵母完整数据 ====================
const COMPOUND_DATA: Phoneme[] = [
  {
    id: 'ai',
    symbol: 'ai',
    category: 'compound',
    pronunciation: '爱',
    mouthShape: '先张大嘴巴发"a"，快速滑向"i"，口型从大变小',
    examples: ['爱(ài)', '白(bái)', '来(lái)', '开(kāi)', '海(hǎi)'],
    difficulty: 2,
    color: '#0077B6',
    icon: '🌊',
  },
  {
    id: 'ei',
    symbol: 'ei',
    category: 'compound',
    pronunciation: '诶',
    mouthShape: '先发"e"音，快速滑向"i"，嘴巴从扁到更扁',
    examples: ['飞(fēi)', '黑(hēi)', '谁(shéi)', '雷(léi)', '杯(bēi)'],
    difficulty: 2,
    color: '#00B4D8',
    icon: '🐬',
  },
  {
    id: 'ui',
    symbol: 'ui',
    category: 'compound',
    pronunciation: '威',
    mouthShape: '先圆唇发"u"，快速滑向"i"，嘴唇从圆变扁',
    examples: ['水(shuǐ)', '对(duì)', '回(huí)', '灰(huī)', '推(tuī)'],
    difficulty: 2,
    color: '#0096C7',
    icon: '🐠',
  },
  {
    id: 'ao',
    symbol: 'ao',
    category: 'compound',
    pronunciation: '奥',
    mouthShape: '先张大嘴巴发"a"，快速滑向"o"，口型从大到圆',
    examples: ['好(hǎo)', '跑(pǎo)', '高(gāo)', '草(cǎo)', '道(dào)'],
    difficulty: 2,
    color: '#48CAE4',
    icon: '🦀',
  },
  {
    id: 'ou',
    symbol: 'ou',
    category: 'compound',
    pronunciation: '欧',
    mouthShape: '先圆唇发"o"，快速滑向"u"，保持圆唇',
    examples: ['走(zǒu)', '口(kǒu)', '楼(lóu)', '狗(gǒu)', '豆(dòu)'],
    difficulty: 2,
    color: '#90E0EF',
    icon: '🦑',
  },
  {
    id: 'iu',
    symbol: 'iu',
    category: 'compound',
    pronunciation: '优',
    mouthShape: '先扁唇发"i"，快速滑向"u"，口型从扁到圆',
    examples: ['六(liù)', '牛(niú)', '秋(qiū)', '酒(jiǔ)', '秀(xiù)'],
    difficulty: 2,
    color: '#CAF0F8',
    icon: '🐙',
  },
  {
    id: 'ie',
    symbol: 'ie',
    category: 'compound',
    pronunciation: '椰',
    mouthShape: '先扁唇发"i"，快速滑向"e"，口型保持扁',
    examples: ['写(xiě)', '别(bié)', '家(jiā)', '接(jiē)', '铁(tiě)'],
    difficulty: 2,
    color: '#023E8A',
    icon: '🐚',
  },
  {
    id: 'üe',
    symbol: 'üe',
    category: 'compound',
    pronunciation: '月',
    mouthShape: '先圆唇发"ü"，快速滑向"e"，保持撮唇',
    examples: ['月(yuè)', '学(xué)', '雪(xuě)', '约(yuē)', '乐(lè)'],
    difficulty: 3,
    color: '#0077B6',
    icon: '🌙',
  },
  {
    id: 'er',
    symbol: 'er',
    category: 'compound',
    pronunciation: '耳',
    mouthShape: '舌头卷起，舌位居中，发出卷舌元音',
    examples: ['二(èr)', '耳(ěr)', '儿(ér)', '而(ér)', '热(rè)'],
    difficulty: 2,
    color: '#00B4D8',
    icon: '🌟',
  },
]

// ==================== 口型动画组件 ====================
const MouthShapeAnimation = ({ final, isPlaying }: { final: Phoneme; isPlaying: boolean }) => {
  const getMouthShape = () => {
    switch (final.id) {
      case 'ai':
        return { start: 'open', end: 'small', description: 'a → i' }
      case 'ei':
        return { start: 'flat', end: 'flat-small', description: 'e → i' }
      case 'ui':
        return { start: 'round', end: 'flat-small', description: 'u → i' }
      case 'ao':
        return { start: 'open', end: 'round', description: 'a → o' }
      case 'ou':
        return { start: 'round', end: 'round-small', description: 'o → u' }
      case 'iu':
        return { start: 'flat-small', end: 'round', description: 'i → u' }
      case 'ie':
        return { start: 'flat-small', end: 'flat', description: 'i → e' }
      case 'üe':
        return { start: 'round', end: 'round-flat', description: 'ü → e' }
      case 'er':
        return { start: 'curled', end: 'curled', description: '卷舌音' }
      default:
        return { start: 'neutral', end: 'neutral', description: '' }
    }
  }

  const shape = getMouthShape()

  const getMouthPath = (type: string) => {
    switch (type) {
      case 'open':
        return 'M 30 50 Q 50 85 70 50 Q 50 15 30 50'
      case 'flat':
        return 'M 28 50 L 72 50'
      case 'flat-small':
        return 'M 40 50 L 60 50'
      case 'round':
        return 'M 35 50 Q 50 75 65 50 Q 50 25 35 50'
      case 'round-small':
        return 'M 42 50 Q 50 65 58 50 Q 50 35 42 50'
      case 'curled':
        return 'M 30 50 Q 50 70 70 50 Q 50 30 30 50'
      default:
        return 'M 35 50 Q 50 65 65 50 Q 50 35 35 50'
    }
  }

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 脸部轮廓 */}
        <ellipse cx="50" cy="50" rx="45" ry="45" fill="#FDBCB4" stroke="#E8A598" strokeWidth="2" />
        {/* 眼睛 */}
        <circle cx="35" cy="35" r="5" fill="#333" />
        <circle cx="65" cy="35" r="5" fill="#333" />
        {/* 嘴巴动画 - 开始 */}
        <motion.path
          d={getMouthPath(shape.start)}
          fill="#FF6B6B"
          stroke="#D64545"
          strokeWidth="2"
          animate={isPlaying ? {
            d: [
              getMouthPath(shape.start),
              getMouthPath(shape.end),
              getMouthPath(shape.start),
            ],
          } : {}}
          transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
        />
        {/* 过渡箭头 */}
        <motion.text
          x="50"
          y="85"
          textAnchor="middle"
          className="text-xs fill-gray-500"
          animate={isPlaying ? { opacity: [1, 0.5, 1] } : {}}
        >
          {shape.description}
        </motion.text>
      </svg>
      <motion.div
        className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-bold"
        animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
      >
        滑动
      </motion.div>
    </div>
  )
}

// ==================== 录音跟读组件 ====================
const RecordingPractice = ({
  final,
  onComplete
}: {
  final: Phoneme
  onComplete: () => void
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        const url = URL.createObjectURL(blob)
        setPlaybackUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // 3秒后自动停止
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording()
        }
      }, 3000)
    } catch (err) {
      console.error('录音失败:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const speakWord = (example: string) => {
    const match = example.match(/([\u4e00-\u9fa5]+)/)?.[0]
    if (match) {
      const utterance = new SpeechSynthesisUtterance(match)
      utterance.lang = 'zh-CN'
      speechSynthesis.speak(utterance)
    }
  }

  const handleConfirm = () => {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      onComplete()
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-xl"
    >
      <h3 className="text-xl font-bold mb-4 text-center">跟读练习</h3>
      <p className="text-center text-gray-600 mb-6">先听发音，然后模仿跟读</p>

      {/* 示例词语 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {final.examples.slice(0, 4).map((example, index) => (
          <motion.button
            key={index}
            onClick={() => speakWord(example)}
            className="bg-blue-50 rounded-xl p-3 text-center hover:bg-blue-100 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <p className="text-xl font-bold text-gray-800">
              {example.match(/([\u4e00-\u9fa5]+)/)?.[0]}
            </p>
            <p className="text-xs text-gray-500">
              {example.match(/\(([a-zāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜêœ]+)\)/)?.[0]}
            </p>
          </motion.button>
        ))}
      </div>

      {/* 录音区域 */}
      <div className="flex flex-col items-center gap-4">
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
            isRecording
              ? 'bg-red-500 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isRecording ? '⏹️' : '🎤'}
        </motion.button>

        <p className="text-gray-500">
          {isRecording ? '录音中... (3秒后自动停止)' : '点击开始录音'}
        </p>

        {/* 回放 */}
        {playbackUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <audio src={playbackUrl} controls className="w-64" />
            <motion.button
              onClick={handleConfirm}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              确认完成
            </motion.button>
          </motion.div>
        )}

        {/* 成功提示 */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            >
              <div className="bg-white rounded-3xl p-8 text-center">
                <span className="text-6xl">🎉</span>
                <p className="text-2xl font-bold mt-4">跟读完成！</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
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
  const [fish, setFish] = useState<FishState[]>([])

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

  const getFinalData = (id: string) => COMPOUND_DATA.find(f => f.id === id)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-blue-400 to-blue-800 z-50 overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 气泡 */}
        {[...Array(15)].map((_, i) => (
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
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`seaweed-${i}`}
            className="absolute bottom-0 w-6 bg-gradient-to-t from-green-600 to-green-400 rounded-t-full"
            style={{
              height: Math.random() * 150 + 100,
              left: `${i * 14 + 3}%`,
            }}
            animate={{
              skewX: [0, 8, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
        {/* 珊瑚 */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`coral-${i}`}
            className="absolute bottom-0"
            style={{
              left: `${i * 22 + 10}%`,
            }}
            animate={{
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <span className="text-4xl" style={{ opacity: 0.7 }}>
              {['🪸', '🪷', '🪸', '🪸', '🪷'][i]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* 头部 */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl font-bold hover:bg-white/30 transition-colors"
        >
          ← 返回
        </button>
        <h1 className="text-2xl font-bold text-white">🐠 复韵母水族馆</h1>
        <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2 text-white font-bold">
          {collectedFinals.length}/9
        </div>
      </div>

      {/* 水族馆区域 */}
      <div className="relative z-10 h-[calc(100vh-180px)] mx-4">
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
                  x: [0, 150, 0, -150, 0],
                  y: [0, -40, 0, 40, 0],
                }}
                transition={{
                  duration: 15 / f.speed,
                  repeat: Infinity,
                  ease: "linear",
                }}
                whileHover={{ scale: 1.3 }}
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
                  <span className="text-6xl">{finalData.icon}</span>
                  <div
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
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
              <span className="text-7xl">🌊</span>
              <p className="mt-4 text-2xl font-bold">还没有收集到复韵母</p>
              <p className="text-lg mt-2">快去学习中收集吧！</p>
            </div>
          </div>
        )}
      </div>

      {/* 收集展示栏 */}
      <div className="relative z-10 absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-2xl p-4">
        <div className="flex justify-center gap-3 flex-wrap">
          {COMPOUND_DATA.map((final) => (
            <motion.div
              key={final.id}
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all shadow-lg ${
                collectedFinals.includes(final.id)
                  ? ''
                  : 'bg-gray-300 text-gray-500'
              }`}
              style={{
                backgroundColor: collectedFinals.includes(final.id) ? final.color : undefined,
                color: collectedFinals.includes(final.id) ? 'white' : undefined,
              }}
              whileHover={collectedFinals.includes(final.id) ? { scale: 1.15, y: -5 } : {}}
            >
              {collectedFinals.includes(final.id) ? final.symbol : '?'}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 测试组件 ====================
const CompoundTest = ({
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
      options: COMPOUND_DATA.map(f => ({ label: f.pronunciation, value: f.id })).sort(() => Math.random() - 0.5),
      correct: final.id,
    },
    {
      type: 'mouth',
      question: `发 "${final.symbol}" 音时，口型是如何变化的？`,
      options: [
        { label: final.mouthShape.slice(0, 8), value: final.id },
        { label: '嘴巴张大，保持不变', value: 'wrong1' },
        { label: '嘴巴变小，保持不变', value: 'wrong2' },
        { label: '舌头卷起发音', value: 'wrong3' },
      ].sort(() => Math.random() - 0.5),
      correct: final.id,
    },
    {
      type: 'example',
      question: `下面哪个词语包含 "${final.symbol}"？`,
      options: final.examples.slice(0, 4).map(ex => {
        const hanzi = ex.match(/([\u4e00-\u9fa5]+)/)?.[0] || ''
        return { label: hanzi, value: ex }
      }),
      correct: final.examples[0],
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
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
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
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
            style={{ backgroundColor: final.color }}
          >
            {final.icon}
          </div>
          <div
            className="text-6xl font-bold mb-4"
            style={{ color: final.color }}
          >
            {final.symbol}
          </div>
          <h3 className="text-xl font-bold">{currentQ.question}</h3>
        </div>

        {/* 选项 */}
        <div className="grid grid-cols-2 gap-4">
          {currentQ.options.map((option, index) => (
            <motion.button
              key={index}
              onClick={() => !showFeedback && handleAnswer(option.value)}
              disabled={showFeedback}
              className={`p-4 rounded-2xl text-lg font-bold transition-all ${
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
export default function CompoundFinalsIsland({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<LearningStage>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState<Record<string, CompoundProgress>>({})
  const [showAquarium, setShowAquarium] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const currentFinal = COMPOUND_DATA[currentIndex]

  // 从 localStorage 加载进度
  useEffect(() => {
    const saved = localStorage.getItem('compound-finals-progress')
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
    localStorage.setItem('compound-finals-progress', JSON.stringify(progress))
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

  const handlePracticeComplete = () => {
    setProgress(prev => ({
      ...prev,
      [currentFinal.id]: {
        ...prev[currentFinal.id],
        id: currentFinal.id,
        practiced: true,
      }
    }))
    setStage('intro')
  }

  const collectedFinals = Object.values(progress).filter(p => p.collected).map(p => p.id)
  const masteredFinals = Object.values(progress).filter(p => p.mastered).map(p => p.id)

  // ==================== 介绍阶段 ====================
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-cyan-50 to-blue-100 p-4">
        {/* 头部 */}
        <header className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl font-bold text-blue-600 hover:bg-white hover:shadow-lg transition-all shadow-md"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🌊 复韵母岛</h1>
          <button
            onClick={() => setShowAquarium(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all shadow-md flex items-center gap-2"
          >
            <span>🐠</span>
            <span>{collectedFinals.length}/9</span>
          </button>
        </header>

        <div className="max-w-4xl mx-auto">
          {/* 进度概览 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur rounded-2xl p-4 mb-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-700">学习进度</h2>
              <span className="text-blue-600 font-medium">
                已掌握: {masteredFinals.length}/9
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${(collectedFinals.length / 9) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          {/* 9个复韵母卡片网格 */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
            {COMPOUND_DATA.map((final, index) => {
              const p = progress[final.id]
              const isSelected = currentIndex === index
              return (
                <motion.button
                  key={final.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg ${
                    isSelected ? 'ring-4 ring-blue-400 ring-offset-2' : ''
                  }`}
                  style={{
                    backgroundColor: final.color,
                    color: 'white',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-4xl mb-1">{final.icon}</span>
                  <span className="text-2xl font-bold">{final.symbol}</span>
                  {p?.mastered && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      ⭐
                    </span>
                  )}
                  {p?.collected && !p?.mastered && (
                    <span className="absolute -top-1 -right-1 bg-green-400 rounded-full w-5 h-5" />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* 当前选中的复韵母详情卡片 */}
          <motion.div
            key={currentFinal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            <div className="text-center mb-6">
              <motion.div
                className="text-7xl mb-4 inline-block"
                animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {currentFinal.icon}
              </motion.div>

              <motion.div
                className="text-8xl font-bold mb-2"
                style={{ color: currentFinal.color }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentFinal.symbol}
              </motion.div>

              <p className="text-2xl text-gray-600 mb-1">{currentFinal.pronunciation}</p>
              <p className="text-sm text-gray-500">{currentFinal.mouthShape}</p>
            </div>

            {/* 功能按钮 */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <motion.button
                onClick={() => {
                  setIsPlaying(true)
                  speak(currentFinal.pronunciation)
                  setTimeout(() => setIsPlaying(false), 1000)
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔊 听发音
              </motion.button>

              <motion.button
                onClick={() => setStage('learn')}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📚 开始学习
              </motion.button>

              {progress[currentFinal.id]?.collected && (
                <>
                  <motion.button
                    onClick={() => setStage('practice')}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎤 跟读练习
                  </motion.button>
                  <motion.button
                    onClick={() => setStage('test')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
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
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🐠 收集复韵母
                </motion.button>
              )}
            </div>

            {/* 示例词语 */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold mb-4 text-center text-gray-700">示例词语</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {currentFinal.examples.map((example, index) => (
                  <motion.span
                    key={index}
                    className="px-4 py-2 rounded-full text-lg font-medium cursor-pointer"
                    style={{
                      backgroundColor: `${currentFinal.color}20`,
                      color: currentFinal.color
                    }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    onClick={() => {
                      const match = example.match(/\(([a-zāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜêœ]+)\)/)
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
                    x: (Math.random() - 0.5) * 600,
                    y: (Math.random() - 0.5) * 600,
                    scale: [0, 1.5, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  {['⭐', '🎉', '🎊', '✨', '🌟', currentFinal.icon][Math.floor(Math.random() * 6)]}
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
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-cyan-50 to-blue-100 p-4">
        <header className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
          <button
            onClick={() => setStage('intro')}
            className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl font-bold text-blue-600 hover:bg-white hover:shadow-lg transition-all"
          >
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
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🔊</span> 发音示范
              </h3>
              <div className="text-center">
                <motion.div
                  className="text-7xl font-bold mb-4"
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
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
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
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>👄</span> 口型演示
              </h3>
              <MouthShapeAnimation final={currentFinal} isPlaying={isPlaying} />
              <p className="text-center text-gray-600 mt-4 text-sm">{currentFinal.mouthShape}</p>
              <button
                onClick={() => {
                  setIsPlaying(true)
                  setTimeout(() => setIsPlaying(false), 2000)
                }}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all w-full mt-4"
              >
                {isPlaying ? '👄 演示中...' : '▶️ 演示口型'}
              </button>
            </motion.div>
          </div>

          {/* 发音特点 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-xl mt-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💡</span> 发音特点
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-bold text-blue-600">{currentFinal.symbol}</span> 是由两个元音组成的复韵母。
                发音时要注意：
              </p>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>从前一个元音快速滑向后一个元音</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>气流连续，中间不能停顿</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>主要元音（韵腹）要读得清晰响亮</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* 示例词语 */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-xl mt-6"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📝</span> 示例词语
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {currentFinal.examples.map((example, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-4 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    const match = example.match(/\(([a-zāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜêœ]+)\)/)
                    if (match) speak(match[1])
                  }}
                >
                  <p className="text-2xl font-bold text-gray-800">
                    {example.match(/([\u4e00-\u9fa5]+)/)?.[0]}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {example.match(/\(([a-zāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜêœ]+)\)/)?.[0]}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 下一步 */}
          <div className="flex justify-center mt-8">
            <motion.button
              onClick={() => setStage('practice')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-lg transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              继续：跟读练习 →
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // ==================== 跟读练习阶段 ====================
  if (stage === 'practice') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 via-cyan-50 to-blue-100 p-4">
        <header className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
          <button
            onClick={() => setStage('learn')}
            className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl font-bold text-blue-600 hover:bg-white hover:shadow-lg transition-all"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🎤 跟读练习：{currentFinal.symbol}</h1>
          <div className="w-20" />
        </header>

        <div className="max-w-2xl mx-auto">
          <RecordingPractice
            final={currentFinal}
            onComplete={handlePracticeComplete}
          />
        </div>
      </div>
    )
  }

  // ==================== 测试阶段 ====================
  if (stage === 'test') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-purple-100 p-4">
        <header className="flex items-center justify-between mb-6 max-w-4xl mx-auto">
          <button
            onClick={() => setStage('intro')}
            className="bg-white/80 backdrop-blur px-4 py-2 rounded-xl font-bold text-purple-600 hover:bg-white hover:shadow-lg transition-all"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🎯 测试：{currentFinal.symbol}</h1>
          <div className="w-20" />
        </header>

        <CompoundTest
          final={currentFinal}
          onComplete={handleTestComplete}
        />
      </div>
    )
  }

  return null
}
