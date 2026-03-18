"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import {
  Plus,
  ListMusic,
  BarChart3,
  Search,
  Ticket,
  History,
  Loader2,
} from "lucide-react";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["italic", "normal"],
});
const outfit = Outfit({ weight: ["300", "400", "500"], subsets: ["latin"] });

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen bg-[#070914] flex items-center justify-center ${outfit.className}`}
      >
        <div className="flex flex-col items-center gap-4 text-[#F2E0AE]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs tracking-widest uppercase font-light">
            Loading Protocol
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className={`min-h-screen bg-[#070914] text-[#EBE7D8] ${outfit.className} overflow-hidden relative selection:bg-[#EBE7D8] selection:text-[#070914]`}
    >
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#1A2552] blur-[120px] opacity-40 mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#3D294D] blur-[150px] opacity-50 mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-[30%] left-[50%] w-[30vw] h-[30vw] rounded-full bg-[#755D30] blur-[180px] opacity-20 mix-blend-lighten animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          {/* Welcome Section */}
          <div className="mb-16 border-b border-white/10 pb-8">
            <h1
              className={`${cormorant.className} text-4xl md:text-5xl font-normal text-white mb-4 tracking-tight`}
            >
              Welcome back,{" "}
              <span className="italic text-[#F2E0AE]">
                {user.role === "ORGANIZER" ? "Director" : "Connoisseur"}
              </span>
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-sm font-light tracking-widest uppercase text-white/50 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                {user.walletAddress.slice(0, 6)}...
                {user.walletAddress.slice(-4)}
              </p>
              <span className="px-3 py-2 text-[10px] tracking-widest uppercase rounded-xl border border-[#F2E0AE]/30 bg-[#F2E0AE]/10 text-[#F2E0AE]">
                {user.role}
              </span>
            </div>
          </div>

          {/* Dashboard Content based on Role */}
          {user.role === "ORGANIZER" ? (
            <OrganizerDashboard />
          ) : (
            <UserDashboard />
          )}
        </main>
      </div>
    </div>
  );
}

function OrganizerDashboard() {
  return (
    <div className="space-y-12">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/create-event"
          className="p-8 backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-[#F2E0AE]/10 hover:border-[#F2E0AE]/40 transition-all duration-500 group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F2E0AE]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-6 group-hover:border-[#F2E0AE] group-hover:text-[#F2E0AE] transition-colors">
            <Plus strokeWidth={1.5} className="w-5 h-5" />
          </div>
          <h3
            className={`${cormorant.className} text-3xl mb-2 tracking-wide text-white group-hover:text-[#F2E0AE] transition-colors`}
          >
            Create Event
          </h3>
          <p className="text-sm text-white/40 font-light tracking-wide leading-relaxed">
            Launch a new exclusive event with secure NFT access protocols.
          </p>
        </Link>

        <Link
          href="/dashboard/my-events"
          className="p-8 backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 group"
        >
          <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
            <ListMusic
              strokeWidth={1.5}
              className="w-5 h-5 text-white/60 group-hover:text-white"
            />
          </div>
          <h3
            className={`${cormorant.className} text-2xl mb-2 tracking-wide text-white/80 group-hover:text-white transition-colors`}
          >
            My Events
          </h3>
          <p className="text-sm text-white/40 font-light tracking-wide leading-relaxed">
            Manage your curated events and guestlists.
          </p>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="p-8 backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 group"
        >
          <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
            <BarChart3
              strokeWidth={1.5}
              className="w-5 h-5 text-white/60 group-hover:text-white"
            />
          </div>
          <h3
            className={`${cormorant.className} text-2xl mb-2 tracking-wide text-white/80 group-hover:text-white transition-colors`}
          >
            Analytics
          </h3>
          <p className="text-sm text-white/40 font-light tracking-wide leading-relaxed">
            View attendance metrics and revenue insights.
          </p>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Events" value="0" />
        <StatCard title="Tickets Issued" value="0" />
        <StatCard title="Revenue" value="0.00" suffix="POL" />
        <StatCard title="Active Experiences" value="0" />
      </div>

      {/* Recent Activity */}
      <div className="backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10">
        <h2
          className={`${cormorant.className} text-3xl text-white mb-8 italic`}
        >
          Recent Activity
        </h2>
        <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/[0.01]">
          <p className="text-sm tracking-widest uppercase font-light text-white/30 mb-6">
            No recent activity detected.
          </p>
          <Link
            href="/dashboard/create-event"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#F2E0AE] hover:text-white transition-colors pb-1 border-b border-[#F2E0AE]/30 hover:border-white"
          >
            <Plus className="w-3 h-3" /> Initiate First Event
          </Link>
        </div>
      </div>
    </div>
  );
}

function UserDashboard() {
  return (
    <div className="space-y-12">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/events"
          className="p-8 backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl hover:bg-[#F2E0AE]/10 hover:border-[#F2E0AE]/40 transition-all duration-500 group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F2E0AE]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-6 group-hover:border-[#F2E0AE] group-hover:text-[#F2E0AE] transition-colors">
            <Search strokeWidth={1.5} className="w-5 h-5" />
          </div>
          <h3
            className={`${cormorant.className} text-3xl mb-2 tracking-wide text-white group-hover:text-[#F2E0AE] transition-colors`}
          >
            Browse Collection
          </h3>
          <p className="text-sm text-white/40 font-light tracking-wide leading-relaxed">
            Discover upcoming exclusive events and secure access.
          </p>
        </Link>

        <Link
          href="/dashboard/my-tickets"
          className="p-8 backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 group"
        >
          <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
            <Ticket
              strokeWidth={1.5}
              className="w-5 h-5 text-white/60 group-hover:text-white"
            />
          </div>
          <h3
            className={`${cormorant.className} text-2xl mb-2 tracking-wide text-white/80 group-hover:text-white transition-colors`}
          >
            My Access
          </h3>
          <p className="text-sm text-white/40 font-light tracking-wide leading-relaxed">
            View and verify your secure NFT event tickets.
          </p>
        </Link>

        <Link
          href="/dashboard/history"
          className="p-8 backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 group"
        >
          <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
            <History
              strokeWidth={1.5}
              className="w-5 h-5 text-white/60 group-hover:text-white"
            />
          </div>
          <h3
            className={`${cormorant.className} text-2xl mb-2 tracking-wide text-white/80 group-hover:text-white transition-colors`}
          >
            Archives
          </h3>
          <p className="text-sm text-white/40 font-light tracking-wide leading-relaxed">
            Browse your history of attended events.
          </p>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Tickets" value="0" />
        <StatCard title="Events Attended" value="0" />
        <StatCard title="Upcoming Invites" value="0" />
      </div>

      {/* My Tickets */}
      <div className="backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10">
        <h2
          className={`${cormorant.className} text-3xl text-white mb-8 italic`}
        >
          Your Passes
        </h2>
        <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/[0.01]">
          <p className="text-sm tracking-widest uppercase font-light text-white/30 mb-6">
            Your collection is currently empty.
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[#F2E0AE] hover:text-white transition-colors pb-1 border-b border-[#F2E0AE]/30 hover:border-white"
          >
            <Search className="w-3 h-3" /> Explore Events
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  suffix,
}: {
  title: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="backdrop-blur-xl bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors duration-500">
      <p className="text-xs tracking-widest uppercase font-light text-white/40 mb-3">
        {title}
      </p>
      <div className="flex items-baseline gap-2">
        <p className={`${cormorant.className} text-4xl text-[#F2E0AE]`}>
          {value}
        </p>
        {suffix && (
          <span className="text-xs tracking-widest uppercase text-white/30">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
