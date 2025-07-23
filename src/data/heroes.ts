import { Hero } from '../types/game'

export const heroes: Hero[] = [
  {
    id: 'wizard',
    name: 'Arcane Wizard',
    class: 'Wizard',
    description: 'Master of elemental magic with devastating ranged attacks and mystical powers.',
    stats: {
      hp: 80,
      mana: 120,
      attack: 85,
      defense: 40
    },
    abilities: [
      {
        name: 'Fireball',
        description: 'Launch a blazing fireball that deals massive fire damage to enemies.',
        manaCost: 30,
        cooldown: 4,
        damage: 45,
        healing: 0
      },
      {
        name: 'Frost Bolt',
        description: 'Freeze and slow enemies with piercing ice magic.',
        manaCost: 25,
        cooldown: 3,
        damage: 35,
        healing: 0
      },
      {
        name: 'Teleport',
        description: 'Instantly teleport to a nearby location, avoiding danger.',
        manaCost: 40,
        cooldown: 8,
        damage: 0,
        healing: 0
      },
      {
        name: 'Mana Shield',
        description: 'Create a magical barrier that absorbs incoming damage.',
        manaCost: 35,
        cooldown: 12,
        damage: 0,
        healing: 0
      }
    ]
  },
  {
    id: 'rogue',
    name: 'Shadow Rogue',
    class: 'Rogue',
    description: 'Swift assassin with stealth abilities and deadly precision strikes.',
    stats: {
      hp: 100,
      mana: 80,
      attack: 95,
      defense: 50
    },
    abilities: [
      {
        name: 'Backstab',
        description: 'Deal massive critical damage from behind enemies.',
        manaCost: 20,
        cooldown: 3,
        damage: 60,
        healing: 0
      },
      {
        name: 'Stealth',
        description: 'Become invisible for a short duration, avoiding attacks.',
        manaCost: 30,
        cooldown: 12,
        damage: 0,
        healing: 0
      },
      {
        name: 'Poison Dart',
        description: 'Throw a poisoned dart that deals damage over time.',
        manaCost: 15,
        cooldown: 2,
        damage: 25,
        healing: 0
      },
      {
        name: 'Shadow Step',
        description: 'Quickly dash behind the nearest enemy for a surprise attack.',
        manaCost: 25,
        cooldown: 6,
        damage: 30,
        healing: 0
      }
    ]
  },
  {
    id: 'paladin',
    name: 'Holy Paladin',
    class: 'Paladin',
    description: 'Righteous warrior with divine healing and protective abilities.',
    stats: {
      hp: 140,
      mana: 100,
      attack: 70,
      defense: 80
    },
    abilities: [
      {
        name: 'Holy Strike',
        description: 'Strike with divine power, dealing holy damage to evil foes.',
        manaCost: 25,
        cooldown: 4,
        damage: 40,
        healing: 0
      },
      {
        name: 'Divine Heal',
        description: 'Channel divine energy to restore health instantly.',
        manaCost: 35,
        cooldown: 5,
        damage: 0,
        healing: 50
      },
      {
        name: 'Divine Shield',
        description: 'Create a protective barrier that blocks incoming damage.',
        manaCost: 40,
        cooldown: 10,
        damage: 0,
        healing: 0
      },
      {
        name: 'Consecration',
        description: 'Consecrate the ground, dealing damage to all nearby enemies.',
        manaCost: 45,
        cooldown: 8,
        damage: 35,
        healing: 0
      }
    ]
  },
  {
    id: 'barbarian',
    name: 'Fierce Barbarian',
    class: 'Barbarian',
    description: 'Brutal warrior with devastating melee attacks and berserker rage.',
    stats: {
      hp: 160,
      mana: 60,
      attack: 100,
      defense: 60
    },
    abilities: [
      {
        name: 'Berserker Rage',
        description: 'Enter a rage state, increasing damage and attack speed.',
        manaCost: 30,
        cooldown: 15,
        damage: 0,
        healing: 0
      },
      {
        name: 'Charge',
        description: 'Rush forward and slam into enemies with tremendous force.',
        manaCost: 20,
        cooldown: 6,
        damage: 50,
        healing: 0
      },
      {
        name: 'Whirlwind',
        description: 'Spin attack hitting all nearby enemies with your weapon.',
        manaCost: 25,
        cooldown: 4,
        damage: 35,
        healing: 0
      },
      {
        name: 'Battle Cry',
        description: 'Let out a mighty roar that intimidates enemies and heals yourself.',
        manaCost: 15,
        cooldown: 8,
        damage: 15,
        healing: 25
      }
    ]
  }
]