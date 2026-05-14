import { useState, useEffect } from 'react'
import { useGame } from '../../context/GameContext'

const chapterList = [
  { id: 'tone-valley', name: '声调谷', description: '学习四个声调，感受汉语的旋律美', icon: '🌈', color: 'from-pink-400 to-purple-400', bg: 'bg-pink-50' },
  { id: 'final-island', name: '单韵母岛', description: '学习六个单韵母，打好拼音基础', icon: '🌊', color: 'from-blue-400 to-cyan-400', bg: 'bg-blue-50' },
  { id: 'compound-finals', name: '复韵母礁', description: '学习九个复韵母，发音更丰富', icon: '🐚', color: 'from-cyan-400 to-teal-400', bg: 'bg-cyan-50' },
  { id: 'initial-peak', name: '声母峰', description: '挑战23个声母，成为拼音高手', icon: '🏔️', color: 'from-green-400 to-emerald-400', bg: 'bg-green-50' },
  { id: 'whole-reading', name: '整体认读', description: '学习16个整体认读音节', icon: '📚', color: 'from-lime-400 to-green-400', bg: 'bg-lime-50' },
  { id: 'spelling-cave', name: '拼读洞', description: '学会拼读，拼音大闯关', icon: '🔮', color: 'from-purple-400 to-pink-400', bg: 'bg-purple-50' },
]

export default function Home({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { state } = useGame()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const hasVisited = localStorage.getItem('pinyin-adventure-visited')
    if (!hasVisited) {
      setShowWelcome(true)
      localStorage.setItem('pinyin-adventure-visited', 'true')
    }
  }, [])

  const completedLevels = state.chapters.reduce(
    (sum, ch) => sum + ch.levels.filter(l => l.completed).length,
    0
  )
  const totalLevels = state.chapters.reduce((sum, ch) => sum + ch.levels.length, 0)

  const getChapterProgress = (chapterId: string) => {
    const ch = state.chapters.find(c => c.id === chapterId)
    if (!ch || ch.levels.length === 0) return 0
    return Math.round((ch.levels.filter(l => l.completed).length / ch.levels.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-purple-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xl shadow-md">
                🧒
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-lg leading-tight">{state.user.nickname}</h1>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">⭐ {state.user.totalStars}</span>
                  <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">🔥 {state.user.streakDays}天</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">完成关卡</div>
              <div className="text-lg font-bold text-blue-600">{completedLevels}<span className="text-gray-400 font-normal">/{totalLevels}</span></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-6 pb-8">
        {/* 每日任务横幅 */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <div className="font-bold">今日任务</div>
                <div className="text-sm opacity-90">完成3个练习关卡获得奖励</div>
              </div>
            </div>
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-bold">
              0/3
            </div>
          </div>
        </div>

        {/* 章节地图 */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>🗺️</span> 章节地图
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapterList.map((chapter) => {
              const progress = getChapterProgress(chapter.id)
              return (
                <button
                  key={chapter.id}
                  onClick={() => onNavigate(chapter.id)}
                  className="relative overflow-hidden rounded-3xl p-5 text-left shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] bg-white group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${chapter.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${chapter.color} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                      {chapter.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-800 mb-0.5">{chapter.name}</h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">{chapter.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${chapter.color} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.max(progress, 8)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-500">{progress}%</span>
                      </div>
                    </div>
                    <div className="text-gray-300 group-hover:text-gray-500 transition-colors text-xl flex-shrink-0 mt-1">
                      ›
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* 成就展示 */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>🏆</span> 成就
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {state.achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 shadow-md'
                    : 'bg-gray-100 opacity-60'
                }`}
              >
                <span className="text-2xl mb-0.5">{achievement.icon}</span>
                <span className="text-[10px] text-center text-gray-600 leading-tight px-1">{achievement.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 欢迎弹窗 */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowWelcome(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-in" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">欢迎来到拼音奇遇岛！</h2>
            <p className="text-gray-500 mb-6 text-sm">
              选择一个章节开始你的拼音冒险吧！
            </p>
            <button
              onClick={() => setShowWelcome(false)}
              className="btn-kid-primary w-full text-lg"
            >
              开始探索 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
