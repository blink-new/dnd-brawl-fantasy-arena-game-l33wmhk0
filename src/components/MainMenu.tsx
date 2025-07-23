import { Button } from './ui/button'
import { Card } from './ui/card'
import { Sword, Users, Trophy, Settings } from 'lucide-react'

interface MainMenuProps {
  onStartGame: () => void
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-8xl font-fantasy text-accent mb-4 drop-shadow-lg">
            D&D Brawl
          </h1>
          <p className="text-2xl text-muted-foreground font-medium">
            Fantasy Arena Combat
          </p>
          <div className="flex justify-center mt-6 space-x-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-300"></div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="hero-card p-8 cursor-pointer group" onClick={onStartGame}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-accent/30 transition-colors">
                <Sword className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-fantasy text-foreground">Quick Battle</h3>
              <p className="text-muted-foreground">
                Jump into a fast-paced 3v3 arena match
              </p>
            </div>
          </Card>

          <Card className="hero-card p-8 cursor-pointer group opacity-75">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/30 transition-colors">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-fantasy text-foreground">Multiplayer</h3>
              <p className="text-muted-foreground">
                Team up with friends online
              </p>
              <div className="text-xs text-accent">Coming Soon</div>
            </div>
          </Card>

          <Card className="hero-card p-8 cursor-pointer group opacity-75">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-accent/30 transition-colors">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-fantasy text-foreground">Leaderboard</h3>
              <p className="text-muted-foreground">
                View top warriors and rankings
              </p>
              <div className="text-xs text-accent">Coming Soon</div>
            </div>
          </Card>

          <Card className="hero-card p-8 cursor-pointer group opacity-75">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/30 transition-colors">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-fantasy text-foreground">Settings</h3>
              <p className="text-muted-foreground">
                Customize your game experience
              </p>
              <div className="text-xs text-accent">Coming Soon</div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>Choose your hero, master your abilities, dominate the arena</p>
        </div>
      </div>
    </div>
  )
}