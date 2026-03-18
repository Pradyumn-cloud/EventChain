import Link from "next/link";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Calendar, Clock, MapPin, ArrowUpRight } from "lucide-react";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["italic", "normal"],
});
const outfit = Outfit({ weight: ["300", "400", "500"], subsets: ["latin"] });

type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
};

export function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <div
        className={`h-full flex flex-col backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.04] hover:border-[#F2E0AE]/40 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:-translate-y-2 ${outfit.className}`}
      >
        <div className="relative overflow-hidden h-56">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-4 left-4 z-20 backdrop-blur-md bg-black/40 border border-white/20 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase font-light text-[#F2E0AE]">
            {event.category}
          </div>
        </div>

        <div className="p-8 flex flex-col flex-1">
          <h3
            className={`${cormorant.className} text-2xl text-white mb-6 tracking-wide group-hover:text-[#F2E0AE] transition-colors duration-500`}
          >
            {event.title}
          </h3>

          <div className="space-y-3 mb-8 flex-1">
            <div className="flex items-center gap-3 text-sm text-white/50 font-light tracking-wide">
              <Calendar
                className="w-4 h-4 text-[#F2E0AE]/70"
                strokeWidth={1.5}
              />
              <span>{event.date}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-white/50 font-light tracking-wide">
              <Clock className="w-4 h-4 text-[#F2E0AE]/70" strokeWidth={1.5} />
              <span>{event.time}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-white/50 font-light tracking-wide">
              <MapPin className="w-4 h-4 text-[#F2E0AE]/70" strokeWidth={1.5} />
              <span>{event.location}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-between items-center group-hover:border-white/20 transition-colors duration-500">
            <span className="text-[11px] tracking-widest uppercase text-white/40 font-light">
              View Details
            </span>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#F2E0AE] group-hover:border-[#F2E0AE] group-hover:text-[#070914] transition-all duration-500">
              <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
