"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Search, Filter } from "lucide-react";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["italic", "normal"],
});
const outfit = Outfit({ weight: ["300", "400", "500"], subsets: ["latin"] });

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const events = [
    {
      id: 1,
      title: "Arijit Singh Music Festival",
      date: "12 July 2026",
      time: "7:00 PM",
      location: "Mumbai",
      category: "Music",
      schedule: [
        "Opening Act - 7:00 PM",
        "Arijit Singh Performance - 8:00 PM",
        "Special Guest Performance - 9:30 PM",
        "Closing Ceremony - 10:30 PM",
      ],
      image: "/AS.png",
    },

    {
      id: 2,
      title: "Digital Scavenger Hunt",
      date: "20 August 2026",
      time: "10:00 AM",
      location: "Bangalore",
      category: "Technical",
      schedule: [
        "Team Registration - 10:00 AM",
        "Puzzle Round 1 - 11:00 AM",
        "City Exploration Challenge - 1:00 PM",
        "Final Treasure Reveal - 4:00 PM",
      ],
      image: "/game.png",
    },

    {
      id: 3,
      title: "Crypto Sports Meetup",
      date: "5 September 2026",
      time: "3:00 PM",
      location: "Delhi",
      category: "Sports",
      schedule: [
        "Welcome Session - 3:00 PM",
        "Blockchain in Sports Talk - 4:00 PM",
        "Panel Discussion - 5:30 PM",
        "Networking Session - 6:30 PM",
      ],
      image: "/market.png",
    },

    {
      id: 4,
      title: "Poetry Slam",
      date: "15 October 2026",
      time: "7:00 PM",
      location: "Ahmedabad",
      category: "Literary",
      schedule: [
        "Poet Registration - 6:30 PM",
        "Opening Poetry - 7:00 PM",
        "Main Slam Competition - 8:00 PM",
        "Winner Announcement - 9:30 PM",
      ],
      image: "/poet.png",
    },

    {
      id: 5,
      title: "Tech Workshop",
      date: "10 December 2026",
      time: "9:00 AM",
      location: "Hyderabad",
      category: "Technical",
      schedule: [
        "Workshop Introduction - 9:00 AM",
        "Blockchain Basics - 10:00 AM",
        "Hands-on Coding Session - 12:00 PM",
        "Project Building - 2:00 PM",
      ],
      image: "/hackathon.png",
    },
  ];

  const filteredEvents = events.filter((event) => {
    return (
      event.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === "" || event.category === category)
    );
  });

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

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
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
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
