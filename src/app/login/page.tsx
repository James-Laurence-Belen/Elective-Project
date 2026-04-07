"use client"

import React, { useState, useContext } from 'react'
import { PixelBorder } from '@/components/pixelborder'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/context/authcontext'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Will be handled by AuthContext
  }

  const { login, register } = useContext(AuthContext)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      const res = await login(email, password)
      if (res.ok) router.push('/')
      else alert(res.error)
    } else {
      const res = await register(name, email, password)
      if (res.ok) router.push('/')
      else alert(res.error)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 text-4xl opacity-20 select-none">🌲</div>
      <div className="absolute bottom-10 right-10 text-4xl opacity-20 select-none">🌲</div>
      <div className="absolute top-1/4 right-1/4 text-2xl opacity-30 select-none">✨</div>
      <div className="absolute bottom-1/4 left-1/4 text-2xl opacity-30 select-none">🍂</div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-pixel text-2xl text-dark-brown mb-2">
            Welcome to the Valley
          </h1>
          <p className="text-brown font-medium">
            {isLogin
              ? 'Sign in to access your journal.'
              : 'Register to join our community.'}
          </p>
        </div>

        <PixelBorder className="bg-parchment p-6 md:p-8">
          {/* Tabs */}
          <div className="flex mb-6 border-b-2 border-brown">
            <button
              type="button"
              className={`flex-1 py-3 font-pixel text-[10px] transition-colors ${
                isLogin 
                  ? 'bg-brown text-cream' 
                  : 'text-brown hover:bg-cream'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={`flex-1 py-3 font-pixel text-[10px] transition-colors ${
                !isLogin 
                  ? 'bg-brown text-cream' 
                  : 'text-brown hover:bg-cream'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-dark-brown mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green"
                  placeholder="e.g. John"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green"
                placeholder="player@ganapph.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green"
                placeholder="••••••••"
              />
            </div>

            {isLogin && (
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center text--brown cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 accent-green"
                  />
                  Remember me
                </label>
                <Link
                  href="/forgot-password"
                  className="text-green hover:underline font-bold"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green hover:bg-dark-green text-cream py-4 font-pixel text-xs pixel-border-sm transition-colors mt-6"
            >
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
        </PixelBorder>

        <p className="text-center mt-6">
          <Link href="/" className="text-brown hover:text-green font-pixel text-[10px] flex items-center justify-center gap-2">
            <span>←</span> Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}