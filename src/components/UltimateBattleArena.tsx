import React, { useState, useEffect, useCallback } from 'react'
import { Hero, Enemy, GameState } from '../types/game'
import { SpellEffects } from './SpellEffects'
import { DamageNumbers } from './DamageNumbers'
import { Heart, Zap, Sword } from 'lucide-react'

interface SpellEffect {
  id: string
  type: 'fireball' | 'lightning' | 'heal' | 'slash' | 'rage' | 'stealth'
  x: number
  y: number
  duration: number
}

interface DamageNumber {
  id: string
  damage: number
  x: number
  y: number
  type: 'damage' | 'heal' | 'critical'
  timestamp: number
}

interface UltimateBattleArenaProps {
  hero: Hero
  onGameEnd: (result: 'victory' | 'defeat', stats: any) => void
}

function generateEnemies(): Enemy[] {
  const enemyTypes = [
    { name: 'Goblin Warrior', type: 'Melee', health: 80, maxHealth: 80 },
    { name: 'Orc Berserker', type: 'Tank', health: 120, maxHealth: 120 },
    { name: 'Dark Mage', type: 'Caster', health: 60, maxHealth: 60 },
    { name: 'Shadow Assassin', type: 'Rogue', health: 70, maxHealth: 70 }
  ]

  return enemyTypes.map(enemy => ({ ...enemy }))
}

function getHeroIcon(heroClass: string): string {
  switch (heroClass.toLowerCase()) {
    case 'wizard':
      return '🧙‍♂️'
    case 'rogue':
      return '🗡️'
    case 'paladin':
      return '🛡️'
    case 'barbarian':
      return '⚔️'
    default:
      return '⚔️'
  }
}

