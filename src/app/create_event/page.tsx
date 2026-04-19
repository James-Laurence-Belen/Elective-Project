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

  useEffect(() => {
    const initializeAutocompleteService = () => {
      if (!window.google || autocompleteServiceRef.current) return

      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService()
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.warn('Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY')
      return
    }

    if (window.google?.maps?.places) {
      initializeAutocompleteService()
      return
    }

    const existingScript = document.getElementById(
      GOOGLE_MAPS_SCRIPT_ID,
    ) as HTMLScriptElement | null

    if (existingScript) {
      existingScript.addEventListener('load', initializeAutocompleteService)
      return () => {
        existingScript.removeEventListener(
          'load',
          initializeAutocompleteService,
        )
      }
    }

    const script = document.createElement('script')
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.addEventListener('load', initializeAutocompleteService)
    document.head.appendChild(script)

    return () => {
      script.removeEventListener('load', initializeAutocompleteService)
    }
  }, [])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name || !description || !category || !location || !time || !date) {
      setError('Please fill in all fields.')
      return
    }

    setSubmitting(true)

    setTimeout(() => {
      setSubmitting(false)
      setShowSuccessPopup(true)
      setName('')
      setDescription('')
      setCategory('')
      setLocation('')
      setSuggestions([])
      setTime('')
      setDate('')
    }, 1000)
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
                Name
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
              <input
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="w-full p-3 bg-white border-2 border-brown focus:outline-none focus:border-green"
                placeholder="Search place or enter address"
                autoComplete="off"
              />

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