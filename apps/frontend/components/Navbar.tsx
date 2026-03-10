'use client';

import Link from 'next/link';
import { ConnectButton } from '@/components/ConnectButton';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎫</span>
            <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              EventChain
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/events" className="text-gray-300 hover:text-white transition">
              Events
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                Dashboard
              </Link>
            )}
            {user?.role === 'ORGANIZER' && (
              <Link href="/dashboard/create-event" className="text-gray-300 hover:text-white transition">
                Create Event
              </Link>
            )}
          </div>

          {/* Right Side - Auth */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {user?.role === 'ORGANIZER' ? '🎭 Organizer' : '🎟️ User'}
                </span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition"
              >
                Sign In
              </Link>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
