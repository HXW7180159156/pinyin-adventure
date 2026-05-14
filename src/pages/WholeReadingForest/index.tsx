import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { wholeReadings } from '../../data/phonemes'
import type { Phoneme } from '../../types'

// ==================== 类型定义 ====================
type LearningStage = 'grid' | 'learn' | 'compare'

interface WholeReadingProgress {
  id: string
  collected: boolean
  mastered: boolean
  practiceCount: number
  testScore: number
}

// 分类数据
const CATEGORIES = [
  {
    id: 'retroflex',
    name: '翘舌音组',
    subtitle: 'zh/ch/sh/r',
    description: '舌尖翘起抵住硬腭前部',
    phonemes: ['zhi', 'chi', 'shi', 'ri'],
    color: '#FF6B6B',
    icon: '🦁',
  },
  {
    id: 'flat',
    name: '平舌音组',
    subtitle: 'z/c/s',
    description: '舌尖平伸抵住上齿背',
    phonemes: ['zi', 'ci', 'si'],
    color: '#4ECDC4',
    icon: '🦎',
  },
  {
    id: 'yw',
    name: '韵母自成音节组',
    subtitle: 'y/w',
    description: '韵母独立成音节，无需声母',
    phonemes: ['yi', 'wu'],
    color: '#FFE66D',
    icon: '🦋',
  },
  {
    id: 'yu',
    name: 'ü相关组',
    subtitle: 'yu/yue/yuan/yin/yun/ying',
    description: 'ü与相关音节组合',
    phonemes: ['yu', 'ye', 'yue', 'yuan', 'yin', 'yun', 'ying'],
    color: '#AA96DA',
    icon: '🦄',
  },
]

// ==================== 发音对比数据 ====================
const COMPARISON_DATA: Record<string, {
  original: string
  spelled: string
  difference: string
  tip: string
}> = {
  zhi: {
    original: 'zhī',
    spelled: 'zh + ī → zhī',
    difference: 'zhi 是一个整体，不能分开读成"zhi"+"i"',
    tip: '发zhi时，舌尖翘起后保持不动，一口气读完',
  },
  chi: {
    original: 'chī',
    spelled: 'ch + ī → chī',
    difference: 'chi 是一个整体，不能分开读成"chi"+"i"',
    tip: '发chi时，送气要足，但仍然是完整一口气',
  },
  shi: {
    original: 'shī',
    spelled: 'sh + ī → shī',
    difference: 'shi 是一个整体，不能分开读成"shi"+"i"',
    tip: '发shi时，舌头保持翘起位置，摩擦发音',
  },
  ri: {
    original: 'rì',
    spelled: 'r + ì → rì',
    difference: 'ri 是一个整体，不能分开读成"ri"+"i"',
    tip: '发ri时，声带振动，是浊音',
  },
  zi: {
    original: 'zī',
    spelled: 'z + ī → zī',
    difference: 'zi 是一个整体，不能分开读成"zi"+"i"',
    tip: '发zi时，舌尖平放，一口气读完',
  },
  ci: {
    original: 'cī',
    spelled: 'c + ī → cī',
    difference: 'ci 是一个整体，不能分开读成"ci"+"i"',
    tip: '发ci时，送气要充足',
  },
  si: {
    original: 'sī',
    spelled: 's + ī → sī',
    difference: 'si 是一个整体，不能分开读成"si"+"i"',
    tip: '发si时，舌尖接近齿背，摩擦发音',
  },
}

