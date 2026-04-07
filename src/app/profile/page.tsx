"use client"

import React, { useContext, useEffect, useState } from 'react'
import { PixelBorder } from '@/components/pixelborder'
import { AuthContext } from '@/context/authcontext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading, updateProfile, logout } = useContext(AuthContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      setName(user.name ?? '')
      setEmail(user.email)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (password && password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    const res = await updateProfile({ name: name || undefined, email: email || undefined, password: password || undefined })
    setSubmitting(false)
    if (!res.ok) setError(res.error || 'Update failed')
    else setMessage('Profile updated')
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <h1 className="font-pixel text-2xl text-dark-brown mb-2">Your Profile</h1>
          <p className="text-brown font-medium text-[12px]">Manage your account details</p>
        </div>

        <PixelBorder className="bg-parchment p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-4">
            {error && <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded font-pixel text-[11px]">{error}</div>}
            {message && <div className="bg-green-100 border border-green-300 text-green-800 px-3 py-2 rounded font-pixel text-[11px]">{message}</div>}

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green" />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green" />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">New Password (optional)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green" placeholder="••••••••" />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">Confirm Password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green" placeholder="••••••••" />
            </div>

            <div className="flex gap-3">
              <button disabled={submitting} className={`flex-1 bg-green text-cream py-3 font-pixel text-xs pixel-border-sm ${submitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-dark-green'}`}>{submitting ? 'Saving…' : 'Save Changes'}</button>
              <button type="button" onClick={() => logout()} className="flex-1 bg-brown text-cream py-3 font-pixel text-xs pixel-border-sm hover:bg-light-brown">Logout</button>
            </div>
          </form>
        </PixelBorder>

        <p className="text-center mt-6">
          <Link href="/" className="text-brown hover:text-green font-pixel text-[10px] flex items-center justify-center gap-2">
            <span>←</span> Back to Home
          </Link>
        </p>
      </div>
    </div>
  )
}
