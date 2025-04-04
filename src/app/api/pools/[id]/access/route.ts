import { NextResponse } from 'next/server'
import { isPoolMember } from '@/lib/pool-access'
import { auth } from '@/auth'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const poolId = (await context.params).id
    const hasAccess = await isPoolMember(poolId)

    if (!hasAccess) {
      return new NextResponse('Access denied', { status: 403 })
    }

    return NextResponse.json({ access: true })
  } catch (error) {
    console.error('Error checking pool access:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
