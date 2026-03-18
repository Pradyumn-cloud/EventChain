"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Calendar, MapPin, Ticket } from "lucide-react";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["italic", "normal"],
});
const outfit = Outfit({ weight: ["300", "400", "500"], subsets: ["latin"] });

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
      image: "/AS.png",
    },

    2: {
      title: "Digital Scavenger Hunt",
      date: "20 August 2026",
      location: "Bangalore",
      description:
        "The Digital Scavenger Hunt is an exciting tech-based adventure where participants solve puzzles, decode clues, and complete challenges across different locations in the city. Teams will compete to unlock hidden tasks using technology, creativity, and teamwork. This event is perfect for tech enthusiasts, students, and problem-solvers who enjoy interactive challenges and exploring the city in a fun and competitive way.",
      bg: "/scavanger.jpg",
      image: "/game.png",
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
      image: "/poet.png",
    },

    5: {
      title: "Tech Workshop",
      date: "10 December 2026",
      location: "Hyderabad",
      description:
        " Join us for an immersive Tech Workshop designed to equip you with the latest skills in blockchain development, smart contracts, and Web3 technologies. This hands-on workshop will cover everything from the basics of blockchain to advanced programming techniques. Whether you're a beginner looking to enter the world of blockchain or an experienced developer seeking to enhance your skills, this workshop offers valuable insights and practical experience. Don't miss this opportunity to learn from industry experts and connect with fellow tech enthusiasts.",
      bg: "/hack.png",
      image: "/hackathon.png",
    },
  };

  const event = events[eventId as keyof typeof events];

  if (!event) {
    return (
      <div
        className={`min-h-screen bg-[#070914] flex items-center justify-center text-white ${outfit.className}`}
      >
        <p className="text-xl tracking-widest uppercase font-light text-white/50">
          Event not found
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-cover bg-center relative ${outfit.className} text-[#EBE7D8] selection:bg-[#EBE7D8] selection:text-[#070914]`}
      style={{ backgroundImage: `url(${event.bg})` }}
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
                {event.date}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F2E0AE]" />
                {event.location}
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
            <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-1 shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <h3 className={`${cormorant.className} text-3xl text-white`}>
                  General Access
                </h3>
                <Ticket className="w-6 h-6 text-white/30" />
              </div>

              <p className="text-2xl text-[#F2E0AE] font-light mb-8 flex items-baseline gap-1">
                0.02{" "}
                <span className="text-sm tracking-widest uppercase text-white/50">
                  ETH
                </span>
              </p>

              <button className="w-full bg-white/10 hover:bg-[#F2E0AE] border border-white/20 hover:border-[#F2E0AE] text-white hover:text-[#070914] py-4 rounded-xl font-medium tracking-widest uppercase text-sm transition-all duration-500 backdrop-blur-md">
                Secure Ticket
              </button>
            </div>

            <div className="backdrop-blur-xl bg-white/[0.03] border border-[#F2E0AE]/30 rounded-3xl p-8 hover:bg-white/[0.05] transition-all duration-500 hover:-translate-y-1 shadow-[0_0_30px_rgba(242,224,174,0.05)]">
              <div className="flex justify-between items-start mb-6">
                <h3
                  className={`${cormorant.className} text-3xl text-[#F2E0AE] italic`}
                >
                  VIP Experience
                </h3>
                <Ticket className="w-6 h-6 text-[#F2E0AE]/50" />
              </div>

              <p className="text-2xl text-[#F2E0AE] font-light mb-8 flex items-baseline gap-1">
                0.05{" "}
                <span className="text-sm tracking-widest uppercase text-[#F2E0AE]/50">
                  ETH
                </span>
              </p>

              <button className="w-full bg-[#F2E0AE]/10 hover:bg-[#F2E0AE] border border-[#F2E0AE]/50 text-[#F2E0AE] hover:text-[#070914] py-4 rounded-xl font-medium tracking-widest uppercase text-sm transition-all duration-500 backdrop-blur-md">
                Secure Ticket
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
