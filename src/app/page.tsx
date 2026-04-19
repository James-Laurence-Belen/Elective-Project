'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users } from 'lucide-react'
import { events } from '@/lib/events'
import { categories } from '@/lib/categories'
import { EventCard } from '@/components/eventcard'
import { CategoryCard } from '@/components/categorycard'
import { RecommendationSection } from '@/components/recommendation'
import { PixelBorder } from '@/components/pixelborder'

export default function HomePage() {
  const featuredEvents = events.filter((e) => e.isFeatured).slice(0, 3)
  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-cream pb-16">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-sky to-cream pt-20 pb-16 px-4 border-b-4 border-dark-brown overflow-hidden">
        {/* Decorative Elements */}
        <div
          className="absolute top-10 left-10 text-4xl opacity-50 animate-bounce"
          style={{
            animationDuration: '3s',
          }}
        >
          ☁️
        </div>
        <div
          className="absolute top-20 right-20 text-4xl opacity-50 animate-bounce"
          style={{
            animationDuration: '4s',
          }}
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
            Discover Local <br />{' '}
            <span className="text-green text-shadow-pixel">Magic</span>
          </h1>
          <p className="text-lg md:text-xl text-brown mb-10 max-w-2xl mx-auto font-medium">
            Find festivals, markets, and gatherings in your community. Your next
            adventure awaits near you.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/events"
              className="w-48 flex items-center justify-center bg-green hover:bg-dark-green text-cream px-8 py-4 font-pixel text-s pixel-border-sm transition-colors"
              className="w-48 flex items-center justify-center bg-green hover:bg-dark-green text-cream px-8 py-4 font-pixel text-xs rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Explore Events
            </Link>

            <Link
              href="/create_event"
              className="w-48 flex items-center justify-center bg-green hover:bg-dark-green text-cream px-8 py-4 font-pixel text-s pixel-border-sm transition-colors"
            >
              Create Event
            </Link>

            <Link
              href="/calendar"
              className="w-48 flex items-center justify-center bg-brown hover:bg-dark-brown text-cream px-8 py-4 font-pixel text-s pixel-border-sm transition-colors"
            >
              View Calendar
            </Link>
              className="w-48 flex items-center justify-center border-2 border-green text-green bg-transparent hover:bg-green/10 px-8 py-4 font-pixel text-xs rounded-xl transition-all duration-300"
            >
              Create Event
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20 mb-16">
        <PixelBorder className="bg-parchment p-6 flex flex-col md:flex-row justify-around items-center gap-6">
          <div className="text-center">
            <div className="font-pixel text-xl text-dark-green text-ligher-shadow-pixel mb-2">
              {events.length}+
            </div>
            <div className="text-sm text-dark-brown font-bold uppercase tracking-wider">
              Active Events
            </div>
          </div>
          <div className="hidden md:block w-1 h-12 bg-brown/30"></div>
          <div className="text-center">
            <div className="font-pixel text-xl text-dark-green text-ligher-shadow-pixel mb-2">
              # of provinces
            </div>
            <div className="text-sm text-dark-brown font-bold uppercase tracking-wider">
              Towns
            </div>
          </div>
          <div className="hidden md:block w-1 h-12 bg-brown/30"></div>
          <div className="text-center">
            <div className="font-pixel text-xl text-dark-green text-ligher-shadow-pixel mb-2">
              # of people
            </div>
            <div className="text-sm text-dark-brown font-bold uppercase tracking-wider">
              Players
            </div>
          </div>
        </PixelBorder>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Categories Section */}
        <section>
          <h2 className="font-pixel text-xl text-dark-brown mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const count = events.filter(
                (e) => e.categoryId === category.id,
              ).length
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

        {/* Featured Events */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-pixel text-xl text-dark-brown">
              Notice Board Highlights
            </h2>
            <Link
              href="/events"
              className="text-green hover:text-dark-green font-bold text-sm underline decoration-2 underline-offset-4"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <RecommendationSection events={events} />

        {/* Upcoming Events List */}
        <section>
          <h2 className="font-pixel text-xl text-dark-brown mb-8">
            Upcoming Gatherings
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map((event) => {
              const dateObj = new Date(event.date)
              const category = categories.find((c) => c.id === event.categoryId)
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
                    <div className="flex-shrink-0 w-full md:w-32 h-32 md:h-24">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover border-2 border-brown"
                      />
                    </div>

                    <div className="flex-grow min-w-0 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <span
                          className={`text-[10px] font-pixel px-2 py-1 text-white ${category?.color || 'bg-brown'}`}
                        >
                          {category?.name}
                        </span>
                        {event.price === 0 && (
                          <span className="text-[10px] font-pixel px-2 py-1 bg-green text-white">
                            FREE
                          </span>
                        )}
                      </div>
                      <h3 className="font-pixel text-sm textdark-brown mb-2 truncate">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-brown">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />{' '}
                          {dateObj.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <MapPin size={14} className="mr-1" /> {event.city}
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
        </section>
      </div>
    </div>
  )
}