import PongGame from "@/components/pong-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-center text-4xl font-retro mb-8 text-white neon-glow animate-pulse-glow">PING VS PONG</h1>
        <PongGame />
      </div>
    </main>
  )
}
