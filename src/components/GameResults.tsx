import React from 'react'
import { Trophy, Target, Clock, RotateCcw, Home, Star, Crown } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Hero } from '../types/game'

interface GameResultsProps {
  result: 'victory' | 'defeat'
  stats: {
    turns: number
    enemiesDefeated: number
  }
  selectedHero: Hero | null
  onPlayAgain: () => void
  onMainMenu: () => void
}

export default function GameResults({ result, stats, selectedHero, onPlayAgain, onMainMenu }: GameResultsProps) {
  const isVictory = result === 'victory'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute top-10 left-10 w-64 h-64 ${isVictory ? 'bg-green-500' : 'bg-red-500'} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute top-40 right-20 w-48 h-48 ${isVictory ? 'bg-yellow-500' : 'bg-gray-500'} rounded-full blur-2xl animate-bounce`}></div>
        <div className={`absolute bottom-20 left-1/3 w-56 h-56 ${isVictory ? 'bg-blue-500' : 'bg-purple-500'} rounded-full blur-3xl animate-pulse delay-1000`}></div>
      </div>

      {/* Floating Particles */}
      {isVictory && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: '2s'
              }}
            ></div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-2xl mx-auto p-6">
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isVictory 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-500/50' 
              : 'bg-gradient-to-br from-red-500 to-red-700 shadow-2xl shadow-red-500/50'
          } animate-pulse`}>
            {isVictory ? (
              <Trophy className="w-12 h-12 text-white" />
            ) : (
              <Target className="w-12 h-12 text-white" />
            )}
          </div>

          <h1 className={`text-6xl font-bold font-cinzel mb-4 ${
            isVictory ? 'text-green-400' : 'text-red-400'
          }`}>
            {isVictory ? 'VICTORY!' : 'DEFEAT'}
          </h1>

          <p className="text-xl text-gray-300">
            {isVictory 
              ? 'You have proven yourself in the arena!' 
              : 'The battle was fierce, but victory eluded you.'}
          </p>
        </div>

        {/* Hero Summary */}
        {selectedHero && (
          <Card className="p-6 mb-6 bg-black/40 border-amber-600/30 backdrop-blur-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {selectedHero.name[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-amber-400 font-cinzel">{selectedHero.name}</h3>
                <Badge variant="outline" className="text-amber-300 border-amber-400/50">
                  {selectedHero.class}
                </Badge>
              </div>
            </div>
            <p className="text-gray-300">{selectedHero.description}</p>
          </Card>
        )}

        {/* Battle Statistics */}
        <Card className="p-6 mb-8 bg-black/40 border-amber-600/30 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-amber-400 mb-4 font-cinzel flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Battle Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Turns Taken</span>
              </div>
              <span className="text-white font-bold">{stats.turns}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-400" />
                <span className="text-gray-300">Enemies Defeated</span>
              </div>
              <span className="text-white font-bold">{stats.enemiesDefeated}/3</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Performance</span>
              </div>
              <span className={`font-bold ${
                stats.enemiesDefeated === 3 ? 'text-green-400' : 
                stats.enemiesDefeated >= 2 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {stats.enemiesDefeated === 3 ? 'Excellent' : 
                 stats.enemiesDefeated >= 2 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Rank</span>
              </div>
              <span className="text-purple-400 font-bold">
                {isVictory ? 'Champion' : 'Warrior'}
              </span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onPlayAgain}
            className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Battle Again
          </Button>

          <Button
            onClick={onMainMenu}
            variant="outline"
            className="flex-1 h-14 text-lg font-bold border-amber-400/50 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400 transition-all duration-300 transform hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Main Menu
          </Button>
        </div>

        {/* Motivational Message */}
        <div className="text-center mt-8 p-4 bg-black/20 rounded-lg border border-gray-600/30">
          <p className="text-gray-300 italic">
            {isVictory 
              ? "\"Victory belongs to the most persevering.\" - Continue your legend!"
              : "\"Every defeat is a lesson in disguise.\" - Rise stronger, champion!"}
          </p>
        </div>
      </div>
    </div>
  )
}