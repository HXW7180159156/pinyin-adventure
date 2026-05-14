import type { Phoneme, Chapter, Achievement, DailyTask } from '../types';

// 声调数据
export const tones: Phoneme[] = [
  {
    id: 'tone1',
    symbol: 'ā',
    category: 'tone',
    pronunciation: '第一声，高平调',
    mouthShape: '嘴巴自然张开，声音平稳',
    examples: ['妈(mā)', '八(bā)', '发(fā)'],
    difficulty: 1,
    color: '#FF6B6B',
    icon: '➡️',
  },
  {
    id: 'tone2',
    symbol: 'á',
    category: 'tone',
    pronunciation: '第二声，升调',
    mouthShape: '嘴巴从低到高，声音上扬',
    examples: ['麻(má)', '拔(bá)', '罚(fá)'],
    difficulty: 2,
    color: '#4ECDC4',
    icon: '↗️',
  },
  {
    id: 'tone3',
    symbol: 'ǎ',
    category: 'tone',
    pronunciation: '第三声，降升调',
    mouthShape: '嘴巴先降后升，声音拐弯',
    examples: ['马(mǎ)', '把(bǎ)', '法(fǎ)'],
    difficulty: 3,
    color: '#FFE66D',
    icon: '↘️↗️',
  },
  {
    id: 'tone4',
    symbol: 'à',
    category: 'tone',
    pronunciation: '第四声，降调',
    mouthShape: '嘴巴从高到低，声音下降',
    examples: ['骂(mà)', '爸(bà)', '发(fà)'],
    difficulty: 2,
    color: '#95E1D3',
    icon: '↘️',
  },
];

// 单韵母数据
export const singleFinals: Phoneme[] = [
  {
    id: 'a',
    symbol: 'a',
    category: 'final',
    pronunciation: '啊',
    mouthShape: '嘴巴张大，舌头放平',
    examples: ['妈(mā)', '爸(bà)', '大(dà)'],
    difficulty: 1,
    color: '#FF6B6B',
    icon: '👄',
  },
  {
    id: 'o',
    symbol: 'o',
    category: 'final',
    pronunciation: '喔',
    mouthShape: '嘴巴圆圆，嘴唇收拢',
    examples: ['波(bō)', '佛(fó)', '我(wǒ)'],
    difficulty: 1,
    color: '#4ECDC4',
    icon: '👄',
  },
  {
    id: 'e',
    symbol: 'e',
    category: 'final',
    pronunciation: '鹅',
    mouthShape: '嘴巴扁扁，嘴角向两边',
    examples: ['哥(gē)', '得(dé)', '了(le)'],
    difficulty: 1,
    color: '#FFE66D',
    icon: '👄',
  },
  {
    id: 'i',
    symbol: 'i',
    category: 'final',
    pronunciation: '衣',
    mouthShape: '嘴巴扁小，嘴角向两边',
    examples: ['一(yī)', '你(nǐ)', '四(sì)'],
    difficulty: 1,
    color: '#95E1D3',
    icon: '👄',
  },
  {
    id: 'u',
    symbol: 'u',
    category: 'final',
    pronunciation: '乌',
    mouthShape: '嘴巴圆圆，嘴唇收拢',
    examples: ['五(wǔ)', '路(lù)', '书(shū)'],
    difficulty: 1,
    color: '#F38181',
    icon: '👄',
  },
  {
    id: 'ü',
    symbol: 'ü',
    category: 'final',
    pronunciation: '鱼',
    mouthShape: '嘴巴圆圆，舌头抵下齿',
    examples: ['鱼(yú)', '女(nǚ)', '去(qù)'],
    difficulty: 2,
    color: '#AA96DA',
    icon: '👄',
  },
];

