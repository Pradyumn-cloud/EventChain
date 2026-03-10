'use client';

import { useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Loading component
function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
    </div>
  );
}

// Client-only wrapper
function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <Loading />;
  }
  
  return <>{children}</>;
}

// Dynamic import of the actual providers (client-only)
const Web3Providers = dynamic(
  () => import('./web3-providers').then((mod) => mod.Web3Providers),
  { 
    ssr: false,
    loading: () => <Loading />
  }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClientOnly>
      <Web3Providers>{children}</Web3Providers>
    </ClientOnly>
  );
}
