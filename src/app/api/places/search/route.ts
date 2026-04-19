import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { query, city } = await req.json()

    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: { message: 'Missing RAPIDAPI_KEY in .env.local' } },
        { status: 500 }
      )
    }

    const q = query?.trim() || 'concerts'
    const location = city?.trim() || 'Bulacan, Philippines'

    // Replace this with the exact endpoint/query string from RapidAPI Playground
    const url =
      `https://real-time-events-search.p.rapidapi.com/event-details?event_id=L2F1dGhvcml0eS9ob3Jpem9uL2NsdXN0ZXJlZF9ldmVudC8yMDI1LTEwLTEwfDEyMzU2NDg0MzM2NjU5NjE0MzM1`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'real-time-events-search.p.rapidapi.com',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: { message: data?.message || 'Failed to fetch events' } },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}