export interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export const categories: Category[] = [
  {
    id: 'food',
    name: 'Food',
    icon: '🍲',
    color: 'bg-orange-400',
    description:
      'Satisfy your cravings at local food festivals, night markets, and culinary events happening near you.',
  },
  {
    id: 'music',
    name: 'Music',
    icon: '🎵',
    color: 'bg-sky',
    description:
      'Discover live music performances, acoustic nights, indie gigs, and concerts near your area.',
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    color: 'bg-blue-500',
    description:
      'Join tech expos, coding bootcamps, startup showcases, and innovation events in your city.',
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: 'bg-green',
    description:
      'Experience basketball leagues, volleyball cups, fun runs, and local sports tournaments.',
  },
  {
    id: 'art',
    name: 'Art',
    icon: '🎨',
    color: 'bg-pink-400',
    description:
      'Explore art exhibits, creative fairs, painting workshops, and gallery events around you.',
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    color: 'bg-brown',
    description:
      'Connect through startup pitch days, business mixers, entrepreneurship events, and forums.',
  },
  {
    id: 'culture',
    name: 'Culture',
    icon: '🏛️',
    color: 'bg-gold',
    description:
      'Celebrate traditions through heritage festivals, cultural showcases, and local fiestas.',
  },
  {
    id: 'photography',
    name: 'Photography',
    icon: '📸',
    color: 'bg-purple-500',
    description:
      'Join photography walks, portrait workshops, sunrise tours, and photo competitions.',
  },
  {
    id: 'career',
    name: 'Career',
    icon: '📄',
    color: 'bg-dark-green',
    description:
      'Attend job fairs, resume workshops, internship events, and professional development sessions.',
  },
  {
    id: 'market',
    name: 'Market',
    icon: '🧺',
    color: 'bg-light-brown',
    description:
      'Visit weekend markets, night bazaars, coffee-and-crafts fairs, and local vendor pop-ups.',
  },
]