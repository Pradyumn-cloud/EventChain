const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type Role = 'USER' | 'ORGANIZER';

export interface User {
  id: string;
  walletAddress: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  userId?: string;
  error?: string;
}

// Sign up a new user
export async function signUp(walletAddress: string, role: Role): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/sign-up`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress, role }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Sign up failed');
  }
  
  return data;
}

// Sign in an existing user
export async function signIn(walletAddress: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/sign-in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Sign in failed');
  }
  
  return data;
}

// Get current user info using token
export async function getMe(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get user info');
  }
  
  return data.user;
}

// Store token in localStorage
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('eventchain_token', token);
  }
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('eventchain_token');
  }
  return null;
}

// Remove token from localStorage  
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('eventchain_token');
  }
}
