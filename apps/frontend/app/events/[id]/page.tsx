'use client';

import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = Number(params.id);

  const events = {
    1: {
      title: "Arijit Singh Music Festival",
      date: "12 July 2026",
      location: "Mumbai",
      description:
        "Experience an unforgettable evening at the Arijit Singh Music Festival in Mumbai. Enjoy live performances by Arijit Singh along with special guest artists, stunning stage lighting, and a powerful sound experience. Fans from across the country will gather to celebrate music, emotion, and energy. From romantic ballads to energetic hits, this concert promises a magical night filled with music, excitement, and unforgettable memories.",
      bg: "/arijitsingh.png",
      image : "/AS.png",
    },

    2: {
      title: "Digital Scavenger Hunt",
      date: "20 August 2026",
      location: "Bangalore",
      description:
        "The Digital Scavenger Hunt is an exciting tech-based adventure where participants solve puzzles, decode clues, and complete challenges across different locations in the city. Teams will compete to unlock hidden tasks using technology, creativity, and teamwork. This event is perfect for tech enthusiasts, students, and problem-solvers who enjoy interactive challenges and exploring the city in a fun and competitive way.",
      bg: "/scavanger.jpg",
      image : "/game.png",
    },

    3: {
      title: "Crypto Sports Meetup",
      date: "5 September 2026",
      location: "Delhi",
      description:
        "The Crypto Sports Meetup brings together sports enthusiasts, blockchain developers, and Web3 innovators to discuss how blockchain technology is transforming the sports industry. Attendees will learn about NFT tickets, fan tokens, digital collectibles, and decentralized sports platforms. The event includes networking sessions, expert talks, and panel discussions with industry professionals.",
      bg: "/crypto.jpg",
      image: "/market.png",
    },

    4: {
      title: "Poetry Slam",
      date: "15 October 2026",
      location: "Ahmedabad",
      description:
        "Join us for a captivating Poetry Slam night where talented poets perform powerful spoken-word pieces in front of a live audience. This event celebrates creativity, storytelling, and artistic expression. Participants will compete with original poetry while the audience enjoys an inspiring atmosphere filled with emotion, rhythm, and creativity. Whether you love poetry or want to discover new voices, this event promises an unforgettable experience.",
      bg: "/poetry.jpg",
      image : "/poet.png",
    },

    5: {
        title: "Tech Workshop",
        date: "10 December 2026",
        location: "Hyderabad",
        description: " Join us for an immersive Tech Workshop designed to equip you with the latest skills in blockchain development, smart contracts, and Web3 technologies. This hands-on workshop will cover everything from the basics of blockchain to advanced programming techniques. Whether you're a beginner looking to enter the world of blockchain or an experienced developer seeking to enhance your skills, this workshop offers valuable insights and practical experience. Don't miss this opportunity to learn from industry experts and connect with fellow tech enthusiasts.",    
        bg: "/hack.png",
        image : "/hackathon.png",
        },
  };

  const event = events[eventId as keyof typeof events];

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Event not found
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${event.bg})` }}
    >
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-5xl mx-auto px-6 py-10 text-white">

          <h1 className="text-4xl font-bold mb-4">
            {event.title}
          </h1>

          <p className="text-gray-300 mb-6">
            📅 {event.date} • 📍 {event.location}
          </p>

          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              About Event
            </h2>

            <p className="text-gray-300">
              {event.description}
            </p>
          </div>

          {/* Ticket Section */}

          <div className="grid md:grid-cols-2 gap-6">

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">
                General Ticket
              </h3>

              <p className="text-purple-400 mb-4">
                0.02 ETH
              </p>

              <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg">
                Buy Ticket
              </button>
            </div>

            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">
                VIP Ticket
              </h3>

              <p className="text-purple-400 mb-4">
                0.05 ETH
              </p>

              <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg">
                Buy Ticket
              </button>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}