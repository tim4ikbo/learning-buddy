import NextAuth, { DefaultSession, Account, Profile } from 'next-auth'
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
    const result = await db.insert(users).values(userData).returning()
    return result[0] as AdapterUser
  },
  linkAccount: async (rawAccount: AdapterAccount): Promise<void> => {
    const id = createId()
    const accountData = {
      id,
      userId: rawAccount.userId,
      type: rawAccount.type as string,
      provider: rawAccount.provider,
      providerAccountId: rawAccount.providerAccountId,
      refresh_token: (rawAccount.refresh_token as string) ?? null,
      access_token: (rawAccount.access_token as string) ?? null,
      expires_at: rawAccount.expires_at ? Number(rawAccount.expires_at) : null,
      token_type: (rawAccount.token_type as string) ?? null,
      scope: (rawAccount.scope as string) ?? null,
      id_token: (rawAccount.id_token as string) ?? null,
      session_state: (rawAccount.session_state as string) ?? null
    }
    await db.insert(accounts).values(accountData)
  }
}

export const authConfig = {
  debug: true,
  adapter: customAdapter,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.error('No email provided in user object:', user)
        return false
      }

      try {
        // Check if user exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
          with: {
            accounts: true
          }
        })
        console.log('Existing user data:', existingUser)

        // If we have an account object, log its data
        if (account) {
          console.log('Account data:', {
            userId: user.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          })
        }
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }
      
      return true
    },
    async session({ session, token }: { session: ExtendedSession; token: JWT }) {
      console.log('Session callback:', { session, token })
      if (session?.user) {
        session.user.id = token.sub!
      }
      return session
    },
    async jwt({ token, user }: { token: JWT; user?: any }) {
      console.log('JWT callback:', { token, user })
      if (user) {
        token.id = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  logger: {
    error(error: Error) {
      console.error('AUTH ERROR:', error, error.cause)
    },
    warn(code: string) {
      console.warn('AUTH WARN:', code)
    },
    debug(code: string, metadata?: any) {
      console.debug('AUTH DEBUG:', code, metadata)
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
} satisfies NextAuthConfig

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth(authConfig)
