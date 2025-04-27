"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Player } from "./pong-game"

interface PlayerSetupProps {
  player: Player
  playerNumber: number
  onChange: (player: Partial<Player>) => void
}

export default function PlayerSetup({ player, playerNumber, onChange }: PlayerSetupProps) {
  const [listeningFor, setListeningFor] = useState<"left" | "right" | null>(null)

  const handleKeyChange = (direction: "left" | "right") => {
    setListeningFor(direction)
  }

  useEffect(() => {
    if (!listeningFor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()

      // Get key name
      let keyName = e.key
      if (keyName === " ") keyName = "Space"
      else if (keyName === "ArrowLeft") keyName = "←"
      else if (keyName === "ArrowRight") keyName = "→"
      else if (keyName === "ArrowUp") keyName = "↑"
      else if (keyName === "ArrowDown") keyName = "↓"
      else if (keyName.length > 1) keyName = keyName
      else keyName = keyName.toUpperCase()

      onChange({
        controls: {
          ...player.controls,
          [listeningFor]: keyName,
        },
        keyCode: {
          ...player.keyCode,
          [listeningFor]: e.keyCode,
        },
      })

      setListeningFor(null)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [listeningFor, onChange, player.controls, player.keyCode])

  return (
    <div
      className="space-y-4 p-4 border-2 rounded-lg pixel-corners bg-black/40"
      style={{
        borderColor: player.color,
        boxShadow: `0 0 10px ${player.color}40`,
      }}
    >
      <h3 className="font-retro text-sm neon-glow" style={{ color: player.color }}>
        PLAYER {playerNumber}
      </h3>

      <div className="space-y-1">
        <Label htmlFor={`player${playerNumber}Name`} className="font-retro text-xs text-white/90">
          NAME
        </Label>
        <Input
          id={`player${playerNumber}Name`}
          value={player.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="mt-1 bg-black/60 border-2 font-retro text-xs h-10 pixel-corners"
          style={{ borderColor: `${player.color}60` }}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`player${playerNumber}Color`} className="font-retro text-xs text-white/90">
          PADDLE COLOR
        </Label>
        <div className="flex mt-1 gap-2">
          <Input
            id={`player${playerNumber}Color`}
            type="color"
            value={player.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="w-12 h-10 p-1 bg-black/60 border-2 pixel-corners"
            style={{ borderColor: `${player.color}60` }}
          />
          <div
            className="flex-1 rounded-md border-2 pixel-corners"
            style={{
              backgroundColor: player.color,
              borderColor: `${player.color}60`,
              boxShadow: `0 0 10px ${player.color}`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="space-y-1">
          <Label htmlFor={`player${playerNumber}Left`} className="font-retro text-xs text-white/90">
            MOVE LEFT
          </Label>
          <button
            id={`player${playerNumber}Left`}
            onClick={() => handleKeyChange("left")}
            className="w-full mt-1 px-4 py-2 border-2 rounded-md bg-black/60 hover:bg-black/40 font-retro text-xs transition-all duration-200 pixel-corners"
            style={{ borderColor: `${player.color}60` }}
          >
            {listeningFor === "left" ? "PRESS KEY..." : player.controls.left}
          </button>
        </div>

        <div className="space-y-1">
          <Label htmlFor={`player${playerNumber}Right`} className="font-retro text-xs text-white/90">
            MOVE RIGHT
          </Label>
          <button
            id={`player${playerNumber}Right`}
            onClick={() => handleKeyChange("right")}
            className="w-full mt-1 px-4 py-2 border-2 rounded-md bg-black/60 hover:bg-black/40 font-retro text-xs transition-all duration-200 pixel-corners"
            style={{ borderColor: `${player.color}60` }}
          >
            {listeningFor === "right" ? "PRESS KEY..." : player.controls.right}
          </button>
        </div>
      </div>
    </div>
  )
}
