"use client"


export default function Home() {

  // if (session) {
  //   // If user is already signed in, redirect to pools page
  //   return null
  // }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white grid-bg">
      {/* Logo Circle */}
      <div className="w-96 h-96 bg-zinc-800 rounded-full flex items-center justify-center mb-24">
        <h1 className="text-white text-5xl font-mono">StudySphere</h1>
      </div>

      {/* Buttons Container */}
      <div className="flex gap-48">
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-zinc-900 hover:bg-zinc-700 text-white font-mono text-2xl py-6 px-16 rounded-full transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={() => window.location.href = '/login?mode=signup'}
          className="bg-zinc-900 hover:bg-zinc-700 text-white font-mono text-2xl py-6 px-16 rounded-full transition-colors"
        >
          Sign Up
        </button>
      </div>
    </main>
  )
}