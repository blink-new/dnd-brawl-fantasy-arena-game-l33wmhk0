import React, { useState } from 'react'
import { ArrowLeft, Zap, Shield, Sword, Heart, Star, Crown } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Hero } from '../types/game'
import { heroes } from '../data/heroes'

interface HeroSelectionProps {
  onHeroSelect: (hero: Hero) => void
  onBack: () => void
}

export default function EnhancedHeroSelection({ onHeroSelect, onBack }: HeroSelectionProps) {
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null)
  const [hoveredHero, setHoveredHero] = useState<Hero | null>(null)

  const getClassIcon = (heroClass: string) => {
    switch (heroClass) {
      case 'Wizard': return <Zap className="w-8 h-8 text-blue-400" />
      case 'Paladin': return <Shield className="w-8 h-8 text-yellow-400" />
      case 'Rogue': return <Sword className="w-8 h-8 text-green-400" />
      case 'Barbarian': return <Crown className="w-8 h-8 text-red-400" />
      default: return <Star className="w-8 h-8 text-gray-400" />
    }
  }

  const getClassColor = (heroClass: string) => {
    switch (heroClass) {
      case 'Wizard': return 'from-blue-600 to-purple-600'
      case 'Paladin': return 'from-yellow-500 to-orange-500'
      case 'Rogue': return 'from-green-600 to-emerald-600'
      case 'Barbarian': return 'from-red-600 to-orange-600'
      default: return 'from-gray-600 to-gray-700'
    }
  }

  const getHeroImage = (heroClass: string) => {
    switch (heroClass) {
      case 'Wizard': return 'https://images.unsplash.com/photo-1576497587501-f71f94bef499?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwd2l6YXJkJTIwY2hhcmFjdGVyJTIwcG9ydHJhaXQlMjBtZWRpZXZhbHxlbnwwfDF8fHwxNzUzMjE2MTI5fDA&ixlib=rb-4.1.0&q=80&w=400'
      case 'Paladin': return 'https://images.unsplash.com/photo-1547809397-e2c7eea071fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwzfHxmYW50YXN5JTIwd2l6YXJkJTIwY2hhcmFjdGVyJTIwcG9ydHJhaXQlMjBtZWRpZXZhbHxlbnwwfDF8fHwxNzUzMjE2MTMwfDA&ixlib=rb-4.1.0&q=80&w=1080'
      case 'Rogue': return 'https://images.unsplash.com/photo-1743267216980-a5ffe3766818?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHwyfHxmYW50YXN5JTIwd2l6YXJkJTIwY2hhcmFjdGVyJTIwcG9ydHJhaXQlMjBtZWRpZXZhbHxlbnwwfDF8fHwxNzUzMjE2MTMwfDA&ixlib=rb-4.1.0&q=80&w=1080'
      case 'Barbarian': return 'https://images.unsplash.com/photo-1739388845149-82825b4cf86e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzI1Njd8MHwxfHNlYXJjaHw0fHxmYW50YXN5JTIwd2l6YXJkJTIwY2hhcmFjdGVyJTIwcG9ydHJhaXQlMjBtZWRpZXZhbHxlbnwwfDF8fHwxNzUzMjE2MTMwfDA&ixlib=rb-4.1.0&q=80&w=1080'
      default: return ''
    }
  }

  const getStatIcon = (stat: string) => {
    switch (stat) {
      case 'hp': return <Heart className="w-4 h-4 text-red-400" />
      case 'mana': return <Zap className="w-4 h-4 text-blue-400" />
      case 'attack': return <Sword className="w-4 h-4 text-orange-400" />
      case 'defense': return <Shield className="w-4 h-4 text-gray-400" />
      default: return <Star className="w-4 h-4" />
    }
  }

  const displayHero = hoveredHero || selectedHero || heroes[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-auto">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-purple-500 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-32 left-1/3 w-56 h-56 bg-amber-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-500 rounded-full blur-2xl animate-bounce delay-500"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-6 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold font-cinzel text-amber-400">Choose Your Champion</h1>
        <div className="w-20"></div>
      </div>

      <div className="flex flex-col xl:flex-row min-h-[calc(100vh-88px)] relative z-10">
        {/* Hero Grid - Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {heroes.map((hero) => (
              <Card
                key={hero.id}
                className={`relative p-6 cursor-pointer transition-all duration-500 transform hover:scale-105 hover:rotate-1 overflow-hidden group ${
                  selectedHero?.id === hero.id
                    ? 'ring-4 ring-amber-400 bg-gradient-to-br from-amber-900/40 to-amber-800/40 border-amber-400/50 scale-105'
                    : 'bg-black/40 border-gray-600/30 hover:border-amber-400/50 hover:bg-black/60'
                } backdrop-blur-sm`}
                onClick={() => setSelectedHero(hero)}
                onMouseEnter={() => setHoveredHero(hero)}
                onMouseLeave={() => setHoveredHero(null)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getClassColor(hero.class)} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                {/* Hero Content */}
                <div className="relative z-10 flex flex-col space-y-4">
                  {/* Hero Portrait */}
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br ${getClassColor(hero.class)} shadow-lg group-hover:shadow-2xl transition-shadow duration-300 border-2 border-white/20`}>
                        <img 
                          src={getHeroImage(hero.class)} 
                          alt={hero.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className={`hidden w-full h-full bg-gradient-to-br ${getClassColor(hero.class)} flex items-center justify-center`}>
                          {getClassIcon(hero.class)}
                        </div>
                      </div>
                      {/* Rotating Ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-spin-slow"></div>
                      {/* Magical Glow */}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getClassColor(hero.class)} opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-300`}></div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold font-cinzel text-amber-400">{hero.name}</h3>
                        <Badge variant="outline" className="text-xs border-amber-400/50 text-amber-300">
                          {hero.class}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-3 leading-relaxed">{hero.description}</p>
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2 p-2 bg-black/20 rounded-lg">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">HP:</span>
                      <span className="text-white font-bold">{hero.stats.hp}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-black/20 rounded-lg">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">MP:</span>
                      <span className="text-white font-bold">{hero.stats.mana}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-black/20 rounded-lg">
                      <Sword className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-300">ATK:</span>
                      <span className="text-white font-bold">{hero.stats.attack}</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-black/20 rounded-lg">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">DEF:</span>
                      <span className="text-white font-bold">{hero.stats.defense}</span>
                    </div>
                  </div>

                  {/* Abilities Preview */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-amber-400 font-cinzel">Signature Abilities</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {hero.abilities.slice(0, 2).map((ability, index) => (
                        <div key={index} className="p-2 bg-black/20 rounded-lg border border-gray-600/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm font-medium">{ability.name}</span>
                            <span className="text-blue-400 text-xs">{ability.manaCost} MP</span>
                          </div>
                          <p className="text-gray-300 text-xs">{ability.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selection Indicator */}
                {selectedHero?.id === hero.id && (
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                      <Star className="w-5 h-5 text-amber-900" fill="currentColor" />
                    </div>
                  </div>
                )}

                {/* Hover Particles */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-4 left-4 w-1 h-1 bg-amber-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-100"></div>
                  <div className="absolute bottom-6 left-8 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-200"></div>
                  <div className="absolute bottom-4 right-4 w-1 h-1 bg-green-400 rounded-full animate-ping delay-300"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Hero Details Panel - Sticky */}
        <div className="w-full xl:w-96 p-6 space-y-4 xl:sticky xl:top-24 xl:h-fit xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto">
          {/* Hero Preview */}
          <Card className="p-6 bg-black/40 border-amber-600/30 backdrop-blur-sm relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${getClassColor(displayHero.class)} opacity-10`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br ${getClassColor(displayHero.class)} shadow-xl border-2 border-white/20`}>
                    <img 
                      src={getHeroImage(displayHero.class)} 
                      alt={displayHero.name}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className={`hidden w-full h-full bg-gradient-to-br ${getClassColor(displayHero.class)} flex items-center justify-center`}>
                      {getClassIcon(displayHero.class)}
                    </div>
                  </div>
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getClassColor(displayHero.class)} opacity-30 blur-md animate-pulse`}></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-cinzel text-amber-400">{displayHero.name}</h2>
                  <p className="text-amber-300">{displayHero.class}</p>
                </div>
              </div>

              <p className="text-gray-300 mb-4 leading-relaxed">{displayHero.description}</p>

              {/* Detailed Stats */}
              <div className="space-y-3">
                <h3 className="font-bold text-amber-400 font-cinzel">Combat Stats</h3>
                {Object.entries(displayHero.stats).map(([stat, value]) => (
                  <div key={stat} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatIcon(stat)}
                      <span className="capitalize text-gray-300">{stat}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${
                            stat === 'hp' ? 'from-red-500 to-red-400' :
                            stat === 'mana' ? 'from-blue-500 to-blue-400' :
                            stat === 'attack' ? 'from-orange-500 to-orange-400' :
                            'from-gray-500 to-gray-400'
                          } transition-all duration-500`}
                          style={{ width: `${Math.min((value / 150) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-bold w-8 text-right">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Abilities */}
          <Card className="p-6 bg-black/40 border-amber-600/30 backdrop-blur-sm">
            <h3 className="font-bold text-amber-400 mb-4 font-cinzel">Abilities</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {displayHero.abilities.map((ability, index) => (
                <div key={index} className="p-3 bg-black/30 rounded-lg border border-gray-600/30 hover:border-amber-400/50 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{ability.name}</h4>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-blue-400">{ability.manaCost} MP</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{ability.cooldown}s CD</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{ability.description}</p>
                  {ability.damage > 0 && (
                    <div className="mt-2 text-xs text-red-400">Damage: {ability.damage}</div>
                  )}
                  {ability.healing > 0 && (
                    <div className="mt-2 text-xs text-green-400">Healing: {ability.healing}</div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Select Button */}
          <Button
            onClick={() => selectedHero && onHeroSelect(selectedHero)}
            disabled={!selectedHero}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-gray-600 disabled:to-gray-700 transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            {selectedHero ? `Enter Battle as ${selectedHero.name}` : 'Select a Hero'}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}