// Import Google Inter font, global styles, session provider, and authentication helper
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import Script from 'next/script'
import { auth } from '@/auth'

// Initialize Inter font with Latin subset
const inter = Inter({ subsets: ['latin'] })

// Default metadata for the application
export const metadata = {
  title: 'StudySphere',
  description: 'A collaborative learning platform for students',
}

// Root layout for the Next.js app, providing session context and global styles
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authenticate user session (server-side)
  const session = await auth();

  return (
    <html lang="en">
      <head>
        {/* Inject Pyodide script for Python execution support */}
        <Script src="https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        {/* Provide session context to the entire app */}
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
