'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { 
  User, 
  Role, 
  signUp as apiSignUp, 
  signIn as apiSignIn, 
  getMe, 
  setToken, 
  getToken, 
  removeToken 
} from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (role: Role) => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Check existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await getMe(token);
          setUser(userData);
        } catch (err) {
          // Token invalid, remove it
          removeToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Clear user if wallet disconnected
  useEffect(() => {
    if (!isConnected && user) {
      removeToken();
      setUser(null);
    }
  }, [isConnected, user]);

  const signUp = useCallback(async (role: Role) => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First sign up
      await apiSignUp(address, role);
      
      // Then sign in to get token
      const signInResponse = await apiSignIn(address);
      
      if (signInResponse.token) {
        setToken(signInResponse.token);
        setUser(signInResponse.user || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const signIn = useCallback(async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiSignIn(address);
      
      if (response.token) {
        setToken(response.token);
        setUser(response.user || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const signOut = useCallback(() => {
    removeToken();
    setUser(null);
    disconnect();
  }, [disconnect]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signOut,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