// 声母数据
export const initials: Phoneme[] = [
  { id: 'b', symbol: 'b', category: 'initial', pronunciation: '玻', mouthShape: '双唇紧闭，突然放开', examples: ['爸(bà)', '不(bù)', '白(bái)'], difficulty: 1, color: '#FF6B6B', icon: '👄' },
  { id: 'p', symbol: 'p', category: 'initial', pronunciation: '坡', mouthShape: '双唇紧闭，用力送气', examples: ['怕(pà)', '跑(pǎo)', '皮(pí)'], difficulty: 1, color: '#4ECDC4', icon: '👄' },
  { id: 'm', symbol: 'm', category: 'initial', pronunciation: '摸', mouthShape: '双唇紧闭，鼻音', examples: ['妈(mā)', '猫(māo)', '门(mén)'], difficulty: 1, color: '#FFE66D', icon: '👄' },
  { id: 'f', symbol: 'f', category: 'initial', pronunciation: '佛', mouthShape: '上齿碰下唇', examples: ['飞(fēi)', '风(fēng)', '饭(fàn)'], difficulty: 1, color: '#95E1D3', icon: '👄' },
  { id: 'd', symbol: 'd', category: 'initial', pronunciation: '得', mouthShape: '舌尖抵上牙龈', examples: ['大(dà)', '的(de)', '多(duō)'], difficulty: 1, color: '#F38181', icon: '👅' },
  { id: 't', symbol: 't', category: 'initial', pronunciation: '特', mouthShape: '舌尖抵上牙龈，送气', examples: ['他(tā)', '天(tiān)', '听(tīng)'], difficulty: 1, color: '#AA96DA', icon: '👅' },
  { id: 'n', symbol: 'n', category: 'initial', pronunciation: '讷', mouthShape: '舌尖抵上牙龈，鼻音', examples: ['你(nǐ)', '年(nián)', '牛(niú)'], difficulty: 1, color: '#FCBAD3', icon: '👅' },
  { id: 'l', symbol: 'l', category: 'initial', pronunciation: '勒', mouthShape: '舌尖抵上牙龈，边音', examples: ['了(le)', '来(lái)', '老(lǎo)'], difficulty: 1, color: '#FFFFD2', icon: '👅' },
];

// 复韵母数据
export const compoundFinals: Phoneme[] = [
  { id: 'ai', symbol: 'ai', category: 'compound', pronunciation: '爱', mouthShape: 'a滑动到i，发音连贯', examples: ['爱(ài)', '白(bái)', '来(lái)'], difficulty: 2, color: '#FF6B6B', icon: '🌊' },
  { id: 'ei', symbol: 'ei', category: 'compound', pronunciation: '诶', mouthShape: 'e滑动到i，发音连贯', examples: ['飞(fēi)', '黑(hēi)', '谁(shéi)'], difficulty: 2, color: '#4ECDC4', icon: '🌊' },
  { id: 'ui', symbol: 'ui', category: 'compound', pronunciation: '威', mouthShape: 'u滑动到i，发音连贯', examples: ['水(shuǐ)', '对(duì)', '回(huí)'], difficulty: 2, color: '#FFE66D', icon: '🌊' },
  { id: 'ao', symbol: 'ao', category: 'compound', pronunciation: '奥', mouthShape: 'a滑动到o，发音连贯', examples: ['好(hǎo)', '跑(pǎo)', '高(gāo)'], difficulty: 2, color: '#95E1D3', icon: '🌊' },
  { id: 'ou', symbol: 'ou', category: 'compound', pronunciation: '欧', mouthShape: 'o滑动到u，发音连贯', examples: ['走(zǒu)', '口(kǒu)', '楼(lóu)'], difficulty: 2, color: '#F38181', icon: '🌊' },
  { id: 'iu', symbol: 'iu', category: 'compound', pronunciation: '优', mouthShape: 'i滑动到u，发音连贯', examples: ['六(liù)', '牛(niú)', '秋(qiū)'], difficulty: 2, color: '#AA96DA', icon: '🌊' },
  { id: 'ie', symbol: 'ie', category: 'compound', pronunciation: '椰', mouthShape: 'i滑动到e，发音连贯', examples: ['写(xiě)', '别(bié)', '家(jiā)'], difficulty: 2, color: '#FCBAD3', icon: '🌊' },
  { id: 'üe', symbol: 'üe', category: 'compound', pronunciation: '月', mouthShape: 'ü滑动到e，发音连贯', examples: ['月(yuè)', '学(xué)', '雪(xuě)'], difficulty: 3, color: '#A8E6CF', icon: '🌊' },
  { id: 'er', symbol: 'er', category: 'compound', pronunciation: '耳', mouthShape: '舌头卷起，发"er"音', examples: ['二(èr)', '耳(ěr)', '儿(ér)'], difficulty: 2, color: '#FFD3B6', icon: '🌊' },
];

