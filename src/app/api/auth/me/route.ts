import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { parse } from 'cookie'

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const cookies = parse(cookieHeader)
    const token = cookies.token

    if (!token) return NextResponse.json({ user: null })

    let payload: any
    try {
      payload = verifyToken(token)
    } catch (err) {
      return NextResponse.json({ user: null })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } })
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    return NextResponse.json({ user: null })
  }
}
