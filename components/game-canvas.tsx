"use client"

import { useRef, useEffect, useState } from "react"
import type { Player } from "./pong-game"

interface GameCanvasProps {
  players: Player[]
  ballSpeed: number
  onScore: (playerIndex: number) => void
}

interface Ball {
  x: number
  y: number
  radius: number
  dx: number
  dy: number
  speed: number
  playerIndex: number
}

interface Paddle {
  x: number
  y: number
  width: number
  height: number
  speed: number
  color: string
  movingLeft: boolean
  movingRight: boolean
}

export default function GameCanvas({ players, ballSpeed, onScore }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameWidth, setGameWidth] = useState(800)
  const [gameHeight, setGameHeight] = useState(600)
  const [round, setRound] = useState(1)
  const [roundStarting, setRoundStarting] = useState(true)
  const [countdown, setCountdown] = useState(3)

  // Game state refs to avoid closure issues in animation loop
  const gameStateRef = useRef({
    balls: [] as Ball[],
    paddles: [] as Paddle[],
    keysPressed: {} as Record<number, boolean>,
    lastLostBy: -1,
    animationFrameId: 0,
    ballLost: false, // Track if a ball was lost in the current update
  })

  // Initialize game dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement
        if (container) {
          const width = container.clientWidth
          setGameWidth(width)
          setGameHeight(Math.min(window.innerHeight * 0.6, width * 0.75))
        }
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Initialize game state
  useEffect(() => {
    if (!canvasRef.current) return

    const paddleHeight = 15
    const paddleWidth = 100
    const paddleY = gameHeight - paddleHeight - 10
    const paddleSpeed = 8

    // Create paddles
    const paddles: Paddle[] = players.map((player, index) => {
      const paddleX = (gameWidth / 3) * (index + 1) - paddleWidth / 2

      return {
        x: paddleX,
        y: paddleY,
        width: paddleWidth,
        height: paddleHeight,
        speed: paddleSpeed,
        color: player.color,
        movingLeft: false,
        movingRight: false,
      }
    })

    // Initialize balls
    const balls: Ball[] = players.map((player, index) => {
      // Position balls slightly offset from center
      const offsetX = index === 0 ? -50 : 50

      return {
        x: gameWidth / 2 + offsetX,
        y: gameHeight / 2,
        radius: 10,
        dx: 0,
        dy: 0,
        speed: ballSpeed,
        playerIndex: index,
      }
    })

    gameStateRef.current = {
      ...gameStateRef.current,
      balls,
      paddles,
      lastLostBy: -1,
      ballLost: false,
    }

    // Start countdown for round
    setRoundStarting(true)
    setCountdown(3)
  }, [gameWidth, gameHeight, players, ballSpeed, round])

  // Handle countdown timer
  useEffect(() => {
    if (!roundStarting) return

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      // Start the round
      startRound()
      setRoundStarting(false)
    }
  }, [roundStarting, countdown])

  // Start a new round
  const startRound = () => {
    const { balls } = gameStateRef.current

    // Reset each ball position
    balls.forEach((ball, index) => {
      // Position balls slightly offset from center
      const offsetX = index === 0 ? -50 : 50

      ball.x = gameWidth / 2 + offsetX
      ball.y = gameHeight / 2

      // Set random horizontal direction
      const horizontalDirection = Math.random() > 0.5 ? 1 : -1

      // Always start moving upward (toward the wall)
      ball.dx = horizontalDirection * (ball.speed * 0.7)
      ball.dy = -ball.speed
    })

    // Reset the ball lost flag
    gameStateRef.current.ballLost = false
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keysPressed[e.keyCode] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keysPressed[e.keyCode] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Main game loop
  useEffect(() => {
    if (!canvasRef.current || roundStarting) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = gameWidth
    canvas.height = gameHeight

    const gameState = gameStateRef.current
    const { balls, paddles, keysPressed } = gameState

    // Create a gradient for the background
    const createBackgroundGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#000000")
      gradient.addColorStop(1, "#0f0f2d")
      return gradient
    }

    // Draw scanlines effect
    const drawScanlines = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.fillRect(0, i, canvas.width, 1)
      }
    }

    // Draw a glowing object
    const drawGlow = (drawFunc: () => void, color: string, blur: number) => {
      ctx.shadowColor = color
      ctx.shadowBlur = blur
      drawFunc()
      ctx.shadowBlur = 0
    }

    const render = () => {
      // Clear canvas with gradient background
      ctx.fillStyle = createBackgroundGradient()
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw scanlines effect
      drawScanlines()

      // Draw top wall with glow
      drawGlow(
        () => {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, 10)
        },
        "#ffffff",
        10,
      )

      // Draw side walls with glow
      drawGlow(
        () => {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, 10, canvas.height)
          ctx.fillRect(canvas.width - 10, 0, 10, canvas.height)
        },
        "#ffffff",
        10,
      )

      // Draw balls with glow
      balls.forEach((ball) => {
        drawGlow(
          () => {
            ctx.beginPath()
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
            ctx.fillStyle = paddles[ball.playerIndex].color
            ctx.fill()
            ctx.closePath()
          },
          paddles[ball.playerIndex].color,
          15,
        )
      })

      // Draw paddles with glow
      paddles.forEach((paddle) => {
        drawGlow(
          () => {
            ctx.fillStyle = paddle.color
            ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
          },
          paddle.color,
          10,
        )
      })

      // Draw round number
      ctx.font = "16px 'Press Start 2P'"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.fillText(`ROUND: ${round}`, gameWidth / 2, 30)
    }

    const update = () => {
      // Update paddle positions based on key presses
      players.forEach((player, index) => {
        const paddle = paddles[index]

        // Check if left key is pressed
        if (keysPressed[player.keyCode.left]) {
          paddle.x = Math.max(10, paddle.x - paddle.speed)
        }

        // Check if right key is pressed
        if (keysPressed[player.keyCode.right]) {
          paddle.x = Math.min(gameWidth - paddle.width - 10, paddle.x + paddle.speed)
        }
      })

      // Update ball positions
      balls.forEach((ball) => {
        ball.x += ball.dx
        ball.y += ball.dy

        // Ball collision with top wall
        if (ball.y - ball.radius < 10) {
          ball.y = ball.radius + 10
          ball.dy = -ball.dy
        }

        // Ball collision with side walls
        if (ball.x - ball.radius < 10 || ball.x + ball.radius > gameWidth - 10) {
          ball.dx = -ball.dx

          // Ensure ball stays within bounds
          if (ball.x - ball.radius < 10) {
            ball.x = ball.radius + 10
          } else if (ball.x + ball.radius > gameWidth - 10) {
            ball.x = gameWidth - ball.radius - 10
          }
        }

        // Ball collision with paddles
        paddles.forEach((paddle) => {
          if (
            ball.y + ball.radius > paddle.y &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.x + ball.radius > paddle.x &&
            ball.x - ball.radius < paddle.x + paddle.width
          ) {
            // Calculate where the ball hit the paddle (0 = left edge, 1 = right edge)
            const hitPosition = (ball.x - paddle.x) / paddle.width

            // Change angle based on where the ball hit the paddle
            // Center = straight up, edges = more angle
            const angle = (hitPosition - 0.5) * Math.PI * 0.7

            // Set new direction
            ball.dx = Math.sin(angle) * ball.speed
            ball.dy = -Math.cos(angle) * ball.speed

            // Ensure ball is above paddle
            ball.y = paddle.y - ball.radius
          }
        })

        // Ball goes below the bottom edge (player loses)
        if (ball.y + ball.radius > gameHeight) {
          // The player whose ball went out loses
          const losingPlayerIndex = ball.playerIndex

          // Update score - the opposing player gets a point
          gameState.lastLostBy = losingPlayerIndex
          onScore(losingPlayerIndex)

          // Reset this ball
          ball.x = gameWidth / 2 + (losingPlayerIndex === 0 ? -50 : 50)
          ball.y = gameHeight / 2

          // Set random horizontal direction
          const horizontalDirection = Math.random() > 0.5 ? 1 : -1

          // Always start moving upward (toward the wall)
          ball.dx = horizontalDirection * (ball.speed * 0.7)
          ball.dy = -ball.speed

          // Mark that a ball was lost in this update
          gameState.ballLost = true
        }
      })

      // Check if we need to start a new round
      if (gameState.ballLost) {
        // Increment the round counter
        setRound((prevRound) => prevRound + 1)

        // Reset the ball lost flag
        gameState.ballLost = false
      }
    }

    const gameLoop = () => {
      update()
      render()
      gameState.animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameState.animationFrameId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(gameState.animationFrameId)
    }
  }, [gameWidth, gameHeight, players, round, roundStarting, onScore])

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg retro-card scanlines"
        style={{
          height: `${gameHeight}px`,
          boxShadow: "0 0 20px rgba(120, 120, 255, 0.3)",
        }}
      />

      {roundStarting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg scanlines">
          <div className="text-center">
            <h2 className="text-2xl font-retro mb-4 neon-glow text-white">ROUND {round}</h2>
            {countdown > 0 ? (
              <div className="text-6xl font-retro neon-glow text-white animate-pulse-glow">{countdown}</div>
            ) : (
              <div className="text-4xl font-retro text-green-500 neon-glow animate-pulse-glow">GO!</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
