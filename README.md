# Local Event Discovery Platform

A modern web application for discovering and managing local events in your area. Built with Next.js, React, TypeScript, Prisma, and PostgreSQL.

## Project Overview

This platform allows users to:
- Browse and discover local events
- View events on a calendar
- Search for events by category and location
- Create and organize events
- Save favorite events to bookmarks
- View their profile and event history

## System Architecture

```mermaid
graph TB
    subgraph Client["🎨 Frontend Layer - React/Next.js"]
        Pages["📄 Pages<br/>- Home<br/>- Events<br/>- Calendar<br/>- Bookmarks<br/>- Profile<br/>- Create Event<br/>- Login"]
        Components["🧩 Components<br/>- EventCard<br/>- CategoryCard<br/>- SearchBar<br/>- BookmarkButton<br/>- CalendarView<br/>- Navbar"]
        Context["🔄 State Management<br/>- AuthContext<br/>- BookmarkContext"]
    end

    subgraph APILayer["⚙️ API Layer - Next.js Route Handlers"]
        Auth["🔐 Auth Routes<br/>POST /login<br/>POST /register<br/>POST /logout<br/>GET /me"]
        EventAPI["📅 Event Routes<br/>GET /events<br/>POST /events<br/>GET /events/[id]<br/>GET /category-count<br/>GET /city-count<br/>GET /count"]
        PlacesAPI["📍 Places Routes<br/>GET /places/search"]
        UsersAPI["👥 Users Routes<br/>GET /users/count"]
    end

    subgraph BizLogic["💼 Business Logic Layer"]
        AuthLib["Auth Library<br/>JWT tokens<br/>Password hashing<br/>Session management"]
        EventLib["Events Library<br/>Event operations<br/>Filtering logic"]
        CatLib["Categories Library<br/>Category handling"]
        Prisma["🗄️ Prisma Client<br/>Database ORM"]
    end

    subgraph Database["💾 Data Layer - PostgreSQL"]
        UserTable["Users Table<br/>- id<br/>- email<br/>- name<br/>- password<br/>- createdAt"]
        EventTable["Events Table<br/>- id<br/>- name<br/>- description<br/>- category<br/>- location<br/>- date<br/>- time<br/>- organizerId"]
    end

    subgraph External["🔗 External Services"]
        GoogleMaps["Google Maps API<br/>Place search<br/>Geocoding"]
        JWT["JWT Service<br/>Token generation<br/>Token validation"]
    end

    Pages -->|Render| Components
    Pages -->|Use| Context
    Components -->|API Calls| APILayer
    Context -->|API Calls| Auth
    Context -->|API Calls| EventAPI
    
    Auth -->|Logic| AuthLib
    EventAPI -->|Logic| EventLib
    PlacesAPI -->|Logic| CatLib
    UsersAPI -->|Logic| EventLib
    
    AuthLib -->|Queries| Prisma
    EventLib -->|Queries| Prisma
    CatLib -->|Queries| Prisma
    
    Prisma -->|Read/Write| UserTable
    Prisma -->|Read/Write| EventTable
    
    AuthLib -->|Uses| JWT
    PlacesAPI -->|Calls| GoogleMaps
    EventAPI -->|Uses| GoogleMaps
```

### Architecture Layers Explained

#### **1. Frontend Layer (React/Next.js)**
- **Pages**: Core application pages including Home, Events browse, Calendar view, Bookmarks (saved events), User Profile, Event creation, and Login
- **Components**: Reusable UI components such as EventCard (displays event details), CategoryCard (shows event categories), SearchBar (location & keyword search), BookmarkButton (save/unsave events), CalendarView (calendar interface), and Navigation
- **State Management**: 
  - `AuthContext`: Manages user authentication state, login/logout, and current user info
  - `BookmarkContext`: Tracks user's bookmarked/favorite events

#### **2. API Layer (Next.js Route Handlers)**
- **Auth Routes** (`/api/auth/*`): Handles user authentication including login, registration, logout, and getting current user info via JWT
- **Event Routes** (`/api/events/*`): CRUD operations for events, filtering by category/city, and analytics (event counts)
- **Places Routes** (`/api/places/search`): Location-based search integration with Google Maps
- **Users Routes** (`/api/users/count`): User statistics and count endpoints

#### **3. Business Logic Layer**
- **Auth Library** (`lib/auth.ts`): Core authentication logic including JWT token generation/validation, password hashing with bcryptjs, and session management
- **Events Library** (`lib/events.ts`): Event operations, filtering, searching, and validation
- **Categories Library** (`lib/categories.ts`): Category management and aggregation logic
- **Prisma Client** (`lib/prisma.ts`): Type-safe ORM for all database operations, providing data abstraction

