import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me'

export const signToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as any
}

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash)
}

export const commitTokenCookie = (token: string) => {
  return serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export const clearTokenCookie = () => {
  return serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  })
}
