import { NextResponse } from 'next/server'
import { clearTokenCookie } from '@/lib/auth'

export async function POST() {
  const cookie = clearTokenCookie()
  return NextResponse.json({ ok: true }, { status: 200, headers: { 'Set-Cookie': cookie } })
}
