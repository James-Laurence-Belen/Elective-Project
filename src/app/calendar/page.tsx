'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarView } from '@/components/calendarview'
import { PixelBorder } from '@/components/pixelborder'
import { events } from '@/lib/events'
import { categories } from '@/lib/categories'

type CalendarEvent = {
  id: string
  title: string
  description: string
  categoryId: string
  date: string
  time: string
  location: string
  city?: string
}

type BookmarkedEvent = {
  id: number | string
  organizerName?: string
  organizer?: string
  name?: string
  title?: string
  description?: string
  category?: string
  categoryId?: string
  location?: string
  date?: string
  time?: string
  city?: string
}

type AuthUser = {
  id: number
  email: string
  name?: string | null
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [bookmarkedEvents, setBookmarkedEvents] = useState<CalendarEvent[]>([])
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadBookmarkedEvents = async () => {
      try {
        const authRes = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!authRes.ok) {
          setCurrentUser(null)
          setBookmarkedEvents([])
          return
        }

        const authData = await authRes.json()
        const user: AuthUser | null = authData.user ?? null

        if (!user?.id) {
          setCurrentUser(null)
          setBookmarkedEvents([])
          return
        }

        setCurrentUser(user)

        const bookmarkKey = `bookmarkedEvents_user_${user.id}`
        const stored = localStorage.getItem(bookmarkKey)

        if (!stored) {
          setBookmarkedEvents([])
          return
        }

        const parsed: BookmarkedEvent[] = JSON.parse(stored)

        const normalized: CalendarEvent[] = parsed.map((event) => {
          const matchedCategory = categories.find(
            (cat) =>
              cat.id === event.categoryId ||
              cat.name.toLowerCase() === (event.category || '').toLowerCase(),
          )

          return {
            id: String(event.id),
            title: event.name || event.title || 'Untitled Event',
            description: event.description || 'No description available.',
            categoryId: matchedCategory?.id || categories[0]?.id || 'general',
            date: event.date || '',
            time: event.time || '',
            location: event.location || 'No location provided',
            city: event.city || '',
          }
        })

        setBookmarkedEvents(normalized)
      } catch (error) {
        console.error('Failed to load bookmarked events:', error)
        setBookmarkedEvents([])
        setCurrentUser(null)
      }
    }

    loadBookmarkedEvents()

    const handleStorageChange = () => {
      loadBookmarkedEvents()
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const staticEvents = useMemo<CalendarEvent[]>(() => {
    return events.map((event) => ({
      id: String(event.id),
      title: event.title,
      description: event.description,
      categoryId: event.categoryId,
      date: event.date,
      time: event.time,
      location: event.location,
      city: event.city || '',
    }))
  }, [])

  const allEvents = useMemo<CalendarEvent[]>(() => {
    const combined: CalendarEvent[] = [...staticEvents, ...bookmarkedEvents]

    const uniqueEvents = combined.filter(
      (event, index, self) =>
        index === self.findIndex((e) => String(e.id) === String(event.id)),
    )

    return uniqueEvents
  }, [staticEvents, bookmarkedEvents])

  const selectedEvents = allEvents.filter((event) => {
    const eventDate = new Date(event.date)

    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    )
  })

  const formattedSelectedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-pixel text-2xl md:text-3xl text-dark-brown mb-2">
            Town Calendar
          </h1>
          <p className="text-brown font-medium">
            See what is happening in the valley.
          </p>
          {currentUser && (
            <p className="text-xs text-brown mt-2">
              Showing your bookmarked events and local events.
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow lg:w-2/3">
            <CalendarView
              events={allEvents}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-1 text-xs font-bold text-dark-brown"
                >
                  <div
                    className={`w-3 h-3 ${cat.color} border border-dark-brown`}
                  ></div>
                  {cat.name}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/3">
            <PixelBorder className="bg-white p-6 h-full min-h-[400px]">
              <h2 className="font-pixel text-sm text-dark-brown mb-1">
                Events for
              </h2>

              <div className="text-lg font-bold text-green border-b-2 border-brown pb-4 mb-4">
                {formattedSelectedDate}
              </div>

              {selectedEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedEvents.map((event) => {
                    const cat = categories.find(
                      (category) => category.id === event.categoryId,
                    )

                    return (
                      <div
                        key={event.id}
                        onClick={() => router.push(`/events/${event.id}`)}
                        className="p-3 border-2 border-brown hover:bg-cream cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`text-[8px] font-pixel px-1.5 py-0.5 text-white ${cat?.color || 'bg-brown'}`}
                          >
                            {cat?.name || 'Event'}
                          </span>

                          <span className="text-xs font-bold text-brown">
                            {event.time}
                          </span>
                        </div>

                        <h3 className="font-bold text-dark-brown text-sm mb-1">
                          {event.title}
                        </h3>

                        <p className="text-xs text-brown truncate">
                          {event.location}
                          {event.city ? `, ${event.city}` : ''}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-brown">
                  <div className="text-3xl mb-2">🍃</div>
                  <p className="font-medium">
                    No events scheduled for this day.
                  </p>
                  <p className="text-sm mt-2">A perfect day to rest!</p>
                </div>
              )}
            </PixelBorder>
          </div>
        </div>
      </div>
    </div>
  )
}