"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import GameCanvas from "./game-canvas"
import PlayerSetup from "./player-setup"

export interface Player {
  name: string
  color: string
  score: number
  controls: {
    left: string
    right: string
  }
  keyCode: {
    left: number
    right: number
  }
}

export default function PongGame() {
  const [gameState, setGameState] = useState<"setup" | "playing" | "gameOver">("setup")
  const [ballSpeed, setBallSpeed] = useState(5)
  const [winner, setWinner] = useState<Player | null>(null)
  const [players, setPlayers] = useState<Player[]>([
    {
      name: "PING",
      color: "#ff2a6d", // Neon pink
      score: 0,
      controls: {
        left: "A",
        right: "D",
      },
      keyCode: {
        left: 65, // A
        right: 68, // D
      },
    },
    {
      name: "PONG",
      color: "#05d9e8", // Neon blue
      score: 0,
      controls: {
        left: "←",
        right: "→",
      },
      keyCode: {
        left: 37, // Left arrow
        right: 39, // Right arrow
      },
    },
  ])

  const startGame = () => {
    // Reset scores
    setPlayers(players.map((player) => ({ ...player, score: 0 })))
    setGameState("playing")
  }

  const handleGameOver = (winningPlayer: Player) => {
    setWinner(winningPlayer)
    setGameState("gameOver")
  }

  const updatePlayerScore = (playerIndex: number) => {
    const updatedPlayers = [...players]
    // Get the opposing player's index (0 or 1)
    const opposingPlayerIndex = playerIndex === 0 ? 1 : 0
    // Increment the opposing player's score
    updatedPlayers[opposingPlayerIndex].score += 1

    // Check if any player has reached 10 points
    if (updatedPlayers[opposingPlayerIndex].score >= 10) {
      handleGameOver(updatedPlayers[opposingPlayerIndex])
    }

    setPlayers(updatedPlayers)
  }

  const updatePlayer = (index: number, updatedPlayer: Partial<Player>) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], ...updatedPlayer }
    setPlayers(newPlayers)
  }

  return (
    <div className="w-full max-w-4xl">
      {gameState === "setup" && (
        <Card className="w-full retro-card bg-black/80 scanlines">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl text-center font-retro text-white animate-pulse-glow neon-glow">
              PING VS PONG
            </CardTitle>
            <CardDescription className="text-center font-retro text-xs leading-relaxed mt-4 text-white/80">
              Each player controls their paddle and has their own ball.
              <br />
              When your ball is lost, your opponent gets a point.
              <br />
              First to 10 points wins!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ballSpeed" className="font-retro text-xs text-white/90">
                  Ball Speed: {ballSpeed}
                </Label>
                <Slider
                  id="ballSpeed"
                  min={1}
                  max={10}
                  step={1}
                  value={[ballSpeed]}
                  onValueChange={(value) => setBallSpeed(value[0])}
                  className="mt-2"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {players.map((player, index) => (
                  <PlayerSetup
                    key={index}
                    player={player}
                    playerNumber={index + 1}
                    onChange={(updatedPlayer) => updatePlayer(index, updatedPlayer)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={startGame}
              className="w-full font-retro text-sm py-6 bg-white text-black hover:bg-white/90 transition-all duration-300 pixel-corners"
            >
              START GAME
            </Button>
          </CardFooter>
        </Card>
      )}

      {gameState === "playing" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-black/80 p-4 rounded-lg retro-card scanlines">
            {players.map((player, index) => (
              <div key={index} className="text-center px-4">
                <h3 className="font-retro text-xs mb-2 neon-glow" style={{ color: player.color }}>
                  {player.name}
                </h3>
                <p className="text-3xl font-retro animate-pulse-glow neon-glow" style={{ color: player.color }}>
                  {player.score}
                </p>
              </div>
            ))}
          </div>

          <GameCanvas players={players} ballSpeed={ballSpeed} onScore={updatePlayerScore} />

          <Button
            variant="outline"
            onClick={() => setGameState("setup")}
            className="w-full font-retro text-xs py-4 border-2 hover:bg-white/10 transition-all duration-300 pixel-corners"
          >
            BACK TO SETUP
          </Button>
        </div>
      )}

      {gameState === "gameOver" && winner && (
        <Card className="w-full text-center retro-card bg-black/80 scanlines">
          <CardHeader>
            <CardTitle className="text-3xl font-retro animate-pulse-glow neon-glow">GAME OVER</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <Trophy className="w-24 h-24 mx-auto text-yellow-400 animate-pulse-glow" />
            <div className="space-y-4">
              <h2 className="text-4xl font-retro animate-pulse-glow neon-glow" style={{ color: winner.color }}>
                {winner.name} WINS!
              </h2>
              <p className="text-xl font-retro mt-4 text-white/80">FINAL SCORE: {winner.score} POINTS</p>
            </div>

            <div className="py-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-4 text-white/60 font-retro">GAME RESULTS</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-6">
                {players.map((player, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg pixel-corners"
                    style={{
                      backgroundColor: `${player.color}20`,
                      boxShadow: `0 0 10px ${player.color}40`,
                    }}
                  >
                    <h3 className="font-retro text-xs mb-2 neon-glow" style={{ color: player.color }}>
                      {player.name}
                    </h3>
                    <p className="text-3xl font-retro neon-glow" style={{ color: player.color }}>
                      {player.score}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => setGameState("setup")}
              className="w-full font-retro text-sm py-6 bg-white text-black hover:bg-white/90 transition-all duration-300 pixel-corners"
            >
              PLAY AGAIN
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
