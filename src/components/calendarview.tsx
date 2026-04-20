'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { categories } from '@/lib/categories'
import { PixelBorder } from './pixelborder'

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

interface CalendarViewProps {
  events: CalendarEvent[]
  onDateSelect?: (date: Date) => void
  selectedDate?: Date
}

export function CalendarView({
  events,
  onDateSelect,
  selectedDate = new Date(),
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  )

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    )
  }

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    )
  }

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay()

  const realMonthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const days: Array<Date | null> = []

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((e) => {
      const eventDate = new Date(e.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  return (
    <PixelBorder className="p-4 bg-parchment">
      <div className="flex justify-between items-center mb-6 bg-brown text-cream p-3 pixel-border-sm">
        <button
          onClick={prevMonth}
          className="hover:text-gold transition-colors p-1"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="text-center">
          <h2 className="font-pixel text-sm md:text-base text-shadow-pixel">
            {realMonthNames[currentMonth.getMonth()]}{' '}
            {currentMonth.getFullYear()}
          </h2>
        </div>

        <button
          onClick={nextMonth}
          className="hover:text-gold transition-colors p-1"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center font-pixel text-[8px] md:text-[10px] text-dark-brown py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="h-16 md:h-24 bg-cream/50 pixel-border-sm opacity-50"
              ></div>
            )
          }

          const dayEvents = getEventsForDate(date)
          const isSelectedDay = isSelected(date)

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDateSelect && onDateSelect(date)}
              className={`h-16 md:h-24 p-1 md:p-2 pixel-border-sm flex flex-col cursor-pointer transition-colors ${
                isSelectedDay
                  ? 'bg-gold border-dark-brown'
                  : isToday(date)
                    ? 'bg-sky/30 border-brown'
                    : 'bg-cream hover:bg-white border-brown'
              }`}
            >
              <span
                className={`font-pixel text-[10px] ${
                  isToday(date) ? 'text-dark-green' : 'text-dark-brown'
                }`}
              >
                {date.getDate()}
              </span>

              <div className="mt-1 flex-grow overflow-hidden flex flex-col gap-1">
                {dayEvents.slice(0, 2).map((event) => {
                  const cat = categories.find((c) => c.id === event.categoryId)

                  return (
                    <div
                      key={event.id}
                      className={`text-[8px] md:text-[10px] truncate px-1 py-0.5 text-white ${
                        cat?.color || 'bg-brown'
                      }`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  )
                })}

                {dayEvents.length > 2 && (
                  <div className="text-[8px] text-brown font-bold">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </PixelBorder>
  )
}