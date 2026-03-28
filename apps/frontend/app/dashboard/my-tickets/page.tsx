"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  getMyTickets,
  getTicketQr,
  getToken,
  type TicketQrResponse,
  type UserTicket,
} from "@/lib/api";

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<TicketQrResponse | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!isAuthenticated) return;
      try {
        setIsLoadingTickets(true);
        setError(null);
        const token = getToken();
        if (!token) throw new Error("Please sign in again");
        const data = await getMyTickets(token);
        setTickets(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load tickets");
        setTickets([]);
      } finally {
        setIsLoadingTickets(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated]);

  const upcomingTickets = useMemo(
    () =>
      tickets.filter((ticket) => new Date(ticket.event.endTime) >= new Date()),
    [tickets],
  );

  const usedOrPastTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          ticket.status === "USED" ||
          new Date(ticket.event.endTime) < new Date(),
      ),
    [tickets],
  );

  const handleViewQr = async (ticketId: string) => {
    try {
      setIsLoadingQr(true);
      setQrError(null);
      const token = getToken();
      if (!token) throw new Error("Please sign in again");
      const data = await getTicketQr(ticketId, token);
      setQrData(data);
    } catch (err: any) {
      setQrError(err?.message || "Failed to generate QR");
    } finally {
      setIsLoadingQr(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <Link
            href="/events"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Browse Events
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {isLoadingTickets ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">🎟️</div>
            <p className="text-xl mb-2">No tickets yet</p>
            <p className="text-sm mb-4">Purchase tickets to see them here</p>
            <Link
              href="/events"
              className="text-purple-400 hover:text-purple-300"
            >
              Browse events →
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="text-xl font-semibold mb-4">Upcoming Tickets</h2>
              {upcomingTickets.length === 0 ? (
                <p className="text-gray-400">No upcoming tickets.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-5"
                    >
                      <p className="text-lg font-semibold">
                        {ticket.event.title}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        {ticket.tier.name} • Token #{ticket.tokenId}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {new Date(ticket.event.startTime).toLocaleString()} •{" "}
                        {ticket.event.venue}
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => handleViewQr(ticket.id)}
                          disabled={isLoadingQr}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition disabled:opacity-50"
                        >
                          {isLoadingQr ? "Generating QR..." : "View Entry QR"}
                        </button>
                        <span className="text-xs text-emerald-300">
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">
                Past / Used Tickets
              </h2>
              {usedOrPastTickets.length === 0 ? (
                <p className="text-gray-400">No past tickets.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {usedOrPastTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-5"
                    >
                      <p className="text-lg font-semibold">
                        {ticket.event.title}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        {ticket.tier.name} • Token #{ticket.tokenId}
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {new Date(ticket.event.startTime).toLocaleString()} •{" "}
                        {ticket.event.venue}
                      </p>
                      <p className="mt-4 text-xs text-gray-400">
                        Status: {ticket.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {(qrData || qrError) && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Entry QR</h3>
                <button
                  onClick={() => {
                    setQrData(null);
                    setQrError(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              {qrError ? (
                <p className="text-red-300 text-sm">{qrError}</p>
              ) : qrData ? (
                <>
                  <img
                    alt="Ticket QR"
                    className="mx-auto rounded-lg bg-white p-2"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      qrData.qrData,
                    )}`}
                  />
                  <p className="mt-4 text-sm text-gray-300 text-center">
                    {qrData.ticket.eventTitle}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 text-center">
                    Expires at {new Date(qrData.expiresAt).toLocaleString()}
                  </p>
                </>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