// 整体认读音节数据
export const wholeReadings: Phoneme[] = [
  { id: 'zhi', symbol: 'zhi', category: 'whole', pronunciation: '知', mouthShape: '舌尖翘起抵硬腭前，声带振动', examples: ['知(zhī)', '蜘(zhī)', '只(zhī)'], difficulty: 3, color: '#FF6B6B', icon: '📖' },
  { id: 'chi', symbol: 'chi', category: 'whole', pronunciation: '吃', mouthShape: '舌尖翘起抵硬腭前，用力送气', examples: ['吃(chī)', '池(chí)', '尺(chǐ)'], difficulty: 3, color: '#4ECDC4', icon: '📖' },
  { id: 'shi', symbol: 'shi', category: 'whole', pronunciation: '师', mouthShape: '舌尖翘起碰硬腭前，摩擦音', examples: ['师(shī)', '十(shí)', '是(shì)'], difficulty: 3, color: '#FFE66D', icon: '📖' },
  { id: 'ri', symbol: 'ri', category: 'whole', pronunciation: '日', mouthShape: '舌尖翘起抵硬腭前，声带振动', examples: ['日(rì)', '热(rè)', '人(rén)'], difficulty: 3, color: '#95E1D3', icon: '📖' },
  { id: 'zi', symbol: 'zi', category: 'whole', pronunciation: '资', mouthShape: '舌尖平舔上齿背，声带振动', examples: ['字(zì)', '子(zǐ)', '自(zì)'], difficulty: 3, color: '#F38181', icon: '📖' },
  { id: 'ci', symbol: 'ci', category: 'whole', pronunciation: '词', mouthShape: '舌尖平舔上齿背，用力送气', examples: ['词(cí)', '次(cì)', '从(cóng)'], difficulty: 3, color: '#AA96DA', icon: '📖' },
  { id: 'si', symbol: 'si', category: 'whole', pronunciation: '思', mouthShape: '舌尖平舔上齿背，摩擦音', examples: ['思(sī)', '四(sì)', '死(sǐ)'], difficulty: 3, color: '#FCBAD3', icon: '📖' },
  { id: 'yi', symbol: 'yi', category: 'whole', pronunciation: '衣', mouthShape: '舌面前抬高，嘴角向两边', examples: ['一(yī)', '医(yī)', '衣(yī)'], difficulty: 1, color: '#FF6B6B', icon: '📖' },
  { id: 'wu', symbol: 'wu', category: 'whole', pronunciation: '乌', mouthShape: '双唇收圆，舌头后缩', examples: ['五(wǔ)', '无(wú)', '屋(wū)'], difficulty: 1, color: '#4ECDC4', icon: '📖' },
  { id: 'yu', symbol: 'yu', category: 'whole', pronunciation: '鱼', mouthShape: '嘴巴圆圆，舌头抵下齿', examples: ['鱼(yú)', '雨(yǔ)', '月(yuè)'], difficulty: 2, color: '#FFE66D', icon: '📖' },
  { id: 'ye', symbol: 'ye', category: 'whole', pronunciation: '椰', mouthShape: '嘴巴扁扁，发ye音', examples: ['也(yě)', '夜(yè)', '叶(yè)'], difficulty: 2, color: '#95E1D3', icon: '📖' },
  { id: 'yue', symbol: 'yue', category: 'whole', pronunciation: '月', mouthShape: 'ü滑动到e，连贯发音', examples: ['月(yuè)', '约(yuē)', '乐(yuè)'], difficulty: 3, color: '#F38181', icon: '📖' },
  { id: 'yuan', symbol: 'yuan', category: 'whole', pronunciation: '元', mouthShape: 'ü滑动到a再到n', examples: ['元(yuán)', '圆(yuán)', '远(yuǎn)'], difficulty: 3, color: '#AA96DA', icon: '📖' },
  { id: 'yin', symbol: 'yin', category: 'whole', pronunciation: '音', mouthShape: '舌面前抬高，发in音', examples: ['音(yīn)', '银(yín)', '饮(yǐn)'], difficulty: 2, color: '#FCBAD3', icon: '📖' },
  { id: 'yun', symbol: 'yun', category: 'whole', pronunciation: '云', mouthShape: 'ü滑动到n，连贯发音', examples: ['云(yún)', '运(yùn)', '军(jūn)'], difficulty: 3, color: '#A8E6CF', icon: '📖' },
  { id: 'ying', symbol: 'ying', category: 'whole', pronunciation: '英', mouthShape: 'i滑动到ng，连贯发音', examples: ['英(yīng)', '应(yīng)', '影(yǐng)'], difficulty: 3, color: '#FFD3B6', icon: '📖' },
];

