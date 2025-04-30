import NextAuth, { User, type DefaultSession } from 'next-auth'
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { db } from '@/db'
import { JWT } from 'next-auth/jwt'
import { NextAuthConfig } from 'next-auth'
import { users, accounts } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'
import type { Adapter, AdapterUser, AdapterAccount } from 'next-auth/adapters'

// Extend the built-in session type
type ExtendedSession = DefaultSession & {
  user?: DefaultSession['user'] & {
    id: string
  }
}

const baseAdapter = DrizzleAdapter(db)
const customAdapter: Adapter = {
  ...baseAdapter,
  createUser: async (data: Partial<AdapterUser>): Promise<AdapterUser> => {
    const id = createId()
    const userData = {
      id,
      name: data.name ?? null,
      email: data.email!,
      emailVerified: data.emailVerified ?? null,
      image: data.image ?? null
    }
    await db.insert(users).values(userData)
    return userData as AdapterUser
  },
  linkAccount: async (rawAccount: AdapterAccount): Promise<void> => {
    const account = {
      ...rawAccount,
      id: createId(),
    }
    await db.insert(accounts).values(account)
  }
}

export const authConfig = {
  debug: process.env.NODE_ENV === 'development',
  adapter: customAdapter,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    // signIn callback: runs on user sign-in attempt
    // - Ensures email is present
    // - For GitHub, creates a new user if one doesn't exist
    signIn: async ({ user, account }) => {
      if (!user.email) {
        return false
      }

      if (account?.provider === 'github') {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        })

        // If user does not exist, create a new user record
        if (!existingUser && customAdapter.createUser) {
          await customAdapter.createUser({
            email: user.email,
            name: user.name,
            image: user.image,
            emailVerified: null,
            id: createId()
          })
        }
      }

      return true
    },
    // session callback: attaches user ID to session object
    session: async ({ session, token }: { session: ExtendedSession; token: JWT }) => {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    // jwt callback: attaches user ID to JWT token
    jwt: async ({ token, user }: { token: JWT; user?: User }) => {
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  // Custom authentication pages
  pages: {
    signIn: '/login',         // Custom sign-in page
    error: '/auth/error',     // Custom error page
  },
  // Custom logger for authentication events
  logger: {
    error(error: Error) {
      console.error('Auth error:', error)
    },
    warn(code: string) {
      console.warn('Auth warning:', code)
    },
    debug(code: string, metadata?: unknown) {
      console.debug('Auth debug:', code, metadata)
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
