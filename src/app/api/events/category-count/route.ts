// src/app/api/events/category-count/route.ts

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      select: {
        category: true,
      },
    })

    const categoryCounts: Record<string, number> = {}

    events.forEach((event) => {
      const category = event.category

      if (categoryCounts[category]) {
        categoryCounts[category] += 1
      } else {
        categoryCounts[category] = 1
      }
    })

    console.log('CATEGORY COUNTS:', categoryCounts)

    return NextResponse.json(
      { categoryCounts },
      { status: 200 }
    )
  } catch (err) {
    console.error('CATEGORY COUNT ERROR:', err)

    return NextResponse.json(
      { error: 'Failed to fetch category counts' },
      { status: 500 }
    )
  }
}