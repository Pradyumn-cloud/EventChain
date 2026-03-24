'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { DeployEventButton } from '@/components/DeployEventButton';
import {
  getOrganizerEvents,
  getEventTiers,
  addTier,
  deleteTier,
  Event,
  TicketTier,
} from '@/lib/api';
import {
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  ChevronRight,
  Calendar,
  MapPin,
  Tag,
  X,
} from 'lucide-react';

interface EventWithTiers extends Event {
  tiers: TicketTier[];
}

const STATUS_COLORS = {
  draft: { badge: 'bg-white/10 text-white/70 border border-white/20' },
  active: { badge: 'bg-[#F2E0AE]/15 text-[#F2E0AE] border border-[#F2E0AE]/30' },
};

const cormorant = Cormorant_Garamond({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  style: ['italic', 'normal'],
});
const outfit = Outfit({ weight: ['300', '400', '500'], subsets: ['latin'] });

export default function MyEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [events, setEvents] = useState<EventWithTiers[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'draft' | 'past'>('draft');

  // Modal states
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithTiers | null>(null);
  const [tierForm, setTierForm] = useState({
    name: '',
    price: '',
    totalSupply: '',
  });
  const [isAddingTier, setIsAddingTier] = useState(false);
  const [tierError, setTierError] = useState<string | null>(null);

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

  // Fetch events
  useEffect(() => {
    if (user?.role === 'ORGANIZER') {
      fetchEvents();
      const editId = searchParams.get('edit');
      if (editId) {
        setTimeout(() => {
          const el = document.getElementById(`event-${editId}`);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    }
  }, [user?.role, searchParams]);

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const token = localStorage.getItem('eventchain_token');
      if (!token) throw new Error('No token found');

      const fetchedEvents = await getOrganizerEvents(token);

      // Fetch tiers for each event
      const eventsWithTiers = await Promise.all(
        fetchedEvents.map(async (event) => {
          try {
            const tiers = await getEventTiers(event.id);
            return { ...event, tiers };
          } catch {
            return { ...event, tiers: [] };
          }
        })
      );

      setEvents(eventsWithTiers);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleAddTier = async () => {
    if (!selectedEvent) return;

    if (!tierForm.name || !tierForm.price || !tierForm.totalSupply) {
      setTierError('All fields are required');
      return;
    }

    if (isNaN(Number(tierForm.price)) || Number(tierForm.price) <= 0) {
      setTierError('Price must be a positive number');
      return;
    }

    if (isNaN(Number(tierForm.totalSupply)) || Number(tierForm.totalSupply) <= 0) {
      setTierError('Supply must be a positive number');
      return;
    }

    try {
      setIsAddingTier(true);
      setTierError(null);
      const token = localStorage.getItem('eventchain_token');
      if (!token) throw new Error('No token found');

      const newTier = await addTier(
        selectedEvent.id,
        {
          name: tierForm.name,
          price: tierForm.price,
          totalSupply: Number(tierForm.totalSupply),
        },
        token
      );

      // Update local state
      setEvents(
        events.map((e) =>
          e.id === selectedEvent.id
            ? { ...e, tiers: [...e.tiers, newTier] }
            : e
        )
      );

      // Reset form
      setTierForm({ name: '', price: '', totalSupply: '' });
      setShowTierModal(false);
    } catch (err: any) {
      setTierError(err.message || 'Failed to add tier');
    } finally {
      setIsAddingTier(false);
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;

    try {
      const token = localStorage.getItem('eventchain_token');
      if (!token) throw new Error('No token found');

      await deleteTier(tierId, token);

      // Update local state
      setEvents(
        events.map((e) =>
          e.id === selectedEvent?.id
            ? { ...e, tiers: e.tiers.filter((t) => t.id !== tierId) }
            : e
        )
      );

      if (selectedEvent?.id) {
        setSelectedEvent({
          ...selectedEvent,
          tiers: selectedEvent.tiers.filter((t) => t.id !== tierId),
        });
      }
    } catch (err: any) {
      setTierError(err.message || 'Failed to delete tier');
    }
  };

  const draftEvents = events.filter((e) => !e.isActive);
  const activeEvents = events.filter((e) => e.isActive);

  if (isLoading || !user || user.role !== 'ORGANIZER') {
    return (
      <div className={`min-h-screen bg-[#070914] flex items-center justify-center ${outfit.className}`}>
        <div className="flex flex-col items-center gap-4 text-[#F2E0AE]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs tracking-widest uppercase font-light">Loading Archive</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#070914] text-[#EBE7D8] ${outfit.className} overflow-hidden relative selection:bg-[#EBE7D8] selection:text-[#070914]`}
    >
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#1A2552] blur-[120px] opacity-40 mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#3D294D] blur-[150px] opacity-50 mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-[30%] left-[50%] w-[30vw] h-[30vw] rounded-full bg-[#755D30] blur-[180px] opacity-20 mix-blend-lighten animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="relative z-10">
        <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10 border-b border-white/10 pb-8">
          <div>
            <h1 className={`${cormorant.className} text-4xl md:text-5xl font-normal text-white mb-3 tracking-tight`}>
              My <span className="italic text-[#F2E0AE]">Events</span>
            </h1>
            <p className="text-sm tracking-widest uppercase text-white/50">Manage your curated experiences</p>
          </div>
          <Link
            href="/dashboard/create-event"
            className="px-6 py-3 rounded-2xl border border-[#F2E0AE]/40 bg-[#F2E0AE]/10 hover:bg-[#F2E0AE]/20 transition flex items-center gap-2 text-[#F2E0AE] text-xs tracking-widest uppercase"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-10 border-b border-white/10">
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-3 text-xs tracking-widest uppercase transition ${
              activeTab === 'draft'
                ? 'border-b-2 border-[#F2E0AE] text-[#F2E0AE]'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            Draft ({draftEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-3 text-xs tracking-widest uppercase transition ${
              activeTab === 'active'
                ? 'border-b-2 border-[#F2E0AE] text-[#F2E0AE]'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            Active ({activeEvents.length})
          </button>
        </div>

        {/* Events Grid */}
        {isLoadingEvents ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 text-[#F2E0AE] animate-spin" />
          </div>
        ) : activeTab === 'draft' && draftEvents.length === 0 ? (
          <div className="text-center py-16 text-white/50 backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl">
            <p className={`${cormorant.className} text-4xl mb-2 text-white/80 italic`}>No Draft Events</p>
            <p className="text-sm mb-4 tracking-wide">Create your first event to begin publishing.</p>
            <Link
              href="/dashboard/create-event"
              className="text-[#F2E0AE] hover:text-white inline-flex items-center gap-2 text-xs tracking-widest uppercase"
            >
              Create event <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : activeTab === 'active' && activeEvents.length === 0 ? (
          <div className="text-center py-16 text-white/50 backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl">
            <p className={`${cormorant.className} text-4xl mb-2 text-white/80 italic`}>No Active Events</p>
            <p className="text-sm">Deploy a draft event to make it publicly visible.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {(activeTab === 'draft' ? draftEvents : activeEvents).map((event) => (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 hover:border-white/20 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className={`${cormorant.className} text-3xl text-white`}>{event.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.2em] ${STATUS_COLORS[event.isActive ? 'active' : 'draft'].badge}`}>
                        {event.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">{event.description}</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 py-4 border-y border-white/10">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Venue</p>
                    <p className="text-sm text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.venue}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-sm text-white">{event.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-sm text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Category</p>
                    <p className="text-sm text-white capitalize">{event.category}</p>
                  </div>
                </div>

                {/* Tiers Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm tracking-widest uppercase text-white/70 flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Ticket Tiers ({event.tiers.length})
                    </h3>
                    {!event.isActive && (
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowTierModal(true);
                        }}
                        className="px-3 py-2 rounded-xl border border-[#F2E0AE]/40 bg-[#F2E0AE]/10 hover:bg-[#F2E0AE]/20 text-xs tracking-widest uppercase text-[#F2E0AE] flex items-center gap-1 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add Tier
                      </button>
                    )}
                  </div>

                  {event.tiers.length === 0 ? (
                    <p className="text-white/40 text-sm py-4 text-center border border-dashed border-white/20 rounded-2xl">
                      No tiers yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {event.tiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="flex justify-between items-center p-4 bg-white/[0.03] border border-white/10 rounded-2xl"
                        >
                          <div className="flex-1">
                            <p className={`${cormorant.className} text-xl text-white`}>{tier.name}</p>
                            <p className="text-xs text-white/50 tracking-wide">
                              {tier.price} MATIC •{' '}
                              {tier.totalSupply} available • {tier.soldCount} sold
                            </p>
                          </div>
                          {!event.isActive && (
                            <button
                              onClick={() => handleDeleteTier(tier.id)}
                              className="ml-4 p-2 text-red-400 hover:text-red-300 transition rounded-lg hover:bg-red-500/10"
                              title="Delete tier"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!event.isActive && (
                  <div className="flex gap-3">
                    <DeployEventButton event={event} onSuccess={fetchEvents} />
                  </div>
                )}

                {event.isActive && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-2 text-green-300 text-sm">
                    <Check className="w-4 h-4" />
                    Contract deployed: {event.contractAddress?.slice(0, 10)}...
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </main>
      </div>

      {/* Add Tier Modal */}
      {showTierModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full p-6 rounded-3xl border border-white/10 bg-[#0E1326]/95 backdrop-blur-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`${cormorant.className} text-3xl text-white`}>Add Tier</h3>
              <button
                onClick={() => {
                  setShowTierModal(false);
                  setTierForm({ name: '', price: '', totalSupply: '' });
                  setTierError(null);
                }}
                className="text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {tierError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded flex items-center gap-2 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                {tierError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Tier Name</label>
                <input
                  type="text"
                  value={tierForm.name}
                  onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                  placeholder="e.g. VIP, General Admission"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/15 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2E0AE]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Price (MATIC)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tierForm.price}
                  onChange={(e) => setTierForm({ ...tierForm, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/15 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2E0AE]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Total Supply</label>
                <input
                  type="number"
                  value={tierForm.totalSupply}
                  onChange={(e) => setTierForm({ ...tierForm, totalSupply: e.target.value })}
                  placeholder="100"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/15 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2E0AE]/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTierModal(false);
                  setTierForm({ name: '', price: '', totalSupply: '' });
                  setTierError(null);
                }}
                className="flex-1 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] rounded-2xl text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTier}
                disabled={isAddingTier}
                className="flex-1 px-4 py-3 border border-[#F2E0AE]/40 bg-[#F2E0AE]/10 hover:bg-[#F2E0AE]/20 disabled:opacity-50 rounded-2xl text-[#F2E0AE] text-xs tracking-widest uppercase transition flex items-center justify-center gap-2"
              >
                {isAddingTier ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Tier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
