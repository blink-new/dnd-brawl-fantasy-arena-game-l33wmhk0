import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Hero, Enemy } from '../types/game'
import { heroes } from '../data/heroes'
import { SpellEffects } from './SpellEffects'
import { DamageNumbers } from './DamageNumbers'
import { Sword, Shield, Zap, Heart, Clock, Target } from 'lucide-react'

interface Position {
  x: number
  y: number
}

interface Character {
  id: string
  position: Position
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  isMoving: boolean
  direction: number // angle in radians
  target?: string
  lastAttack: number
  isDead: boolean
  type: 'player' | 'enemy'
  heroType?: string
  size: number
}

interface Projectile {
  id: string
  position: Position
  target: Position
  damage: number
  speed: number
  type: 'fireball' | 'arrow' | 'lightning' | 'heal'
  ownerId: string
  startTime: number
}

interface RealTimeBattleArenaProps {
  selectedHero: Hero
  onBattleEnd: (victory: boolean, stats: any) => void
}

export const RealTimeBattleArena: React.FC<RealTimeBattleArenaProps> = ({
  selectedHero,
  onBattleEnd
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'ended'>('playing')
  const [battleTime, setBattleTime] = useState(0)
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string
    x: number
    y: number
    damage: number
    type: 'damage' | 'heal' | 'critical'
    timestamp: number
  }>>([])

  // Game objects
  const [player, setPlayer] = useState<Character>({
    id: 'player',
    position: { x: 100, y: 300 },
    health: selectedHero.stats.health,
    maxHealth: selectedHero.stats.health,
    mana: selectedHero.stats.mana,
    maxMana: selectedHero.stats.mana,
    isMoving: false,
    direction: 0,
    lastAttack: 0,
    isDead: false,
    type: 'player',
    heroType: selectedHero.name,
    size: 30
  })

  const [enemies, setEnemies] = useState<Character[]>([
    {
      id: 'enemy1',
      position: { x: 600, y: 200 },
      health: 80,
      maxHealth: 80,
      mana: 50,
      maxMana: 50,
      isMoving: false,
      direction: Math.PI,
      lastAttack: 0,
      isDead: false,
      type: 'enemy',
      size: 25
    },
    {
      id: 'enemy2',
      position: { x: 650, y: 400 },
      health: 60,
      maxHealth: 60,
      mana: 30,
      maxMana: 30,
      isMoving: false,
      direction: Math.PI,
      lastAttack: 0,
      isDead: false,
      type: 'enemy',
      size: 25
    }
  ])

  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })

  // Game constants
  const ARENA_WIDTH = 800
  const ARENA_HEIGHT = 600
  const MOVE_SPEED = 2
  const ATTACK_RANGE = 150
  const PROJECTILE_SPEED = 5

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = ARENA_WIDTH
    canvas.height = ARENA_HEIGHT
  }, [])

  // Mouse handling
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }, [])

  const handleMouseClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // Check if clicking on an enemy
    const clickedEnemy = enemies.find(enemy => {
      if (enemy.isDead) return false
      const dx = enemy.position.x - clickX
      const dy = enemy.position.y - clickY
      return Math.sqrt(dx * dx + dy * dy) < enemy.size
    })

    if (clickedEnemy) {
      setSelectedTarget(clickedEnemy.id)
    } else {
      // Move player to clicked position
      setPlayer(prev => ({
        ...prev,
        target: undefined,
        isMoving: true,
        direction: Math.atan2(clickY - prev.position.y, clickX - prev.position.x)
      }))
      
      // Move towards click position
      const moveToPosition = (targetX: number, targetY: number) => {
        setPlayer(prev => {
          const dx = targetX - prev.position.x
          const dy = targetY - prev.position.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 5) {
            return { ...prev, isMoving: false }
          }
          
          const moveX = (dx / distance) * MOVE_SPEED
          const moveY = (dy / distance) * MOVE_SPEED
          
          return {
            ...prev,
            position: {
              x: prev.position.x + moveX,
              y: prev.position.y + moveY
            }
          }
        })
      }
      
      const moveInterval = setInterval(() => {
        setPlayer(current => {
          const dx = clickX - current.position.x
          const dy = clickY - current.position.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 5) {
            clearInterval(moveInterval)
            return { ...current, isMoving: false }
          }
          
          const moveX = (dx / distance) * MOVE_SPEED
          const moveY = (dy / distance) * MOVE_SPEED
          
          return {
            ...current,
            position: {
              x: current.position.x + moveX,
              y: current.position.y + moveY
            }
          }
        })
      }, 16)
    }
  }, [enemies])

  // Attack function
  const attack = useCallback((attacker: Character, target: Character) => {
    const now = Date.now()
    if (now - attacker.lastAttack < 1000) return // 1 second cooldown

    const dx = target.position.x - attacker.position.x
    const dy = target.position.y - attacker.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > ATTACK_RANGE) return

    // Create projectile
    const projectile: Projectile = {
      id: `projectile_${now}`,
      position: { ...attacker.position },
      target: { ...target.position },
      damage: 20 + Math.random() * 10,
      speed: PROJECTILE_SPEED,
      type: attacker.type === 'player' ? 'fireball' : 'arrow',
      ownerId: attacker.id,
      startTime: now
    }

    setProjectiles(prev => [...prev, projectile])

    // Update attacker's last attack time
    if (attacker.type === 'player') {
      setPlayer(prev => ({ ...prev, lastAttack: now }))
    } else {
      setEnemies(prev => prev.map(e => 
        e.id === attacker.id ? { ...e, lastAttack: now } : e
      ))
    }
  }, [])

  // Cast ability
  const castAbility = useCallback((abilityIndex: number) => {
    const ability = selectedHero.abilities[abilityIndex]
    if (!ability || player.mana < ability.manaCost) return

    const now = Date.now()
    if (now - player.lastAttack < ability.cooldown * 1000) return

    // Reduce mana
    setPlayer(prev => ({
      ...prev,
      mana: Math.max(0, prev.mana - ability.manaCost),
      lastAttack: now
    }))

    // Find target
    const target = enemies.find(e => e.id === selectedTarget && !e.isDead)
    if (!target) return

    // Create special projectile based on ability
    const projectile: Projectile = {
      id: `ability_${now}`,
      position: { ...player.position },
      target: { ...target.position },
      damage: ability.damage,
      speed: PROJECTILE_SPEED * 1.5,
      type: ability.name.toLowerCase().includes('heal') ? 'heal' : 
            ability.name.toLowerCase().includes('lightning') ? 'lightning' : 'fireball',
      ownerId: player.id,
      startTime: now
    }

    setProjectiles(prev => [...prev, projectile])
  }, [selectedHero, player.mana, player.lastAttack, selectedTarget, enemies, player.position, player.id])

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now()

      // Update projectiles
      setProjectiles(prev => {
        return prev.map(projectile => {
          const elapsed = (now - projectile.startTime) / 1000
          const totalDistance = Math.sqrt(
            Math.pow(projectile.target.x - projectile.position.x, 2) +
            Math.pow(projectile.target.y - projectile.position.y, 2)
          )
          const progress = Math.min(elapsed * projectile.speed / totalDistance, 1)

          const newX = projectile.position.x + (projectile.target.x - projectile.position.x) * progress
          const newY = projectile.position.y + (projectile.target.y - projectile.position.y) * progress

          return {
            ...projectile,
            position: { x: newX, y: newY }
          }
        }).filter(projectile => {
          const elapsed = (now - projectile.startTime) / 1000
          const totalDistance = Math.sqrt(
            Math.pow(projectile.target.x - projectile.position.x, 2) +
            Math.pow(projectile.target.y - projectile.position.y, 2)
          )
          const progress = elapsed * projectile.speed / totalDistance

          // Check if projectile reached target
          if (progress >= 1) {
            // Apply damage
            if (projectile.ownerId === 'player') {
              setEnemies(prev => prev.map(enemy => {
                const dx = enemy.position.x - projectile.target.x
                const dy = enemy.position.y - projectile.target.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                
                if (distance < 30) {
                  const newHealth = Math.max(0, enemy.health - projectile.damage)
                  
                  // Add damage number
                  setDamageNumbers(prev => [...prev, {
                    id: `damage_${now}_${Math.random()}`,
                    x: enemy.position.x,
                    y: enemy.position.y,
                    damage: projectile.damage,
                    type: projectile.damage > 25 ? 'critical' : 'damage',
                    timestamp: now
                  }])
                  
                  return {
                    ...enemy,
                    health: newHealth,
                    isDead: newHealth <= 0
                  }
                }
                return enemy
              }))
            } else {
              // Enemy attacking player
              const dx = player.position.x - projectile.target.x
              const dy = player.position.y - projectile.target.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              
              if (distance < 30) {
                setPlayer(prev => {
                  const newHealth = Math.max(0, prev.health - projectile.damage)
                  
                  // Add damage number
                  setDamageNumbers(prevDamage => [...prevDamage, {
                    id: `damage_${now}_${Math.random()}`,
                    x: prev.position.x,
                    y: prev.position.y,
                    damage: projectile.damage,
                    type: 'damage',
                    timestamp: now
                  }])
                  
                  return {
                    ...prev,
                    health: newHealth,
                    isDead: newHealth <= 0
                  }
                })
              }
            }
            return false // Remove projectile
          }
          return true // Keep projectile
        })
      })

      // AI for enemies
      setEnemies(prev => prev.map(enemy => {
        if (enemy.isDead) return enemy

        const dx = player.position.x - enemy.position.x
        const dy = player.position.y - enemy.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Move towards player if too far
        if (distance > ATTACK_RANGE) {
          const moveX = (dx / distance) * MOVE_SPEED * 0.8
          const moveY = (dy / distance) * MOVE_SPEED * 0.8
          
          return {
            ...enemy,
            position: {
              x: enemy.position.x + moveX,
              y: enemy.position.y + moveY
            },
            direction: Math.atan2(dy, dx),
            isMoving: true
          }
        } else {
          // Attack player
          if (now - enemy.lastAttack > 1500) {
            attack(enemy, player)
          }
          return { ...enemy, isMoving: false }
        }
      }))

      // Mana regeneration
      setPlayer(prev => ({
        ...prev,
        mana: Math.min(prev.maxMana, prev.mana + 0.1)
      }))

      // Clean up old damage numbers
      setDamageNumbers(prev => prev.filter(dmg => now - dmg.timestamp < 2000))

      // Check win/lose conditions
      const aliveEnemies = enemies.filter(e => !e.isDead)
      if (aliveEnemies.length === 0) {
        setGameState('ended')
        onBattleEnd(true, { battleTime, damageDealt: 100 })
        return
      }
      
      if (player.isDead) {
        setGameState('ended')
        onBattleEnd(false, { battleTime, damageDealt: 50 })
        return
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    if (gameState === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameState, enemies, player, attack, onBattleEnd, battleTime])

  // Battle timer
  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setBattleTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

  // Render function
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT)

    // Draw arena background pattern
    ctx.strokeStyle = '#2a2a4e'
    ctx.lineWidth = 1
    for (let i = 0; i < ARENA_WIDTH; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, ARENA_HEIGHT)
      ctx.stroke()
    }
    for (let i = 0; i < ARENA_HEIGHT; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(ARENA_WIDTH, i)
      ctx.stroke()
    }

    // Draw characters
    const drawCharacter = (char: Character) => {
      if (char.isDead) return

      // Character body
      ctx.fillStyle = char.type === 'player' ? '#4ade80' : '#ef4444'
      ctx.beginPath()
      ctx.arc(char.position.x, char.position.y, char.size, 0, Math.PI * 2)
      ctx.fill()

      // Direction indicator
      if (char.isMoving) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(char.position.x, char.position.y)
        ctx.lineTo(
          char.position.x + Math.cos(char.direction) * char.size,
          char.position.y + Math.sin(char.direction) * char.size
        )
        ctx.stroke()
      }

      // Health bar
      const barWidth = char.size * 2
      const barHeight = 6
      const barX = char.position.x - barWidth / 2
      const barY = char.position.y - char.size - 15

      // Background
      ctx.fillStyle = '#333'
      ctx.fillRect(barX, barY, barWidth, barHeight)

      // Health
      ctx.fillStyle = '#ef4444'
      const healthPercent = char.health / char.maxHealth
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)

      // Border
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1
      ctx.strokeRect(barX, barY, barWidth, barHeight)

      // Character label
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px Inter'
      ctx.textAlign = 'center'
      ctx.fillText(
        char.type === 'player' ? selectedHero.name : 'Enemy',
        char.position.x,
        char.position.y + char.size + 20
      )
    }

    // Draw player
    drawCharacter(player)

    // Draw enemies
    enemies.forEach(drawCharacter)

    // Draw projectiles
    projectiles.forEach(projectile => {
      ctx.fillStyle = projectile.type === 'fireball' ? '#f97316' :
                     projectile.type === 'lightning' ? '#3b82f6' :
                     projectile.type === 'heal' ? '#22c55e' : '#fbbf24'
      
      ctx.beginPath()
      ctx.arc(projectile.position.x, projectile.position.y, 8, 0, Math.PI * 2)
      ctx.fill()

      // Projectile trail
      ctx.strokeStyle = ctx.fillStyle
      ctx.lineWidth = 3
      ctx.globalAlpha = 0.5
      ctx.beginPath()
      ctx.moveTo(projectile.position.x, projectile.position.y)
      const trailLength = 20
      const angle = Math.atan2(
        projectile.target.y - projectile.position.y,
        projectile.target.x - projectile.position.x
      )
      ctx.lineTo(
        projectile.position.x - Math.cos(angle) * trailLength,
        projectile.position.y - Math.sin(angle) * trailLength
      )
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    // Draw target indicator
    if (selectedTarget) {
      const target = enemies.find(e => e.id === selectedTarget)
      if (target && !target.isDead) {
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 3
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(target.position.x, target.position.y, target.size + 10, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // Draw mouse cursor crosshair
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(mousePosition.x - 10, mousePosition.y)
    ctx.lineTo(mousePosition.x + 10, mousePosition.y)
    ctx.moveTo(mousePosition.x, mousePosition.y - 10)
    ctx.lineTo(mousePosition.x, mousePosition.y + 10)
    ctx.stroke()

  }, [player, enemies, projectiles, selectedTarget, mousePosition, selectedHero.name])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Battle HUD */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">
                  {Math.floor(battleTime / 60)}:{(battleTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-400" />
                <span className="text-white">
                  Enemies: {enemies.filter(e => !e.isDead).length}/{enemies.length}
                </span>
              </div>
            </div>
            
            {/* Player stats */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-300">{selectedHero.name}</div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white">{Math.round(player.health)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white">{Math.round(player.mana)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="border-2 border-yellow-600 rounded-lg cursor-crosshair bg-gradient-to-br from-indigo-900 to-purple-900"
            onMouseMove={handleMouseMove}
            onClick={handleMouseClick}
          />
          
          {/* Damage Numbers Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {damageNumbers.map(dmg => (
              <div
                key={dmg.id}
                className={`absolute text-lg font-bold animate-float-up ${
                  dmg.type === 'critical' ? 'text-yellow-400' :
                  dmg.type === 'heal' ? 'text-green-400' : 'text-red-400'
                }`}
                style={{
                  left: dmg.x - 20,
                  top: dmg.y - 30,
                  animation: 'float-up 2s ease-out forwards'
                }}
              >
                {dmg.type === 'critical' && '!'}
                {Math.round(dmg.damage)}
              </div>
            ))}
          </div>
        </div>

        {/* Abilities Panel */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold">Abilities</div>
            <div className="flex space-x-2">
              {selectedHero.abilities.map((ability, index) => (
                <button
                  key={index}
                  onClick={() => castAbility(index)}
                  disabled={player.mana < ability.manaCost}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    player.mana >= ability.manaCost
                      ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="text-sm">{ability.name}</div>
                  <div className="text-xs">
                    {ability.manaCost} mana
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 mt-4">
          <div className="text-center text-gray-300 text-sm">
            <strong>Controls:</strong> Click to move • Click enemies to target • Use abilities to attack • Defeat all enemies to win!
          </div>
        </div>
      </div>
    </div>
  )
}