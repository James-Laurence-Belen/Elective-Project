'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, MapPin, Filter, ArrowUpDown } from 'lucide-react'
import { categories } from '@/lib/categories'

type SearchBarProps = {
  initialQuery?: string
  initialCity?: string
  initialCategory?: string
  initialSort?: string
  cityOptions?: string[]
}

export function SearchBar({
  initialQuery = '',
  initialCity = 'All Locations',
  initialCategory = 'all',
  initialSort = 'distance',
  cityOptions = ['All Locations'],
}: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(initialQuery)
  const [city, setCity] = useState(initialCity || 'All Locations')
  const [category, setCategory] = useState(initialCategory || 'all')
  const [sort, setSort] = useState(initialSort || 'distance')

  useEffect(() => {
    setQuery(initialQuery || '')
  }, [initialQuery])

  useEffect(() => {
    setCity(initialCity || 'All Locations')
  }, [initialCity])

  useEffect(() => {
    setCategory(initialCategory || 'all')
  }, [initialCategory])

  useEffect(() => {
    setSort(initialSort || 'distance')
  }, [initialSort])

  const uniqueCities = useMemo(() => {
    const set = new Set<string>()
    set.add('All Locations')

    cityOptions.forEach((city) => {
      if (city && city.trim()) {
        set.add(city)
      }
    })

    return Array.from(set)
  }, [cityOptions])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }

    if (city && city !== 'All Locations') {
      params.set('city', city)
    } else {
      params.delete('city')
    }

    if (category && category !== 'all') {
      params.set('category', category)
    } else {
      params.delete('category')
    }

    if (sort) {
      params.set('sort', sort)
    } else {
      params.delete('sort')
    }

    const next = params.toString()
    router.push(next ? `${pathname}?${next}` : pathname)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-4 border-brown bg-parchment p-2 shadow-[4px_4px_0px_#6b4423]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.8fr)_0.95fr_0.95fr_0.95fr_0.7fr] gap-2">
        <div className="flex items-center border-2 border-brown bg-white px-4 py-3">
          <Search size={18} className="text-brown mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, festivals..."
            className="w-full bg-transparent outline-none border-none ring-0 focus:outline-none focus:ring-0 text-brown placeholder:text-light-brown font-medium"
          />
        </div>

        <div className="flex items-center border-2 border-brown bg-white px-4 py-3">
          <MapPin size={18} className="text-brown mr-3 flex-shrink-0" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 appearance-none text-brown font-bold"
          >
            {uniqueCities.map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center border-2 border-brown bg-white px-4 py-3">
          <Filter size={18} className="text-brown mr-3 flex-shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 appearance-none text-brown font-bold"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center border-2 border-brown bg-white px-4 py-3">
          <ArrowUpDown size={18} className="text-brown mr-3 flex-shrink-0" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 appearance-none text-brown font-bold"
          >
            <option value="distance">Closest First</option>
            <option value="date">Upcoming Date</option>
            <option value="category">Category</option>
          </select>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 border-2 border-brown bg-green hover:bg-dark-green text-cream px-4 py-3 font-pixel text-xs transition-colors"
        >
          <Search size={16} />
          Search
        </button>
      </div>
    </form>
  )
}