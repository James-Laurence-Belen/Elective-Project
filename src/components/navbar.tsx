"use client"

import React, { useState, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X, User, Heart } from 'lucide-react'
import { useBookmarks } from '@/context/bookmarkcontext'
import { AuthContext } from '@/context/authcontext'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'About', path: '/about' },
]

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { bookmarkedIds } = useBookmarks()
  const { user } = useContext(AuthContext)

  const isActive = (path: string) => pathname === path
    return (
    <nav className="bg-gradient-to-b from-dark-green to-green border-b-4 border-dark-brown sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🌿</span>
              <span className="font-pixel text-sm md:text-lg text-cream text-shadow-pixel tracking-wider">
                GanapPH
              </span>
            </Link>
          </div>

          {/* Desktop Nav - Centered */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`px-3 py-2 font-pixel text-xs uppercase transition-colors ${isActive(link.path) ? 'text-gold text-shadow-pixel border-b-2 border-gold' : 'text-cream hover:text-gold'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/events"
              className="text-cream hover:text-gold transition-colors"
            >
              <Search size={23} />
            </Link>

            <Link
              href="/profile"
              className="relative text-cream hover:text-gold transition-colors"
            >
              <Heart size={23} />
              {bookmarkedIds.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-dark-brown">
                  {bookmarkedIds.length}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                href="/profile"
                className="flex items-center justify-center w-9 h-9 bg-brown hover:bg-light-brown text-cream px-3 py-1.5 pixel-border-sm transition-colors"
                aria-label="Profile"
              >
                <User size={18} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-brown hover:bg-light-brown text-cream px-3 py-1.5 pixel-border-sm transition-colors"
              >
                <User size={20} />
                <span className="font-pixel text-[0.8rem]">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-cream hover:text-gold p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-green border-t-2 border-dark-brown">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 font-pixel text-[10px] uppercase ${isActive(link.path) ? 'text-gold bg-dark-green' : 'text-cream hover:bg-dark-green'}`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-dark-green my-2 pt-2">
               {user ? (
                 <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 font-pixel text-[10px] uppercase text-cream hover:bg-dark-green"
                >
                  Profile
                </Link>
               ) : (
                 <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 font-pixel text-[10px] uppercase text-cream hover:bg-dark-green"
                >
                  Login / Register
                </Link>
               )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}