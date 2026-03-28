const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type Role = "USER" | "ORGANIZER";

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
export async function signUp(
  walletAddress: string,
  role: Role,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress, role }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Sign up failed");
  }

  return data;
}

// Sign in an existing user
export async function signIn(walletAddress: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Sign in failed");
  }

  return data;
}

// Get current user info using token
export async function getMe(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to get user info");
  }

  return data.user;
}

// Store token in localStorage
export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("eventchain_token", token);
  }
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("eventchain_token");
  }
  return null;
}

// Remove token from localStorage
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("eventchain_token");
  }
}

// ==================== Event APIs ====================

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  venue: string;
  location: string;
  bannerImage?: string;
  startTime: string;
  endTime: string;
  category: string;
  contractAddress?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  price: string;
  totalSupply: number;
  soldCount: number;
}

export interface EventResponse {
  event?: Event;
  events?: Event[];
  tiers?: TicketTier[];
  tier?: TicketTier;
  message?: string;
  error?: string;
}

export interface OrganizerDashboardStats {
  totalEvents: number;
  ticketsIssued: number;
  revenue: number;
  activeExperiences: number;
}

// Create a new event (organizer only)
export async function createEvent(
  eventData: {
    title: string;
    description: string;
    venue: string;
    location: string;
    bannerImage?: string;
    startTime: string;
    endTime: string;
    category: string;
  },
  token: string,
): Promise<Event> {
  const response = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to create event");
  }

  return data;
}

// Get all events (active ones for users)
export async function getAllEvents(): Promise<Event[]> {
  const response = await fetch(`${API_URL}/events`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch events");
  }

  return Array.isArray(data) ? data : [];
}

// Get single event by ID
export async function getEventById(eventId: string): Promise<Event> {
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch event");
  }

  return data;
}

// Get organizer's events
export async function getOrganizerEvents(token: string): Promise<Event[]> {
  const response = await fetch(`${API_URL}/events/mine`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch organizer events");
  }

  return Array.isArray(data) ? data : [];
}

export async function getOrganizerDashboardStats(
  token: string,
): Promise<OrganizerDashboardStats> {
  const response = await fetch(`${API_URL}/organizer/dashboard-stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch organizer dashboard stats");
  }

  return data;
}

// Update event details (organizer only)
export async function updateEvent(
  eventId: string,
  eventData: Partial<Event>,
  token: string,
): Promise<Event> {
  const response = await fetch(`${API_URL}/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update event");
  }

  return data;
}

// Activate event with smart contract address (organizer only)
export async function activateEvent(
  eventId: string,
  contractAddress: string,
  token: string,
): Promise<Event> {
  const response = await fetch(`${API_URL}/events/${eventId}/activate`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ contractAddress }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to activate event");
  }

  return data.event || data;
}

// ==================== Tier APIs ====================

// Get all tiers for an event
export async function getEventTiers(eventId: string): Promise<TicketTier[]> {
  const response = await fetch(`${API_URL}/tiers/${eventId}/tiers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch tiers");
  }

  return data.tiers || [];
}

// Add a single tier to event (organizer only)
export async function addTier(
  eventId: string,
  tierData: {
    name: string;
    price: string | number;
    totalSupply: number;
  },
  token: string,
): Promise<TicketTier> {
  const response = await fetch(`${API_URL}/tiers/${eventId}/tiers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(tierData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to add tier");
  }

  return data.tier;
}

// Add multiple tiers at once (organizer only)
export async function addBulkTiers(
  eventId: string,
  tiers: Array<{
    name: string;
    price: string | number;
    totalSupply: number;
  }>,
  token: string,
): Promise<TicketTier[]> {
  const response = await fetch(`${API_URL}/tiers/${eventId}/tiers/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tiers }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to add tiers");
  }

  return data.tiers || [];
}

// Delete a tier (organizer only)
export async function deleteTier(tierId: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/tiers/${tierId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete tier");
  }
}

// ==================== Ticket APIs ====================

export interface UserTicket {
  id: string;
  eventId: string;
  tierId: string;
  ownerId: string;
  tokenId: number;
  status: "VALID" | "USED";
  mintTxHash: string;
  purchasedAt: string;
  usedAt?: string | null;
  event: Event;
  tier: TicketTier;
}

export interface ConfirmTicketInput {
  eventId: string;
  tierId: string;
  txHash: string;
  tokenId: number;
}

export interface TicketQrResponse {
  qrData: string;
  expiresAt: number;
  ticket: {
    id: string;
    eventTitle: string;
    venue: string;
    startTime: string;
  };
}

export async function getMyTickets(token: string): Promise<UserTicket[]> {
  const response = await fetch(`${API_URL}/tickets`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch tickets");
  }

  return data.tickets || [];
}

export async function confirmTicketPurchase(
  payload: ConfirmTicketInput,
  token: string,
): Promise<UserTicket> {
  const response = await fetch(`${API_URL}/tickets/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to confirm ticket purchase");
  }

  return data.ticket;
}

export async function getTicketQr(
  ticketId: string,
  token: string,
): Promise<TicketQrResponse> {
  const response = await fetch(`${API_URL}/tickets/${ticketId}/qr`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch ticket QR");
  }

  return data;
}
