export interface Hero {
  id: string
  name: string
  class: 'wizard' | 'rogue' | 'paladin' | 'barbarian'
  description: string
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  abilities: Ability[]
  position: Position
  isAlive: boolean
}

export interface Ability {
  id: string
  name: string
  description: string
  manaCost: number
  cooldown: number
  currentCooldown: number
  damage?: number
  healing?: number
  range: number
  icon: string
}

export interface Position {
  x: number
  y: number
}

export interface GameState {
  phase: 'menu' | 'hero-selection' | 'battle' | 'results'
  selectedHero: Hero | null
  enemies: Hero[]
  allies: Hero[]
  battleTimer: number
  score: {
    player: number
    enemy: number
  }
}

export interface Player {
  id: string
  name: string
  hero: Hero | null
  team: 'blue' | 'red'
  isReady: boolean
}