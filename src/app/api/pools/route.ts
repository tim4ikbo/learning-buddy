/**
 * API route for managing study pools.
 * - GET: Returns all pools that the authenticated user is a member of, including member counts.
 * - POST: Creates a new pool and adds the creator as an admin member.
 *
 * Requires user authentication for all actions.
 */

import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pools, poolMembers } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { auth } from '@/auth'

// GET handler: Returns all pools the authenticated user is a member of, with member counts
export async function GET() {
  // Authenticate the user
  const session = await auth()

  // If not authenticated, return 401 Unauthorized
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Fetch pools where the user is a member
    const userPoolsRaw = await db
      .select({
        id: pools.id, // Pool ID
        name: pools.name, // Pool name
        createdAt: pools.createdAt, // Pool creation date
        creatorId: pools.creatorId, // Pool creator's user ID
      })
      .from(pools)
      // Join with poolMembers to filter by membership
      .leftJoin(poolMembers, eq(pools.id, poolMembers.poolId))
      .where(eq(poolMembers.userId, session.user.id))
      .groupBy(pools.id)

    // For each pool, count the number of members
    const userPools = await Promise.all(
      userPoolsRaw.map(async (pool) => {
        // Count number of members in this pool
        const [{ count }] = await db.select({ count: sql`count(*)`.as('count') })
          .from(poolMembers)
          .where(eq(poolMembers.poolId, pool.id));
        return { ...pool, memberCount: Number(count) };
      })
    );

    // Return the list of pools as JSON
    return NextResponse.json(userPools)
  } catch (error) {
    // Log and return server error
    console.error('Error fetching pools:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST handler: Creates a new pool and adds the creator as an admin member
export async function POST(request: Request) {
  // Authenticate the user
  const session = await auth()

  // If not authenticated, return 401 Unauthorized
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Parse the pool name from the request body
    const { name } = await request.json()
    // Generate a unique ID for the new pool
    const poolId = nanoid()
    // Get the current time for timestamps
    const now = new Date()

    // Insert the new pool into the database
    await db.insert(pools).values({
      id: poolId,
      name,
      creatorId: session.user.id, // Set the creator
      createdAt: now,
    })

    // Add the creator as an admin member of the pool
    await db.insert(poolMembers).values({
      id: nanoid(), // Unique ID for the membership
      poolId, // Link to the new pool
      userId: session.user.id, // The creator's user ID
      role: 'admin', // Assign admin role
      joinedAt: now, // Timestamp
    })

    // Return the new pool's ID as JSON
    return NextResponse.json({ id: poolId })
  } catch (error) {
    // Log and return server error
    console.error('Error creating pool:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 