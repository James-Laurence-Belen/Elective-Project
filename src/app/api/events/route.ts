import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: 'asc',
      },
    })

    console.log('ALL EVENTS:', events)

    return NextResponse.json({ events }, { status: 200 })
  } catch (err) {
    console.error('GET EVENTS ERROR:', err)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token) as { id: number }

    if (!payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, description, category, location, date, time } = body

    if (!name || !description || !category || !location || !date || !time) {
      return NextResponse.json(
        { error: 'Please fill in all fields.' },
        { status: 400 },
      )
    }

    const eventData = {
      organizerName: user.name || user.email,
      name,
      description,
      category,
      location,
      date,
      time,
      organizerId: user.id,
    }

    console.log('DATA TO SAVE IN DB:', eventData)

    const event = await prisma.event.create({
      data: eventData,
    })

    console.log('SAVED EVENT:', event)

    return NextResponse.json({ event }, { status: 201 })
  } catch (err) {
    console.error('CREATE EVENT ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}