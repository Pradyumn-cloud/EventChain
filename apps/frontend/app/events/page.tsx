'use client';

import { Navbar } from '@/components/Navbar';

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Events</h1>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search events..."
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
          />
          <select className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none">
            <option value="">All Categories</option>
            <option value="music">Music</option>
            <option value="sports">Sports</option>
            <option value="conference">Conference</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Events Grid */}
        <div className="text-center py-16 text-gray-400">
          <div className="text-6xl mb-4">🎪</div>
          <p className="text-xl mb-2">No events available yet</p>
          <p className="text-sm">Check back soon for exciting events!</p>
        </div>
      </main>
    </div>
  );
}