// 章节配置
export const chapters: Chapter[] = [
  {
    id: 'tone-valley',
    name: '声调谷',
    description: '学习四个声调，感受汉语的旋律美',
    icon: '🌈',
    color: 'from-pink-400 to-purple-400',
    unlocked: true,
    completed: false,
    progress: 0,
    levels: [
      {
        id: 'tone-train',
        chapterId: 'tone-valley',
        name: '声调小火车',
        type: 'practice',
        description: '听音选择正确的声调',
        phonemes: ['tone1', 'tone2', 'tone3', 'tone4'],
        starsRequired: 0,
        completed: false,
        starsEarned: 0,
        bestScore: 0,
      },
      {
        id: 'tone-runner',
        chapterId: 'tone-valley',
        name: '四声跑步赛',
        type: 'practice',
        description: '跟随声调做跳跃动作',
        phonemes: ['tone1', 'tone2', 'tone3', 'tone4'],
        starsRequired: 0,
        completed: false,
        starsEarned: 0,
        bestScore: 0,
      },
      {
        id: 'tone-match',
        chapterId: 'tone-valley',
        name: '声调消消乐',
        type: 'practice',
        description: '找出相同的声调配对',
        phonemes: ['tone1', 'tone2', 'tone3', 'tone4'],
        starsRequired: 0,
        completed: false,
        starsEarned: 0,
        bestScore: 0,
      },
      {
        id: 'tone-challenge',
        chapterId: 'tone-valley',
        name: '声调大挑战',
        type: 'challenge',
        description: '综合考核，成为声调小勇士',
        phonemes: ['tone1', 'tone2', 'tone3', 'tone4'],
        starsRequired: 3,
        completed: false,
        starsEarned: 0,
        bestScore: 0,
      },
    ],
  },
  {
    id: 'final-island',
    name: '单韵母岛',
    description: '学习六个单韵母，打好拼音基础',
    icon: '🌊',
    color: 'from-blue-400 to-cyan-400',
    unlocked: false,
    completed: false,
    progress: 0,
    levels: [
      {
        id: 'final-a',
        chapterId: 'final-island',
        name: 'a的冒险',
        type: 'learn',
        description: '学习韵母a',
        phonemes: ['a'],
        starsRequired: 0,
        completed: false,
        starsEarned: 0,
        bestScore: 0,
      },
      {
        id: 'final-o',
        chapterId: 'final-island',
        name: 'o的巢穴',
        type: 'learn',
        description: '学习韵母o',
        phonemes: ['o'],
        starsRequired: 0,
        completed: false,
        starsEarned: 0,
        bestScore: 0,
      },
      {
        id: 'final-e',
        chapterId: 'final-island',
        name: 'e的树林',
        type: 'learn',
        description: '学习韵母e',
        phonemes: ['e'],
        starsRequired: 0,
        completed: false,
        starsEarned: 0,
        bestScore: 0,
      },
      {
        id: 'final-collector',
        chapterId: 'final-island',
        name: '韵母收集',
        type: 'practice',
        description: '收集所有单韵母',
        phonemes: ['a', 'o', 'e', 'i', 'u', 'ü'],
        starsRequired: 0,
        completed: false,
        starsEarned: 0,
        bestScore: 0,
      },
    ],
  },
  {
    id: 'initial-peak',
    name: '声母峰',
    description: '挑战23个声母，成为拼音高手',
    icon: '🏔️',
    color: 'from-green-400 to-emerald-400',
    unlocked: false,
    completed: false,
    progress: 0,
    levels: [],
  },
  {
    id: 'spelling-cave',
    name: '拼读洞',
    description: '学会拼读，拼音大闯关',
    icon: '🔮',
    color: 'from-purple-400 to-pink-400',
    unlocked: false,
    completed: false,
    progress: 0,
    levels: [],
  },
];

// 成就配置
export const achievements: Achievement[] = [
  {
    id: 'first-step',
    name: '第一步',
    description: '完成第一个关卡',
    icon: '👣',
    unlocked: false,
    requirement: { type: 'levels', value: 1 },
  },
  {
    id: 'tone-master',
    name: '声调小勇士',
    description: '完成声调谷所有关卡',
    icon: '🌈',
    unlocked: false,
    requirement: { type: 'levels', value: 4 },
  },
  {
    id: 'star-collector',
    name: '星星收集家',
    description: '收集50颗星星',
    icon: '⭐',
    unlocked: false,
    requirement: { type: 'stars', value: 50 },
  },
  {
    id: 'study-streak',
    name: '坚持小达人',
    description: '连续学习3天',
    icon: '🔥',
    unlocked: false,
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'perfect-score',
    name: '满分小天才',
    description: '获得一次满分',
    icon: '💯',
    unlocked: false,
    requirement: { type: 'score', value: 100 },
  },
];

// 每日任务配置
export const dailyTasks: DailyTask[] = [
  {
    id: 'daily-practice',
    name: '每日练习',
    description: '完成3个练习关卡',
    completed: false,
    reward: 10,
    type: 'practice',
  },
  {
    id: 'daily-learn',
    name: '每日学习',
    description: '学习2个新拼音',
    completed: false,
    reward: 15,
    type: 'learn',
  },
  {
    id: 'daily-challenge',
    name: '每日挑战',
    description: '完成1个挑战关卡',
    completed: false,
    reward: 20,
    type: 'challenge',
  },
];

// 获取所有拼音
export const getAllPhonemes = (): Phoneme[] => {
  return [...tones, ...singleFinals, ...initials];
};

// 根据ID获取拼音
export const getPhonemeById = (id: string): Phoneme | undefined => {
  return getAllPhonemes().find(p => p.id === id);
};

// 根据类别获取拼音
export const getPhonemesByCategory = (category: Phoneme['category']): Phoneme[] => {
  return getAllPhonemes().filter(p => p.category === category);
};
