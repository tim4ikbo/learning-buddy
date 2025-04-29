'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { type Session } from 'next-auth'

// Props for SessionProvider: children and optional session
type Props = {
  children: React.ReactNode
  session?: Session | null
}

// Provides NextAuth session context (optionally with a pre-fetched session) to all child components
export function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
} 