#### **4. Data Layer (PostgreSQL)**
- **Users Table**: Stores user credentials (email, hashed password), name, and timestamps
- **Events Table**: Stores event information (name, description, category, location, date, time) with foreign key to User (organizer)

#### **5. External Services**
- **Google Maps API**: Provides place search, geocoding, and location validation
- **JWT Service**: Handles secure token-based authentication and session validation

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user, returns JWT | ❌ |
| POST | `/api/auth/logout` | Logout user | ✅ |
| GET | `/api/auth/me` | Get current user info | ✅ |

### Event Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/events` | Get all events (with filtering) | ❌ |
| POST | `/api/events` | Create new event | ✅ |
| GET | `/api/events/[id]` | Get event by ID | ❌ |
| GET | `/api/events/count` | Get total event count | ❌ |
| GET | `/api/events/category-count` | Get events by category | ❌ |
| GET | `/api/events/city-count` | Get events by city/location | ❌ |

### Places Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/places/search` | Search places via Google Maps | ❌ |

### User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/count` | Get total user count | ❌ |

---

## Database Schema

### User Table
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  events    Event[]
}
```

**Fields:**
- `id`: Unique user identifier (auto-incrementing integer)
- `email`: User email (unique, used for login)
- `name`: Optional user display name
- `password`: Hashed password (bcryptjs)
- `createdAt`: Timestamp of account creation
- `updatedAt`: Timestamp of last update
- `events`: One-to-many relationship with Event (organizer)

### Event Table
```prisma
model Event {
  id            Int      @id @default(autoincrement())
  organizerName String
  name          String
  description   String
  category      String
  location      String
  date          String
  time          String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  organizerId   Int
  organizer     User     @relation(fields: [organizerId], references: [id], onDelete: Cascade)
}
```

**Fields:**
- `id`: Unique event identifier (auto-incrementing integer)
- `organizerName`: Name of the person organizing the event
- `name`: Event title/name
- `description`: Detailed event description
- `category`: Event category (e.g., Sports, Music, Food, Tech)
- `location`: Event location/address
- `date`: Event date (stored as string: YYYY-MM-DD format)
- `time`: Event time (stored as string: HH:MM format)
- `createdAt`: Timestamp of event creation
- `updatedAt`: Timestamp of last update
- `organizerId`: Foreign key to User table (who created the event)
- `organizer`: Relation to User object

---

## Deployment Diagram

```mermaid
graph LR
    subgraph Local["Local Development"]
        DevServer["🖥️ Dev Server<br/>Next.js Dev<br/>Port 3000"]
        DevDB["💾 PostgreSQL<br/>Local/Docker"]
    end

    subgraph Prod["Production Environment"]
        CloudPlatform["☁️ Hosting Platform<br/>Vercel / AWS / Railway"]
        ProdServer["⚙️ Production Server<br/>Next.js App<br/>Auto-scaled"]
        Cache["⚡ Edge Cache<br/>CDN<br/>Static Assets"]
    end

    subgraph Data["Data Layer"]
        ProdDB["🗄️ PostgreSQL<br/>Managed Database<br/>Backups"]
        BackupDB["💾 Database Backups<br/>Automated Daily"]
    end

    subgraph External["External Services"]
        Maps["🗺️ Google Maps API"]
        Email["📧 Email Service<br/>Optional"]
    end

    DevServer -->|Git Push| Prod
    CloudPlatform -->|Deploy| ProdServer
    ProdServer -->|Serve| Cache
    ProdServer -->|Query| ProdDB
    ProdDB -->|Backup| BackupDB
    ProdServer -->|Call| Maps
    ProdServer -->|Send| Email
    DevServer -->|Local Query| DevDB

    style Local fill:#e1f5ff
    style Prod fill:#f3e5f5
    style Data fill:#fff3e0
    style External fill:#e8f5e9
```

### Deployment Strategy

**Development:**
- Local Next.js dev server with hot reload
- Local PostgreSQL (Docker recommended)
- Git-based version control

**Production:**
- Deploy to cloud platform (Vercel, AWS, Railway, etc.)
- Managed PostgreSQL database with automated backups
- CDN for static asset distribution
- Environment-based configuration (.env.production)

**Deployment Steps:**
1. Push code to main branch
2. CI/CD pipeline builds and tests
3. Auto-deploy to production server
4. Database migrations run automatically
5. Health checks verify deployment

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Maps API key (optional, for location features)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/eventdb
DIRECT_URL=postgresql://user:password@localhost:5432/eventdb
```

3. Run database migrations:
```bash
npm run prisma:migrate
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

---

## Tech Stack

- **Frontend**: React 19, Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: JWT, bcryptjs
- **UI Library**: Lucide React (icons)
- **Linting**: ESLint
- **Styling**: Tailwind CSS + PostCSS

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
