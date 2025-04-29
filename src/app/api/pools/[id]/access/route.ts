import { NextResponse } from 'next/server'
import { isPoolMember } from '@/lib/pool-access'
import { auth } from '@/auth'

// GET handler to check if the current user has access to a specific pool
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Retrieve the current user's session
  const session = await auth()

  // If the user is not authenticated, return 401 Unauthorized
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Extract the pool ID from route parameters
    const poolId = (await context.params).id
    // Check if the user is a member of the pool
    const hasAccess = await isPoolMember(poolId)

    // If the user does not have access, return 403 Forbidden
    if (!hasAccess) {
      return new NextResponse('Access denied', { status: 403 })
    }

    // If access is granted, return a JSON response
    return NextResponse.json({ access: true })
  } catch (error) {
    // Log and handle unexpected errors
    console.error('Error checking pool access:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
