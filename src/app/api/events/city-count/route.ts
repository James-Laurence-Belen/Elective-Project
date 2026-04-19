import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function extractCityOrTown(location: string) {
  if (!location) return null

  const parts = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return null

  // Based on your request:
  // use the part before the last comma
  if (parts.length >= 2) {
    return parts[parts.length - 2]
  }

  return parts[0]
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      select: {
        location: true,
      },
    })

    const uniqueCities = new Set<string>()

    for (const event of events) {
      const city = extractCityOrTown(event.location)

      if (city) {
        uniqueCities.add(city)
      }
    }

    const count = uniqueCities.size

    console.log('UNIQUE CITIES/TOWNS:', [...uniqueCities])
    console.log('CITY/TOWN COUNT:', count)

    return NextResponse.json(
      {
        count,
        cities: [...uniqueCities],
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('CITY COUNT ERROR:', err)

    return NextResponse.json(
      { error: 'Failed to fetch city count' },
      { status: 500 },
    )
  }
}