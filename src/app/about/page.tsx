"use client";
import { PixelBorder } from "@/components/pixelborder";

const team = [
  {
    id: "1",
    name: "Belen, James Laurence",
    role: "Backend Developer",
    avatar: "./ganapics/hames.jpg",
    bio: "A hardworking and passionate computer engineer that continuously strives to improve technical skills and problemsolving abilities through consistent learning and hands-on practice.",
    github: "https://github.com/James-Laurence-Belen",
  },
  {
    id: "2",
    name: "Cuevas, Christian John",
    role: "Frontend Developer",
    avatar: "./ganapics/cj.jpg",
    bio: "Designed and developed the UI/UX of GanapPH, focusing on user-friendly navigation, responsive layout, and modern visual design.",
    github: "https://github.com/CPE3A-cuevas-christian",
  },
  {
    id: "3",
    name: "Enriquez, Ryen Uri",
    role: "UI/UX Designer & Documentation",
    avatar: "./ganapics/ryen.jpg",
    bio: "Documented the system architecture, API endpoints, database schema, and deployment diagram of the project. Additionally, contributed to the UI/UX design and frontend development of the project.",
    github: "https://github.com/CPE3A-enriquez-ryenuri",
  },
  {
    id: "4",
    name: "Deguzman, Dionel",
    role: "Database & API Developer",
    avatar: "./ganapics/dion.jpg",
    bio: "Helped design the database schema, and develop the RESTful API endpoints for user authentication, event management, and data retrieval using Node.js, Express, and Prisma ORM.",
    github: "https://github.com/CPE3A-deguzman-dionel",
  },
  {
    id: "5",
    name: "Ongleo, John Lei",
    role: "Frontend Developer",
    avatar: "./ganapics/lei.jpg",
    bio: "Contributed to the frontend development of the project, implementing responsive design and interactive features using React and Tailwind CSS.",
    github: "https://github.com/CPE3A-ongleo-johnlei",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-pixel text-3xl md:text-4xl text-dark-brown mb-4">
            Meet the Builders
          </h1>
          <p className="text-lg text-brown max-w-2xl mx-auto font-medium">
            We are a team of BS Computer Engineering students from Bulacan State
            University, passionate about connecting our local community through technology.
          </p>
        </div>

        {/* Mission */}
        <PixelBorder className="bg-white p-8 mb-12">
          <h2 className="font-pixel text-lg text-dark-brown mb-3">Our Mission</h2>
          <p className="text-brown leading-relaxed">
            To bridge communities by providing a centralized, accessible platform to discover, share, and celebrate local events, fiestas, and everyday gatherings.
          </p>
        </PixelBorder>

        {/* Team Grid */}
        <h2 className="font-pixel text-xl text-dark-brown text-center mb-8">
          The Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {team.map((member) => (
            <PixelBorder
              key={member.id}
              className="bg-parchment p-6 flex flex-col items-center text-center pixel-border-interactive"
            >
              <div className="w-20 h-20 mb-4 pixel-border-sm overflow-hidden bg-brown">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-pixel text-sm text-dark-brown mb-1">
                {member.name}
              </h3>
              <div className="text-xs font-bold text-green uppercase tracking-wider mb-3">
                {member.role}
              </div>
              <p className="text-sm text-brown mb-4 flex-grow">{member.bio}</p>
              <div className="flex gap-3 mt-auto">
                <a href={member.github} className="text-dark-brown hover:text-green font-bold text-sm">
                  GitHub
                </a>
              </div>
            </PixelBorder>
          ))}
        </div>

        {/* Story + Tech Stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <PixelBorder className="bg-white p-8">
            <h2 className="font-pixel text-lg text-dark-brown mb-4">Our Story</h2>
            <p className="text-brown mb-4 leading-relaxed">
              As Computer Engineering students at Bulacan State University, we noticed how easy it is to miss out on vibrant local events right in our own backyards. From university intramurals and barangay fiestas to weekend pop-up markets, information was scattered across different social media pages.
            </p>
            <p className="text-brown leading-relaxed">
              We built GanapPH to solve this—creating a unified space where every local gathering gets the spotlight it deserves.
            </p>
          </PixelBorder>

          <PixelBorder className="bg-white p-8">
            <h2 className="font-pixel text-lg text-gold mb-4">Tech Stack</h2>
            <div className="grid grid-cols-3 gap-4 font-medium">
              {[
                "React",
                "Next.js",
                "TypeScript",
                "Tailwind CSS",
                "PostgreSQL",
                "Prisma ORM",
                "JWT Auth",
                "bcryptjs",
                "Lucide Icons",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="text-green">▶</span> {item}
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t-2 border-brown">
              <p className="font-pixel text-[10px] text-light-brown leading-loose">
                Class of 2026<br />Bulacan State University
              </p>
            </div>
          </PixelBorder>
        </div>

        {/* Footer Banner */}
        <div className="pixel-border bg-dark-brown text-cream p-8 text-center">
          <p className="font-medium text-lg mb-1">BS Computer Engineering Students</p>
          <p className="font-pixel text-xl text-gold text-shadow-pixel">Bulacan State University</p>
          <p className="text-light-brown mt-1 text-sm">Elective Project · 2026</p>
        </div>

      </div>
    </div>
  );
}