import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token) as { id: number }

    if (!payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      where: {
        organizerId: payload.id,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json({ events }, { status: 200 })
  } catch (error) {
    console.error('GET MY EVENTS ERROR:', error)
    return NextResponse.json(
      { error: 'Failed to fetch your events' },
      { status: 500 }
    )
  }
}
