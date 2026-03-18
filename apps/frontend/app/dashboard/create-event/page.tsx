"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import {
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  MapPin,
  Calendar,
  Tag,
  Info,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["italic", "normal"],
});
const outfit = Outfit({ weight: ["300", "400", "500"], subsets: ["latin"] });

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated or not an organizer
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth");
      } else if (user?.role !== "ORGANIZER") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || !user || user.role !== "ORGANIZER") {
    return (
      <div
        className={`min-h-screen bg-[#070914] flex items-center justify-center ${outfit.className}`}
      >
        <div className="flex flex-col items-center gap-4 text-[#F2E0AE]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs tracking-widest uppercase font-light">
            Verifying Clearance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#070914] text-[#EBE7D8] ${outfit.className} overflow-hidden relative selection:bg-[#EBE7D8] selection:text-[#070914]`}
    >
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#1A2552] blur-[120px] opacity-40 mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#3D294D] blur-[150px] opacity-50 mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]" />

      <div className="relative z-10 h-screen flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto px-6 py-8 pb-32">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-light text-white/40 hover:text-[#F2E0AE] transition-colors mb-4 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
                  Back to Protocol
                </Link>
                <h1
                  className={`${cormorant.className} text-4xl md:text-5xl font-normal text-white tracking-tight`}
                >
                  Initialize{" "}
                  <span className="italic text-[#F2E0AE]">Event</span>
                </h1>
                <p className="text-sm font-light text-white/50 tracking-wide mt-2">
                  Mint a new exclusive experience on the ledger.
                </p>
              </div>
            </div>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              {/* Basic Info Section */}
              <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#F2E0AE]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <h2
                  className={`${cormorant.className} text-3xl text-white mb-6 flex items-center gap-3`}
                >
                  <Info className="w-5 h-5 text-[#F2E0AE]" strokeWidth={1.5} />
                  Core Data
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs tracking-widest uppercase text-white/50 mb-3 ml-1">
                      Event Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Symphony of the Void"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#F2E0AE]/50 focus:bg-white/[0.02] transition-all font-light tracking-wide text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-widest uppercase text-white/50 mb-3 ml-1">
                      Manifesto
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe the experience..."
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#F2E0AE]/50 focus:bg-white/[0.02] transition-all font-light tracking-wide resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-white/50 mb-3 ml-1">
                        Classification
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10" />
                        <select className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-[#F2E0AE]/50 focus:bg-white/[0.02] transition-all font-light tracking-wide appearance-none cursor-pointer">
                          <option value="music">Music</option>
                          <option value="sports">Sports</option>
                          <option value="conference">Conference</option>
                          <option value="art">Art Exhibition</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs tracking-widest uppercase text-white/50 mb-3 ml-1">
                        Visual Asset
                      </label>
                      <div className="relative flex items-center justify-center w-full bg-black/20 border border-white/10 border-dashed rounded-xl px-5 py-4 text-white hover:border-[#F2E0AE]/50 hover:bg-white/[0.02] transition-all cursor-pointer group/upload">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div className="flex items-center gap-3 text-white/40 group-hover/upload:text-[#F2E0AE] transition-colors font-light text-sm tracking-wide">
                          <ImageIcon className="w-5 h-5" strokeWidth={1.5} />
                          <span>Upload Banner Image</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time & Space Section */}
              <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#F2E0AE]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <h2
                  className={`${cormorant.className} text-3xl text-white mb-6 flex items-center gap-3`}
                >
                  <MapPin
                    className="w-5 h-5 text-[#F2E0AE]"
                    strokeWidth={1.5}
                  />
                  Time & Space
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-white/50 mb-3 ml-1">
                        Venue Identity
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Madison Square Garden"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#F2E0AE]/50 focus:bg-white/[0.02] transition-all font-light tracking-wide"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-white/50 mb-3 ml-1">
                        Coordinates
                      </label>
                      <input
                        type="text"
                        placeholder="City, Country"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:border-[#F2E0AE]/50 focus:bg-white/[0.02] transition-all font-light tracking-wide"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-white/50 mb-3 ml-1">
                        Commencement
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="datetime-local"
                          className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white/80 focus:outline-none focus:border-[#F2E0AE]/50 focus:bg-white/[0.02] transition-all font-light tracking-wide [&::-webkit-calendar-picker-indicator]:filter-[invert(1)] [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs tracking-widest uppercase text-white/50 mb-3 ml-1">
                        Conclusion
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="datetime-local"
                          className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white/80 focus:outline-none focus:border-[#F2E0AE]/50 focus:bg-white/[0.02] transition-all font-light tracking-wide [&::-webkit-calendar-picker-indicator]:filter-[invert(1)] [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiers Section */}
              <div className="backdrop-blur-xl bg-white/[0.02] border border-[#F2E0AE]/20 rounded-3xl p-8 relative overflow-hidden group shadow-[0_0_30px_rgba(242,224,174,0.03)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h2
                    className={`${cormorant.className} text-3xl text-[#F2E0AE] italic flex items-center gap-3`}
                  >
                    <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
                    Access Protocols
                  </h2>
                  <p className="text-xs tracking-widest uppercase font-light text-white/40 border border-white/10 px-3 py-1 rounded-full bg-white/[0.02]">
                    Blockchain Registry
                  </p>
                </div>

                <div className="p-8 border border-dashed border-[#F2E0AE]/30 rounded-2xl bg-[#F2E0AE]/[0.02] text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-[#F2E0AE]/30 bg-[#F2E0AE]/10 flex items-center justify-center mb-4 text-[#F2E0AE]">
                    <Loader2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <p className="text-lg text-white/80 tracking-wide font-light mb-2">
                    Smart Contract Initialization Pending
                  </p>
                  <p className="text-sm font-light text-white/40 tracking-wide max-w-md">
                    Ticket tier configuration, capacity limits, and POL pricing
                    structures will be available once the ledger sync completes.
                  </p>
                </div>
              </div>

              {/* Actions - Fixed Bottom Bar on Mobile, Flowing on Desktop */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-4 bg-white/[0.03] border border-white/10 hover:border-white/30 hover:bg-white/[0.06] text-white rounded-xl text-sm tracking-widest uppercase font-medium transition-all duration-300 backdrop-blur-md"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  disabled
                  className="flex-1 px-8 py-4 bg-white/10 border border-white/20 text-white/40 rounded-xl text-sm tracking-widest uppercase font-medium transition-all duration-300 backdrop-blur-md cursor-not-allowed"
                >
                  Deploy to Ledger (Soon)
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
