import React, { useState, useEffect } from 'react'
import { Play, Users, Trophy, Settings, Sword, Shield, Zap, Crown } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface MainMenuProps {
  onQuickBattle: () => void
}

export default function EnhancedMainMenu({ onQuickBattle }: MainMenuProps) {
  const [floatingElements, setFloatingElements] = useState<Array<{id: number, x: number, y: number, delay: number}>>([])

  useEffect(() => {
    // Generate floating magical elements
    const elements = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }))
    setFloatingElements(elements)
  }, [])

  const menuItems = [
    {
      title: 'Quick Battle',
      description: 'Jump into a fast-paced 3v3 arena match',
      icon: <Play className="w-8 h-8" />,
      action: onQuickBattle,
      gradient: 'from-green-600 to-emerald-600',
      available: true
    },
    {
      title: 'Multiplayer',
      description: 'Battle against players worldwide',
      icon: <Users className="w-8 h-8" />,
      action: () => {},
      gradient: 'from-blue-600 to-cyan-600',
      available: false
    },
    {
      title: 'Tournament',
      description: 'Compete in ranked tournaments',
      icon: <Trophy className="w-8 h-8" />,
      action: () => {},
      gradient: 'from-yellow-600 to-orange-600',
      available: false
    },
    {
      title: 'Settings',
      description: 'Customize your game experience',
      icon: <Settings className="w-8 h-8" />,
      action: () => {},
      gradient: 'from-gray-600 to-slate-600',
      available: false
    }
  ]

  const heroClasses = [
    { name: 'Wizard', icon: <Zap className="w-6 h-6" />, color: 'text-blue-400' },
    { name: 'Paladin', icon: <Shield className="w-6 h-6" />, color: 'text-yellow-400' },
    { name: 'Rogue', icon: <Sword className="w-6 h-6" />, color: 'text-green-400' },
    { name: 'Barbarian', icon: <Crown className="w-6 h-6" />, color: 'text-red-400' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Large Background Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-green-500/20 rounded-full blur-2xl animate-bounce delay-500"></div>
        
        {/* Floating Magical Elements */}
        {floatingElements.map((element) => (
          <div
            key={element.id}
            className="absolute w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-60"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              animationDelay: `${element.delay}s`,
              animationDuration: '3s'
            }}
          ></div>
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Title Section */}
        <div className="text-center mb-12 relative">
          {/* Title Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent blur-xl"></div>
          
          <h1 className="text-6xl md:text-8xl font-bold font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 mb-4 relative animate-pulse">
            D&D BRAWL
          </h1>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            {heroClasses.map((heroClass, index) => (
              <div
                key={heroClass.name}
                className={`${heroClass.color} transform hover:scale-110 transition-transform duration-300`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {heroClass.icon}
              </div>
            ))}
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 font-medium">
            Fantasy Arena Combat
          </p>
          <p className="text-lg text-gray-400 mt-2">
            Choose your champion • Master your abilities • Dominate the arena
          </p>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {menuItems.map((item, index) => (
            <Card
              key={item.title}
              className={`relative p-8 cursor-pointer transition-all duration-500 transform hover:scale-105 hover:-rotate-1 overflow-hidden group ${
                item.available 
                  ? 'bg-black/40 border-amber-600/30 hover:border-amber-400/70 hover:bg-black/60' 
                  : 'bg-black/20 border-gray-600/20 opacity-60 cursor-not-allowed'
              } backdrop-blur-sm`}
              onClick={item.available ? item.action : undefined}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-10 ${item.available ? 'group-hover:opacity-20' : ''} transition-opacity duration-300`}></div>
              
              {/* Shimmer Effect */}
              {item.available && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              )}

              <div className="relative z-10 flex items-center space-x-6">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg ${item.available ? 'group-hover:shadow-2xl group-hover:scale-110' : ''} transition-all duration-300`}>
                  <div className="text-white">
                    {item.icon}
                  </div>
                  {/* Rotating Ring */}
                  {item.available && (
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-spin-slow"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold font-cinzel text-amber-400 mb-2 flex items-center">
                    {item.title}
                    {!item.available && (
                      <span className="ml-2 text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </div>

              {/* Corner Decorations */}
              {item.available && (
                <>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-100 transition-opacity duration-300"></div>
                </>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Start Button */}
        <div className="mt-12">
          <Button
            onClick={onQuickBattle}
            className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-amber-500/25 relative overflow-hidden group"
          >
            {/* Button Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0 group-hover:via-amber-400/50 transition-all duration-300"></div>
            
            <span className="relative z-10 flex items-center space-x-3">
              <Play className="w-6 h-6" />
              <span>START BATTLE</span>
              <Sword className="w-6 h-6" />
            </span>
            
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-lg border-2 border-amber-400/50 group-hover:border-amber-300 transition-colors duration-300"></div>
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>Choose from 4 unique hero classes</p>
          <p className="mt-1">Master abilities • Strategic combat • Epic victories</p>
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