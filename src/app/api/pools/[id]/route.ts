import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pools, poolMembers } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/auth'

// DELETE handler to remove a pool and its members
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context
  const session = await auth()

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Extract pool ID from route parameters
    const poolId = (await params).id
    // Check if the current user is the creator of the pool
    const pool = await db.query.pools.findFirst({
      where: and(
        eq(pools.id, poolId),
        eq(pools.creatorId, session.user.id)
      ),
    })

    // Only the creator can delete the pool
    if (!pool) {
      return new NextResponse('Not found or not authorized', { status: 404 })
    }

    // Delete all pool members first (to satisfy foreign key constraints)
    await db.delete(poolMembers).where(eq(poolMembers.poolId, poolId))
    
    // Delete the pool itself
    await db.delete(pools).where(eq(pools.id, poolId))

    // Respond with 204 No Content on success
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    // Log and handle unexpected errors
    console.error('Error deleting pool:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context
  const session = await auth()

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const poolId = (await params).id
    const { action } = await request.json()

    if (action === 'leave') {
      // Check if user is a member of the pool
      const member = await db.query.poolMembers.findFirst({
        where: and(
          eq(poolMembers.poolId, poolId),
          eq(poolMembers.userId, session.user.id)
        ),
      })

      if (!member) {
        return new NextResponse('Not a member', { status: 404 })
      }

      // Check if user is not the creator (creators can't leave, they must delete)
      const pool = await db.query.pools.findFirst({
        where: eq(pools.id, poolId),
      })

      if (pool?.creatorId === session.user.id) {
        return new NextResponse('Creator cannot leave pool', { status: 400 })
      }

      // Remove user from pool
      await db.delete(poolMembers).where(
        and(
          eq(poolMembers.poolId, poolId),
          eq(poolMembers.userId, session.user.id)
        )
      )

      return new NextResponse(null, { status: 204 })
    }

    return new NextResponse('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Error leaving pool:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
