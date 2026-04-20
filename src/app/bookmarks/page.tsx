'use client'

import React, { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin } from 'lucide-react'
import { AuthContext } from '@/context/authcontext'
import { categories } from '@/lib/categories'

type DbEvent = {
  id: number
  organizerName: string
  name: string
  description: string
  category: string
  location: string
  date: string
  time: string
}

function extractCityFromLocation(location: string) {
  const parts = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length >= 3) {
    return parts[parts.length - 3]
  }

  if (parts.length >= 2) {
    return parts[parts.length - 2]
  }

  return parts[0] || 'Unknown'
}

function normalizeCategory(raw: string) {
  const value = raw.trim().toLowerCase()

  const category = categories.find(
    (item) =>
      item.id.toLowerCase() === value || item.name.toLowerCase() === value,
  )

  return (
    category ?? {
      id: raw,
      name: raw,
      icon: '📌',
      color: 'bg-brown',
    }
  )
}

export default function BookmarksPage() {
  const { user, loading } = useContext(AuthContext)
  const router = useRouter()

  const [bookmarkedEvents, setBookmarkedEvents] = useState<DbEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, router, user])

  useEffect(() => {
    if (!user) {
      setBookmarkedEvents([])
      setIsLoading(false)
      return
    }

    try {
      const bookmarkKey = `bookmarkedEvents_user_${user.id}`
      const saved = JSON.parse(
        localStorage.getItem(bookmarkKey) || '[]',
      ) as DbEvent[]

      setBookmarkedEvents(saved)
    } catch (error) {
      console.error('Failed to load bookmarked events:', error)
      setBookmarkedEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const handleRemoveBookmark = (eventId: number) => {
    if (!user) return

    const updated = bookmarkedEvents.filter((event) => event.id !== eventId)
    setBookmarkedEvents(updated)

    const bookmarkKey = `bookmarkedEvents_user_${user.id}`
    localStorage.setItem(bookmarkKey, JSON.stringify(updated))
  }

  if (loading || (!user && isLoading)) {
    return <div className="min-h-screen bg-cream" />
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-pixel text-2xl md:text-3xl text-dark-brown">
              Your Bookmarks
            </h1>
            <p className="mt-2 text-brown">
              Saved events appear here while you&apos;re logged in.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center justify-center bg-green text-cream px-4 py-3 font-pixel text-xs border-2 border-green hover:bg-dark-green"
          >
            Browse More Events
          </Link>
        </div>

        <div className="mb-6 bg-parchment border-2 border-brown px-4 py-3 text-dark-brown font-bold">
          {bookmarkedEvents.length} bookmarked event
          {bookmarkedEvents.length === 1 ? '' : 's'}
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <h2 className="font-pixel text-lg text-dark-brown mb-2">
              Loading bookmarks...
            </h2>
            <p className="text-brown">Fetching your saved events.</p>
          </div>
        ) : bookmarkedEvents.length === 0 ? (
          <div className="bg-white border-2 border-brown p-8 text-center">
            <div className="text-5xl mb-4">♡</div>
            <h2 className="font-pixel text-lg text-dark-brown mb-2">
              No bookmarks yet
            </h2>
            <p className="text-brown mb-5">
              Bookmark an event and it will appear here.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center justify-center bg-brown text-cream px-5 py-3 font-pixel text-xs border-2 border-brown hover:bg-light-brown"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookmarkedEvents.map((event) => {
              const category = normalizeCategory(event.category)

              return (
                <article
                  key={event.id}
                  className="h-full bg-parchment border-2 border-brown p-5 hover:bg-white transition-colors"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`${category.color} px-2 py-1 text-[10px] font-pixel text-white`}
                      >
                        {category.name}
                      </span>
                      <span className="text-[10px] font-pixel px-2 py-1 bg-sky text-dark-brown">
                        by {event.organizerName}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(event.id)}
                      className="text-brown hover:text-red-600 font-pixel text-[10px] border-2 border-brown px-2 py-1 bg-white hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>

                  <Link href={`/events/${event.id}`} className="block">
                    <h2 className="font-pixel text-sm text-dark-brown mb-3">
                      {event.name}
                    </h2>

                    <p className="text-sm text-brown mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm text-brown">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2" />
                        {new Date(event.date).toLocaleDateString()} • {event.time}
                      </div>

                      <div className="flex items-start">
                        <MapPin size={14} className="mr-2 mt-0.5" />
                        <span>{extractCityFromLocation(event.location)}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}