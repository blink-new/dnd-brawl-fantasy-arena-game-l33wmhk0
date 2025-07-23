import { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { GameState, Hero, Position } from '../types/game'
import { ArrowLeft, Clock } from 'lucide-react'

interface BattleArenaProps {
  gameState: GameState
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void
}

export default function BattleArena({ gameState, setGameState }: BattleArenaProps) {
  const [selectedTarget, setSelectedTarget] = useState<Hero | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.battleTimer <= 1) {
          clearInterval(timer)
          return { ...prev, battleTimer: 0, phase: 'results' }
        }
        return { ...prev, battleTimer: prev.battleTimer - 1 }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [setGameState])

  // Check win conditions
  useEffect(() => {
    const aliveEnemies = gameState.enemies.filter(enemy => enemy.isAlive)
    const playerAlive = gameState.selectedHero?.isAlive

    if (!playerAlive) {
      setGameState(prev => ({ ...prev, phase: 'results' }))
    } else if (aliveEnemies.length === 0) {
      setGameState(prev => ({ 
        ...prev, 
        phase: 'results',
        score: { ...prev.score, player: prev.score.player + 1 }
      }))
    }
  }, [gameState.enemies, gameState.selectedHero, setGameState])

  const handleUseAbility = useCallback((abilityId: string) => {
    if (!gameState.selectedHero || !selectedTarget) return

    const ability = gameState.selectedHero.abilities.find(a => a.id === abilityId)
    if (!ability || ability.currentCooldown > 0 || gameState.selectedHero.mana < ability.manaCost) return

    setGameState(prev => {
      if (!prev.selectedHero) return prev

      const updatedHero = { ...prev.selectedHero }
      const updatedAbility = { ...ability, currentCooldown: ability.cooldown }
      updatedHero.abilities = updatedHero.abilities.map(a => 
        a.id === abilityId ? updatedAbility : a
      )
      updatedHero.mana = Math.max(0, updatedHero.mana - ability.manaCost)

      const updatedEnemies = [...prev.enemies]
      let logMessage = ''

      if (ability.damage && selectedTarget) {
        const targetIndex = updatedEnemies.findIndex(e => e.id === selectedTarget.id)
        if (targetIndex !== -1) {
          const damage = ability.damage + Math.floor(Math.random() * 10) - 5 // Random variance
          updatedEnemies[targetIndex] = {
            ...updatedEnemies[targetIndex],
            health: Math.max(0, updatedEnemies[targetIndex].health - damage)
          }
          
          if (updatedEnemies[targetIndex].health <= 0) {
            updatedEnemies[targetIndex].isAlive = false
            logMessage = `${updatedHero.name} defeated ${selectedTarget.name} with ${ability.name}!`
          } else {
            logMessage = `${updatedHero.name} used ${ability.name} on ${selectedTarget.name} for ${damage} damage!`
          }
        }
      } else if (ability.healing) {
        updatedHero.health = Math.min(updatedHero.maxHealth, updatedHero.health + ability.healing)
        logMessage = `${updatedHero.name} used ${ability.name} and healed for ${ability.healing}!`
      } else {
        logMessage = `${updatedHero.name} used ${ability.name}!`
      }

      setBattleLog(prev => [...prev.slice(-4), logMessage])

      return {
        ...prev,
        selectedHero: updatedHero,
        enemies: updatedEnemies
      }
    })

    setSelectedTarget(null)
  }, [gameState.selectedHero, selectedTarget, setGameState])

  // AI enemy turns
  useEffect(() => {
    const enemyTurnTimer = setInterval(() => {
      if (!gameState.selectedHero?.isAlive) return

      setGameState(prev => {
        const aliveEnemies = prev.enemies.filter(enemy => enemy.isAlive)
        if (aliveEnemies.length === 0) return prev

        const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]
        const availableAbilities = randomEnemy.abilities.filter(
          ability => ability.currentCooldown === 0 && randomEnemy.mana >= ability.manaCost
        )

        if (availableAbilities.length === 0) return prev

        const ability = availableAbilities[Math.floor(Math.random() * availableAbilities.length)]
        const damage = ability.damage ? ability.damage + Math.floor(Math.random() * 8) - 4 : 0

        let updatedHero = prev.selectedHero
        if (updatedHero && damage > 0) {
          updatedHero = {
            ...updatedHero,
            health: Math.max(0, updatedHero.health - damage)
          }
          if (updatedHero.health <= 0) {
            updatedHero.isAlive = false
          }
        }

        const updatedEnemies = prev.enemies.map(enemy => {
          if (enemy.id === randomEnemy.id) {
            return {
              ...enemy,
              mana: Math.max(0, enemy.mana - ability.manaCost),
              abilities: enemy.abilities.map(a => 
                a.id === ability.id ? { ...a, currentCooldown: ability.cooldown } : a
              )
            }
          }
          return enemy
        })

        const logMessage = damage > 0 
          ? `${randomEnemy.name} used ${ability.name} and dealt ${damage} damage!`
          : `${randomEnemy.name} used ${ability.name}!`

        setBattleLog(prev => [...prev.slice(-4), logMessage])

        return {
          ...prev,
          selectedHero: updatedHero,
          enemies: updatedEnemies
        }
      })
    }, 3000)

    return () => clearInterval(enemyTurnTimer)
  }, [gameState.selectedHero, setGameState])

  // Cooldown and mana regeneration
  useEffect(() => {
    const regenTimer = setInterval(() => {
      setGameState(prev => {
        let updatedHero = prev.selectedHero
        if (updatedHero) {
          updatedHero = {
            ...updatedHero,
            mana: Math.min(updatedHero.maxMana, updatedHero.mana + 2),
            abilities: updatedHero.abilities.map(ability => ({
              ...ability,
              currentCooldown: Math.max(0, ability.currentCooldown - 1000)
            }))
          }
        }

        const updatedEnemies = prev.enemies.map(enemy => ({
          ...enemy,
          mana: Math.min(enemy.maxMana, enemy.mana + 1),
          abilities: enemy.abilities.map(ability => ({
            ...ability,
            currentCooldown: Math.max(0, ability.currentCooldown - 1000)
          }))
        }))

        return {
          ...prev,
          selectedHero: updatedHero,
          enemies: updatedEnemies
        }
      })
    }, 1000)

    return () => clearInterval(regenTimer)
  }, [setGameState])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!gameState.selectedHero) return null

  return (
    <div className="min-h-screen p-4">
      {/* Battle Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Clock className="w-5 h-5 text-accent" />
          <span className="text-xl font-fantasy text-accent">
            {formatTime(gameState.battleTimer)}
          </span>
        </div>
        
        <h1 className="text-3xl font-fantasy text-accent">Battle Arena</h1>
        
        <div className="text-lg font-semibold">
          Score: {gameState.score.player} - {gameState.score.enemy}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {/* Battle Arena */}
        <div className="lg:col-span-3">
          <Card className="game-ui p-6 h-96 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-brown-900/20"></div>
            
            {/* Player Hero */}
            <div 
              className="absolute w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl cursor-pointer border-2 border-blue-400 shadow-lg"
              style={{ 
                left: `${gameState.selectedHero.position.x}px`, 
                top: `${gameState.selectedHero.position.y}px` 
              }}
              title={gameState.selectedHero.name}
            >
              {gameState.selectedHero.class === 'wizard' && '🧙‍♂️'}
              {gameState.selectedHero.class === 'rogue' && '🥷'}
              {gameState.selectedHero.class === 'paladin' && '⚔️'}
              {gameState.selectedHero.class === 'barbarian' && '🪓'}
            </div>

            {/* Enemy Heroes */}
            {gameState.enemies.map((enemy, index) => (
              <div
                key={enemy.id}
                className={`absolute w-16 h-16 rounded-full flex items-center justify-center text-2xl cursor-pointer border-2 shadow-lg transition-all ${
                  enemy.isAlive 
                    ? 'bg-red-500 border-red-400 hover:scale-110' 
                    : 'bg-gray-600 border-gray-500 opacity-50'
                } ${
                  selectedTarget?.id === enemy.id ? 'ring-2 ring-yellow-400' : ''
                }`}
                style={{ 
                  left: `${enemy.position.x}px`, 
                  top: `${enemy.position.y}px` 
                }}
                onClick={() => enemy.isAlive && setSelectedTarget(enemy)}
                title={enemy.name}
              >
                {enemy.class === 'wizard' && '🧙‍♂️'}
                {enemy.class === 'rogue' && '🥷'}
                {enemy.class === 'paladin' && '⚔️'}
                {enemy.class === 'barbarian' && '🪓'}
              </div>
            ))}

            {/* Battle Log */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded p-3 max-h-24 overflow-y-auto">
              {battleLog.map((log, index) => (
                <div key={index} className="text-sm text-white mb-1">
                  {log}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* UI Panel */}
        <div className="space-y-4">
          {/* Player Stats */}
          <Card className="game-ui p-4">
            <h3 className="font-fantasy text-lg text-accent mb-3">{gameState.selectedHero.name}</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Health</span>
                  <span>{gameState.selectedHero.health}/{gameState.selectedHero.maxHealth}</span>
                </div>
                <Progress 
                  value={(gameState.selectedHero.health / gameState.selectedHero.maxHealth) * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Mana</span>
                  <span>{gameState.selectedHero.mana}/{gameState.selectedHero.maxMana}</span>
                </div>
                <Progress 
                  value={(gameState.selectedHero.mana / gameState.selectedHero.maxMana) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </Card>

          {/* Abilities */}
          <Card className="game-ui p-4">
            <h3 className="font-fantasy text-lg text-accent mb-3">Abilities</h3>
            <div className="space-y-2">
              {gameState.selectedHero.abilities.map((ability) => (
                <Button
                  key={ability.id}
                  onClick={() => handleUseAbility(ability.id)}
                  disabled={
                    ability.currentCooldown > 0 || 
                    gameState.selectedHero!.mana < ability.manaCost ||
                    !selectedTarget
                  }
                  className="w-full justify-start ability-button text-white"
                  variant="outline"
                >
                  <span className="mr-2">{ability.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{ability.name}</div>
                    <div className="text-xs opacity-75">
                      {ability.currentCooldown > 0 
                        ? `${Math.ceil(ability.currentCooldown / 1000)}s` 
                        : `${ability.manaCost} mana`
                      }
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </Card>

          {/* Target Info */}
          {selectedTarget && (
            <Card className="game-ui p-4">
              <h3 className="font-fantasy text-lg text-accent mb-3">Target: {selectedTarget.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Health:</span>
                  <span className="text-red-400">{selectedTarget.health}/{selectedTarget.maxHealth}</span>
                </div>
                <Progress 
                  value={(selectedTarget.health / selectedTarget.maxHealth) * 100} 
                  className="h-2"
                />
              </div>
            </Card>
          )}

          {/* Instructions */}
          <Card className="game-ui p-4">
            <h3 className="font-fantasy text-sm text-accent mb-2">Instructions</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Click enemies to target them</p>
              <p>• Use abilities to attack</p>
              <p>• Mana regenerates over time</p>
              <p>• Defeat all enemies to win!</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}