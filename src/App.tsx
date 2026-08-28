import { useState, useCallback, useEffect } from 'react'
import Home from './pages/Home'
import ToneValley from './pages/ToneValley'
import FinalIsland from './pages/FinalIsland'
import CompoundFinalsIsland from './pages/CompoundFinalsIsland'
import InitialPeak from './pages/InitialPeak'
import WholeReadingForest from './pages/WholeReadingForest'
import SpellingCave from './pages/SpellingCave'
import { GameProvider } from './context/GameContext'
import ErrorBoundary from './components/ErrorBoundary'
import { loadStoredValue, saveStoredValue } from './utils/storage'
import './index.css'

type Page = 'home' | 'tone-valley' | 'final-island' | 'compound-finals' | 'initial-peak' | 'whole-reading' | 'spelling-cave'

const pages: readonly Page[] = [
  'home',
  'tone-valley',
  'final-island',
  'compound-finals',
  'initial-peak',
  'whole-reading',
  'spelling-cave',
]

const isPage = (page: string): page is Page => pages.includes(page as Page)

const getPageFromHash = (): Page => {
  const page = window.location.hash.slice(1)
  return isPage(page) ? page : 'home'
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash)
  const [showWelcome, setShowWelcome] = useState(
    () => !loadStoredValue('pinyin-adventure-visited', false),
  )

  const handleNavigate = useCallback((page: string) => {
    if (!isPage(page)) return
    window.location.hash = page === 'home' ? '' : page
    setCurrentPage(page)
  }, [])

  const handleWelcomeDone = useCallback(() => {
    setShowWelcome(false)
    saveStoredValue('pinyin-adventure-visited', true)
  }, [])

  useEffect(() => {
    const handleHashChange = () => setCurrentPage(getPageFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />
      case 'tone-valley':
        return <ToneValley onBack={() => handleNavigate('home')} />
      case 'final-island':
        return <FinalIsland onBack={() => handleNavigate('home')} />
      case 'compound-finals':
        return <CompoundFinalsIsland onBack={() => handleNavigate('home')} />
      case 'initial-peak':
        return <InitialPeak onBack={() => handleNavigate('home')} />
      case 'whole-reading':
        return <WholeReadingForest onBack={() => handleNavigate('home')} />
      case 'spelling-cave':
        return <SpellingCave onBack={() => handleNavigate('home')} />
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
    <ErrorBoundary>
      <GameProvider>
        <div className="min-h-screen bg-gray-50">
          {renderPage()}
        </div>
      </GameProvider>
    </ErrorBoundary>
  )
}

export default App
