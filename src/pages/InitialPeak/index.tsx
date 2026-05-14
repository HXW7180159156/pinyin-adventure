import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Phoneme } from '../../types'

// ==================== 类型定义 ====================
type LearningStage = 'intro' | 'learn' | 'practice' | 'test' | 'collection' | 'compare'
type MouthShape = 'bilateral' | 'labiodental' | 'apical' | 'blade' | 'root' | 'zero'

interface InitialProgress {
  id: string
  collected: boolean
  mastered: boolean
  practiceCount: number
  testScore: number
}

interface SpriteState {
  id: string
  initialId: string
  x: number
  y: number
  evolution: number
  happiness: number
}

// ==================== 23个声母完整数据 ====================
const INITIALS_DATA: Phoneme[] = [
  {
    id: 'b',
    symbol: 'b',
    category: 'initial',
    pronunciation: '玻',
    mouthShape: '双唇紧闭，突然放开，气流较弱',
    examples: ['爸(bà)', '不(bù)', '白(bái)', '包(bāo)', '北(běi)'],
    difficulty: 1,
    color: '#FF6B6B',
    icon: '🦋',
  },
  {
    id: 'p',
    symbol: 'p',
    category: 'initial',
    pronunciation: '坡',
    mouthShape: '双唇紧闭，突然放开，气流较强（送气）',
    examples: ['怕(pà)', '跑(pǎo)', '皮(pí)', '盆(pén)', '片(piàn)'],
    difficulty: 1,
    color: '#FF8E72',
    icon: '🦜',
  },
  {
    id: 'm',
    symbol: 'm',
    category: 'initial',
    pronunciation: '摸',
    mouthShape: '双唇紧闭，软腭下降，气流从鼻腔出来',
    examples: ['妈(mā)', '猫(māo)', '门(mén)', '米(mǐ)', '马(mǎ)'],
    difficulty: 1,
    color: '#4ECDC4',
    icon: '🐵',
  },
  {
    id: 'f',
    symbol: 'f',
    category: 'initial',
    pronunciation: '佛',
    mouthShape: '上齿碰下唇，气流从缝隙中摩擦出来',
    examples: ['飞(fēi)', '风(fēng)', '饭(fàn)', '花(huā)', '父(fù)'],
    difficulty: 1,
    color: '#45B7D1',
    icon: '🦊',
  },
  {
    id: 'd',
    symbol: 'd',
    category: 'initial',
    pronunciation: '得',
    mouthShape: '舌尖抵住上牙龈，突然放开，气流较弱',
    examples: ['大(dà)', '的(de)', '多(duō)', '刀(dāo)', '灯(dēng)'],
    difficulty: 1,
    color: '#96CEB4',
    icon: '🦌',
  },
  {
    id: 't',
    symbol: 't',
    category: 'initial',
    pronunciation: '特',
    mouthShape: '舌尖抵住上牙龈，突然放开，气流较强（送气）',
    examples: ['他(tā)', '天(tiān)', '听(tīng)', '土(tǔ)', '头(tóu)'],
    difficulty: 1,
    color: '#88D8B0',
    icon: '🐯',
  },
  {
    id: 'n',
    symbol: 'n',
    category: 'initial',
    pronunciation: '讷',
    mouthShape: '舌尖抵住上牙龈，软腭下降，气流从鼻腔出来',
    examples: ['你(nǐ)', '年(nián)', '牛(niú)', '女(nǚ)', '鸟(niǎo)'],
    difficulty: 1,
    color: '#FFEAA7',
    icon: '🦉',
  },
  {
    id: 'l',
    symbol: 'l',
    category: 'initial',
    pronunciation: '勒',
    mouthShape: '舌尖抵住上牙龈，气流从舌头两边出来',
    examples: ['了(le)', '来(lái)', '老(lǎo)', '路(lù)', '蓝(lán)'],
    difficulty: 1,
    color: '#DDA0DD',
    icon: '🦁',
  },
  {
    id: 'g',
    symbol: 'g',
    category: 'initial',
    pronunciation: '哥',
    mouthShape: '舌根抵住软腭，突然放开，气流较弱',
    examples: ['哥(gē)', '个(gè)', '狗(gǒu)', '瓜(guā)', '给(gěi)'],
    difficulty: 2,
    color: '#98D8C8',
    icon: '🦒',
  },
  {
    id: 'k',
    symbol: 'k',
    category: 'initial',
    pronunciation: '科',
    mouthShape: '舌根抵住软腭，突然放开，气流较强（送气）',
    examples: ['看(kàn)', '开(kāi)', '口(kǒu)', '快(kuài)', '空(kōng)'],
    difficulty: 2,
    color: '#F7DC6F',
    icon: '🦘',
  },
  {
    id: 'h',
    symbol: 'h',
    category: 'initial',
    pronunciation: '喝',
    mouthShape: '舌根接近软腭，气流从缝隙中摩擦出来',
    examples: ['好(hǎo)', '和(hé)', '火(huǒ)', '花(huā)', '海(hǎi)'],
    difficulty: 2,
    color: '#BB8FCE',
    icon: '🦛',
  },
  {
    id: 'j',
    symbol: 'j',
    category: 'initial',
    pronunciation: '基',
    mouthShape: '舌面前部抵住硬腭前部，气流较弱',
    examples: ['鸡(jī)', '家(jiā)', '九(jiǔ)', '进(jìn)', '叫(jiào)'],
    difficulty: 2,
    color: '#85C1E2',
    icon: '🦜',
  },
  {
    id: 'q',
    symbol: 'q',
    category: 'initial',
    pronunciation: '欺',
    mouthShape: '舌面前部抵住硬腭前部，气流较强（送气）',
    examples: ['七(qī)', '去(qù)', '前(qián)', '球(qiú)', '桥(qiáo)'],
    difficulty: 2,
    color: '#F8B739',
    icon: '🦆',
  },
  {
    id: 'x',
    symbol: 'x',
    category: 'initial',
    pronunciation: '希',
    mouthShape: '舌面前部接近硬腭前部，气流摩擦出来',
    examples: ['西(xī)', '小(xiǎo)', '下(xià)', '星(xīng)', '雪(xuě)'],
    difficulty: 2,
    color: '#52B788',
    icon: '🦈',
  },
  {
    id: 'zh',
    symbol: 'zh',
    category: 'initial',
    pronunciation: '知',
    mouthShape: '舌尖翘起抵住硬腭前部，气流较弱',
    examples: ['中(zhōng)', '竹(zhú)', '真(zhēn)', '站(zhàn)', '纸(zhǐ)'],
    difficulty: 3,
    color: '#E17055',
    icon: '🦎',
  },
  {
    id: 'ch',
    symbol: 'ch',
    category: 'initial',
    pronunciation: '吃',
    mouthShape: '舌尖翘起抵住硬腭前部，气流较强（送气）',
    examples: ['吃(chī)', '车(chē)', '春(chūn)', '船(chuán)', '窗(chuāng)'],
    difficulty: 3,
    color: '#6C5CE7',
    icon: '🦅',
  },
  {
    id: 'sh',
    symbol: 'sh',
    category: 'initial',
    pronunciation: '诗',
    mouthShape: '舌尖翘起接近硬腭前部，气流摩擦出来',
    examples: ['书(shū)', '水(shuǐ)', '山(shān)', '上(shàng)', '手(shǒu)'],
    difficulty: 3,
    color: '#A29BFE',
    icon: '🦢',
  },
  {
    id: 'r',
    symbol: 'r',
    category: 'initial',
    pronunciation: '日',
    mouthShape: '舌尖翘起接近硬腭前部，声带振动',
    examples: ['人(rén)', '热(rè)', '日(rì)', '肉(ròu)', '让(ràng)'],
    difficulty: 3,
    color: '#FD79A8',
    icon: '🦏',
  },
  {
    id: 'z',
    symbol: 'z',
    category: 'initial',
    pronunciation: '资',
    mouthShape: '舌尖抵住上齿背，气流较弱',
    examples: ['在(zài)', '走(zǒu)', '左(zuǒ)', '坐(zuò)', '字(zì)'],
    difficulty: 2,
    color: '#FDCB6E',
    icon: '🦓',
  },
  {
    id: 'c',
    symbol: 'c',
    category: 'initial',
    pronunciation: '雌',
    mouthShape: '舌尖抵住上齿背，气流较强（送气）',
    examples: ['从(cóng)', '草(cǎo)', '彩(cǎi)', '菜(cài)', '参(cān)'],
    difficulty: 2,
    color: '#6C5CE7',
    icon: '🦀',
  },
  {
    id: 's',
    symbol: 's',
    category: 'initial',
    pronunciation: '思',
    mouthShape: '舌尖接近上齿背，气流摩擦出来',
    examples: ['三(sān)', '四(sì)', '色(sè)', '伞(sǎn)', '松(sōng)'],
    difficulty: 2,
    color: '#00B894',
    icon: '🦎',
  },
  {
    id: 'y',
    symbol: 'y',
    category: 'initial',
    pronunciation: '医',
    mouthShape: '舌面前部向硬腭抬起，气流较弱',
    examples: ['一(yī)', '有(yǒu)', '月(yuè)', '羊(yáng)', '雨(yǔ)'],
    difficulty: 1,
    color: '#E84393',
    icon: '🦜',
  },
  {
    id: 'w',
    symbol: 'w',
    category: 'initial',
    pronunciation: '巫',
    mouthShape: '双唇收圆，舌头后缩，气流较弱',
    examples: ['我(wǒ)', '五(wǔ)', '外(wài)', '晚(wǎn)', '文(wén)'],
    difficulty: 1,
    color: '#0984E3',
    icon: '🐋',
  },
]

