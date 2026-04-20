import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const firstNames = [
  'Juan', 'Maria', 'Carlos', 'Anna', 'Mark', 'Sofia', 'Daniel', 'Lea', 'Paolo', 'Karen',
  'John', 'Angela', 'Michael', 'Patricia', 'Kevin', 'Nicole', 'Joshua', 'Camille', 'Adrian', 'Bianca',
  'Nathan', 'Isabel', 'Ethan', 'Shane', 'Alyssa', 'Vince', 'Chloe', 'Rafael', 'Denise', 'Gabriel',
  'Mika', 'Lance', 'Ella', 'Noah', 'Jasmine', 'Caleb', 'Trisha', 'Ivan', 'Bea', 'Aaron',
  'Kurt', 'Ivy', 'Cedric', 'Faith', 'Ron', 'Mae', 'Jerome', 'Angela', 'Sean', 'Pat',
]

const lastNames = [
  'Dela Cruz', 'Santos', 'Reyes', 'Villanueva', 'Fernandez', 'Gonzales', 'Cruz', 'Mendoza', 'Ramirez', 'Bautista',
  'Garcia', 'Torres', 'Flores', 'Aquino', 'Navarro', 'Castro', 'Rivera', 'Domingo', 'Salazar', 'Mercado',
]

const categories = [
  'Food',
  'Music',
  'Technology',
  'Sports',
  'Art',
  'Business',
  'Culture',
  'Photography',
  'Career',
  'Market',
]

const eventNamePool = {
  Food: [
    'Food Festival',
    'Street Food Fair',
    'Taste of the City',
    'Local Flavors Expo',
    'Weekend Food Bazaar',
  ],
  Music: [
    'Indie Music Night',
    'Live Band Sessions',
    'Acoustic Evening',
    'Campus Music Fest',
    'Rhythm and Lights',
  ],
  Technology: [
    'Tech Expo',
    'Coding Bootcamp',
    'Innovation Summit',
    'Startup Demo Day',
    'Future Tech Forum',
  ],
  Sports: [
    'Basketball Open League',
    'Fun Run Challenge',
    'Community Sports Fest',
    'Volleyball Cup',
    'Fitness Weekend',
  ],
  Art: [
    'Art in the Park',
    'Creative Arts Fair',
    'Campus Art Exhibit',
    'Sketch and Paint Day',
    'Gallery Weekend',
  ],
  Business: [
    'Startup Pitch Day',
    'Business Mixer',
    'Entrepreneur Meetup',
    'Small Business Fair',
    'Leadership Forum',
  ],
  Culture: [
    'Cultural Dance Showcase',
    'Heritage Weekend',
    'Local Culture Night',
    'Festival of Traditions',
    'Town Fiesta Showcase',
  ],
  Photography: [
    'Photography Walk',
    'Sunrise Photo Tour',
    'Photo Contest',
    'Urban Photography Day',
    'Portrait Workshop',
  ],
  Career: [
    'Community Job Fair',
    'Resume Workshop',
    'Career Orientation',
    'Internship Connect',
    'Professional Growth Day',
  ],
  Market: [
    'Weekend Market',
    'Night Market Experience',
    'Makers Fair',
    'Coffee and Crafts',
    'Farmers Market Day',
  ],
}

const descriptionPool = [
  'A community event featuring local talents, food, and activities.',
  'An exciting gathering for families, students, and professionals.',
  'Join us for a full day of fun, networking, and entertainment.',
  'Discover local businesses, performers, and creative showcases.',
  'A lively event designed to bring people together around shared interests.',
  'Meet new people and enjoy a memorable experience in the city.',
  'An interactive event with performances, exhibits, and hands-on activities.',
  'Celebrate culture, creativity, and community in one place.',
  'A public event open to everyone looking for something fun and meaningful.',
  'Enjoy a day filled with learning, discovery, and local experiences.',
]

