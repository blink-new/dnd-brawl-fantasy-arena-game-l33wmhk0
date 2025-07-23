import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { ArrowLeft, Play } from 'lucide-react'
import { HEROES } from '../data/heroes'
import { GameState, Hero } from '../types/game'

interface HeroSelectionProps {
  gameState: GameState
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void
  onBack: () => void
}

export default function HeroSelection({ gameState, setGameState, onBack }: HeroSelectionProps) {
  const selectHero = (heroData: typeof HEROES[0]) => {
    const hero: Hero = {
      ...heroData,
      position: { x: 100, y: 300 },
      isAlive: true
    }
    
    setGameState(prev => ({
      ...prev,
      selectedHero: hero
    }))
  }

  const startBattle = () => {
    if (!gameState.selectedHero) return
    
    // Create enemy heroes
    const enemyHeroes = HEROES.slice(0, 3).map((heroData, index) => ({
      ...heroData,
      position: { x: 700 + (index * 50), y: 250 + (index * 100) },
      isAlive: true,
      health: heroData.maxHealth * 0.8, // Slightly weaker enemies
      mana: heroData.maxMana * 0.8
    }))
    
    setGameState(prev => ({
      ...prev,
      phase: 'battle',
      enemies: enemyHeroes,
      allies: []
    }))
  }

  const getClassColor = (heroClass: string) => {
    switch (heroClass) {
      case 'wizard': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'rogue': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'paladin': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'barbarian': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>
        
        <h1 className="text-4xl font-fantasy text-accent">Choose Your Hero</h1>
        
        <Button 
          onClick={startBattle}
          disabled={!gameState.selectedHero}
          className="ability-button text-white font-semibold"
        >
          <Play className="w-4 h-4 mr-2" />
          Enter Battle
        </Button>
      </div>

      {/* Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {HEROES.map((hero) => (
          <Card 
            key={hero.id}
            className={`hero-card p-6 cursor-pointer transition-all duration-300 ${
              gameState.selectedHero?.id === hero.id 
                ? 'ring-2 ring-accent shadow-lg shadow-accent/25 scale-105' 
                : ''
            }`}
            onClick={() => selectHero(hero)}
          >
            {/* Hero Portrait */}
            <div className="aspect-square bg-gradient-to-br from-card to-secondary rounded-lg mb-4 flex items-center justify-center text-6xl">
              {hero.class === 'wizard' && '🧙‍♂️'}
              {hero.class === 'rogue' && '🥷'}
              {hero.class === 'paladin' && '⚔️'}
              {hero.class === 'barbarian' && '🪓'}
            </div>

            {/* Hero Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-fantasy text-foreground">{hero.name}</h3>
                <Badge className={getClassColor(hero.class)}>
                  {hero.class}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {hero.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health:</span>
                  <span className="text-red-400 font-medium">{hero.maxHealth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mana:</span>
                  <span className="text-blue-400 font-medium">{hero.maxMana}</span>
                </div>
              </div>

              {/* Abilities Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Abilities:</h4>
                <div className="flex space-x-1">
                  {hero.abilities.map((ability) => (
                    <div 
                      key={ability.id}
                      className="w-8 h-8 bg-secondary rounded border border-border flex items-center justify-center text-sm"
                      title={ability.name}
                    >
                      {ability.icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Hero Details */}
      {gameState.selectedHero && (
        <div className="mt-8 max-w-4xl mx-auto">
          <Card className="hero-card p-6">
            <h3 className="text-2xl font-fantasy text-accent mb-4">
              {gameState.selectedHero.name} - Abilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gameState.selectedHero.abilities.map((ability) => (
                <div key={ability.id} className="bg-secondary/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{ability.icon}</span>
                    <h4 className="font-semibold text-foreground">{ability.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{ability.description}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-400">Mana: {ability.manaCost}</span>
                    <span className="text-yellow-400">CD: {ability.cooldown / 1000}s</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}