export const UltimateBattleArena: React.FC<UltimateBattleArenaProps> = ({ hero, onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState>({
    hero: { ...hero, health: hero.maxHealth, mana: hero.maxMana },
    enemies: generateEnemies(),
    turn: 'player',
    selectedTarget: null
  })

  const [spellEffects, setSpellEffects] = useState<SpellEffect[]>([])
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([])
  const [battleStats, setBattleStats] = useState({
    damageDealt: 0,
    damageReceived: 0,
    abilitiesUsed: 0,
    criticalHits: 0,
    battleTime: 0
  })

  const [battleStartTime] = useState(Date.now())

  const addSpellEffect = useCallback((type: SpellEffect['type'], x: number, y: number, duration: number) => {
    const effect: SpellEffect = {
      id: `effect-${Date.now()}-${Math.random()}`,
      type,
      x,
      y,
      duration
    }
    setSpellEffects(prev => [...prev, effect])
  }, [])

  const addDamageNumber = useCallback((damage: number, x: number, y: number, type: DamageNumber['type']) => {
    const number: DamageNumber = {
      id: `damage-${Date.now()}-${Math.random()}`,
      damage,
      x,
      y,
      type,
      timestamp: Date.now()
    }
    setDamageNumbers(prev => [...prev, number])
  }, [])

  const removeSpellEffect = useCallback((id: string) => {
    setSpellEffects(prev => prev.filter(effect => effect.id !== id))
  }, [])

  const removeDamageNumber = useCallback((id: string) => {
    setDamageNumbers(prev => prev.filter(number => number.id !== id))
  }, [])

  // Auto-update battle time
  useEffect(() => {
    const timer = setInterval(() => {
      setBattleStats(prev => ({
        ...prev,
        battleTime: Math.floor((Date.now() - battleStartTime) / 1000)
      }))
    }, 1000)
    return () => clearInterval(timer)
  }, [battleStartTime])

  // Check win/lose conditions
  useEffect(() => {
    if (gameState.hero.health <= 0) {
      onGameEnd('defeat', battleStats)
    } else if (gameState.enemies.every(enemy => enemy.health <= 0)) {
      onGameEnd('victory', {
        ...battleStats,
        battleTime: Math.floor((Date.now() - battleStartTime) / 1000)
      })
    }
  }, [gameState.hero.health, gameState.enemies, onGameEnd, battleStats, battleStartTime])

  // Enemy AI turn
  useEffect(() => {
    if (gameState.turn === 'enemy') {
      const timer = setTimeout(() => {
        const aliveEnemies = gameState.enemies.filter(e => e.health > 0)
        if (aliveEnemies.length > 0) {
          const damage = Math.floor(Math.random() * 15) + 10
          const isCritical = Math.random() < 0.2
          const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage

          // Add damage number
          addDamageNumber(finalDamage, 400, 300, isCritical ? 'critical' : 'damage')

          // Add spell effect
          addSpellEffect('slash', 400, 300, 1000)

          setGameState(prev => ({
            ...prev,
            hero: { ...prev.hero, health: Math.max(0, prev.hero.health - finalDamage) },
            turn: 'player'
          }))

          setBattleStats(prev => ({
            ...prev,
            damageReceived: prev.damageReceived + finalDamage,
            criticalHits: isCritical ? prev.criticalHits + 1 : prev.criticalHits
          }))
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [gameState.turn, gameState.enemies, addDamageNumber, addSpellEffect])

  // Mana regeneration
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          mana: Math.min(prev.hero.maxMana, prev.hero.mana + 2)
        }
      }))
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const attackEnemy = (enemyIndex: number) => {
    if (gameState.turn !== 'player') return

    const enemy = gameState.enemies[enemyIndex]
    if (enemy.health <= 0) return

    const damage = Math.floor(Math.random() * 20) + 15
    const isCritical = Math.random() < 0.15
    const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage

    // Add visual effects
    const enemyX = 600 + (enemyIndex % 2) * 200
    const enemyY = 200 + Math.floor(enemyIndex / 2) * 150
    
    addDamageNumber(finalDamage, enemyX, enemyY, isCritical ? 'critical' : 'damage')
    addSpellEffect('slash', enemyX, enemyY, 800)

    setGameState(prev => ({
      ...prev,
      enemies: prev.enemies.map((e, i) => 
        i === enemyIndex ? { ...e, health: Math.max(0, e.health - finalDamage) } : e
      ),
      turn: 'enemy'
    }))

    setBattleStats(prev => ({
      ...prev,
      damageDealt: prev.damageDealt + finalDamage,
      criticalHits: isCritical ? prev.criticalHits + 1 : prev.criticalHits
    }))
  }

  const castAbility = (abilityIndex: number) => {
    if (gameState.turn !== 'player') return

    const ability = gameState.hero.abilities[abilityIndex]
    if (gameState.hero.mana < ability.manaCost) return

    let effectType: SpellEffect['type'] = 'fireball'
    let targetX = 400
    let targetY = 300

    // Determine effect based on ability
    if (ability.name.toLowerCase().includes('fireball')) {
      effectType = 'fireball'
      targetX = 600
      targetY = 250
    } else if (ability.name.toLowerCase().includes('lightning') || ability.name.toLowerCase().includes('bolt')) {
      effectType = 'lightning'
      targetX = 600
      targetY = 200
    } else if (ability.name.toLowerCase().includes('heal')) {
      effectType = 'heal'
      targetX = 400
      targetY = 300
    } else if (ability.name.toLowerCase().includes('rage')) {
      effectType = 'rage'
      targetX = 400
      targetY = 300
    } else if (ability.name.toLowerCase().includes('stealth')) {
      effectType = 'stealth'
      targetX = 400
      targetY = 300
    }

    addSpellEffect(effectType, targetX, targetY, 1500)

    if (ability.name.toLowerCase().includes('heal')) {
      const healAmount = ability.damage
      addDamageNumber(healAmount, 400, 300, 'heal')
      
      setGameState(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          health: Math.min(prev.hero.maxHealth, prev.hero.health + healAmount),
          mana: prev.hero.mana - ability.manaCost
        },
        turn: 'enemy'
      }))
    } else {
      // Damage all enemies
      const damage = ability.damage
      const isCritical = Math.random() < 0.25
      const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage

      gameState.enemies.forEach((enemy, index) => {
        if (enemy.health > 0) {
          const enemyX = 600 + (index % 2) * 200
          const enemyY = 200 + Math.floor(index / 2) * 150
          addDamageNumber(finalDamage, enemyX, enemyY, isCritical ? 'critical' : 'damage')
        }
      })

      setGameState(prev => ({
        ...prev,
        enemies: prev.enemies.map(e => ({ ...e, health: Math.max(0, e.health - finalDamage) })),
        hero: { ...prev.hero, mana: prev.hero.mana - ability.manaCost },
        turn: 'enemy'
      }))

      setBattleStats(prev => ({
        ...prev,
        damageDealt: prev.damageDealt + (finalDamage * gameState.enemies.filter(e => e.health > 0).length),
        abilitiesUsed: prev.abilitiesUsed + 1,
        criticalHits: isCritical ? prev.criticalHits + 1 : prev.criticalHits
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-4 h-4 bg-blue-400 rounded-full animate-float opacity-60" />
        <div className="absolute top-32 right-20 w-3 h-3 bg-purple-400 rounded-full animate-float-delayed opacity-50" />
        <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-yellow-400 rounded-full animate-float opacity-40" />
        <div className="absolute bottom-40 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-float-delayed opacity-70" />
      </div>

      {/* Battle Stats HUD */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-amber-500/30">
        <div className="text-amber-300 text-sm space-y-1">
          <div>Time: {Math.floor(battleStats.battleTime / 60)}:{(battleStats.battleTime % 60).toString().padStart(2, '0')}</div>
          <div>Damage Dealt: {battleStats.damageDealt}</div>
          <div>Critical Hits: {battleStats.criticalHits}</div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="absolute bottom-8 left-8">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30 min-w-[300px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-2xl animate-glow">
              {getHeroIcon(gameState.hero.class)}
            </div>
            <div>
              <h3 className="text-xl font-cinzel text-amber-300">{gameState.hero.name}</h3>
              <p className="text-amber-200 text-sm">{gameState.hero.class}</p>
            </div>
          </div>

          {/* Health Bar */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">Health</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500 animate-pulse-subtle"
                style={{ width: `${(gameState.hero.health / gameState.hero.maxHealth) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-300 mt-1">{gameState.hero.health}/{gameState.hero.maxHealth}</div>
          </div>

          {/* Mana Bar */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm">Mana</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 animate-pulse-subtle"
                style={{ width: `${(gameState.hero.mana / gameState.hero.maxMana) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-300 mt-1">{gameState.hero.mana}/{gameState.hero.maxMana}</div>
          </div>

          {/* Abilities */}
          <div className="grid grid-cols-2 gap-2">
            {gameState.hero.abilities.map((ability, index) => (
              <button
                key={index}
                onClick={() => castAbility(index)}
                disabled={gameState.hero.mana < ability.manaCost || gameState.turn !== 'player'}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  gameState.hero.mana >= ability.manaCost && gameState.turn === 'player'
                    ? 'bg-amber-600/20 border-amber-500/50 hover:bg-amber-600/30 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 cursor-pointer'
                    : 'bg-gray-600/20 border-gray-500/30 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="text-amber-300 text-sm font-medium">{ability.name}</div>
                <div className="text-xs text-gray-300 mt-1">
                  {ability.damage} dmg • {ability.manaCost} mana
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => attackEnemy(0)}
            disabled={gameState.turn !== 'player'}
            className={`w-full mt-4 p-3 rounded-lg border transition-all duration-200 ${
              gameState.turn === 'player'
                ? 'bg-red-600/20 border-red-500/50 hover:bg-red-600/30 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 cursor-pointer'
                : 'bg-gray-600/20 border-gray-500/30 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sword className="w-4 h-4" />
              <span className="text-red-300 font-medium">Basic Attack</span>
            </div>
          </button>
        </div>
      </div>

      {/* Enemies Section */}
      <div className="absolute top-8 right-8">
        <div className="grid grid-cols-2 gap-4">
          {gameState.enemies.map((enemy, index) => (
            <div
              key={index}
              onClick={() => attackEnemy(index)}
              className={`bg-black/50 backdrop-blur-sm rounded-xl p-4 border transition-all duration-200 cursor-pointer min-w-[150px] ${
                enemy.health > 0
                  ? 'border-red-500/30 hover:border-red-400/50 hover:bg-red-900/20 hover:shadow-lg hover:shadow-red-500/20'
                  : 'border-gray-500/20 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                  enemy.health > 0 ? 'bg-gradient-to-br from-red-500 to-red-700 animate-glow' : 'bg-gray-600'
                }`}>
                  👹
                </div>
                <div>
                  <h4 className="text-red-300 font-medium">{enemy.name}</h4>
                  <p className="text-xs text-gray-400">{enemy.type}</p>
                </div>
              </div>

              <div className="mb-2">
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                    style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-300 mt-1">{enemy.health}/{enemy.maxHealth}</div>
              </div>

              {enemy.health <= 0 && (
                <div className="text-center text-gray-500 text-sm">💀 Defeated</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Turn Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className={`px-6 py-3 rounded-full border-2 backdrop-blur-sm transition-all duration-500 ${
          gameState.turn === 'player'
            ? 'bg-green-600/20 border-green-400 text-green-300 animate-pulse'
            : 'bg-red-600/20 border-red-400 text-red-300 animate-pulse'
        }`}>
          <div className="text-center font-cinzel">
            {gameState.turn === 'player' ? 'Your Turn' : 'Enemy Turn'}
          </div>
        </div>
      </div>

      {/* Visual Effects */}
      <SpellEffects effects={spellEffects} onEffectComplete={removeSpellEffect} />
      <DamageNumbers numbers={damageNumbers} onNumberComplete={removeDamageNumber} />
    </div>
  )
}