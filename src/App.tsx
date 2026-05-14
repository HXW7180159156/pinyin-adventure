import { useState, useCallback } from 'react'
import Home from './pages/Home'
import ToneValley from './pages/ToneValley'
import FinalIsland from './pages/FinalIsland'
import CompoundFinalsIsland from './pages/CompoundFinalsIsland'
import InitialPeak from './pages/InitialPeak'
import WholeReadingForest from './pages/WholeReadingForest'
import SpellingCave from './pages/SpellingCave'
import { GameProvider } from './context/GameContext'
import './index.css'

type Page = 'home' | 'tone-valley' | 'final-island' | 'compound-finals' | 'initial-peak' | 'whole-reading' | 'spelling-cave'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('pinyin-adventure-visited')
  })

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page as Page)
  }, [])

  const handleWelcomeDone = useCallback(() => {
    setShowWelcome(false)
    localStorage.setItem('pinyin-adventure-visited', 'true')
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />
      case 'tone-valley':
        return <ToneValley onBack={() => setCurrentPage('home')} />
      case 'final-island':
        return <FinalIsland onBack={() => setCurrentPage('home')} />
      case 'compound-finals':
        return <CompoundFinalsIsland onBack={() => setCurrentPage('home')} />
      case 'initial-peak':
        return <InitialPeak onBack={() => setCurrentPage('home')} />
      case 'whole-reading':
        return <WholeReadingForest onBack={() => setCurrentPage('home')} />
      case 'spelling-cave':
        return <SpellingCave onBack={() => setCurrentPage('home')} />
      default:
        return <Home onNavigate={handleNavigate} />
    }
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
        <div className="text-center animate-float mb-8">
          <div className="text-8xl mb-4">🏝️</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            拼音奇遇岛
          </h1>
          <p className="text-xl text-gray-600">
            和拼音精灵一起冒险吧！
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 max-w-md w-full">
          {[
            { icon: '🌈', name: '声调谷', desc: '四个声调' },
            { icon: '🌊', name: '单韵母岛', desc: '六个单韵母' },
            { icon: '🐚', name: '复韵母礁', desc: '九个复韵母' },
            { icon: '🏔️', name: '声母峰', desc: '23个声母' },
            { icon: '📚', name: '整体认读', desc: '16个整体音节' },
            { icon: '🔮', name: '拼读洞', desc: '拼读练习' },
          ].map(item => (
            <div key={item.name} className="bg-white/80 rounded-2xl p-3 text-center shadow-lg">
              <div className="text-3xl mb-1">{item.icon}</div>
              <div className="text-sm font-bold text-gray-800">{item.name}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleWelcomeDone}
          className="btn-kid-primary text-xl px-10 py-5"
        >
          开始冒险 🚀
        </button>
      </div>
    )
  }

  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-50">
        {renderPage()}
      </div>
    </GameProvider>
  )
}

export default App
