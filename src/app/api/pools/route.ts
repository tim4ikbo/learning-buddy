import { NextResponse } from 'next/server'
import { db } from '@/db'
import { pools, poolMembers } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Fetch pools where the user is a member and count members per pool
    const userPoolsRaw = await db
      .select({
        id: pools.id,
        name: pools.name,
        createdAt: pools.createdAt,
        creatorId: pools.creatorId,
      })
      .from(pools)
      .leftJoin(poolMembers, eq(pools.id, poolMembers.poolId))
      .where(eq(poolMembers.userId, session.user.id))
      .groupBy(pools.id)

    // For each pool, count the number of members using Drizzle's select and count
    const userPools = await Promise.all(
      userPoolsRaw.map(async (pool) => {
        const [{ count }] = await db.select({ count: sql`count(*)`.as('count') })
          .from(poolMembers)
          .where(eq(poolMembers.poolId, pool.id));
        return { ...pool, memberCount: Number(count) };
      })
    );

    return NextResponse.json(userPools)
  } catch (error) {
    console.error('Error fetching pools:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { name } = await request.json()
    const poolId = nanoid()
    const now = new Date()

    // Create the pool
    await db.insert(pools).values({
      id: poolId,
      name,
      creatorId: session.user.id,
      createdAt: now,
    })

    // Add creator as admin member
    await db.insert(poolMembers).values({
      id: nanoid(),
      poolId,
      userId: session.user.id,
      role: 'admin',
      joinedAt: now,
    })

    return NextResponse.json({ id: poolId })
  } catch (error) {
    console.error('Error creating pool:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 