import { db } from '@/db'
import { poolMembers } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

/**
 * Check if the current user is a member of the specified pool
 * @param poolId The ID of the pool to check membership for
 * @returns True if the user is a member, false otherwise
 */
export async function isPoolMember(poolId: string): Promise<boolean> {
  const session = await auth()
  
  if (!session?.user?.id) {
    return false
  }
  
  const member = await db.query.poolMembers.findFirst({
    where: and(
      eq(poolMembers.poolId, poolId),
      eq(poolMembers.userId, session.user.id)
    ),
  })
  
  return !!member
}

/**
 * Middleware to ensure the current user has access to the specified pool
 * Redirects to the home page if the user doesn't have access
 * @param poolId The ID of the pool to check access for
 */
export async function requirePoolAccess(poolId: string): Promise<void> {
  const hasAccess = await isPoolMember(poolId)
  
  if (!hasAccess) {
    redirect('/')
  }
}
