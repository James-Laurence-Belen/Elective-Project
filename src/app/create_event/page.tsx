'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PixelBorder } from '@/components/pixelborder'
import { categories } from '@/lib/categories'

declare global {
  interface Window {
    google: typeof google
  }
}

const today = new Date().toISOString().split('T')[0]
const currentTime = new Date().toTimeString().slice(0, 5)
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-places-script'

export default function AddEventPage() {
  const router = useRouter()

  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const mapRef = useRef<HTMLDivElement | null>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([])
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const [showMapModal, setShowMapModal] = useState(false)
  const [selectedLatLng, setSelectedLatLng] =
    useState<google.maps.LatLngLiteral | null>(null)
  const [mapAddress, setMapAddress] = useState('')
  const [mapLoadingAddress, setMapLoadingAddress] = useState(false)

  useEffect(() => {
    const initializeGoogleServices = () => {
      if (!window.google) return

      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current =
          new window.google.maps.places.AutocompleteService()
      }

      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder()
      }
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.warn('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
      return
    }

    if (window.google?.maps?.places) {
      initializeGoogleServices()
      return
    }

    const existingScript = document.getElementById(
      GOOGLE_MAPS_SCRIPT_ID,
    ) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogleServices)
      return () => {
        existingScript.removeEventListener('load', initializeGoogleServices)
      }
    }

    const script = document.createElement('script')
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.addEventListener('load', initializeGoogleServices)
    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', initializeGoogleServices)
    }
  }, [])

  useEffect(() => {
    if (!showMapModal || !mapRef.current || !window.google?.maps) return

    const defaultCenter = selectedLatLng || { lat: 14.5995, lng: 120.9842 } // Manila fallback

    const map = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: selectedLatLng ? 16 : 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    googleMapRef.current = map

    const marker = new window.google.maps.Marker({
      position: defaultCenter,
      map,
      draggable: false,
    })

    markerRef.current = marker
    setSelectedLatLng(defaultCenter)

    if (!mapAddress) {
      reverseGeocode(defaultCenter)
    }

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return

      const clicked = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }

      marker.setPosition(clicked)
      setSelectedLatLng(clicked)
      reverseGeocode(clicked)
    })
  }, [showMapModal])

  const reverseGeocode = (latLng: google.maps.LatLngLiteral) => {
    if (!geocoderRef.current) return

    setMapLoadingAddress(true)

    geocoderRef.current.geocode({ location: latLng }, (results, status) => {
      setMapLoadingAddress(false)

      if (status === 'OK' && results && results.length > 0) {
        setMapAddress(results[0].formatted_address)
      } else {
        setMapAddress(`${latLng.lat}, ${latLng.lng}`)
      }
    })
  }

  const handleLocationChange = (value: string) => {
    setLocation(value)

    if (!autocompleteServiceRef.current || !value.trim()) {
      setSuggestions([])
      return
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'ph' },
      },
      (predictions) => {
        setSuggestions(predictions || [])
      },
    )
  }

  const handleSelectSuggestion = (description: string) => {
    setLocation(description)
    setSuggestions([])
  }

  const openMapModal = () => {
    setShowMapModal(true)
    setSuggestions([])
  }

  const handleMapConfirm = () => {
    if (mapAddress) {
      setLocation(mapAddress)
    } else if (selectedLatLng) {
      setLocation(`${selectedLatLng.lat}, ${selectedLatLng.lng}`)
    }

    setShowMapModal(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')

  if (!name || !description || !category || !location || !time || !date) {
    setError('Please fill in all fields.')
    return
  }

  setSubmitting(true)
    console.log('FRONTEND EVENT DATA:', {
    name,
    description,
    category,
    location,
    date,
    time,
  })
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        category,
        location,
        date,
        time,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to create event.')
      return
    }

    setShowSuccessPopup(true)
    setName('')
    setDescription('')
    setCategory('')
    setLocation('')
    setSuggestions([])
    setTime('')
    setDate('')
    setMapAddress('')
    setSelectedLatLng(null)
  } catch (err) {
    setError('Network error. Please try again.')
  } finally {
    setSubmitting(false)
  }
}

  const handleSuccessClose = () => {
    setShowSuccessPopup(false)
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <h1 className="font-pixel text-2xl text-dark-brown mb-2">
            Add Event
          </h1>
          <p className="text-brown font-medium text-[12px]">
            Create an event for everyone
          </p>
        </div>

        <PixelBorder className="bg-parchment p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded font-pixel text-[11px]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">
                Event Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green"
                placeholder="Enter event name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green min-h-[120px] resize-none"
                placeholder="Enter event description"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-dark-brown mb-1">
                Location
              </label>

              <div className="relative">
                <input
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="w-full p-3 pr-12 bg-white border-2 border-brown focus:outline-none focus:border-green"
                  placeholder="Search place or enter address"
                  autoComplete="off"
                />

                <button
                  type="button"
                  onClick={openMapModal}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border-2 border-brown bg-cream hover:bg-green hover:text-cream text-dark-brown"
                  title="Pick location from map"
                >
                  📍
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-brown shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((place) => (
                    <button
                      key={place.place_id}
                      type="button"
                      onClick={() => handleSelectSuggestion(place.description)}
                      className="w-full text-left px-4 py-3 text-sm text-dark-brown hover:bg-cream border-b border-brown last:border-b-0"
                    >
                      {place.description}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark-brown mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                min={date === today ? currentTime : undefined}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 bg-green text-cream py-3 font-pixel text-xs pixel-border-sm ${
                  submitting
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-dark-green'
                }`}
              >
                {submitting ? 'Saving…' : 'Create Event'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-brown text-cream py-3 font-pixel text-xs pixel-border-sm hover:bg-light-brown"
              >
                Cancel
              </button>
            </div>
          </form>
        </PixelBorder>

        <p className="text-center mt-6">
          <Link
            href="/"
            className="text-brown hover:text-green font-pixel text-[10px] flex items-center justify-center gap-2"
          >
            <span>←</span> Back to Home
          </Link>
        </p>
      </div>

      {showMapModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl">
            <PixelBorder className="bg-parchment p-4 md:p-6">
              <h2 className="font-pixel text-lg text-dark-brown mb-3">
                Pick a Location
              </h2>

              <p className="text-brown text-[12px] mb-3">
                Click anywhere on the map to drop a pin.
              </p>

              <div
                ref={mapRef}
                className="w-full h-[350px] border-2 border-brown bg-white"
              />

              <div className="mt-3 p-3 border-2 border-brown bg-white min-h-[70px]">
                <p className="text-xs font-bold text-dark-brown mb-1">
                  Selected Address
                </p>
                <p className="text-sm text-brown break-words">
                  {mapLoadingAddress
                    ? 'Loading address...'
                    : mapAddress || 'No location selected yet.'}
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleMapConfirm}
                  className="flex-1 bg-green text-cream py-3 font-pixel text-xs pixel-border-sm hover:bg-dark-green"
                >
                  OK
                </button>

                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="flex-1 bg-brown text-cream py-3 font-pixel text-xs pixel-border-sm hover:bg-light-brown"
                >
                  Cancel
                </button>
              </div>
            </PixelBorder>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm">
            <PixelBorder className="bg-parchment p-6 text-center">
              <h2 className="font-pixel text-lg text-dark-brown mb-3">
                Success!
              </h2>
              <p className="text-brown font-medium text-[12px] mb-6">
                Event created successfully.
              </p>
              <button
                type="button"
                onClick={handleSuccessClose}
                className="w-full bg-green text-cream py-3 font-pixel text-xs pixel-border-sm hover:bg-dark-green"
              >
                OK
              </button>
            </PixelBorder>
          </div>
        </div>
      )}
    </div>
  )
}