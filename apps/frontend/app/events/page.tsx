'use client';

import { useState } from "react";
import { Navbar } from '@/components/Navbar';
import { EventCard } from '@/components/EventCard';

export default function EventsPage() {

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const events = [
    {
      id:1,
      title:"Arijit Singh Music Festival",
      date:"12 July 2026",
      time:"7:00 PM",
      location:"Mumbai",
      category:"Music",
      schedule:[
        "Opening Act - 7:00 PM",
        "Arijit Singh Performance - 8:00 PM",
        "Special Guest Performance - 9:30 PM",
        "Closing Ceremony - 10:30 PM"
      ],
      image:"/AS.png"
    },

    {
      id:2,
      title:"Digital Scavenger Hunt",
      date:"20 August 2026",
      time:"10:00 AM",
      location:"Bangalore",
      category:"Technical",
      schedule:[
        "Team Registration - 10:00 AM",
        "Puzzle Round 1 - 11:00 AM",
        "City Exploration Challenge - 1:00 PM",
        "Final Treasure Reveal - 4:00 PM"
      ],
      image:"/game.png"
    },

    {
      id:3,
      title:"Crypto Sports Meetup",
      date:"5 September 2026",
      time:"3:00 PM",
      location:"Delhi",
      category:"Sports",
      schedule:[
        "Welcome Session - 3:00 PM",
        "Blockchain in Sports Talk - 4:00 PM",
        "Panel Discussion - 5:30 PM",
        "Networking Session - 6:30 PM"
      ],
      image:"/market.png"
    },

    {
      id:4,
      title:"Poetry Slam",
      date:"15 October 2026",
      time:"7:00 PM",
      location:"Ahmedabad",
      category:"Literary",
      schedule:[
        "Poet Registration - 6:30 PM",
        "Opening Poetry - 7:00 PM",
        "Main Slam Competition - 8:00 PM",
        "Winner Announcement - 9:30 PM"
      ],
      image:"/poet.png"
    },

    {
      id:5,
      title:"Tech Workshop",
      date:"10 December 2026",
      time:"9:00 AM",
      location:"Hyderabad",
      category:"Technical",
      schedule:[
        "Workshop Introduction - 9:00 AM",
        "Blockchain Basics - 10:00 AM",
        "Hands-on Coding Session - 12:00 PM",
        "Project Building - 2:00 PM"
      ],
      image:"/hackathon.png"
    }
  ];

  const filteredEvents = events.filter((event) => {
    return (
      event.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === "" || event.category === category)
    );
  });

  return (
    <div className="min-h-screen bg-[url('/concert.jpg')] bg-cover bg-center relative">

      <div className="absolute inset-0 bg-black/10"></div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">

        <h1 className="text-3xl font-bold mb-8">Browse Events</h1>

        {/* Search + Category Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">

          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg"
          >
            <option value="">All Categories</option>
            <option value="Music">Music</option>
            <option value="Technical">Technical</option>
            <option value="Sports">Sports</option>
            <option value="Literary">Literary</option>
          </select>

        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (

          <div className="text-center text-gray-300 mt-16">
            <h2 className="text-2xl">No Events Found</h2>
            <p className="text-gray-400 mt-2">
              Try searching for something else
            </p>
          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}

          </div>

        )}

      </main>
    </div>
  );
}