import { NextResponse } from 'next/server'
import { db } from '@/db'
import { canvases } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'

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
    const canvas = await db.query.canvases.findFirst({
      where: eq(canvases.poolId, poolId),
    })

    if (!canvas) {
      // Return empty canvas state if none exists
      return NextResponse.json({
        images: [],
        lastModified: Date.now(),
      })
    }

    return NextResponse.json({
      images: JSON.parse(canvas.content || '[]'),
      lastModified: canvas.updatedAt?.getTime() || Date.now(),
    })
  } catch (error) {
    console.error('Failed to get canvas:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
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
    const body = await request.json()
    const { images } = body

    const existingCanvas = await db.query.canvases.findFirst({
      where: eq(canvases.poolId, poolId),
    })

    if (existingCanvas) {
      await db
        .update(canvases)
        .set({
          content: JSON.stringify(images),
          updatedAt: new Date(),
        })
        .where(eq(canvases.id, existingCanvas.id))
    } else {
      await db.insert(canvases).values({
        name: 'Pool Canvas',
        poolId: poolId,
        creatorId: session.user.id,
        content: JSON.stringify(images),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update canvas:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