// ==================== 易混淆声母对比数据 ====================
const CONFUSING_PAIRS = [
  {
    id: 'b-p',
    initials: ['b', 'p'],
    title: 'b vs p',
    difference: 'b不送气，p送气（p有气流喷出）',
    testWords: [
      { word: '爸', pinyin: 'bà', correct: 'b' },
      { word: '怕', pinyin: 'pà', correct: 'p' },
      { word: '白', pinyin: 'bái', correct: 'b' },
      { word: '跑', pinyin: 'pǎo', correct: 'p' },
    ],
  },
  {
    id: 'd-t',
    initials: ['d', 't'],
    title: 'd vs t',
    difference: 'd不送气，t送气（t有气流喷出）',
    testWords: [
      { word: '大', pinyin: 'dà', correct: 'd' },
      { word: '他', pinyin: 'tā', correct: 't' },
      { word: '多', pinyin: 'duō', correct: 'd' },
      { word: '天', pinyin: 'tiān', correct: 't' },
    ],
  },
  {
    id: 'n-l',
    initials: ['n', 'l'],
    title: 'n vs l',
    difference: 'n是鼻音（气流从鼻子出），l是边音（气流从舌头两边出）',
    testWords: [
      { word: '你', pinyin: 'nǐ', correct: 'n' },
      { word: '了', pinyin: 'le', correct: 'l' },
      { word: '牛', pinyin: 'niú', correct: 'n' },
      { word: '来', pinyin: 'lái', correct: 'l' },
    ],
  },
  {
    id: 'g-k',
    initials: ['g', 'k'],
    title: 'g vs k',
    difference: 'g不送气，k送气（k有气流喷出）',
    testWords: [
      { word: '哥', pinyin: 'gē', correct: 'g' },
      { word: '看', pinyin: 'kàn', correct: 'k' },
      { word: '狗', pinyin: 'gǒu', correct: 'g' },
      { word: '开', pinyin: 'kāi', correct: 'k' },
    ],
  },
  {
    id: 'zh-z',
    initials: ['zh', 'z'],
    title: 'zh vs z',
    difference: 'zh舌尖翘起（卷舌），z舌尖平伸',
    testWords: [
      { word: '中', pinyin: 'zhōng', correct: 'zh' },
      { word: '在', pinyin: 'zài', correct: 'z' },
      { word: '竹', pinyin: 'zhú', correct: 'zh' },
      { word: '走', pinyin: 'zǒu', correct: 'z' },
    ],
  },
  {
    id: 'ch-c',
    initials: ['ch', 'c'],
    title: 'ch vs c',
    difference: 'ch舌尖翘起（卷舌），c舌尖平伸',
    testWords: [
      { word: '吃', pinyin: 'chī', correct: 'ch' },
      { word: '从', pinyin: 'cóng', correct: 'c' },
      { word: '车', pinyin: 'chē', correct: 'ch' },
      { word: '草', pinyin: 'cǎo', correct: 'c' },
    ],
  },
  {
    id: 'sh-s',
    initials: ['sh', 's'],
    title: 'sh vs s',
    difference: 'sh舌尖翘起（卷舌），s舌尖平伸',
    testWords: [
      { word: '书', pinyin: 'shū', correct: 'sh' },
      { word: '三', pinyin: 'sān', correct: 's' },
      { word: '水', pinyin: 'shuǐ', correct: 'sh' },
      { word: '四', pinyin: 'sì', correct: 's' },
    ],
  },
]

