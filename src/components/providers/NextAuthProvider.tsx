'use client'

import { SessionProvider } from 'next-auth/react'

// Provides NextAuth session context to all child components
export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  // Wrap children with SessionProvider for authentication context
  return <SessionProvider>{children}</SessionProvider>
} 