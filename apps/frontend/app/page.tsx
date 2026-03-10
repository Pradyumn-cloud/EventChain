'use client';

import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Event Ticketing
            </span>
            <br />
            <span className="text-white">Reimagined with NFTs</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Buy, sell, and verify event tickets on the blockchain. 
            Secure, transparent, and impossible to counterfeit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-lg transition"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold text-lg transition"
              >
                Get Started
              </Link>
            )}
            <Link
              href="/events"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-semibold text-lg transition"
            >
              Browse Events
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-16">
          <FeatureCard
            icon="🔒"
            title="Secure & Verifiable"
            description="Every ticket is an NFT on the blockchain. Impossible to counterfeit or duplicate."
          />
          <FeatureCard
            icon="⚡"
            title="Instant Transfers"
            description="Buy tickets instantly with your crypto wallet. No middlemen, no waiting."
          />
          <FeatureCard
            icon="📱"
            title="Easy Check-in"
            description="Show your QR code at the venue. Quick verification on the blockchain."
          />
        </div>

        {/* How it Works */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StepCard step={1} title="Connect Wallet" description="Link your MetaMask or other Web3 wallet" />
            <StepCard step={2} title="Create Account" description="Sign up as a user or event organizer" />
            <StepCard step={3} title="Browse Events" description="Find exciting events near you" />
            <StepCard step={4} title="Get Tickets" description="Purchase NFT tickets instantly" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="text-2xl">🎫</span>
              <span className="font-bold text-xl">EventChain</span>
            </div>
            <p className="text-gray-500 text-sm">
              Built with Next.js, Solidity & Polygon
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
