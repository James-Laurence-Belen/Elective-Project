'use client'

import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext } from '@/context/authcontext'

interface BookmarkContextType {
  bookmarkedIds: string[]
  toggleBookmark: (eventId: string) => void
  isBookmarked: (eventId: string) => boolean
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useContext(AuthContext)
  const router = useRouter()
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])

  const storageKey = user ? `bookmarks:${user.id}` : null

  useEffect(() => {
    if (loading || typeof window === 'undefined') return

    if (!user || !storageKey) {
      queueMicrotask(() => {
        setBookmarkedIds([])
      })
      return
    }

    const stored = localStorage.getItem(storageKey)
    const legacy = localStorage.getItem('bookmarks')
    const source = stored ?? legacy

    if (!source) {
      queueMicrotask(() => {
        setBookmarkedIds([])
      })
      return
    }

    try {
      const parsed = JSON.parse(source)
      const nextBookmarks = Array.isArray(parsed)
        ? parsed.filter((id): id is string => typeof id === 'string')
        : []

      queueMicrotask(() => {
        setBookmarkedIds(nextBookmarks)
      })

      if (!stored && legacy) {
        localStorage.setItem(storageKey, JSON.stringify(nextBookmarks))
      }
    } catch {
      queueMicrotask(() => {
        setBookmarkedIds([])
      })
    }
  }, [loading, storageKey, user])

  const toggleBookmark = (eventId: string) => {
    if (!user || !storageKey) {
      router.push('/login')
      return
    }

    setBookmarkedIds((prev) => {
      const newBookmarks = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]

      localStorage.setItem(storageKey, JSON.stringify(newBookmarks))
      return newBookmarks
    })
  }

  const isBookmarked = (eventId: string) => bookmarkedIds.includes(eventId)

  if (loading || typeof window === 'undefined') {
    return (
      <BookmarkContext.Provider
        value={{
          bookmarkedIds: [],
          toggleBookmark: () => {},
          isBookmarked: () => false,
        }}
      >
        {children}
      </BookmarkContext.Provider>
    )
  }

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedIds,
        toggleBookmark,
        isBookmarked,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmarks() {
  const context = useContext(BookmarkContext)
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider')
  }
  return context
}
