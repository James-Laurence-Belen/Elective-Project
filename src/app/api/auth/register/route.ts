import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, signToken, commitTokenCookie } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    })

    const token = signToken({ id: user.id })
    const cookie = commitTokenCookie(token)

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      {
        status: 201,
        headers: {
          'Set-Cookie': cookie,
        },
      }
    )
  } catch (err: any) {
    console.error('REGISTER ERROR:', err)
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}