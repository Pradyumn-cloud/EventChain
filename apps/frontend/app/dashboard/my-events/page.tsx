'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function MyEventsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated or not an organizer
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth');
      } else if (user?.role !== 'ORGANIZER') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !user || user.role !== 'ORGANIZER') {
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
          <h1 className="text-3xl font-bold">My Events</h1>
          <Link
            href="/dashboard/create-event"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            + Create Event
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button className="px-4 py-2 bg-purple-600 rounded-lg">Active</button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">Draft</button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">Past</button>
        </div>

        {/* Events Grid */}
        <div className="text-center py-16 text-gray-400">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-xl mb-2">No events yet</p>
          <p className="text-sm mb-4">Create your first event to get started</p>
          <Link
            href="/dashboard/create-event"
            className="text-purple-400 hover:text-purple-300"
          >
            Create event →
          </Link>
        </div>
      </main>
    </div>
  );
}
