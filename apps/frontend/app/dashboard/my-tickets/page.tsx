'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <Link
            href="/events"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Browse Events
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button className="px-4 py-2 bg-purple-600 rounded-lg">Upcoming</button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">Past</button>
        </div>

        {/* Tickets Grid */}
        <div className="text-center py-16 text-gray-400">
          <div className="text-6xl mb-4">🎟️</div>
          <p className="text-xl mb-2">No tickets yet</p>
          <p className="text-sm mb-4">Purchase tickets to see them here</p>
          <Link
            href="/events"
            className="text-purple-400 hover:text-purple-300"
          >
            Browse events →
          </Link>
        </div>
      </main>
    </div>
  );
}
