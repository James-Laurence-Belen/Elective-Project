'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { categories } from '@/lib/categories'
import { CategoryCard } from '@/components/categorycard'
import { PixelBorder } from '@/components/pixelborder'

declare global {
  interface Window {
    google: any
  }
}

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-home-geocoder-script'

type DbEvent = {
  id: number
  organizerName: string
  name: string
  description: string
  category: string
  location: string
  date: string
  time: string
  createdAt?: string
  updatedAt?: string
}

type HomeEvent = DbEvent & {
  city: string
  categoryId: string
  categoryName: string
  distanceKm: number | null
  image: string
}

type AuthUser = {
  id: number
  email: string
  name?: string | null
}

type UserCoords = {
  lat: number
  lng: number
} | null

function normalizeCategory(raw: string) {
  const value = raw.trim().toLowerCase()

  const byId = categories.find((c) => c.id.toLowerCase() === value)
  if (byId) {
    return {
      categoryId: byId.id,
      categoryName: byId.name,
      color: byId.color,
    }
  }

  const byName = categories.find((c) => c.name.toLowerCase() === value)
  if (byName) {
    return {
      categoryId: byName.id,
      categoryName: byName.name,
      color: byName.color,
    }
  }

  return {
    categoryId: raw,
    categoryName: raw,
    color: 'bg-brown',
  }
}

function extractCityFromLocation(location: string) {
  const parts = location
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length >= 2) {
    return parts[parts.length - 2]
  }

  return parts[0] || 'Unknown'
}

function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const R = 6371

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

async function loadGoogleMaps(): Promise<void> {
  if (
    window.google?.maps?.Geocoder &&
    window.google?.maps?.places?.PlacesService
  ) {
    return
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_MAPS_SCRIPT_ID,
    ) as HTMLScriptElement | null

    const waitForGoogleMaps = () => {
      let attempts = 0
      const maxAttempts = 50

      const check = () => {
        if (
          window.google?.maps?.Geocoder &&
          window.google?.maps?.places?.PlacesService
        ) {
          resolve()
          return
        }

        attempts++

        if (attempts >= maxAttempts) {
          reject(new Error('Google Maps Places library failed to load'))
          return
        }

        setTimeout(check, 200)
      }

      check()
    }

    if (existingScript) {
      waitForGoogleMaps()
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      waitForGoogleMaps()
    }

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps'))
    }

    document.head.appendChild(script)
  })
}

async function getPlacePhotoByAddress(address: string): Promise<string> {
  try {
    await loadGoogleMaps()

    return await new Promise((resolve) => {
      const container = document.createElement('div')
      const service = new window.google.maps.places.PlacesService(container)

      service.textSearch(
        { query: address },
        (results: any[] | null, status: string) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results.length > 0
          ) {
            const placeWithPhoto = results.find(
              (place: any) => place.photos && place.photos.length > 0,
            )

            if (placeWithPhoto?.photos?.[0]) {
              resolve(
                placeWithPhoto.photos[0].getUrl({
                  maxWidth: 900,
                  maxHeight: 500,
                }),
              )
              return
            }
          }

          resolve('')
        },
      )
    })
  } catch (error) {
    console.error('FAILED TO LOAD PLACE PHOTO:', error)
    return ''
  }
}

