import React from 'react'

interface SpellEffect {
  id: string
  type: 'fireball' | 'lightning' | 'heal' | 'slash' | 'rage' | 'stealth'
  x: number
  y: number
  duration: number
}

interface SpellEffectsProps {
  effects: SpellEffect[]
  onEffectComplete: (id: string) => void
}

const getEffectAnimation = (type: SpellEffect['type']): string => {
  switch (type) {
    case 'fireball':
      return 'animate-ping'
    case 'lightning':
      return 'animate-pulse'
    case 'heal':
      return 'animate-bounce'
    case 'slash':
      return 'animate-spin'
    case 'rage':
      return 'animate-pulse'
    case 'stealth':
      return 'animate-fade'
    default:
      return 'animate-ping'
  }
}

const getEffectElement = (type: SpellEffect['type']): React.ReactNode => {
  switch (type) {
    case 'fireball':
      return (
        <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-80">
          <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-red-600 rounded-full animate-pulse" />
        </div>
      )
    case 'lightning':
      return (
        <div className="w-2 h-20 bg-gradient-to-b from-blue-300 to-purple-500 opacity-90 animate-pulse">
          <div className="w-full h-full bg-gradient-to-b from-white to-blue-400 animate-flash" />
        </div>
      )
    case 'heal':
      return (
        <div className="w-12 h-12 text-green-400 opacity-80">
          <div className="text-4xl animate-bounce">✨</div>
          <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping" />
        </div>
      )
    case 'slash':
      return (
        <div className="w-20 h-4 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-80 rotate-45">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
        </div>
      )
    case 'rage':
      return (
        <div className="w-16 h-16 text-red-500 opacity-80">
          <div className="text-6xl animate-pulse">💥</div>
          <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping" />
        </div>
      )
    case 'stealth':
      return (
        <div className="w-12 h-12 text-purple-400 opacity-60">
          <div className="text-4xl animate-fade">👤</div>
          <div className="absolute inset-0 bg-purple-400 rounded-full opacity-10 animate-pulse" />
        </div>
      )
    default:
      return null
  }
}

export const SpellEffects: React.FC<SpellEffectsProps> = ({ effects, onEffectComplete }) => {
  React.useEffect(() => {
    effects.forEach(effect => {
      const timer = setTimeout(() => {
        onEffectComplete(effect.id)
      }, effect.duration)
      return () => clearTimeout(timer)
    })
  }, [effects, onEffectComplete])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {effects.map(effect => (
        <div
          key={effect.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getEffectAnimation(effect.type)}`}
          style={{ left: effect.x, top: effect.y }}
        >
          {getEffectElement(effect.type)}
        </div>
      ))}
    </div>
  )
}