import { Sword, Shield, Zap } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background game-canvas flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="relative">
          <h1 className="text-6xl font-fantasy text-accent mb-4">
            D&D Brawl
          </h1>
          <p className="text-xl text-muted-foreground">
            Fantasy Arena Game
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <div className="animate-bounce delay-0">
            <Sword className="w-8 h-8 text-accent" />
          </div>
          <div className="animate-bounce delay-150">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="animate-bounce delay-300">
            <Zap className="w-8 h-8 text-accent" />
          </div>
        </div>
        
        <div className="text-muted-foreground">
          Loading your adventure...
        </div>
      </div>
    </div>
  )
}