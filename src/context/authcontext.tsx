'use client'

import React, { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = { id: number; email: string; name?: string | null } | null

type AuthContextType = {
	user: User
	loading: boolean
	login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
	register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
	logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	login: async () => ({ ok: false }),
	register: async () => ({ ok: false }),
	logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		let mounted = true
		fetch('/api/auth/me', { credentials: 'include' })
			.then((res) => res.json())
			.then((data) => {
				if (!mounted) return
				setUser(data.user ?? null)
				setLoading(false)
			})
			.catch(() => {
				setUser(null)
				setLoading(false)
			})

		return () => {
			mounted = false
		}
	}, [])

	const login = async (email: string, password: string) => {
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
				credentials: 'include',
			})
			const data = await res.json()
			if (!res.ok) return { ok: false, error: data?.error || 'Login failed' }
			setUser(data.user)
			return { ok: true }
		} catch (err) {
			return { ok: false, error: 'Network error' }
		}
	}

	const register = async (name: string, email: string, password: string) => {
		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password }),
				credentials: 'include',
			})
			const data = await res.json()
			if (!res.ok) return { ok: false, error: data?.error || 'Registration failed' }
			setUser(data.user)
			return { ok: true }
		} catch (err) {
			return { ok: false, error: 'Network error' }
		}
	}

	const logout = async () => {
		await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
		setUser(null)
		router.push('/')
	}

	return (
		<AuthContext.Provider value={{ user, loading, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	)
}
