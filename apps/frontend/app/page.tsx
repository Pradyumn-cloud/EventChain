"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { Sparkles, ArrowUpRight, Lock, Zap, QrCode } from "lucide-react";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["italic", "normal"],
});
const outfit = Outfit({ weight: ["300", "400", "500"], subsets: ["latin"] });

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className={`min-h-screen bg-[#070914] text-[#EBE7D8] ${outfit.className} overflow-hidden relative selection:bg-[#EBE7D8] selection:text-[#070914]`}
    >
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#1A2552] blur-[120px] opacity-60 mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#3D294D] blur-[150px] opacity-70 mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-[30%] left-[50%] w-[30vw] h-[30vw] rounded-full bg-[#755D30] blur-[180px] opacity-30 mix-blend-lighten animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 py-16 md:py-32 flex flex-col items-center text-center">
          <div className="mb-4 text-[#F2E0AE]/60 tracking-widest uppercase text-xs font-light flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>The Next Evolution of Access</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <h1
            className={`${cormorant.className} text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] font-normal tracking-tight text-[#F2E0AE] mb-8`}
          >
            Event Ticketing <br className="hidden md:block" />
            <span className="italic text-white">Reimagined</span> with NFTs.
          </h1>

          <p className="text-lg md:text-xl font-light tracking-wide text-white/60 max-w-2xl mx-auto leading-relaxed mb-12">
            Buy, sell, and verify event tickets on the blockchain. Secure,
            transparent, and impossible to counterfeit. Experience true
            ownership.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-4 bg-[#F2E0AE] text-[#070914] px-8 py-4 rounded-full font-medium tracking-widest uppercase text-sm hover:bg-white transition-all duration-500 shadow-[0_0_30px_rgba(242,224,174,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]"
              >
                <span>Go to Dashboard</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="group inline-flex items-center gap-4 bg-[#F2E0AE] text-[#070914] px-8 py-4 rounded-full font-medium tracking-widest uppercase text-sm hover:bg-white transition-all duration-500 shadow-[0_0_30px_rgba(242,224,174,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]"
              >
                <span>Get Started</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            )}
            <Link
              href="/events"
              className="px-8 py-4 rounded-full border border-white/20 text-sm tracking-widest uppercase font-light hover:bg-white/10 hover:border-white/40 transition-all duration-500 backdrop-blur-md text-white/80 hover:text-white"
            >
              Browse Events
            </Link>
          </div>
        </main>

        {/* Features */}
        <div className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <Lock className="w-8 h-8 text-[#F2E0AE] mb-6" strokeWidth={1} />
              }
              title="Secure & Verifiable"
              description="Every ticket is an NFT on the blockchain. Impossible to counterfeit or duplicate."
            />
            <FeatureCard
              icon={
                <Zap className="w-8 h-8 text-[#F2E0AE] mb-6" strokeWidth={1} />
              }
              title="Instant Transfers"
              description="Buy tickets instantly with your crypto wallet. No middlemen, no waiting."
            />
            <FeatureCard
              icon={
                <QrCode
                  className="w-8 h-8 text-[#F2E0AE] mb-6"
                  strokeWidth={1}
                />
              }
              title="Easy Check-in"
              description="Show your QR code at the venue. Quick verification on the blockchain."
            />
          </div>
        </div>

        {/* How it Works */}
        <div className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
          <h2
            className={`${cormorant.className} text-4xl md:text-5xl text-center mb-16 text-[#F2E0AE] italic`}
          >
            The Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard
              step="01"
              title="Connect Wallet"
              description="Link your MetaMask or other Web3 wallet to establish identity."
            />
            <StepCard
              step="02"
              title="Create Account"
              description="Sign up as an attendee or an event organizer."
            />
            <StepCard
              step="03"
              title="Browse Events"
              description="Discover exclusive, curated events happening globally."
            />
            <StepCard
              step="04"
              title="Secure Access"
              description="Purchase NFT tickets and claim your spot instantly."
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-16 backdrop-blur-md bg-[#070914]/50">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div
              className={`${cormorant.className} text-2xl tracking-wide flex items-center gap-2 text-[#F2E0AE]`}
            >
              <Sparkles
                className="w-4 h-4 text-current opacity-70"
                strokeWidth={1.5}
              />
              <span className="italic">Event</span>Chain
            </div>
            <p className="text-xs tracking-widest text-white/30 font-light uppercase">
              Built with Next.js, Solidity & Polygon. Est.{" "}
              {new Date().getFullYear()}.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl hover:bg-white/[0.04] transition-colors duration-500 group">
      <div className="transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 origin-bottom-left">
        {icon}
      </div>
      <h3
        className={`${cormorant.className} text-3xl text-white mb-4 tracking-wide`}
      >
        {title}
      </h3>
      <p className="text-white/50 font-light leading-relaxed tracking-wide text-sm">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4 group">
      <div
        className={`${cormorant.className} text-5xl text-white/10 group-hover:text-[#F2E0AE]/40 transition-colors duration-500 italic`}
      >
        {step}
      </div>
      <div className="h-px w-full bg-white/10 group-hover:bg-[#F2E0AE]/30 transition-colors duration-500 relative">
        <div className="absolute top-0 left-0 w-0 h-full bg-[#F2E0AE] group-hover:w-full transition-all duration-1000 ease-out" />
      </div>
      <h3 className={`${cormorant.className} text-2xl text-white mt-4`}>
        {title}
      </h3>
      <p className="text-sm font-light text-white/40 leading-relaxed tracking-wide">
        {description}
      </p>
    </div>
  );
}
