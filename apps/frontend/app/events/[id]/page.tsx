"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { getEventById, getEventTiers, type Event, type TicketTier } from "@/lib/api";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Calendar, MapPin, Ticket, Loader2, AlertCircle } from "lucide-react";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["italic", "normal"],
});
const outfit = Outfit({ weight: ["300", "400", "500"], subsets: ["latin"] });

function resolveBannerUrl(rawUrl?: string | null): string {
  if (!rawUrl) {
    return "/arijitsingh.png";
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "/arijitsingh.png";
  }

  if (
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  return "/arijitsingh.png";
}

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = String(params.id || "");
  const [event, setEvent] = useState<Event | null>(null);
  const [tiers, setTiers] = useState<TicketTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bannerImage = resolveBannerUrl(event?.bannerImage);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setIsLoading(true);
        const eventData = await getEventById(eventId);
        const tierData = await getEventTiers(eventId);
        setEvent(eventData);
        setTiers(tierData);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load event");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen bg-[#070914] flex items-center justify-center text-white ${outfit.className}`}
      >
        <div className="flex items-center gap-3 text-[#F2E0AE]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-sm tracking-widest uppercase">Loading Event</p>
        </div>
      </div>
    );
  }

  if (!event || error) {
    return (
      <div
        className={`min-h-screen bg-[#070914] flex items-center justify-center text-white ${outfit.className}`}
      >
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-400" />
          <p className="text-xl tracking-widest uppercase font-light text-white/50">
            {error || "Event not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-cover bg-center relative ${outfit.className} text-[#EBE7D8] selection:bg-[#EBE7D8] selection:text-[#070914]`}
      style={{ backgroundImage: `url(${bannerImage})` }}
    >
      {/* Refined dark overlay for glassmorphic contrast */}
      <div className="absolute inset-0 bg-[#070914]/80 backdrop-blur-[2px]"></div>

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-5xl mx-auto px-6 py-16">
          <div className="mb-12 text-center md:text-left">
            <h1
              className={`${cormorant.className} text-5xl md:text-7xl font-normal text-[#F2E0AE] mb-6 tracking-tight drop-shadow-lg`}
            >
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm tracking-widest uppercase font-light text-white/70">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F2E0AE]" />
                {new Date(event.startTime).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F2E0AE]" />
                {event.venue}
              </div>
            </div>
          </div>

          <div className="backdrop-blur-2xl bg-[#070914]/40 border border-white/10 rounded-3xl p-8 md:p-12 mb-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative z-10">
              <h2
                className={`${cormorant.className} text-3xl md:text-4xl text-[#F2E0AE] mb-6 italic`}
              >
                About Event
              </h2>
              <p className="text-white/70 font-light leading-relaxed tracking-wide text-lg">
                {event.description}
              </p>
            </div>
          </div>

          {/* Ticket Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {tiers.length === 0 ? (
              <div className="md:col-span-2 backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center">
                <p className="text-sm tracking-widest uppercase text-white/50">
                  Ticket tiers are not published yet.
                </p>
              </div>
            ) : (
              tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-1 shadow-xl"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className={`${cormorant.className} text-3xl text-white`}>
                      {tier.name}
                    </h3>
                    <Ticket className="w-6 h-6 text-white/30" />
                  </div>

                  <p className="text-2xl text-[#F2E0AE] font-light mb-2 flex items-baseline gap-1">
                    {tier.price}
                    <span className="text-sm tracking-widest uppercase text-white/50">
                      MATIC
                    </span>
                  </p>
                  <p className="text-xs tracking-widest uppercase text-white/40 mb-8">
                    Remaining: {Math.max(0, tier.totalSupply - tier.soldCount)} / {tier.totalSupply}
                  </p>

                  <button className="w-full bg-white/10 hover:bg-[#F2E0AE] border border-white/20 hover:border-[#F2E0AE] text-white hover:text-[#070914] py-4 rounded-xl font-medium tracking-widest uppercase text-sm transition-all duration-500 backdrop-blur-md">
                    Secure Ticket
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