// ==================== 卡片组件 ====================
const ReadingCard = ({
  phoneme,
  isCollected,
  isMastered,
  onClick,
  index,
}: {
  phoneme: Phoneme
  isCollected: boolean
  isMastered: boolean
  onClick: () => void
  index: number
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSpeaking) return
    
    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(phoneme.pronunciation)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8
    utterance.onend = () => setIsSpeaking(false)
    speechSynthesis.speak(utterance)
  }

  return (
    <motion.button
      onClick={onClick}
      className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden ${
        isMastered
          ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-300/50'
          : isCollected
          ? 'bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-300/50'
          : 'bg-white shadow-md hover:shadow-lg'
      }`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-2 right-2 text-4xl">{phoneme.icon}</div>
      </div>

      {/* 主符号 */}
      <span
        className={`text-4xl font-bold mb-1 ${
          isCollected || isMastered ? 'text-white' : 'text-gray-800'
        }`}
      >
        {phoneme.symbol}
      </span>

      {/* 发音标注 */}
      <span
        className={`text-lg ${
          isCollected || isMastered ? 'text-white/80' : 'text-gray-500'
        }`}
      >
        {phoneme.pronunciation}
      </span>

      {/* 状态标识 */}
      {isMastered && (
        <div className="absolute top-2 left-2 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center">
          <span className="text-sm">⭐</span>
        </div>
      )}

      {/* 播放按钮 */}
      <motion.button
        onClick={handleSpeak}
        className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isCollected || isMastered
            ? 'bg-white/30 hover:bg-white/50'
            : 'bg-emerald-100 hover:bg-emerald-200'
        }`}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className={isSpeaking ? 'animate-pulse' : ''}>
          {isSpeaking ? '🔊' : '🔈'}
        </span>
      </motion.button>

      {/* 未收集状态 */}
      {!isCollected && (
        <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
          <span className="text-white text-4xl opacity-50">🔒</span>
        </div>
      )}
    </motion.button>
  )
}

