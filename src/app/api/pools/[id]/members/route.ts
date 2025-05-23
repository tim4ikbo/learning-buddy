import { NextResponse } from 'next/server'
import { db } from '@/db'
import { poolMembers, users } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/auth'
import { nanoid } from 'nanoid'

// POST handler to add a new member to a specific pool
export async function POST(
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
    // Parse request body for user email
    const { email } = await request.json()

    // Validate that an email was provided
    if (!email) {
      return new NextResponse('Email is required', { status: 400 })
    }

    // Check if current user is an admin of the pool
    const member = await db.query.poolMembers.findFirst({
      where: and(
        eq(poolMembers.poolId, poolId),
        eq(poolMembers.userId, session.user.id),
        eq(poolMembers.role, 'admin')
      ),
    })

    // Only admins can add new members
    if (!member) {
      return new NextResponse('Not authorized to add members', { status: 403 })
    }

    // Find the user to add by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    // Return 404 if user does not exist
    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Check if user is already a member of the pool
    const existingMember = await db.query.poolMembers.findFirst({
      where: and(
        eq(poolMembers.poolId, poolId),
        eq(poolMembers.userId, user.id)
      ),
    })

    // Prevent adding duplicate members
    if (existingMember) {
      return new NextResponse('User is already a member of this pool', { status: 409 })
    }

    // Add user to pool
    await db.insert(poolMembers).values({
      id: nanoid(),
      poolId,
      userId: user.id,
      role: 'member',
      joinedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding pool member:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(
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

    // Check if user is a member of the pool
    const userMember = await db.query.poolMembers.findFirst({
      where: and(
        eq(poolMembers.poolId, poolId),
        eq(poolMembers.userId, session.user.id)
      ),
    })

    if (!userMember) {
      return new NextResponse('Not a member of this pool', { status: 403 })
    }

    // Get all members of the pool with user details
    const members = await db
      .select({
        id: poolMembers.id,
        userId: poolMembers.userId,
        role: poolMembers.role,
        joinedAt: poolMembers.joinedAt,
        name: users.name,
        email: users.email,
        image: users.image,
      })
      .from(poolMembers)
      .leftJoin(users, eq(poolMembers.userId, users.id))
      .where(eq(poolMembers.poolId, poolId))

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching pool members:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