export default function HomePage() {
  const [activeEventCount, setActiveEventCount] = useState(0)
  const [playerCount, setPlayerCount] = useState(0)
  const [townCount, setTownCount] = useState(0)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  )

  const [events, setEvents] = useState<DbEvent[]>([])
  const [recommendedEvents, setRecommendedEvents] = useState<HomeEvent[]>([])
  const [bookmarkedEvents, setBookmarkedEvents] = useState<DbEvent[]>([])
  const [userCoords, setUserCoords] = useState<UserCoords>(null)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const eventRes = await fetch('/api/events/count')
        const eventData = await eventRes.json()

        if (eventRes.ok) {
          setActiveEventCount(eventData.count)
        }

        const userRes = await fetch('/api/users/count')
        const userData = await userRes.json()

        if (userRes.ok) {
          setPlayerCount(userData.count)
        }

        const cityRes = await fetch('/api/events/city-count')
        const cityData = await cityRes.json()

        if (cityRes.ok) {
          setTownCount(cityData.count)
        }

        const categoryRes = await fetch('/api/events/category-count')
        const categoryData = await categoryRes.json()

        if (categoryRes.ok) {
          const normalizedCounts: Record<string, number> = {}

          Object.entries(categoryData.categoryCounts || {}).forEach(
            ([key, value]) => {
              normalizedCounts[key.trim().toLowerCase()] = Number(value)
            },
          )

          setCategoryCounts(normalizedCounts)
        }
      } catch (err) {
        console.error('FAILED TO FETCH COUNTS:', err)
      }
    }

    fetchCounts()
  }, [])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events', {
          method: 'GET',
          credentials: 'include',
        })

        const data = await res.json()

        if (res.ok) {
          setEvents(data.events || [])
        }
      } catch (err) {
        console.error('FAILED TO FETCH EVENTS:', err)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        if (!res.ok) {
          setCurrentUser(null)
          setBookmarkedEvents([])
          return
        }

        const data = await res.json()
        const user: AuthUser | null = data.user ?? null
        setCurrentUser(user)

        if (!user?.id) {
          setBookmarkedEvents([])
          return
        }

        const bookmarkKey = `bookmarkedEvents_user_${user.id}`
        const saved = JSON.parse(
          localStorage.getItem(bookmarkKey) || '[]',
        ) as DbEvent[]

        setBookmarkedEvents(saved)
      } catch (err) {
        console.error('FAILED TO FETCH CURRENT USER:', err)
        setCurrentUser(null)
        setBookmarkedEvents([])
      }
    }

    fetchCurrentUser()

    const handleStorageChange = () => {
      fetchCurrentUser()
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        setUserCoords(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }, [])

  useEffect(() => {
    const buildRecommendedEvents = async () => {
      if (!events.length) {
        setRecommendedEvents([])
        return
      }

      const initialEvents = [...events]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3)

      const initialCards: HomeEvent[] = initialEvents.map((event) => {
        const normalized = normalizeCategory(event.category)

        return {
          ...event,
          city: extractCityFromLocation(event.location),
          categoryId: normalized.categoryId,
          categoryName: normalized.categoryName,
          distanceKm: null,
          image: '',
        }
      })

      setRecommendedEvents(initialCards)

      const cardsWithPhotos = await Promise.all(
        initialCards.map(async (event) => ({
          ...event,
          image: await getPlacePhotoByAddress(event.location),
        })),
      )

      setRecommendedEvents(cardsWithPhotos)

      if (!userCoords) return

      try {
        await loadGoogleMaps()
        const geocoder = new window.google.maps.Geocoder()

        const geocodeLocation = async (address: string) => {
          return new Promise<{ lat: number; lng: number } | null>((resolve) => {
            geocoder.geocode(
              { address },
              (results: any[] | null, status: string) => {
                if (
                  status === 'OK' &&
                  results &&
                  results.length > 0 &&
                  results[0].geometry?.location
                ) {
                  const loc = results[0].geometry.location
                  resolve({
                    lat: loc.lat(),
                    lng: loc.lng(),
                  })
                } else {
                  resolve(null)
                }
              },
            )
          })
        }

        const enriched = await Promise.all(
          events.map(async (event) => {
            const normalized = normalizeCategory(event.category)
            const city = extractCityFromLocation(event.location)
            const coords = await geocodeLocation(event.location)

            let distanceKm: number | null = null
            if (coords) {
              distanceKm = haversineDistanceKm(
                userCoords.lat,
                userCoords.lng,
                coords.lat,
                coords.lng,
              )
            }

            return {
              ...event,
              city,
              categoryId: normalized.categoryId,
              categoryName: normalized.categoryName,
              distanceKm,
              image: '',
            }
          }),
        )

        const nearest = [...enriched]
          .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
          .slice(0, 3)

        const nearestWithPhotos = await Promise.all(
          nearest.map(async (event) => ({
            ...event,
            image: await getPlacePhotoByAddress(event.location),
          })),
        )

        setRecommendedEvents(nearestWithPhotos)
      } catch (err) {
        console.error('FAILED TO BUILD RECOMMENDED EVENTS:', err)
      }
    }

    buildRecommendedEvents()
  }, [events, userCoords])

  const upcomingBookmarkedEvents = useMemo(() => {
    return [...bookmarkedEvents]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6)
  }, [bookmarkedEvents])

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="relative bg-gradient-to-b from-sky to-cream pt-20 pb-16 px-4 border-b-4 border-dark-brown overflow-hidden">
        <div
          className="absolute top-10 left-10 text-4xl opacity-50 animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          ☁️
        </div>

        <div
          className="absolute top-20 right-20 text-4xl opacity-50 animate-bounce"
          style={{ animationDuration: '4s' }}
        >
          ☁️
        </div>

        <div className="absolute bottom-10 left-1/4 text-2xl">🌿</div>
        <div className="absolute bottom-5 right-1/4 text-2xl">🍄</div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at top left, rgba(255,255,255,0.35) 0%, transparent 35%), radial-gradient(circle at bottom right, rgba(255,255,255,0.25) 0%, transparent 30%)',
          }}
        />

        <div className="absolute inset-0 bg-white/10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-pixel text-3xl md:text-5xl text-dark-brown mb-6 leading-tight">
            Discover Local <br />
            <span className="text-green text-shadow-pixel">Magic</span>
          </h1>

          <p className="text-lg md:text-xl text-brown mb-10 max-w-2xl mx-auto font-medium">
            Find festivals, markets, and gatherings in your community.
            Your next adventure awaits near you.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/events"
              className="w-48 flex items-center justify-center bg-green hover:bg-dark-green text-cream px-8 py-4 font-pixel text-xs rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explore Events
            </Link>

            <Link
              href="/create_event"
              className="w-48 flex items-center justify-center border-2 border-green text-green bg-transparent hover:bg-green/10 px-8 py-4 font-pixel text-xs rounded-xl transition-all duration-300"
            >
              Create Event
            </Link>

            <Link
              href="/calendar"
              className="w-48 flex items-center justify-center bg-brown hover:bg-dark-brown text-cream px-8 py-4 font-pixel text-xs rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            >
              View Calendar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20 mb-16">
        <PixelBorder className="bg-parchment p-6 flex flex-col md:flex-row justify-around items-center gap-6">
          <div className="text-center">
            <div className="font-pixel text-xl text-dark-green text-ligher-shadow-pixel mb-2">
              {activeEventCount}
            </div>
            <div className="text-sm text-dark-brown font-bold uppercase tracking-wider">
              Active Events
            </div>
          </div>

          <div className="hidden md:block w-1 h-12 bg-brown/30"></div>

          <div className="text-center">
            <div className="font-pixel text-xl text-dark-green text-ligher-shadow-pixel mb-2">
              {townCount}
            </div>
            <div className="text-sm text-dark-brown font-bold uppercase tracking-wider">
              Cities
            </div>
          </div>

          <div className="hidden md:block w-1 h-12 bg-brown/30"></div>

          <div className="text-center">
            <div className="font-pixel text-xl text-dark-green text-ligher-shadow-pixel mb-2">
              {playerCount}
            </div>
            <div className="text-sm text-dark-brown font-bold uppercase tracking-wider">
              People
            </div>
          </div>
        </PixelBorder>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        <section>
          <h2 className="font-pixel text-xl text-dark-brown mb-8 text-center">
            Browse by Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const count =
                categoryCounts[category.id.toLowerCase()] ??
                categoryCounts[category.name.toLowerCase()] ??
                0

              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  eventCount={count}
                />
              )
            })}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-pixel text-xl text-dark-brown">
                Recommended Events
              </h2>
              <p className="text-sm text-brown mt-2">
                {userCoords
                  ? 'Showing events near your current location.'
                  : 'Allow location for nearby recommendations. Showing upcoming events for now.'}
              </p>
            </div>

            <Link
              href="/events"
              className="text-green hover:text-dark-green font-bold text-sm underline decoration-2 underline-offset-4"
            >
              View All
            </Link>
          </div>

          {recommendedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendedEvents.map((event) => {
                const category = categories.find(
                  (c) => c.id === event.categoryId,
                )

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block"
                  >
                    <PixelBorder
                      interactive
                      className="bg-white hover:bg-cream p-4 h-full"
                    >
                      <div className="w-full h-44 mb-4 bg-parchment border-2 border-brown overflow-hidden flex items-center justify-center">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.name}
                            loading="eager"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-brown text-sm font-bold">
                            Loading image...
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className={`text-[10px] font-pixel px-2 py-1 text-white ${
                            category?.color || 'bg-brown'
                          }`}
                        >
                          {category?.name || event.categoryName}
                        </span>

                        {event.distanceKm !== null && (
                          <span className="text-[10px] font-pixel px-2 py-1 bg-green text-white">
                            {event.distanceKm.toFixed(1)} km away
                          </span>
                        )}
                      </div>

                      <h3 className="font-pixel text-sm text-dark-brown mb-2">
                        {event.name}
                      </h3>

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
                          <span>{event.city}</span>
                        </div>
                      </div>
                    </PixelBorder>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border-2 border-brown p-8 text-center">
              <div className="text-5xl mb-4">📌</div>
              <h3 className="font-pixel text-lg text-dark-brown mb-2">
                No recommended events yet
              </h3>
              <p className="text-brown">
                Check back after more events are added.
              </p>
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-pixel text-xl text-dark-brown">
                Upcoming Gatherings
              </h2>
              <p className="text-sm text-brown mt-2">
                {currentUser
                  ? 'Your bookmarked events appear here.'
                  : 'Log in and bookmark events to see them here.'}
              </p>
            </div>

            <Link
              href="/bookmarks"
              className="text-green hover:text-dark-green font-bold text-sm underline decoration-2 underline-offset-4"
            >
              View Bookmarks
            </Link>
          </div>

          {upcomingBookmarkedEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookmarkedEvents.map((event) => {
                const normalized = normalizeCategory(event.category)
                const dateObj = new Date(event.date)

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block"
                  >
                    <PixelBorder
                      interactive
                      className="p-4 flex flex-col md:flex-row gap-4 items-center bg-white hover:bg-cream"
                    >
                      <div className="flex-shrink-0 w-full md:w-32 h-32 md:h-24 bg-parchment border-2 border-brown flex items-center justify-center text-3xl">
                        📌
                      </div>

                      <div className="flex-grow min-w-0 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                          <span
                            className={`text-[10px] font-pixel px-2 py-1 text-white ${
                              normalized.color || 'bg-brown'
                            }`}
                          >
                            {normalized.categoryName}
                          </span>
                        </div>

                        <h3 className="font-pixel text-sm text-dark-brown mb-2 truncate">
                          {event.name}
                        </h3>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-brown">
                          <span className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {dateObj.toLocaleDateString()}
                          </span>

                          <span className="flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {extractCityFromLocation(event.location)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <button className="bg-brown hover:bg-dark-brown text-cream px-4 py-2 font-pixel text-[10px] pixel-border-sm transition-colors w-full md:w-auto">
                          Details
                        </button>
                      </div>
                    </PixelBorder>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border-2 border-brown p-8 text-center">
              <div className="text-5xl mb-4">♡</div>
              <h3 className="font-pixel text-lg text-dark-brown mb-2">
                No bookmarked events yet
              </h3>
              <p className="text-brown mb-5">
                Bookmark events and they will appear here.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center justify-center bg-brown text-cream px-5 py-3 font-pixel text-xs border-2 border-brown hover:bg-light-brown"
              >
                Explore Events
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}