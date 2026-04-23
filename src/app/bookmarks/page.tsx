'use client'

import React, { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Edit2, Trash2, X } from 'lucide-react'
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

type EditingEvent = DbEvent | null

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
  const [createdEvents, setCreatedEvents] = useState<DbEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<EditingEvent>(null)
  const [editFormData, setEditFormData] = useState<Partial<DbEvent>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, router, user])

  useEffect(() => {
    if (!user) {
      setBookmarkedEvents([])
      setCreatedEvents([])
      setIsLoading(false)
      return
    }

    const loadData = async () => {
      try {
        // Load bookmarked events from localStorage
        const bookmarkKey = `bookmarkedEvents_user_${user.id}`
        const saved = JSON.parse(
          localStorage.getItem(bookmarkKey) || '[]',
        ) as DbEvent[]
        setBookmarkedEvents(saved)

        // Load created events from API
        const response = await fetch('/api/events/my-events', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setCreatedEvents(data.events || [])
        }
      } catch (error) {
        console.error('Failed to load events:', error)
        setBookmarkedEvents([])
        setCreatedEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleRemoveBookmark = (eventId: number) => {
    if (!user) return

    const updated = bookmarkedEvents.filter((event) => event.id !== eventId)
    setBookmarkedEvents(updated)

    const bookmarkKey = `bookmarkedEvents_user_${user.id}`
    localStorage.setItem(bookmarkKey, JSON.stringify(updated))
  }

  const handleEditClick = (event: DbEvent) => {
    setEditingEvent(event)
    setEditFormData({
      name: event.name,
      description: event.description,
      category: event.category,
      location: event.location,
      date: event.date,
      time: event.time,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingEvent) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editFormData),
      })

      if (response.ok) {
        const data = await response.json()
        setCreatedEvents(
          createdEvents.map((e) =>
            e.id === editingEvent.id ? data.event : e
          )
        )
        setEditingEvent(null)
        setEditFormData({})
      } else {
        alert('Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Error updating event')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (eventId: number) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setCreatedEvents(createdEvents.filter((e) => e.id !== eventId))
        setDeleteConfirm(null)
      } else {
        alert('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Error deleting event')
    } finally {
      setIsDeleting(false)
    }
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
              Your Bookmarks & Events
            </h1>
            <p className="mt-2 text-brown">
              Manage your saved events and created events here.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center justify-center bg-green text-cream px-4 py-3 font-pixel text-xs border-2 border-green hover:bg-dark-green"
          >
            Browse More Events
          </Link>
        </div>

        {/* Created Events Section */}
        <div className="mb-12">
          <h2 className="font-pixel text-xl text-dark-brown mb-4">Your Created Events</h2>
          <div className="mb-6 bg-parchment border-2 border-brown px-4 py-3 text-dark-brown font-bold">
            {createdEvents.length} event{createdEvents.length === 1 ? '' : 's'} created
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <h2 className="font-pixel text-lg text-dark-brown mb-2">
                Loading your events...
              </h2>
              <p className="text-brown">Fetching your created events.</p>
            </div>
          ) : createdEvents.length === 0 ? (
            <div className="bg-white border-2 border-brown p-8 text-center">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="font-pixel text-lg text-dark-brown mb-2">
                No events created yet
              </h2>
              <p className="text-brown mb-5">
                Create an event to share with the community.
              </p>
              <Link
                href="/create_event"
                className="inline-flex items-center justify-center bg-brown text-cream px-5 py-3 font-pixel text-xs border-2 border-brown hover:bg-light-brown"
              >
                Create Event
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {createdEvents.map((event) => {
                const category = normalizeCategory(event.category)
                const isDeleting = deleteConfirm === event.id

                return (
                  <article
                    key={event.id}
                    className="h-full bg-white border-2 border-green p-5 hover:bg-cream transition-colors relative"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`${category.color} px-2 py-1 text-[10px] font-pixel text-white`}
                        >
                          {category.name}
                        </span>
                        <span className="text-[10px] font-pixel px-2 py-1 bg-green text-white">
                          YOUR EVENT
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(event)}
                          className="text-brown hover:text-green font-pixel text-[10px] border-2 border-brown px-2 py-1 bg-white hover:bg-cream"
                          title="Edit event"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(event.id)}
                          className="text-brown hover:text-red-600 font-pixel text-[10px] border-2 border-brown px-2 py-1 bg-white hover:bg-red-50"
                          title="Delete event"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {deleteConfirm === event.id && (
                      <div className="absolute inset-0 bg-white/95 border-2 border-red-600 flex flex-col items-center justify-center p-4">
                        <p className="font-pixel text-sm text-dark-brown mb-3">
                          Delete this event?
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(event.id)}
                            disabled={isDeleting}
                            className="bg-red-600 text-white px-3 py-1 font-pixel text-xs border-2 border-red-600 hover:bg-red-700 disabled:opacity-60"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="bg-brown text-white px-3 py-1 font-pixel text-xs border-2 border-brown hover:bg-dark-brown"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

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
                          {new Date(event.date).toLocaleDateString()} •{' '}
                          {event.time}
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

        {/* Bookmarked Events Section */}
        <div>
          <h2 className="font-pixel text-xl text-dark-brown mb-4">Bookmarked Events</h2>
          <div className="mb-6 bg-parchment border-2 border-brown px-4 py-3 text-dark-brown font-bold">
            {bookmarkedEvents.length} bookmarked event
            {bookmarkedEvents.length === 1 ? '' : 's'}
          </div>

          {bookmarkedEvents.length === 0 ? (
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
                          {new Date(event.date).toLocaleDateString()} •{' '}
                          {event.time}
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

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-cream border-4 border-brown p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-pixel text-lg text-dark-brown">Edit Event</h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-brown hover:text-dark-brown"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-pixel text-sm text-dark-brown mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full border-2 border-brown px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block font-pixel text-sm text-dark-brown mb-1">
                  Description
                </label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full border-2 border-brown px-3 py-2 text-sm min-h-[100px]"
                />
              </div>

              <div>
                <label className="block font-pixel text-sm text-dark-brown mb-1">
                  Category
                </label>
                <select
                  value={editFormData.category || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, category: e.target.value })
                  }
                  className="w-full border-2 border-brown px-3 py-2 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-pixel text-sm text-dark-brown mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editFormData.location || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, location: e.target.value })
                  }
                  className="w-full border-2 border-brown px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-sm text-dark-brown mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.date || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, date: e.target.value })
                    }
                    className="w-full border-2 border-brown px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-sm text-dark-brown mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={editFormData.time || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, time: e.target.value })
                    }
                    className="w-full border-2 border-brown px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 bg-green text-cream px-4 py-2 font-pixel text-sm border-2 border-green hover:bg-dark-green disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditingEvent(null)}
                  className="flex-1 bg-brown text-cream px-4 py-2 font-pixel text-sm border-2 border-brown hover:bg-dark-brown"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}