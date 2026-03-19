"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Sparkles } from "lucide-react";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["italic", "normal"],
});
const outfit = Outfit({ weight: ["300", "400", "500"], subsets: ["latin"] });

export function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <nav
      className={`border-b border-white/10 bg-[#070914]/55 backdrop-blur-md sticky top-0 z-50 ${outfit.className}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className={`${cormorant.className} text-3xl tracking-wide flex items-center gap-2 text-[#F2E0AE] hover:text-white transition-colors duration-300`}
          >
            <Sparkles
              className="w-5 h-5 text-current opacity-70"
              strokeWidth={1.5}
            />
            <span className="italic">Event</span>Chain
            <span className="hidden md:inline text-[10px] uppercase tracking-[0.2em] text-white/35 ml-2 font-normal">
              Protocol
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase font-light">
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className="text-white/60 hover:text-white transition-colors duration-300"
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/events"
              className="text-white/60 hover:text-white transition-colors duration-300"
            >
              Events
            </Link>
            {user?.role === "ORGANIZER" && (
              <Link
                href="/dashboard/create-event"
                className="text-white/60 hover:text-white transition-colors duration-300"
              >
                Create Event
              </Link>
            )}
          </div>

          {/* Right Side - Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-[11px] tracking-widest uppercase text-white/45 font-light px-3 py-2 border border-white/10 rounded-xl bg-white/3">
                  {user?.role === "ORGANIZER" ? "Organizer" : "User"}
                </span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-xl text-xs tracking-widest uppercase font-light border border-white/20 bg-white/4 text-white/80 hover:text-white hover:bg-white/8 transition-all duration-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 rounded-xl text-xs tracking-widest uppercase font-light border border-white/20 bg-white/4 text-white/80 hover:text-white hover:bg-white/8 transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
