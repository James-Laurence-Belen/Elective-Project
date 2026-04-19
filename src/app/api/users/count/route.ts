// src/app/api/users/count/route.ts

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.user.count()

    console.log('TOTAL USER COUNT:', count)

    return NextResponse.json(
      { count },
      { status: 200 }
    )
  } catch (err) {
    console.error('USER COUNT ERROR:', err)

    return NextResponse.json(
      { error: 'Failed to fetch user count' },
      { status: 500 }
    )
  }
}