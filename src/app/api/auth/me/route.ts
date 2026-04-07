import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken, hashPassword } from '@/lib/auth'
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

export async function PUT(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const cookies = parse(cookieHeader)
    const token = cookies.token

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let payload: any
    try {
      payload = verifyToken(token)
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, password } = body

    const data: any = {}
    if (typeof name === 'string') data.name = name
    if (typeof email === 'string') {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== payload.id) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
      data.email = email
    }
    if (typeof password === 'string' && password.length > 0) {
      data.password = await hashPassword(password)
    }

    if (Object.keys(data).length === 0) {
      const user = await prisma.user.findUnique({ where: { id: payload.id } })
      if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
    }

    const user = await prisma.user.update({ where: { id: payload.id }, data })
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
