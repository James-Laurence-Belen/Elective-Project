export interface Category {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export const categories: Category[] = [
  {
    id: 'festivals',
    name: 'Festivals',
    icon: '🎪',
    color: 'bg-gold',
    description: 'Experience the vibrant colors and traditions of local fiestas, parades, and street dances.',
  },
  {
    id: 'music',
    name: 'Concerts',
    icon: '🎵',
    color: 'bg-sky',
    description: 'Discover live music, indie gigs, and massive OPM concerts happening near you.',
  },
  {
    id: 'markets',
    name: 'Markets',
    icon: '🧺',
    color: 'bg-light-brown',
    description: 'Support local vendors at weekend pop-ups, tiangges, and artisan flea markets.',
  },
  {
    id: 'workshops',
    name: 'Workshops',
    icon: '🔨',
    color: 'bg-brown',
    description: 'Learn new skills and hobbies through interactive classes and creative sessions.',
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '⚽',
    color: 'bg-green',
    description: 'Join the action with local basketball ligas, fun runs, and community tournaments.',
  },
  {
    id: 'community',
    name: 'Community',
    icon: '🤝',
    color: 'bg-dark-green',
    description: 'Give back and connect through volunteer drives, town halls, and outreach programs.',
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍲',
    color: 'bg-orange-400',
    description: 'Satisfy your cravings at local food festivals, night markets, and culinary crawls.',
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌿',
    color: 'bg-emerald-500',
    description: 'Escape to the outdoors with guided hikes, eco-tours, and environmental clean-ups.',
  },
]