// ==================== 口型动画组件 ====================
const MouthShapeAnimation = ({ initial, isPlaying }: { initial: Phoneme; isPlaying: boolean }) => {
  const getMouthShape = () => {
    const id = initial.id
    if (['b', 'p', 'm'].includes(id)) {
      // 双唇音 - 嘴唇紧闭然后张开
      return { type: 'bilateral', label: '双唇音' }
    } else if (id === 'f') {
      // 唇齿音 - 上齿碰下唇
      return { type: 'labiodental', label: '唇齿音' }
    } else if (['d', 't', 'n', 'l'].includes(id)) {
      // 舌尖中音
      return { type: 'apical', label: '舌尖音' }
    } else if (['g', 'k', 'h'].includes(id)) {
      // 舌根音
      return { type: 'root', label: '舌根音' }
    } else if (['j', 'q', 'x'].includes(id)) {
      // 舌面音
      return { type: 'blade', label: '舌面音' }
    } else if (['zh', 'ch', 'sh', 'r'].includes(id)) {
      // 翘舌音
      return { type: 'retroflex', label: '翘舌音' }
    } else if (['z', 'c', 's'].includes(id)) {
      // 平舌音
      return { type: 'dental', label: '平舌音' }
    }
    return { type: 'zero', label: '零声母' }
  }

  const shape = getMouthShape()

  const getAnimation = () => {
    switch (shape.type) {
      case 'bilateral':
        return { scaleY: isPlaying ? [1, 0.3, 1] : 1 }
      case 'labiodental':
        return { scaleX: isPlaying ? [1, 0.8, 1] : 1 }
      case 'apical':
        return { y: isPlaying ? [0, 5, 0] : 0 }
      case 'retroflex':
        return { rotate: isPlaying ? [0, -10, 0] : 0 }
      default:
        return {}
    }
  }

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 脸部 */}
        <ellipse cx="50" cy="50" rx="45" ry="45" fill="#FDBCB4" stroke="#E8A598" strokeWidth="2" />
        {/* 眼睛 */}
        <circle cx="35" cy="35" r="5" fill="#333" />
        <circle cx="65" cy="35" r="5" fill="#333" />
        {/* 嘴巴动画 */}
        <motion.ellipse
          cx="50"
          cy="65"
          rx="15"
          ry="10"
          fill="#FF6B6B"
          stroke="#D64545"
          strokeWidth="2"
          animate={getAnimation()}
          transition={{ duration: 0.3, repeat: isPlaying ? Infinity : 0 }}
        />
        {/* 舌头示意（针对舌尖音） */}
        {(shape.type === 'apical' || shape.type === 'retroflex') && (
          <motion.path
            d="M 45 70 Q 50 75 55 70"
            fill="none"
            stroke="#FF9999"
            strokeWidth="3"
            strokeLinecap="round"
            animate={isPlaying ? { y: [0, -3, 0] } : {}}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}
      </svg>
      <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 text-xs font-bold shadow">
        {shape.label}
      </div>
    </div>
  )
}

