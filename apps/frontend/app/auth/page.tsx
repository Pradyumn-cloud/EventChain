'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@/components/ConnectButton';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/lib/api';

export default function AuthPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signUp, signIn, isAuthenticated, isLoading, error, clearError } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<Role>('USER');
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Clear errors when switching modes
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [mode, clearError]);

  const handleSignIn = async () => {
    if (!isConnected) {
      setLocalError('Please connect your wallet first');
      return;
    }
    
    try {
      await signIn();
      router.push('/dashboard');
    } catch (err) {
      // Error is already set in context
      if (err instanceof Error && err.message.includes('not found')) {
        setLocalError('Account not found. Please sign up first.');
      }
    }
  };

  const handleSignUp = async () => {
    if (!isConnected) {
      setLocalError('Please connect your wallet first');
      return;
    }
    
    try {
      await signUp(selectedRole);
      router.push('/dashboard');
    } catch (err) {
      // Error is already set in context
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              EventChain
            </span>
          </h1>
          <p className="text-gray-400">Decentralized Event Ticketing</p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-gray-800 p-1 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                mode === 'signin'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                mode === 'signup'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Wallet Connection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              1. Connect Your Wallet
            </label>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
            {isConnected && (
              <p className="text-center text-sm text-green-400 mt-2">
                ✓ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            )}
          </div>

          {/* Role Selection (Sign Up only) */}
          {mode === 'signup' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                2. Choose Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedRole('USER')}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedRole === 'USER'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">🎟️</div>
                  <div className="font-medium">User</div>
                  <div className="text-xs text-gray-400">Buy tickets</div>
                </button>
                <button
                  onClick={() => setSelectedRole('ORGANIZER')}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedRole === 'ORGANIZER'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">🎭</div>
                  <div className="font-medium">Organizer</div>
                  <div className="text-xs text-gray-400">Create events</div>
                </button>
              </div>
            </div>
          )}
          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error || localError}
            </div>
          )}
          <button
            onClick={mode === 'signin' ? handleSignIn : handleSignUp}
            disabled={!isConnected || isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition ${
              !isConnected || isLoading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : mode === 'signin' ? (
              `${mode === 'signin' ? '2' : '3'}. Sign In with Wallet`
            ) : (
              '3. Create Account'
            )}
          </button>
          <p className="text-center text-sm text-gray-400 mt-4">
            {mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="text-purple-400 hover:text-purple-300"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          Your wallet address serves as your identity. No passwords needed.
        </p>
      </div>
    </div>
  );
}
