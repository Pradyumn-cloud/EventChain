'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back! {user.role === 'ORGANIZER' ? '🎭' : '🎟️'}
          </h1>
          <p className="text-gray-400">
            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400">
              {user.role}
            </span>
          </p>
        </div>

        {/* Dashboard Content based on Role */}
        {user.role === 'ORGANIZER' ? (
          <OrganizerDashboard />
        ) : (
          <UserDashboard />
        )}
      </main>
    </div>
  );
}

function OrganizerDashboard() {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/create-event"
          className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition group"
        >
          <div className="text-3xl mb-2">➕</div>
          <h3 className="font-semibold text-lg">Create Event</h3>
          <p className="text-sm text-white/70">Launch a new event with NFT tickets</p>
        </Link>

        <Link
          href="/dashboard/my-events"
          className="p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition border border-gray-700"
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-semibold text-lg">My Events</h3>
          <p className="text-sm text-gray-400">Manage your created events</p>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition border border-gray-700"
        >
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-lg">Analytics</h3>
          <p className="text-sm text-gray-400">View sales and attendance</p>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Events" value="0" icon="🎪" />
        <StatCard title="Tickets Sold" value="0" icon="🎫" />
        <StatCard title="Revenue (POL)" value="0.00" icon="💰" />
        <StatCard title="Active Events" value="0" icon="✅" />
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-400">
          <p>No recent activity</p>
          <Link href="/dashboard/create-event" className="text-purple-400 hover:text-purple-300 text-sm">
            Create your first event →
          </Link>
        </div>
      </div>
    </div>
  );
}

function UserDashboard() {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/events"
          className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition group"
        >
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="font-semibold text-lg">Browse Events</h3>
          <p className="text-sm text-white/70">Discover upcoming events</p>
        </Link>

        <Link
          href="/dashboard/my-tickets"
          className="p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition border border-gray-700"
        >
          <div className="text-3xl mb-2">🎟️</div>
          <h3 className="font-semibold text-lg">My Tickets</h3>
          <p className="text-sm text-gray-400">View your purchased tickets</p>
        </Link>

        <Link
          href="/dashboard/history"
          className="p-6 bg-gray-800 rounded-xl hover:bg-gray-750 transition border border-gray-700"
        >
          <div className="text-3xl mb-2">📜</div>
          <h3 className="font-semibold text-lg">History</h3>
          <p className="text-sm text-gray-400">Past events attended</p>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Tickets Owned" value="0" icon="🎫" />
        <StatCard title="Events Attended" value="0" icon="✅" />
        <StatCard title="Upcoming Events" value="0" icon="📅" />
      </div>

      {/* My Tickets */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
        <div className="text-center py-8 text-gray-400">
          <p>You don&apos;t have any tickets yet</p>
          <Link href="/events" className="text-purple-400 hover:text-purple-300 text-sm">
            Browse events →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}
