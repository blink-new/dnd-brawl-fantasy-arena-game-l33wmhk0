import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Hero, Enemy, Projectile, DamageNumber } from '../types/game'
import { Sword, Shield, Zap, Heart } from 'lucide-react'

interface PremiumBattleArenaProps {
  selectedHero: Hero
  onBattleEnd: (result: { victory: boolean; stats: any }) => void
}

interface Character {
  id: string
  x: number
  y: number
  health: number
  maxHealth: number
  isPlayer: boolean
  type: string
  facing: number
  animationFrame: number
  lastAttack: number
  sprite?: HTMLImageElement
}

interface VisualEffect {
  id: string
  x: number
  y: number
  type: 'explosion' | 'heal' | 'lightning' | 'slash'
  frame: number
  maxFrames: number
}

export default function PremiumBattleArena({ selectedHero, onBattleEnd }: PremiumBattleArenaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  
  const [player, setPlayer] = useState<Character>({
    id: 'player',
    x: 100,
    y: 300,
    health: selectedHero.stats.health,
    maxHealth: selectedHero.stats.health,
    isPlayer: true,
    type: selectedHero.name.toLowerCase(),
    facing: 0,
    animationFrame: 0,
    lastAttack: 0
  })
  
  const [enemies, setEnemies] = useState<Character[]>([
    { id: 'enemy1', x: 600, y: 200, health: 80, maxHealth: 80, isPlayer: false, type: 'orc', facing: Math.PI, animationFrame: 0, lastAttack: 0 },
    { id: 'enemy2', x: 650, y: 350, health: 60, maxHealth: 60, isPlayer: false, type: 'goblin', facing: Math.PI, animationFrame: 0, lastAttack: 0 },
    { id: 'enemy3', x: 700, y: 250, health: 100, maxHealth: 100, isPlayer: false, type: 'skeleton', facing: Math.PI, animationFrame: 0, lastAttack: 0 }
  ])
  
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([])
  const [visualEffects, setVisualEffects] = useState<VisualEffect[]>([])
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [playerMana, setPlayerMana] = useState(selectedHero.stats.mana)
  const [battleStats, setBattleStats] = useState({
    damageDealt: 0,
    criticalHits: 0,
    spellsCast: 0,
    battleTime: 0
  })

  const drawCharacter = useCallback((ctx: CanvasRenderingContext2D, character: Character) => {
    // Character sprites and animations
    const characterSprites = {
      wizard: {
        idle: '🧙‍♂️',
        attack: '⚡',
        move: '🏃‍♂️',
        color: '#4F46E5'
      },
      rogue: {
        idle: '🥷',
        attack: '🗡️',
        move: '🏃‍♂️',
        color: '#059669'
      },
      paladin: {
        idle: '🛡️',
        attack: '⚔️',
        move: '🏃‍♂️',
        color: '#DC2626'
      },
      barbarian: {
        idle: '🪓',
        attack: '💥',
        move: '🏃‍♂️',
        color: '#EA580C'
      },
      orc: {
        idle: '👹',
        attack: '🔥',
        move: '🏃‍♂️',
        color: '#7C2D12'
      },
      goblin: {
        idle: '👺',
        attack: '🗡️',
        move: '🏃‍♂️',
        color: '#166534'
      },
      skeleton: {
        idle: '💀',
        attack: '🦴',
        move: '🏃‍♂️',
        color: '#374151'
      }
    }
    
    const sprite = characterSprites[character.type as keyof typeof characterSprites]
    if (!sprite) return

    // Character shadow
    ctx.save()
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(character.x, character.y + 25, 15, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Character body (enhanced circle with gradient)
    const gradient = ctx.createRadialGradient(character.x, character.y, 0, character.x, character.y, 20)
    gradient.addColorStop(0, sprite.color)
    gradient.addColorStop(1, sprite.color + '80')
    
    ctx.save()
    ctx.fillStyle = gradient
    ctx.strokeStyle = character.isPlayer ? '#FFD700' : '#FF4444'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(character.x, character.y, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Character sprite/emoji
    ctx.font = '24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Animation frame for movement
    const isMoving = Math.abs(character.x - targetPosition?.x || character.x) > 5 || 
                    Math.abs(character.y - targetPosition?.y || character.y) > 5
    const currentSprite = isMoving ? sprite.move : sprite.idle
    
    ctx.fillText(currentSprite, character.x, character.y - 5)

    // Health bar
    const barWidth = 40
    const barHeight = 6
    const barX = character.x - barWidth / 2
    const barY = character.y - 35

    // Health bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(barX, barY, barWidth, barHeight)

    // Health bar fill
    const healthPercent = character.health / character.maxHealth
    const healthColor = healthPercent > 0.6 ? '#22C55E' : healthPercent > 0.3 ? '#EAB308' : '#EF4444'
    ctx.fillStyle = healthColor
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight)

    // Health bar border
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    ctx.strokeRect(barX, barY, barWidth, barHeight)

    // Selection indicator
    if (selectedTarget === character.id) {
      ctx.save()
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 3
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.arc(character.x, character.y, 30, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    ctx.restore()
  }, [selectedTarget, targetPosition])

  const drawProjectile = useCallback((ctx: CanvasRenderingContext2D, projectile: Projectile) => {
    ctx.save()
    
    // Projectile trail
    const gradient = ctx.createRadialGradient(projectile.x, projectile.y, 0, projectile.x, projectile.y, 8)
    
    switch (projectile.type) {
      case 'fireball':
        gradient.addColorStop(0, '#FF6B35')
        gradient.addColorStop(1, '#FF6B3500')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(projectile.x, projectile.y, 8, 0, Math.PI * 2)
        ctx.fill()
        
        // Fire particles
        ctx.fillStyle = '#FFD700'
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('🔥', projectile.x, projectile.y)
        break
        
      case 'arrow':
        gradient.addColorStop(0, '#8B4513')
        gradient.addColorStop(1, '#8B451300')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#654321'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('➤', projectile.x, projectile.y)
        break
        
      case 'lightning':
        gradient.addColorStop(0, '#3B82F6')
        gradient.addColorStop(1, '#3B82F600')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(projectile.x, projectile.y, 10, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = '#60A5FA'
        ctx.font = '18px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('⚡', projectile.x, projectile.y)
        break
    }
    
    ctx.restore()
  }, [])

  const drawVisualEffect = useCallback((ctx: CanvasRenderingContext2D, effect: VisualEffect) => {
    const progress = effect.frame / effect.maxFrames
    const scale = 1 + progress * 0.5
    const alpha = 1 - progress
    
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.translate(effect.x, effect.y)
    ctx.scale(scale, scale)
    
    switch (effect.type) {
      case 'explosion':
        ctx.fillStyle = '#FF6B35'
        ctx.font = '32px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('💥', 0, 0)
        break
        
      case 'heal':
        ctx.fillStyle = '#22C55E'
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('✨', 0, 0)
        break
        
      case 'lightning':
        ctx.fillStyle = '#3B82F6'
        ctx.font = '28px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('⚡', 0, 0)
        break
        
      case 'slash':
        ctx.strokeStyle = '#DC2626'
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(-20, -20)
        ctx.lineTo(20, 20)
        ctx.stroke()
        break
    }
    
    ctx.restore()
  }, [])

  const drawDamageNumber = useCallback((ctx: CanvasRenderingContext2D, damage: DamageNumber) => {
    ctx.save()
    ctx.font = `bold ${damage.isCritical ? '24px' : '18px'} Arial`
    ctx.textAlign = 'center'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    ctx.fillStyle = damage.isCritical ? '#FFD700' : damage.isHealing ? '#22C55E' : '#FF4444'
    
    const text = damage.isCritical ? `${damage.value}!` : damage.value.toString()
    ctx.strokeText(text, damage.x, damage.y)
    ctx.fillText(text, damage.x, damage.y)
    ctx.restore()
  }, [])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1A1A2E')
    gradient.addColorStop(1, '#16213E')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw arena grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw characters
    drawCharacter(ctx, player)
    enemies.forEach(enemy => drawCharacter(ctx, enemy))

    // Draw projectiles
    projectiles.forEach(projectile => drawProjectile(ctx, projectile))

    // Draw visual effects
    visualEffects.forEach(effect => drawVisualEffect(ctx, effect))

    // Draw damage numbers
    damageNumbers.forEach(damage => drawDamageNumber(ctx, damage))

    // Draw target position indicator
    if (targetPosition) {
      ctx.save()
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.arc(targetPosition.x, targetPosition.y, 15, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [player, enemies, projectiles, damageNumbers, visualEffects, targetPosition, drawCharacter, drawProjectile, drawVisualEffect, drawDamageNumber])

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if clicking on an enemy
    const clickedEnemy = enemies.find(enemy => {
      const distance = Math.sqrt((x - enemy.x) ** 2 + (y - enemy.y) ** 2)
      return distance < 25
    })

    if (clickedEnemy) {
      setSelectedTarget(clickedEnemy.id)
      // Attack the enemy
      const damage = Math.floor(Math.random() * 20) + selectedHero.stats.attack
      const isCritical = Math.random() < 0.2

      setEnemies(prev => prev.map(enemy => 
        enemy.id === clickedEnemy.id 
          ? { ...enemy, health: Math.max(0, enemy.health - (isCritical ? damage * 2 : damage)) }
          : enemy
      ))

      // Add damage number
      setDamageNumbers(prev => [...prev, {
        id: Date.now().toString(),
        x: clickedEnemy.x,
        y: clickedEnemy.y - 20,
        value: isCritical ? damage * 2 : damage,
        isCritical,
        isHealing: false,
        timestamp: Date.now()
      }])

      // Add visual effect
      setVisualEffects(prev => [...prev, {
        id: Date.now().toString(),
        x: clickedEnemy.x,
        y: clickedEnemy.y,
        type: 'explosion',
        frame: 0,
        maxFrames: 20
      }])

      setBattleStats(prev => ({
        ...prev,
        damageDealt: prev.damageDealt + (isCritical ? damage * 2 : damage),
        criticalHits: prev.criticalHits + (isCritical ? 1 : 0)
      }))
    } else {
      // Move to position
      setTargetPosition({ x, y })
    }
  }, [enemies, selectedHero.stats.attack])

  const executeAbility = useCallback((abilityIndex: number) => {
    const ability = selectedHero.abilities[abilityIndex]
    if (!ability || playerMana < ability.manaCost) return

    setPlayerMana(prev => prev - ability.manaCost)
    setBattleStats(prev => ({ ...prev, spellsCast: prev.spellsCast + 1 }))

    // Create projectile or effect based on ability
    const projectileType = ability.name.toLowerCase().includes('fireball') ? 'fireball' :
                          ability.name.toLowerCase().includes('arrow') ? 'arrow' : 'lightning'

    if (selectedTarget) {
      const target = enemies.find(e => e.id === selectedTarget)
      if (target) {
        setProjectiles(prev => [...prev, {
          id: Date.now().toString(),
          x: player.x,
          y: player.y,
          targetX: target.x,
          targetY: target.y,
          speed: 8,
          damage: ability.damage,
          type: projectileType
        }])
      }
    }
  }, [selectedHero.abilities, playerMana, selectedTarget, enemies, player.x, player.y])

  // Update game state
  useEffect(() => {
    const interval = setInterval(() => {
      // Move player towards target
      if (targetPosition) {
        setPlayer(prev => {
          const dx = targetPosition.x - prev.x
          const dy = targetPosition.y - prev.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 5) {
            setTargetPosition(null)
            return prev
          }
          
          const speed = 3
          return {
            ...prev,
            x: prev.x + (dx / distance) * speed,
            y: prev.y + (dy / distance) * speed,
            facing: Math.atan2(dy, dx)
          }
        })
      }

      // Move enemies towards player
      setEnemies(prev => prev.map(enemy => {
        const dx = player.x - enemy.x
        const dy = player.y - enemy.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > 50) {
          const speed = 1.5
          return {
            ...enemy,
            x: enemy.x + (dx / distance) * speed,
            y: enemy.y + (dy / distance) * speed,
            facing: Math.atan2(dy, dx)
          }
        }
        
        // Attack player if close enough
        if (distance < 50 && Date.now() - enemy.lastAttack > 2000) {
          const damage = Math.floor(Math.random() * 15) + 10
          setPlayer(prev => ({ ...prev, health: Math.max(0, prev.health - damage) }))
          
          setDamageNumbers(prev => [...prev, {
            id: Date.now().toString(),
            x: player.x,
            y: player.y - 20,
            value: damage,
            isCritical: false,
            isHealing: false,
            timestamp: Date.now()
          }])
          
          return { ...enemy, lastAttack: Date.now() }
        }
        
        return enemy
      }))

      // Update projectiles
      setProjectiles(prev => prev.map(projectile => {
        const dx = projectile.targetX - projectile.x
        const dy = projectile.targetY - projectile.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < projectile.speed) {
          // Hit target
          const target = enemies.find(e => e.x === projectile.targetX && e.y === projectile.targetY)
          if (target) {
            setEnemies(prev => prev.map(enemy => 
              enemy.id === target.id 
                ? { ...enemy, health: Math.max(0, enemy.health - projectile.damage) }
                : enemy
            ))
            
            setDamageNumbers(prev => [...prev, {
              id: Date.now().toString(),
              x: projectile.targetX,
              y: projectile.targetY - 20,
              value: projectile.damage,
              isCritical: Math.random() < 0.3,
              isHealing: false,
              timestamp: Date.now()
            }])
          }
          
          return null
        }
        
        return {
          ...projectile,
          x: projectile.x + (dx / distance) * projectile.speed,
          y: projectile.y + (dy / distance) * projectile.speed
        }
      }).filter(Boolean) as Projectile[])

      // Update visual effects
      setVisualEffects(prev => prev.map(effect => ({
        ...effect,
        frame: effect.frame + 1
      })).filter(effect => effect.frame < effect.maxFrames))

      // Update damage numbers
      setDamageNumbers(prev => prev.map(damage => ({
        ...damage,
        y: damage.y - 1
      })).filter(damage => Date.now() - damage.timestamp < 2000))

      // Regenerate mana
      setPlayerMana(prev => Math.min(selectedHero.stats.mana, prev + 1))

      // Update battle time
      setBattleStats(prev => ({ ...prev, battleTime: prev.battleTime + 1 }))

      // Check win/lose conditions
      const aliveEnemies = enemies.filter(e => e.health > 0)
      if (aliveEnemies.length === 0) {
        onBattleEnd({ victory: true, stats: battleStats })
      } else if (player.health <= 0) {
        onBattleEnd({ victory: false, stats: battleStats })
      }
    }, 100)

    return () => clearInterval(interval)
  }, [targetPosition, player, enemies, selectedHero.stats.mana, battleStats, onBattleEnd])

  useEffect(() => {
    gameLoop()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameLoop])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Battle HUD */}
        <div className="mb-4 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
                    style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm">{player.health}/{player.maxHealth}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-500" />
                <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                    style={{ width: `${(playerMana / selectedHero.stats.mana) * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm">{playerMana}/{selectedHero.stats.mana}</span>
              </div>
            </div>
            
            <div className="text-white text-sm">
              Enemies: {enemies.filter(e => e.health > 0).length} | 
              Damage: {battleStats.damageDealt} | 
              Crits: {battleStats.criticalHits}
            </div>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            className="border-2 border-purple-500/50 rounded-lg cursor-crosshair bg-gradient-to-br from-indigo-900/50 to-purple-900/50"
          />
          
          {/* Abilities Panel */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {selectedHero.abilities.map((ability, index) => (
              <button
                key={index}
                onClick={() => executeAbility(index)}
                disabled={playerMana < ability.manaCost}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  playerMana >= ability.manaCost
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/25'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="text-sm">{ability.name}</div>
                <div className="text-xs opacity-75">{ability.manaCost} mana</div>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-gray-300 text-sm">
          Click to move • Click enemies to target • Use abilities to cast spells
        </div>
      </div>
    </div>
  )
}