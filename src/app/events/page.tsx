'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import { Calendar, MapPin, Tag, LocateFixed } from 'lucide-react'
import { SearchBar } from '@/components/searchbar'
import { categories } from '@/lib/categories'

declare global {
  interface Window {
    google: typeof google
  }
}

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-geocoder-script'

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

type EnrichedEvent = DbEvent & {
  categoryId: string
  categoryName: string
  city: string
  distanceKm: number | null
  coordinates?: {
    lat: number
    lng: number
  } | null
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
    }
  }

  const byName = categories.find((c) => c.name.toLowerCase() === value)
  if (byName) {
    return {
      categoryId: byName.id,
      categoryName: byName.name,
    }
  }

  return {
    categoryId: raw,
    categoryName: raw,
  }
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
  if (window.google?.maps?.Geocoder) return

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_MAPS_SCRIPT_ID,
    ) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google Maps')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

function EventsPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') || ''
  const cityParam = searchParams.get('city') || ''
  const category = searchParams.get('category') || 'all'
  const sort = searchParams.get('sort') || 'distance'

  const [events, setEvents] = useState<DbEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<EnrichedEvent[]>([])
  const [userCoords, setUserCoords] = useState<UserCoords>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLocating, setIsLocating] = useState(false)
  const [locationAsked, setLocationAsked] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)
  const [error, setError] = useState('')
  const [autoCity, setAutoCity] = useState('')

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === '' || value === 'all' || value === 'All Locations') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    const next = params.toString()
    router.push(next ? `${pathname}?${next}` : pathname)
  }

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)

        const res = await fetch('/api/events', {
          method: 'GET',
          credentials: 'include',
        })

        const data = await res.json()

        console.log('EVENT LIST RESPONSE:', data)

        if (!res.ok) {
          setError(data.error || 'Failed to load events.')
          return
        }

        setEvents(data.events || [])
      } catch (err) {
        console.error('FETCH EVENTS ERROR:', err)
        setError('Failed to load events.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const requestCurrentLocation = () => {
    setLocationAsked(true)
    setLocationDenied(false)

    if (!navigator.geolocation) {
      setLocationDenied(true)
      setError('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationDenied(false)
        setIsLocating(false)
      },
      (err) => {
        console.error('GEOLOCATION ERROR:', err)
        setLocationDenied(true)
        setIsLocating(false)

        if (err.code === err.PERMISSION_DENIED) {
          setError('Location access was denied. Please allow location permission and try again.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Your location is unavailable right now.')
        } else if (err.code === err.TIMEOUT) {
          setError('Getting your location timed out. Please try again.')
        } else {
          setError('Failed to get your current location.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    )
  }

  useEffect(() => {
    const enrichEvents = async () => {
      if (!events.length) {
        setFilteredEvents([])
        return
      }

      try {
        await loadGoogleMaps()
        const geocoder = new window.google.maps.Geocoder()

        const geocodeLocation = async (address: string) => {
          return new Promise<{ lat: number; lng: number } | null>((resolve) => {
            geocoder.geocode({ address }, (results, status) => {
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
            })
          })
        }

        const enriched = await Promise.all(
          events.map(async (event) => {
            const normalized = normalizeCategory(event.category)
            const city = extractCityFromLocation(event.location)
            const coords = await geocodeLocation(event.location)

            let distanceKm: number | null = null
            if (coords && userCoords) {
              distanceKm = haversineDistanceKm(
                userCoords.lat,
                userCoords.lng,
                coords.lat,
                coords.lng,
              )
            }

            return {
              ...event,
              categoryId: normalized.categoryId,
              categoryName: normalized.categoryName,
              city,
              distanceKm,
              coordinates: coords,
            }
          }),
        )

        let result = [...enriched]

        if (query) {
          const lowerQuery = query.toLowerCase()
          result = result.filter(
            (e) =>
              e.name.toLowerCase().includes(lowerQuery) ||
              e.description.toLowerCase().includes(lowerQuery) ||
              e.location.toLowerCase().includes(lowerQuery) ||
              e.organizerName.toLowerCase().includes(lowerQuery),
          )
        }

        let effectiveCity = cityParam

        if (!effectiveCity && userCoords) {
          const nearestWithDistance = result
            .filter((e) => e.distanceKm !== null)
            .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))

          if (nearestWithDistance.length > 0) {
            effectiveCity = nearestWithDistance[0].city
            setAutoCity(nearestWithDistance[0].city)
          }
        } else if (!cityParam) {
          setAutoCity('')
        }

        if (effectiveCity && effectiveCity !== 'All Locations') {
          result = result.filter(
            (e) => e.city.toLowerCase() === effectiveCity.toLowerCase(),
          )
        }

        if (category && category !== 'all') {
          result = result.filter(
            (e) =>
              e.categoryId.toLowerCase() === category.toLowerCase() ||
              e.categoryName.toLowerCase() === category.toLowerCase(),
          )
        }

        result.sort((a, b) => {
          if (sort === 'date') {
            const aDate = new Date(`${a.date}T${a.time || '00:00'}`).getTime()
            const bDate = new Date(`${b.date}T${b.time || '00:00'}`).getTime()
            return aDate - bDate
          }

          if (sort === 'distance') {
            return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
          }

          if (sort === 'category') {
            return a.categoryName.localeCompare(b.categoryName)
          }

          return 0
        })

        setFilteredEvents(result)
      } catch (err) {
        console.error('ENRICH EVENTS ERROR:', err)
        setError('Failed to process event locations.')
      }
    }

    if (!isLoading) {
      enrichEvents()
    }
  }, [events, query, cityParam, category, sort, userCoords, isLoading])

  const activeCityLabel = useMemo(() => {
    if (cityParam) return cityParam
    if (autoCity) return autoCity
    return 'All Locations'
  }, [cityParam, autoCity])

  const cityOptions = useMemo(() => {
    const set = new Set<string>()
    set.add('All Locations')

    events.forEach((event) => {
      const city = extractCityFromLocation(event.location)
      if (city) set.add(city)
    })

    return Array.from(set)
  }, [events])

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-pixel text-2xl md:text-3xl text-dark-brown mb-6">
            Find Events
          </h1>

          <SearchBar
            initialQuery={query}
            initialCity={cityParam || autoCity || 'All Locations'}
            initialCategory={category}
            initialSort={sort}
            cityOptions={cityOptions}
          />
        </div>

        <div className="mb-6 bg-parchment p-4 border-2 border-brown">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-dark-brown font-bold">
                Found {filteredEvents.length} event
                {filteredEvents.length !== 1 ? 's' : ''}
              </div>
              <div className="text-sm text-brown mt-1">
                {userCoords
                  ? 'Showing nearest events based on your current location.'
                  : 'Use your current location to automatically show nearby events.'}
              </div>
            </div>

            <button
              type="button"
              onClick={requestCurrentLocation}
              disabled={isLocating}
              className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-green font-pixel text-xs ${
                isLocating
                  ? 'opacity-60 cursor-not-allowed bg-green text-cream'
                  : 'bg-white text-green hover:bg-green hover:text-cream'
              }`}
            >
              <LocateFixed size={14} />
              {isLocating
                ? 'Getting Location...'
                : userCoords
                  ? 'Refresh My Location'
                  : 'Use My Current Location'}
            </button>
          </div>
        </div>

        {(query || category !== 'all' || cityParam || autoCity || userCoords) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {query && (
              <span className="bg-light-brown text-white px-3 py-1 text-xs font-bold rounded-full">
                "{query}"
              </span>
            )}

            {(cityParam || autoCity) && (
              <span className="bg-sky text-dark-brown px-3 py-1 text-xs font-bold rounded-full">
                📍 {activeCityLabel}
              </span>
            )}

            {userCoords && (
              <span className="bg-green text-white px-3 py-1 text-xs font-bold rounded-full">
                📌 Using Current Location
              </span>
            )}

            {category !== 'all' && (
              <span className="bg-green text-white px-3 py-1 text-xs font-bold rounded-full">
                🏷️ {categories.find((c) => c.id === category)?.name || category}
              </span>
            )}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3">
            {error}
          </div>
        )}

        {!locationAsked && !userCoords && (
          <div className="mb-8 bg-white border-2 border-brown p-6 text-center">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="font-pixel text-lg text-dark-brown mb-2">
              Use your current location
            </h3>
            <p className="text-brown mb-4">
              Allow location access so we can show the closest events near you and display how far each event is.
            </p>
            <button
              type="button"
              onClick={requestCurrentLocation}
              className="bg-green text-cream px-6 py-3 font-pixel text-xs border-2 border-green hover:bg-dark-green"
            >
              Allow My Location
            </button>
          </div>
        )}

        {locationDenied && !userCoords && (
          <div className="mb-8 bg-white border-2 border-brown p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-pixel text-lg text-dark-brown mb-2">
              Location access is needed
            </h3>
            <p className="text-brown mb-4">
              Please allow location permission in your browser, then try again.
            </p>
            <button
              type="button"
              onClick={requestCurrentLocation}
              className="bg-green text-cream px-6 py-3 font-pixel text-xs border-2 border-green hover:bg-dark-green"
            >
              Try Again
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🧭</div>
            <h3 className="font-pixel text-xl text-dark-brown mb-2">
              Loading events...
            </h3>
            <p className="text-brown">
              Please wait while we load the events.
            </p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const categoryMeta = categories.find(
                (c) => c.id === event.categoryId,
              )

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block"
                >
                  <div className="bg-parchment border-2 border-brown p-4 h-full hover:bg-cream transition-colors">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span
                        className={`text-[10px] font-pixel px-2 py-1 text-white ${
                          categoryMeta?.color || 'bg-brown'
                        }`}
                      >
                        {event.categoryName}
                      </span>

                      <span className="text-[10px] font-pixel px-2 py-1 bg-sky text-dark-brown">
                        by {event.organizerName}
                      </span>
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
                        <span>{event.location}</span>
                      </div>

                      <div className="flex items-center">
                        <Tag size={14} className="mr-2" />
                        <span>{event.city}</span>
                      </div>

                      <div className="font-bold text-dark-green">
                        {event.distanceKm !== null
                          ? `${event.distanceKm.toFixed(1)} km away`
                          : userCoords
                            ? 'Distance unavailable'
                            : 'Enable location to see distance'}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍂</div>
            <h3 className="font-pixel text-xl text-dark-brown mb-2">
              No events found
            </h3>
            <p className="text-brown">
              Try adjusting your search filters or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <EventsPageContent />
    </Suspense>
  )
}