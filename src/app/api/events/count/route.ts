// src/app/api/events/count/route.ts

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.event.count()

    console.log('ACTIVE EVENT COUNT:', count)

    return NextResponse.json(
      { count },
      { status: 200 }
    )
  } catch (err) {
    console.error('EVENT COUNT ERROR:', err)

    return NextResponse.json(
      { error: 'Failed to fetch event count' },
      { status: 500 }
    )
  }
}