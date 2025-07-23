import React, { useState, useEffect } from 'react'
import { ArrowLeft, Zap, Shield, Sword, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { Hero, Enemy, GameState } from '../types/game'

interface BattleArenaProps {
  selectedHero: Hero
  onBack: () => void
  onBattleEnd: (result: 'victory' | 'defeat', stats: any) => void
}

export default function EnhancedBattleArena({ selectedHero, onBack, onBattleEnd }: BattleArenaProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentHp: selectedHero.stats.hp,
    currentMana: selectedHero.stats.mana,
    abilityCooldowns: {},
    turnCount: 0
  })

  const [enemies, setEnemies] = useState<Enemy[]>([
    { id: 1, name: 'Goblin Warrior', hp: 80, maxHp: 80, damage: 15, position: { x: 70, y: 30 } },
    { id: 2, name: 'Orc Berserker', hp: 120, maxHp: 120, damage: 25, position: { x: 80, y: 60 } },
    { id: 3, name: 'Dark Mage', hp: 90, maxHp: 90, damage: 30, position: { x: 75, y: 80 } }
  ])

  const [selectedTarget, setSelectedTarget] = useState<number | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>(['Battle begins!'])
  const [animations, setAnimations] = useState<{[key: string]: boolean}>({})
  const [damageNumbers, setDamageNumbers] = useState<{id: string, damage: number, x: number, y: number}[]>([])

  // Mana regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        currentMana: Math.min(prev.currentMana + 2, selectedHero.stats.mana)
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [selectedHero.stats.mana])

  // Cooldown reduction
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        abilityCooldowns: Object.fromEntries(
          Object.entries(prev.abilityCooldowns).map(([key, value]) => [key, Math.max(0, value - 1)])
        )
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const showDamageNumber = (damage: number, x: number, y: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    setDamageNumbers(prev => [...prev, { id, damage, x, y }])
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id))
    }, 1500)
  }

  const triggerAnimation = (animationType: string) => {
    setAnimations(prev => ({ ...prev, [animationType]: true }))
    setTimeout(() => {
      setAnimations(prev => ({ ...prev, [animationType]: false }))
    }, 600)
  }

  const executeAbility = (abilityIndex: number) => {
    const ability = selectedHero.abilities[abilityIndex]
    const cooldownKey = `ability_${abilityIndex}`
    
    if (gameState.abilityCooldowns[cooldownKey] > 0) return
    if (gameState.currentMana < ability.manaCost) return
    if (!selectedTarget && ability.damage > 0) return

    triggerAnimation(`ability_${abilityIndex}`)
    
    setGameState(prev => ({
      ...prev,
      currentMana: prev.currentMana - ability.manaCost,
      abilityCooldowns: { ...prev.abilityCooldowns, [cooldownKey]: ability.cooldown }
    }))

    if (ability.damage > 0 && selectedTarget) {
      const target = enemies.find(e => e.id === selectedTarget)
      if (target) {
        const damage = ability.damage + Math.floor(Math.random() * 10)
        showDamageNumber(damage, target.position.x, target.position.y)
        
        setEnemies(prev => prev.map(enemy => 
          enemy.id === selectedTarget 
            ? { ...enemy, hp: Math.max(0, enemy.hp - damage) }
            : enemy
        ))
        setBattleLog(prev => [...prev, `${selectedHero.name} uses ${ability.name} for ${damage} damage!`])
      }
    }

    if (ability.healing > 0) {
      setGameState(prev => ({
        ...prev,
        currentHp: Math.min(prev.currentHp + ability.healing, selectedHero.stats.hp)
      }))
      setBattleLog(prev => [...prev, `${selectedHero.name} heals for ${ability.healing} HP!`])
    }

    // Enemy turn
    setTimeout(() => {
      const aliveEnemies = enemies.filter(e => e.hp > 0)
      if (aliveEnemies.length > 0) {
        const attacker = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]
        const damage = attacker.damage + Math.floor(Math.random() * 5)
        
        triggerAnimation('player_damage')
        showDamageNumber(damage, 20, 50)
        
        setGameState(prev => ({
          ...prev,
          currentHp: Math.max(0, prev.currentHp - damage),
          turnCount: prev.turnCount + 1
        }))
        setBattleLog(prev => [...prev, `${attacker.name} attacks for ${damage} damage!`])
      }
    }, 1000)
  }

  // Check win/lose conditions
  useEffect(() => {
    if (gameState.currentHp <= 0) {
      onBattleEnd('defeat', { turns: gameState.turnCount, enemiesDefeated: 3 - enemies.filter(e => e.hp > 0).length })
    } else if (enemies.every(e => e.hp <= 0)) {
      onBattleEnd('victory', { turns: gameState.turnCount, enemiesDefeated: 3 })
    }
  }, [gameState.currentHp, enemies, gameState.turnCount, onBattleEnd])

  const getAbilityIcon = (index: number) => {
    const icons = [Zap, Shield, Sword, Sparkles]
    const Icon = icons[index] || Zap
    return <Icon className="w-6 h-6" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-amber-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Damage Numbers */}
      {damageNumbers.map(damage => (
        <div
          key={damage.id}
          className="absolute text-2xl font-bold text-red-400 animate-bounce pointer-events-none z-50"
          style={{ 
            left: `${damage.x}%`, 
            top: `${damage.y}%`,
            animation: 'damageFloat 1.5s ease-out forwards'
          }}
        >
          -{damage.damage}
        </div>
      ))}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-black/30 backdrop-blur-sm">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold font-cinzel text-amber-400">Battle Arena</h1>
        <div className="text-sm text-gray-300">Turn {gameState.turnCount}</div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-88px)]">
        {/* Battle Arena */}
        <div className="flex-1 relative p-6">
          <div className="relative w-full h-full bg-gradient-to-br from-amber-900/20 to-red-900/20 rounded-xl border-2 border-amber-600/30 overflow-hidden">
            {/* Arena Floor Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #fbbf24 2px, transparent 2px),
                                 radial-gradient(circle at 75% 75%, #fbbf24 2px, transparent 2px)`,
                backgroundSize: '50px 50px'
              }}></div>
            </div>

            {/* Player Character */}
            <div 
              className={`absolute w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full border-4 border-blue-300 shadow-lg transition-all duration-300 ${
                animations.player_damage ? 'animate-pulse bg-red-500' : ''
              } ${animations.ability_0 || animations.ability_1 || animations.ability_2 || animations.ability_3 ? 'scale-110 shadow-2xl shadow-blue-500/50' : ''}`}
              style={{ left: '10%', top: '40%' }}
            >
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                {selectedHero.name[0]}
              </div>
              {/* Player Glow Effect */}
              <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></div>
            </div>

            {/* Enemies */}
            {enemies.map((enemy, index) => (
              <div
                key={enemy.id}
                className={`absolute w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-full border-3 border-red-400 cursor-pointer transition-all duration-300 hover:scale-110 ${
                  selectedTarget === enemy.id ? 'ring-4 ring-yellow-400 scale-110' : ''
                } ${enemy.hp <= 0 ? 'opacity-30 grayscale' : ''}`}
                style={{ left: `${enemy.position.x}%`, top: `${enemy.position.y}%` }}
                onClick={() => enemy.hp > 0 && setSelectedTarget(enemy.id)}
              >
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                  {enemy.name[0]}
                </div>
                {/* Enemy Health Bar */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-16">
                  <div className="bg-black/50 rounded-full h-1">
                    <div 
                      className="bg-red-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                    ></div>
                  </div>
                </div>
                {/* Enemy Glow Effect */}
                {enemy.hp > 0 && (
                  <div className="absolute inset-0 rounded-full bg-red-400/20 animate-pulse"></div>
                )}
              </div>
            ))}

            {/* Spell Effects */}
            {animations.ability_0 && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/30 rounded-full animate-ping"></div>
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
              </div>
            )}
          </div>
        </div>

        {/* UI Panel */}
        <div className="w-full lg:w-96 p-6 space-y-4">
          {/* Hero Status */}
          <Card className="p-4 bg-black/40 border-amber-600/30 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                {selectedHero.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-amber-400 font-cinzel">{selectedHero.name}</h3>
                <p className="text-sm text-gray-300">{selectedHero.class}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-400">Health</span>
                  <span>{gameState.currentHp}/{selectedHero.stats.hp}</span>
                </div>
                <Progress value={(gameState.currentHp / selectedHero.stats.hp) * 100} className="h-2 bg-red-900/50" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-400">Mana</span>
                  <span>{gameState.currentMana}/{selectedHero.stats.mana}</span>
                </div>
                <Progress value={(gameState.currentMana / selectedHero.stats.mana) * 100} className="h-2 bg-blue-900/50" />
              </div>
            </div>
          </Card>

          {/* Abilities */}
          <Card className="p-4 bg-black/40 border-amber-600/30 backdrop-blur-sm">
            <h3 className="font-bold text-amber-400 mb-3 font-cinzel">Abilities</h3>
            <div className="grid grid-cols-2 gap-2">
              {selectedHero.abilities.map((ability, index) => {
                const cooldownKey = `ability_${index}`
                const isOnCooldown = gameState.abilityCooldowns[cooldownKey] > 0
                const canAfford = gameState.currentMana >= ability.manaCost
                const isDisabled = isOnCooldown || !canAfford

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={`h-16 flex flex-col items-center justify-center text-xs relative overflow-hidden transition-all duration-300 ${
                      isDisabled 
                        ? 'opacity-50 cursor-not-allowed bg-gray-800/50' 
                        : 'hover:bg-amber-600/20 hover:border-amber-400 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25'
                    } ${animations[`ability_${index}`] ? 'bg-amber-500/30 scale-110' : ''}`}
                    onClick={() => !isDisabled && executeAbility(index)}
                    disabled={isDisabled}
                  >
                    {/* Ability Icon */}
                    <div className="mb-1 text-amber-400">
                      {getAbilityIcon(index)}
                    </div>
                    
                    {/* Ability Name */}
                    <span className="font-medium text-white">{ability.name}</span>
                    
                    {/* Mana Cost */}
                    <span className="text-blue-400 text-xs">{ability.manaCost} MP</span>
                    
                    {/* Cooldown Overlay */}
                    {isOnCooldown && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-white font-bold">{gameState.abilityCooldowns[cooldownKey]}</span>
                      </div>
                    )}
                    
                    {/* Glow Effect for Available Abilities */}
                    {!isDisabled && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/20 to-amber-500/0 animate-pulse"></div>
                    )}
                  </Button>
                )
              })}
            </div>
          </Card>

          {/* Target Info */}
          {selectedTarget && (
            <Card className="p-4 bg-black/40 border-red-600/30 backdrop-blur-sm">
              <h3 className="font-bold text-red-400 mb-2 font-cinzel">Target</h3>
              {(() => {
                const target = enemies.find(e => e.id === selectedTarget)
                return target ? (
                  <div>
                    <p className="text-white font-medium">{target.name}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-red-400">Health</span>
                        <span>{target.hp}/{target.maxHp}</span>
                      </div>
                      <Progress value={(target.hp / target.maxHp) * 100} className="h-2 bg-red-900/50" />
                    </div>
                  </div>
                ) : null
              })()}
            </Card>
          )}

          {/* Battle Log */}
          <Card className="p-4 bg-black/40 border-gray-600/30 backdrop-blur-sm">
            <h3 className="font-bold text-gray-300 mb-2 font-cinzel">Battle Log</h3>
            <div className="h-24 overflow-y-auto text-sm space-y-1">
              {battleLog.slice(-4).map((log, index) => (
                <p key={index} className="text-gray-300">{log}</p>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes damageFloat {
          0% { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}