"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { getAllEvents, type Event } from "@/lib/api";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Search, Filter, Loader2, AlertCircle } from "lucide-react";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["italic", "normal"],
});
const outfit = Outfit({ weight: ["300", "400", "500"], subsets: ["latin"] });

function resolveImageUrl(rawUrl?: string | null): string {
  if (!rawUrl) {
    return "/game.png";
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "/game.png";
  }

  if (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  return "/game.png";
}

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const data = await getAllEvents();
        setEvents(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => new Date(event.endTime) >= now)
      .filter(
        (event) =>
          event.title.toLowerCase().includes(search.toLowerCase()) &&
          (category === "" || event.category.toLowerCase() === category.toLowerCase())
      );
  }, [events, search, category]);

  return (
    <div
      className={`min-h-screen bg-[url('/concert.jpg')] bg-cover bg-fixed bg-center relative ${outfit.className} text-[#EBE7D8] selection:bg-[#EBE7D8] selection:text-[#070914]`}
    >
      {/* Dark overlay to match the ethereal theme */}
      <div className="absolute inset-0 bg-[#070914]/85 backdrop-blur-[4px]"></div>

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="mb-16 text-center">
            <h1
              className={`${cormorant.className} text-5xl md:text-7xl font-normal text-[#F2E0AE] mb-6 tracking-tight`}
            >
              Curated <span className="italic text-white">Experiences</span>
            </h1>
            <p className="text-sm tracking-widest uppercase font-light text-white/50 max-w-xl mx-auto">
              Discover and secure access to the world's most exclusive events.
            </p>
          </div>

          {/* Search + Category Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-16 max-w-4xl mx-auto">
            <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-[#F2E0AE] transition-colors" />
              <input
                type="text"
                placeholder="Search the collection..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-[#F2E0AE]/50 focus:bg-white/[0.05] transition-all backdrop-blur-md font-light tracking-wide"
              />
            </div>

            <div className="relative md:w-64 group">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#F2E0AE] transition-colors z-10 pointer-events-none" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-[#070914]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-[#F2E0AE]/50 transition-all backdrop-blur-md font-light tracking-wide appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Music">Music</option>
                <option value="Technical">Technical</option>
                <option value="Sports">Sports</option>
                <option value="Literary">Literary</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none border-l border-white/10 pl-4">
                <div className="w-2 h-2 border-b-2 border-r-2 border-white/30 transform rotate-45 group-focus-within:border-[#F2E0AE] transition-colors"></div>
              </div>
            </div>
          </div>

          {error && (
            <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Events Grid */}
          {isLoading ? (
            <div className="text-center py-24 backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-3xl">
              <Loader2 className="w-8 h-8 mx-auto text-[#F2E0AE] animate-spin mb-4" />
              <p className="text-sm tracking-widest uppercase font-light text-white/40">
                Loading Events
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-24 backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-3xl">
              <h2
                className={`${cormorant.className} text-4xl text-[#F2E0AE] mb-4 italic`}
              >
                No Events Discovered
              </h2>
              <p className="text-sm tracking-widest uppercase font-light text-white/40">
                Adjust your filters or try a different search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={{
                    id: event.id,
                    title: event.title,
                    date: new Date(event.startTime).toLocaleDateString(),
                    time: new Date(event.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    venue: event.venue,
                    category: event.category,
                    image: resolveImageUrl(event.bannerImage),
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
