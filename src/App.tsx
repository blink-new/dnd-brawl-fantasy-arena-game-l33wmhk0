import { useState, useEffect } from 'react'
import { Hero } from './types/game'
import { blink } from './blink/client'
import EnhancedMainMenu from './components/EnhancedMainMenu'
import EnhancedHeroSelection from './components/EnhancedHeroSelection'
import PremiumBattleArena from './components/PremiumBattleArena'
import GameResults from './components/GameResults'
import LoadingScreen from './components/LoadingScreen'

type GamePhase = 'menu' | 'hero-selection' | 'battle' | 'results'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gamePhase, setGamePhase] = useState<GamePhase>('menu')
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null)
  const [battleResult, setBattleResult] = useState<{result: 'victory' | 'defeat', stats: any} | null>(null)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) return <LoadingScreen />
  if (!user) return <LoadingScreen />

  const handleQuickBattle = () => {
    setGamePhase('hero-selection')
  }

  const handleHeroSelect = (hero: Hero) => {
    setSelectedHero(hero)
    setGamePhase('battle')
  }

  const handleBattleEnd = (victory: boolean, stats: any) => {
    setBattleResult({ result: victory ? 'victory' : 'defeat', stats })
    setGamePhase('results')
  }

  const handlePlayAgain = () => {
    setSelectedHero(null)
    setBattleResult(null)
    setGamePhase('hero-selection')
  }

  const handleMainMenu = () => {
    setSelectedHero(null)
    setBattleResult(null)
    setGamePhase('menu')
  }

  const renderCurrentPhase = () => {
    switch (gamePhase) {
      case 'menu':
        return <EnhancedMainMenu onQuickBattle={handleQuickBattle} />
      
      case 'hero-selection':
        return (
          <EnhancedHeroSelection
            onHeroSelect={handleHeroSelect}
            onBack={handleMainMenu}
          />
        )
      
      case 'battle':
        return selectedHero ? (
          <PremiumBattleArena
            selectedHero={selectedHero}
            onBattleEnd={(result) => handleBattleEnd(result.victory, result.stats)}
          />
        ) : null
      
      case 'results':
        return battleResult ? (
          <GameResults
            result={battleResult.result}
            stats={battleResult.stats}
            selectedHero={selectedHero}
            onPlayAgain={handlePlayAgain}
            onMainMenu={handleMainMenu}
          />
        ) : null
      
      default:
        return <EnhancedMainMenu onQuickBattle={handleQuickBattle} />
    }
  }

  return (
    <div className="min-h-screen bg-background game-canvas">
      {renderCurrentPhase()}
    </div>
  )
}

export default App