const locations = [
  'Malolos Sports and Convention Center, Malolos, Bulacan, Philippines',
  'Town Plaza, Guiguinto, Bulacan, Philippines',
  'BulSU Main Campus, Malolos, Bulacan, Philippines',
  'WalterMart, Baliwag, Bulacan, Philippines',
  'Municipal Gymnasium, Plaridel, Bulacan, Philippines',
  'The Pavilion, San Jose del Monte, Bulacan, Philippines',
  'Heritage District, Malolos, Bulacan, Philippines',
  'Barangay Hall Grounds, Hagonoy, Bulacan, Philippines',
  'SM North EDSA, Quezon City, Metro Manila, Philippines',
  'Araneta Coliseum, Quezon City, Metro Manila, Philippines',
  'UP Diliman, Quezon City, Metro Manila, Philippines',
  'Rizal Park, Manila, Metro Manila, Philippines',
  'SMX Convention Center, Pasay, Metro Manila, Philippines',
  'SM Megamall Megatrade Hall, Mandaluyong, Metro Manila, Philippines',
  'Ayala Center Cebu, Cebu City, Cebu, Philippines',
  'Waterfront Cebu City Hotel, Cebu City, Cebu, Philippines',
  'People’s Park, Davao City, Davao del Sur, Philippines',
  'Roxas Night Market, Davao City, Davao del Sur, Philippines',
  'Burnham Park, Baguio City, Benguet, Philippines',
  'Camp John Hay, Baguio City, Benguet, Philippines',
  'SM City Clark, Angeles City, Pampanga, Philippines',
  'MarQuee Mall, Angeles City, Pampanga, Philippines',
  'Enchanted Kingdom, Santa Rosa, Laguna, Philippines',
  'Nuvali, Santa Rosa, Laguna, Philippines',
  'SM City Batangas, Batangas City, Batangas, Philippines',
  'Provincial Capitol Grounds, Batangas City, Batangas, Philippines',
  'Festive Walk Iloilo, Iloilo City, Iloilo, Philippines',
  'Iloilo Convention Center, Iloilo City, Iloilo, Philippines',
  'Limketkai Center, Cagayan de Oro, Misamis Oriental, Philippines',
  'Centrio Mall, Cagayan de Oro, Misamis Oriental, Philippines',
  'SM City Naga, Naga City, Camarines Sur, Philippines',
  'Robinsons Place Tacloban, Tacloban City, Leyte, Philippines',
  'SM City Baguio, Baguio City, Benguet, Philippines',
  'Capitol Commons, Pasig, Metro Manila, Philippines',
  'Alabang Town Center, Muntinlupa, Metro Manila, Philippines',
  'SM Seaside City, Cebu City, Cebu, Philippines',
  'People’s Plaza, Zamboanga City, Zamboanga del Sur, Philippines',
  'KCC Mall, General Santos City, South Cotabato, Philippines',
  'Downtown Area, Dumaguete City, Negros Oriental, Philippines',
  'Public Plaza, Vigan City, Ilocos Sur, Philippines',
]

function pad(num: number) {
  return num.toString().padStart(2, '0')
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(index: number) {
  const year = 2026

  

  const availableMonths = [5, 6, 7, 8, 9, 10, 11, 12]
  const month = availableMonths[index % availableMonths.length]

  // Random day from 1–28 for safe valid dates
  const day = ((index * 7) % 28) + 1

  return `${year}-${pad(month)}-${pad(day)}`
}

function randomTime(index: number) {
  const times = [
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM',
    '6:30 PM',
    '7:00 PM',
    '8:00 PM',
  ]
  return times[index % times.length]
}

function makeEmail(firstName: string, lastName: string, index: number) {
  const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '')
  const cleanLast = lastName.toLowerCase().replace(/\s+/g, '')
  return `${cleanFirst}.${cleanLast}${index + 1}@example.com`
}

async function main() {
  console.log('Seeding database...')

  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 10)

  const userData = Array.from({ length: 100 }, (_, i) => {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length]
    const fullName = `${firstName} ${lastName}`

    return {
      email: makeEmail(firstName, lastName, i),
      name: fullName,
      password: hashedPassword,
    }
  })

  await prisma.user.createMany({
    data: userData,
  })

  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
  })

  const eventsData = Array.from({ length: 1000 }, (_, i) => {
    const organizer = users[i % users.length]
    const category = categories[i % categories.length]
    const nameOptions = eventNamePool[category as keyof typeof eventNamePool]
    const baseName = nameOptions[i % nameOptions.length]
    const location = locations[i % locations.length]
    const description = descriptionPool[i % descriptionPool.length]

    return {
      organizerName: organizer.name || organizer.email,
      name: `${baseName} ${i + 1}`,
      description,
      category,
      location,
      date: randomDate(i),
      time: randomTime(i),
      organizerId: organizer.id,
    }
  })

  await prisma.event.createMany({
    data: eventsData,
  })

  console.log('Seeding finished.')
  console.log(`Created users: ${users.length}`)
  console.log(`Created events: ${eventsData.length}`)
  console.log('Default password for all users: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })