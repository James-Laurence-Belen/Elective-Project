'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchBar } from '@/components/searchbar'
import { EventCard } from '@/components/eventcard'
import { events } from '@/lib/events'
import { categories } from '@/lib/categories'

function EventsPageContent() {
  const searchParams = useSearchParams()
  const [filteredEvents, setFilteredEvents] = useState(events)

  const query = searchParams.get('q') || ''
  const city = searchParams.get('city') || 'All Locations'
  const category = searchParams.get('category') || 'all'
  const sort = searchParams.get('sort') || 'date'

  useEffect(() => {
    let result = [...events]

    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(lowerQuery) ||
          e.description.toLowerCase().includes(lowerQuery),
      )
    }

    // Filter by city
    if (city && city !== 'All Locations') {
      result = result.filter((e) => e.city === city)
    }

    // Filter by category
    if (category && category !== 'all') {
      result = result.filter((e) => e.categoryId === category)
    }

    // Sort
    result.sort((a, b) => {
      if (sort === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sort === 'popularity') {
        return b.attendeesCount - a.attendeesCount
      } else if (sort === 'price-low') {
        return a.price - b.price
      }
      return 0
    })

    setFilteredEvents(result)
  }, [query, city, category, sort])

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-pixel text-2xl md:text-3xl text-dark-brown mb-6">
            Find Events
          </h1>
          <SearchBar
            initialQuery={query}
            initialCity={city}
            initialCategory={category}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-parchment p-4 border-2 border-brown">
          <div className="text-dark-brown font-bold mb-4 sm:mb-0">
            Found {filteredEvents.length} event
            {filteredEvents.length !== 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="sort"
              className="text-sm font-bold text-brown"
            >
              Sort by:
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams)
                params.set('sort', e.target.value)
                window.history.pushState({}, '', `?${params.toString()}`)
              }}
              className="bg-white border-2 border-brown px-3 py-1 focus:outline-none focus:border-green text-sm"
            >
              <option value="date">Upcoming Date</option>
              <option value="popularity">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(query || city !== 'All Locations' || category !== 'all') && (
          <div className="flex flex-wrap gap-2 mb-6">
            {query && (
              <span className="bg-light-brown text-white px-3 py-1 text-xs font-bold rounded-full">
                "{query}"
              </span>
            )}
            {city !== 'All Locations' && (
              <span className="bg-sky text-dark-brown px-3 py-1 text-xs font-bold rounded-full">
                📍 {city}
              </span>
            )}
            {category !== 'all' && (
              <span className="bg-green text-white px-3 py-1 text-xs font-bold rounded-full">
                🏷️ {categories.find((c) => c.id === category)?.name}
              </span>
            )}
          </div>
        )}

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
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