// ==================== 分类卡片组件 ====================
const CategorySection = ({
  category,
  progress,
  onSelectPhoneme,
}: {
  category: typeof CATEGORIES[0]
  progress: Record<string, WholeReadingProgress>
  onSelectPhoneme: (id: string) => void
}) => {
  const categoryPhonemes = wholeReadings.filter((p) =>
    category.phonemes.includes(p.id)
  )

  const collectedCount = categoryPhonemes.filter(
    (p) => progress[p.id]?.collected
  ).length
  const totalCount = categoryPhonemes.length

  return (
    <motion.div
      className="bg-white/80 backdrop-blur rounded-3xl p-4 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 分类标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.subtitle}</p>
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: category.color }}
        >
          {collectedCount}/{totalCount}
        </div>
      </div>

      {/* 描述 */}
      <p className="text-sm text-gray-600 mb-4">{category.description}</p>

      {/* 音节网格 */}
      <div className="grid grid-cols-4 gap-3">
        {categoryPhonemes.map((phoneme, index) => (
          <ReadingCard
            key={phoneme.id}
            phoneme={phoneme}
            isCollected={progress[phoneme.id]?.collected || false}
            isMastered={progress[phoneme.id]?.mastered || false}
            onClick={() => onSelectPhoneme(phoneme.id)}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ==================== 学习详情组件 ====================
const LearningDetail = ({
  phoneme,
  onBack,
  onCollect,
  progress,
}: {
  phoneme: Phoneme
  onBack: () => void
  onCollect: () => void
  progress: WholeReadingProgress | undefined
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [stage, setStage] = useState<'learn' | 'compare'>('learn')

  const comparison = COMPARISON_DATA[phoneme.id]

  const speak = useCallback((text: string) => {
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8
    utterance.onend = () => setIsPlaying(false)
    speechSynthesis.speak(utterance)
  }, [])

  const speakWord = useCallback((word: string) => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }, [])

  const handleCollect = () => {
    onCollect()
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-50 to-teal-50 p-4">
      {/* 头部 */}
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="bg-white rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <span>←</span>
          <span className="font-medium">返回</span>
        </button>
        <h1 className="text-xl font-bold text-gray-800">整体认读音节</h1>
        <div className="w-20" />
      </header>

      <div className="max-w-2xl mx-auto">
        {/* 主卡片 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 shadow-xl mb-6"
        >
          {/* 音节展示 */}
          <div className="text-center mb-6">
            <motion.div
              className="text-8xl font-bold mb-4"
              style={{ color: phoneme.color }}
              animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {phoneme.symbol}
            </motion.div>
            <p className="text-2xl text-gray-600 mb-2">{phoneme.pronunciation}</p>
            <p className="text-sm text-gray-400">{phoneme.mouthShape}</p>
          </div>

          {/* 发音按钮 */}
          <motion.button
            onClick={() => speak(phoneme.pronunciation)}
            className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className={isPlaying ? 'animate-pulse' : ''}>
              {isPlaying ? '🔊' : '🔈'}
            </span>
            听发音
          </motion.button>

          {/* 特点说明 */}
          <div className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4">
            <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
              <span>💡</span> 发音特点
            </h3>
            <p className="text-gray-700">
              整体认读音节，发音时作为一个整体，不需要拼读。
              舌头位置在整个发音过程中保持不变，一口气完成。
            </p>
          </div>

          {/* 示例词语 */}
          <div className="mt-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span>📝</span> 示例词语
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {phoneme.examples.map((example, index) => {
                const word = example.match(/([\u4e00-\u9fa5]+)/)?.[0] || ''
                return (
                  <motion.button
                    key={index}
                    onClick={() => speakWord(word)}
                    className="bg-gray-50 hover:bg-emerald-50 rounded-xl p-3 text-center transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <p className="text-2xl font-bold text-gray-800">{word}</p>
                    <p className="text-sm text-gray-500">
                      {example.match(/\(([a-zāáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜ]+)\)/)?.[0]}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* 与声母对比按钮 */}
          {comparison && (
            <motion.button
              onClick={() => setStage('compare')}
              className="w-full mt-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>🔍</span>
              与声母对比
            </motion.button>
          )}
        </motion.div>

        {/* 收集按钮 */}
        {!progress?.collected && (
          <motion.button
            onClick={handleCollect}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🦋 收集音节
          </motion.button>
        )}

        {progress?.collected && (
          <div className="text-center py-4 bg-emerald-100 rounded-2xl">
            <span className="text-2xl">🎉</span>
            <p className="text-emerald-700 font-bold">已收集</p>
          </div>
        )}
      </div>

      {/* 对比面板 */}
      <AnimatePresence>
        {stage === 'compare' && comparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setStage('learn')}
          >
            <motion.div
              initial={{ scale: 0.8, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 100 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">🔍 与声母对比</h3>
                <button
                  onClick={() => setStage('learn')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* 对比展示 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-emerald-600 mb-2">整体认读</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {comparison.original}
                  </p>
                  <p className="text-sm text-emerald-500 mt-2">
                    一口气读完，不拆分
                  </p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-red-600 mb-2">错误拼读</p>
                  <p className="text-3xl font-bold text-red-400">
                    {comparison.spelled}
                  </p>
                  <p className="text-sm text-red-400 mt-2 line-through">
                    这样读是错误的
                  </p>
                </div>
              </div>

              {/* 区别说明 */}
              <div className="bg-yellow-50 rounded-2xl p-4 mb-4">
                <p className="text-yellow-800 font-medium">
                  {comparison.difference}
                </p>
              </div>

              {/* 小贴士 */}
              <div className="bg-purple-50 rounded-2xl p-4">
                <p className="text-purple-700 font-medium flex items-center gap-2">
                  <span>💡</span> 小贴士
                </p>
                <p className="text-purple-600 mt-2">{comparison.tip}</p>
              </div>

              {/* 听对比发音 */}
              <motion.button
                onClick={() => {
                  speak(comparison.original)
                  setTimeout(() => speak('不是'), 800)
                  setTimeout(() => speak(comparison.spelled.replace(' + ', '')), 1600)
                }}
                className="w-full mt-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white py-3 rounded-2xl font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔊 听对比发音
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  rotate: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  scale: [0, 1.5, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                {['⭐', '🎉', '🎊', '✨', '🦋', '🌟'][Math.floor(Math.random() * 6)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== 收集进度条组件 ====================
const ProgressBar = ({
  collected,
  total,
}: {
  collected: number
  total: number
}) => {
  const percentage = (collected / total) * 100

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur shadow-lg border-t border-gray-100 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦋</span>
            <span className="font-bold text-gray-800">收集进度</span>
          </div>
          <span className="font-bold text-emerald-600">
            {collected}/{total}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {percentage === 100 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-emerald-600 font-bold mt-2"
          >
            🎉 恭喜完成所有整体认读音节！
          </motion.p>
        )}
      </div>
    </div>
  )
}

// ==================== 主组件 ====================
export default function WholeReadingForest({ onBack }: { onBack: () => void }) {
  const [progress, setProgress] = useState<Record<string, WholeReadingProgress>>({})
  const [selectedPhoneme, setSelectedPhoneme] = useState<Phoneme | null>(null)
  const [stage, setStage] = useState<LearningStage>('grid')

  // 从 localStorage 加载进度
  useEffect(() => {
    const saved = localStorage.getItem('whole-reading-progress')
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
    localStorage.setItem('whole-reading-progress', JSON.stringify(progress))
  }, [progress])

  const collectedCount = Object.values(progress).filter((p) => p.collected).length

  const handleSelectPhoneme = (id: string) => {
    const phoneme = wholeReadings.find((p) => p.id === id)
    if (phoneme) {
      setSelectedPhoneme(phoneme)
      setStage('learn')
    }
  }

  const handleCollect = () => {
    if (!selectedPhoneme) return
    setProgress((prev) => ({
      ...prev,
      [selectedPhoneme.id]: {
        ...prev[selectedPhoneme.id],
        id: selectedPhoneme.id,
        collected: true,
        practiceCount: (prev[selectedPhoneme.id]?.practiceCount || 0) + 1,
      },
    }))
  }

  const handleBackFromLearn = () => {
    setSelectedPhoneme(null)
    setStage('grid')
  }

  // 学习详情模式
  if (stage === 'learn' && selectedPhoneme) {
    return (
      <LearningDetail
        phoneme={selectedPhoneme}
        onBack={handleBackFromLearn}
        onCollect={handleCollect}
        progress={progress[selectedPhoneme.id]}
      />
    )
  }

  // 网格模式
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-emerald-50 to-teal-50 pb-24">
      {/* 头部 */}
      <header className="sticky top-0 bg-white/90 backdrop-blur shadow-sm z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="bg-emerald-100 hover:bg-emerald-200 rounded-full px-4 py-2 transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span className="font-medium">返回</span>
            </button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>🌲</span> 整体认读森林
              </h1>
              <p className="text-sm text-gray-500">16个整体认读音节</p>
            </div>
            <motion.div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-full px-4 py-2 font-bold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {collectedCount}/16
            </motion.div>
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 介绍卡片 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 text-white shadow-xl"
        >
          <div className="flex items-start gap-4">
            <span className="text-5xl">📖</span>
            <div>
              <h2 className="text-2xl font-bold mb-2">什么是整体认读音节？</h2>
              <p className="text-white/90 leading-relaxed">
                整体认读音节是指在学习汉语拼音时，需要作为一个整体来认读，不需要也不能拆分成声母和韵母来拼读的音节。
                共16个音节，分为四组学习。
              </p>
            </div>
          </div>
        </motion.div>

        {/* 分类展示 */}
        {CATEGORIES.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CategorySection
              category={category}
              progress={progress}
              onSelectPhoneme={handleSelectPhoneme}
            />
          </motion.div>
        ))}
      </main>

      {/* 底部进度条 */}
      <ProgressBar collected={collectedCount} total={16} />
    </div>
  )
}