// ==================== 声母精灵收集系统 ====================
const SpriteCollection = ({ 
  collectedInitials, 
  onClose 
}: { 
  collectedInitials: string[] 
  onClose: () => void 
}) => {
  const [sprites, setSprites] = useState<SpriteState[]>([])

  useEffect(() => {
    const newSprites = collectedInitials.map((initialId, index) => ({
      id: `sprite-${initialId}`,
      initialId,
      x: Math.random() * 70 + 15,
      y: Math.random() * 50 + 25,
      evolution: Math.floor(Math.random() * 3) + 1,
      happiness: Math.random() * 50 + 50,
    }))
    setSprites(newSprites)
  }, [collectedInitials])

  const getInitialData = (id: string) => INITIALS_DATA.find(i => i.id === id)

  const handleFeed = (spriteId: string) => {
    setSprites(prev => prev.map(s => 
      s.id === spriteId 
        ? { ...s, happiness: Math.min(100, s.happiness + 10), evolution: Math.min(3, s.evolution + (s.happiness > 90 ? 1 : 0)) }
        : s
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-b from-green-400 to-emerald-600 z-50 overflow-hidden"
    >
      {/* 背景装饰 - 山峰 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`mountain-${i}`}
            className="absolute bottom-0"
            style={{
              left: `${i * 25 - 10}%`,
              width: 0,
              height: 0,
              borderLeft: '150px solid transparent',
              borderRight: '150px solid transparent',
              borderBottom: `${Math.random() * 200 + 150}px solid rgba(255,255,255,0.1)`,
            }}
          />
        ))}
        {/* 云朵 */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute bg-white/30 rounded-full"
            style={{
              width: Math.random() * 100 + 80,
              height: Math.random() * 40 + 40,
              top: `${Math.random() * 30 + 5}%`,
              left: `${Math.random() * 80 + 10}%`,
            }}
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, delay: i * 2 }}
          />
        ))}
      </div>

      {/* 头部 */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <button onClick={onClose} className="btn-kid-secondary">
          ← 返回
        </button>
        <h1 className="text-2xl font-bold text-white">🏔️ 声母精灵家园</h1>
        <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2 text-white">
          {collectedInitials.length}/23
        </div>
      </div>

      {/* 精灵区域 */}
      <div className="relative z-10 h-[calc(100vh-200px)] mx-4">
        <AnimatePresence>
          {sprites.map((sprite) => {
            const initialData = getInitialData(sprite.initialId)
            if (!initialData) return null
            return (
              <motion.div
                key={sprite.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${sprite.x}%`,
                  top: `${sprite.y}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{ scale: 1.2 }}
              >
                <div className="relative">
                  {/* 精灵 */}
                  <motion.div
                    className="text-6xl filter drop-shadow-lg"
                    animate={{ scale: sprite.evolution * 0.3 + 0.7 }}
                  >
                    {initialData.icon}
                  </motion.div>
                  {/* 等级标识 */}
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {sprite.evolution}
                  </div>
                  {/* 开心度条 */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-300 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-pink-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${sprite.happiness}%` }}
                    />
                  </div>
                  {/* 名字 */}
                  <div
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full text-white text-sm font-bold whitespace-nowrap"
                    style={{ backgroundColor: initialData.color }}
                  >
                    {initialData.symbol}
                  </div>
                  {/* 喂食按钮 */}
                  <motion.button
                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs px-2 py-1 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFeed(sprite.id)
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    🍎 喂食
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* 空状态 */}
        {collectedInitials.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/70">
              <span className="text-6xl">🏔️</span>
              <p className="mt-4 text-xl">还没有收集到声母精灵</p>
              <p>快去学习中收集吧！</p>
            </div>
          </div>
        )}
      </div>

      {/* 收集展示栏 */}
      <div className="relative z-10 absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-2xl p-4 max-h-32 overflow-y-auto">
        <div className="flex flex-wrap justify-center gap-2">
          {INITIALS_DATA.map((initial) => (
            <motion.div
              key={initial.id}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
                collectedInitials.includes(initial.id)
                  ? 'shadow-lg'
                  : 'bg-gray-200 text-gray-400'
              }`}
              style={{
                backgroundColor: collectedInitials.includes(initial.id) ? initial.color : undefined,
                color: collectedInitials.includes(initial.id) ? 'white' : undefined,
              }}
              whileHover={collectedInitials.includes(initial.id) ? { scale: 1.1 } : {}}
            >
              {collectedInitials.includes(initial.id) ? initial.symbol : '?'}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 易混淆对比组件 ====================
const ConfusingComparison = ({ onBack }: { onBack: () => void }) => {
  const [selectedPair, setSelectedPair] = useState(CONFUSING_PAIRS[0])
  const [testMode, setTestMode] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)
    
    const isCorrect = answer === selectedPair.testWords[currentQuestion].correct
    if (isCorrect) setScore(prev => prev + 1)

    setTimeout(() => {
      if (currentQuestion < selectedPair.testWords.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        // 测试完成
        setTimeout(() => {
          setTestMode(false)
          setCurrentQuestion(0)
          setScore(0)
          setShowResult(false)
          setSelectedAnswer(null)
        }, 2000)
      }
    }, 1500)
  }

  const getInitialData = (id: string) => INITIALS_DATA.find(i => i.id === id)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn-kid-secondary">← 返回</button>
        <h2 className="text-2xl font-bold">🔍 易混淆声母对比</h2>
        <div className="w-24" />
      </div>

      {!testMode ? (
        <>
          {/* 对比对选择 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {CONFUSING_PAIRS.map((pair) => (
              <motion.button
                key={pair.id}
                onClick={() => setSelectedPair(pair)}
                className={`p-4 rounded-2xl text-center transition-all ${
                  selectedPair.id === pair.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white hover:bg-blue-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl font-bold">{pair.title}</span>
              </motion.button>
            ))}
          </div>

          {/* 对比详情 */}
          <motion.div
            key={selectedPair.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-xl"
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {selectedPair.initials.map((initialId) => {
                const data = getInitialData(initialId)
                if (!data) return null
                return (
                  <div key={initialId} className="text-center">
                    <motion.div
                      className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
                      style={{ backgroundColor: data.color }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {data.icon}
                    </motion.div>
                    <div
                      className="text-6xl font-bold mb-2"
                      style={{ color: data.color }}
                    >
                      {data.symbol}
                    </div>
                    <p className="text-xl text-gray-600">{data.pronunciation}</p>
                    <p className="text-sm text-gray-500 mt-2">{data.mouthShape}</p>
                  </div>
                )
              })}
            </div>

            {/* 区别说明 */}
            <div className="bg-yellow-50 rounded-2xl p-4 mb-6">
              <h4 className="font-bold text-yellow-800 mb-2">💡 关键区别</h4>
              <p className="text-yellow-700">{selectedPair.difference}</p>
            </div>

            {/* 测试词语 */}
            <div className="mb-6">
              <h4 className="font-bold mb-3">📝 对比练习</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedPair.testWords.map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-gray-50 rounded-xl p-3 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      const utterance = new SpeechSynthesisUtterance(item.word)
                      utterance.lang = 'zh-CN'
                      speechSynthesis.speak(utterance)
                    }}
                  >
                    <p className="text-2xl font-bold">{item.word}</p>
                    <p className="text-sm text-gray-500">{item.pinyin}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 开始测试按钮 */}
            <button
              onClick={() => setTestMode(true)}
              className="btn-kid-primary w-full"
            >
              🎯 开始测试
            </button>
          </motion.div>
        </>
      ) : (
        /* 测试模式 */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-3xl p-8 shadow-xl"
        >
          {/* 进度 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>问题 {currentQuestion + 1}/{selectedPair.testWords.length}</span>
              <span>得分: {score}</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / selectedPair.testWords.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 问题 */}
          <div className="text-center mb-8">
            <p className="text-gray-500 mb-4">选择正确的声母</p>
            <motion.div
              key={currentQuestion}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-8xl font-bold text-gray-800 mb-4"
            >
              {selectedPair.testWords[currentQuestion].word}
            </motion.div>
            <p className="text-2xl text-gray-400">
              _{selectedPair.testWords[currentQuestion].pinyin.slice(1)}
            </p>
          </div>

          {/* 选项 */}
          <div className="grid grid-cols-2 gap-4">
            {selectedPair.initials.map((initialId) => {
              const data = getInitialData(initialId)
              if (!data) return null
              const isCorrect = initialId === selectedPair.testWords[currentQuestion].correct
              const isSelected = selectedAnswer === initialId
              
              return (
                <motion.button
                  key={initialId}
                  onClick={() => !showResult && handleAnswer(initialId)}
                  disabled={showResult}
                  className={`p-6 rounded-2xl text-4xl font-bold transition-all ${
                    showResult
                      ? isCorrect
                        ? 'bg-green-500 text-white'
                        : isSelected
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                      : 'bg-gray-100 hover:bg-blue-100'
                  }`}
                  style={{
                    color: showResult ? undefined : data.color,
                  }}
                  whileHover={!showResult ? { scale: 1.05 } : {}}
                  whileTap={!showResult ? { scale: 0.95 } : {}}
                >
                  {data.symbol}
                </motion.button>
              )
            })}
          </div>

          {/* 反馈 */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 text-center p-4 rounded-xl ${
                  selectedAnswer === selectedPair.testWords[currentQuestion].correct
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {selectedAnswer === selectedPair.testWords[currentQuestion].correct ? (
                  <span className="text-2xl">🎉 回答正确！</span>
                ) : (
                  <span className="text-2xl">😅 正确答案是 {selectedPair.testWords[currentQuestion].correct}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

// ==================== 测试组件 ====================
const InitialTest = ({ 
  initial, 
  onComplete 
}: { 
  initial: Phoneme
  onComplete: (score: number) => void 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const questions = [
    {
      type: 'pronunciation',
      question: `"${initial.symbol}" 的发音是什么？`,
      options: INITIALS_DATA.slice(0, 6).map(i => ({ label: i.pronunciation, value: i.id })),
      correct: initial.id,
    },
    {
      type: 'example',
      question: `下面哪个词语以 "${initial.symbol}" 开头？`,
      options: [
        { label: initial.examples[0].match(/([\u4e00-\u9fa5]+)/)?.[0] || '', value: initial.id },
        ...INITIALS_DATA.filter(i => i.id !== initial.id).slice(0, 3).map(i => ({
          label: i.examples[0].match(/([\u4e00-\u9fa5]+)/)?.[0] || '',
          value: i.id,
        }))
      ].sort(() => Math.random() - 0.5),
      correct: initial.id,
    },
    {
      type: 'mouth',
      question: `发 "${initial.symbol}" 音时，发音部位是？`,
      options: [
        { label: '双唇', value: 'b' },
        { label: '舌尖', value: 'd' },
        { label: '舌根', value: 'g' },
        { label: initial.mouthShape.slice(0, 4), value: initial.id },
      ],
      correct: initial.id,
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
            className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl"
            style={{ backgroundColor: initial.color }}
          >
            {initial.icon}
          </div>
          <div
            className="text-6xl font-bold mb-4"
            style={{ color: initial.color }}
          >
            {initial.symbol}
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
export default function InitialPeak({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<LearningStage>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState<Record<string, InitialProgress>>({})
  const [showCollection, setShowCollection] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  const currentInitial = INITIALS_DATA[currentIndex]

  // 从 localStorage 加载进度
  useEffect(() => {
    const saved = localStorage.getItem('initial-peak-progress')
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
    localStorage.setItem('initial-peak-progress', JSON.stringify(progress))
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
      [currentInitial.id]: {
        ...prev[currentInitial.id],
        id: currentInitial.id,
        collected: true,
        practiceCount: (prev[currentInitial.id]?.practiceCount || 0) + 1,
      }
    }))
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 2000)
  }

  const handleTestComplete = (score: number) => {
    setProgress(prev => ({
      ...prev,
      [currentInitial.id]: {
        ...prev[currentInitial.id],
        id: currentInitial.id,
        testScore: Math.max(prev[currentInitial.id]?.testScore || 0, score),
        mastered: score >= 80,
      }
    }))
    setStage('intro')
  }

  const collectedInitials = Object.values(progress).filter(p => p.collected).map(p => p.id)
  const masteredInitials = Object.values(progress).filter(p => p.mastered).map(p => p.id)

  // ==================== 介绍阶段 ====================
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-emerald-100 p-4">
        {/* 头部 */}
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => onBack()}
            className="btn-kid-secondary"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🏔️ 声母峰</h1>
          <button
            onClick={() => setShowCollection(true)}
            className="bg-white rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <span className="text-green-600 font-bold">🦋 {collectedInitials.length}/23</span>
          </button>
        </header>

        {/* 进度概览 */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">学习进度</h2>
              <div className="flex gap-4">
                <span className="text-green-600 font-medium">
                  已掌握: {masteredInitials.length}/23
                </span>
                <button
                  onClick={() => setStage('compare')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  🔍 易混淆对比
                </button>
              </div>
            </div>
            
            {/* 声母网格 */}
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
              {INITIALS_DATA.map((initial, index) => {
                const p = progress[initial.id]
                return (
                  <motion.button
                    key={initial.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${
                      currentIndex === index
                        ? 'ring-4 ring-green-400'
                        : ''
                    } ${
                      p?.mastered
                        ? 'bg-green-400 text-white'
                        : p?.collected
                        ? 'bg-blue-400 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg font-bold">{initial.symbol}</span>
                    {p?.mastered && <span className="text-xs">⭐</span>}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* 当前声母卡片 */}
          <motion.div
            key={currentInitial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* 左侧：声母信息 */}
              <div className="text-center">
                <motion.div
                  className="text-9xl mb-4 inline-block"
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {currentInitial.icon}
                </motion.div>
                
                <motion.div
                  className="text-9xl font-bold mb-4"
                  style={{ color: currentInitial.color }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentInitial.symbol}
                </motion.div>

                <p className="text-2xl text-gray-600 mb-2">{currentInitial.pronunciation}</p>
                <p className="text-sm text-gray-500">{currentInitial.mouthShape}</p>
              </div>

              {/* 右侧：功能按钮 */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <motion.button
                    onClick={() => {
                      setIsPlaying(true)
                      speak(currentInitial.pronunciation)
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

                  {progress[currentInitial.id]?.collected && (
                    <>
                      <motion.button
                        onClick={() => setStage('practice')}
                        className="btn-kid-success"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        👄 口型练习
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

                  {!progress[currentInitial.id]?.collected && (
                    <motion.button
                      onClick={handleCollect}
                      className="btn-kid-success"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🦋 收集精灵
                    </motion.button>
                  )}
                </div>

                {/* 示例词语 */}
                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-bold mb-4">示例词语</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentInitial.examples.slice(0, 4).map((example, index) => (
                      <motion.span
                        key={index}
                        className="px-3 py-2 rounded-xl text-base font-medium cursor-pointer"
                        style={{ 
                          backgroundColor: `${currentInitial.color}20`,
                          color: currentInitial.color 
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
                  {['⭐', '🎉', '🎊', '✨', currentInitial.icon][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 精灵收集弹窗 */}
        <AnimatePresence>
          {showCollection && (
            <SpriteCollection 
              collectedInitials={collectedInitials} 
              onClose={() => setShowCollection(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ==================== 学习阶段 ====================
  if (stage === 'learn') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-emerald-100 p-4">
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => setStage('intro')} className="btn-kid-secondary">
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">📚 学习：{currentInitial.symbol}</h1>
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
                  style={{ color: currentInitial.color }}
                  animate={{ scale: isPlaying ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                >
                  {currentInitial.symbol}
                </motion.div>
                <p className="text-2xl text-gray-600 mb-4">{currentInitial.pronunciation}</p>
                <button
                  onClick={() => {
                    setIsPlaying(true)
                    speak(currentInitial.pronunciation)
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
              <MouthShapeAnimation initial={currentInitial} isPlaying={isPlaying} />
              <p className="text-center text-gray-600 mt-4">{currentInitial.mouthShape}</p>
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
              {currentInitial.examples.map((example, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-4 text-center cursor-pointer hover:bg-green-50 transition-colors"
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
              继续：口型练习 →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ==================== 口型练习阶段 ====================
  if (stage === 'practice') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 to-emerald-100 p-4">
        <header className="flex items-center justify-between mb-6">
          <button onClick={() => setStage('learn')} className="btn-kid-secondary">
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">👄 口型练习：{currentInitial.symbol}</h1>
          <div className="w-20" />
        </header>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-xl text-center"
          >
            <div className="mb-8">
              <MouthShapeAnimation initial={currentInitial} isPlaying={isPlaying} />
            </div>

            <div
              className="text-9xl font-bold mb-6"
              style={{ color: currentInitial.color }}
            >
              {currentInitial.symbol}
            </div>

            <p className="text-xl text-gray-600 mb-8">{currentInitial.mouthShape}</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setIsPlaying(true)
                  speak(currentInitial.pronunciation)
                  setTimeout(() => setIsPlaying(false), 1500)
                }}
                className="btn-kid-accent"
              >
                🔊 跟我读
              </button>
              <button
                onClick={() => setStage('intro')}
                className="btn-kid-success"
              >
                ✅ 完成练习
              </button>
            </div>

            {/* 练习提示 */}
            <div className="mt-8 bg-yellow-50 rounded-2xl p-4">
              <p className="text-yellow-800">
                💡 小贴士：对着镜子练习，观察自己的口型是否与动画一致
              </p>
            </div>
          </motion.div>
        </div>
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
          <h1 className="text-2xl font-bold text-gray-800">🎯 测试：{currentInitial.symbol}</h1>
          <div className="w-20" />
        </header>

        <InitialTest
          initial={currentInitial}
          onComplete={handleTestComplete}
        />
      </div>
    )
  }

  // ==================== 易混淆对比阶段 ====================
  if (stage === 'compare') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-indigo-100 p-4">
        <ConfusingComparison onBack={() => setStage('intro')} />
      </div>
    )
  }

  return null
}
