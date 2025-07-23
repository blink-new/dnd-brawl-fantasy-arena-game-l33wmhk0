import React from 'react'

interface DamageNumber {
  id: string
  damage: number
  x: number
  y: number
  type: 'damage' | 'heal' | 'critical'
  timestamp: number
}

interface DamageNumbersProps {
  numbers: DamageNumber[]
  onNumberComplete: (id: string) => void
}

const getDamageColor = (type: DamageNumber['type']): string => {
  switch (type) {
    case 'damage':
      return 'text-red-400'
    case 'heal':
      return 'text-green-400'
    case 'critical':
      return 'text-yellow-300'
    default:
      return 'text-white'
  }
}

export const DamageNumbers: React.FC<DamageNumbersProps> = ({ numbers, onNumberComplete }) => {
  React.useEffect(() => {
    numbers.forEach(number => {
      const timer = setTimeout(() => {
        onNumberComplete(number.id)
      }, 2000)
      return () => clearTimeout(timer)
    })
  }, [numbers, onNumberComplete])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {numbers.map(number => (
        <div
          key={number.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 animate-float-up ${getDamageColor(number.type)} font-bold text-xl`}
          style={{ 
            left: number.x, 
            top: number.y,
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          {number.type === 'heal' ? '+' : '-'}{number.damage}
          {number.type === 'critical' && (
            <span className="text-yellow-300 ml-1 animate-pulse">!</span>
          )}
        </div>
      ))}
    </div>
  )
}