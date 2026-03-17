"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/lib/api";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import {
  Sparkles,
  Ticket,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  style: ["italic", "normal"],
});
const outfit = Outfit({ weight: ["300", "400", "500"], subsets: ["latin"] });

export default function AuthPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signUp, signIn, isAuthenticated, isLoading, error, clearError } =
    useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<Role>("USER");
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Clear errors when switching modes
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [mode, clearError]);

  const handleSignIn = async () => {
    if (!isConnected) {
      setLocalError("Please connect your wallet first");
      return;
    }

    try {
      await signIn();
      router.push("/dashboard");
    } catch (err) {
      // Error is already set in context
      if (err instanceof Error && err.message.includes("not found")) {
        setLocalError("Account not found. Please sign up first.");
      }
    }
  };

  const handleSignUp = async () => {
    if (!isConnected) {
      setLocalError("Please connect your wallet first");
      return;
    }

    try {
      await signUp(selectedRole);
      router.push("/dashboard");
    } catch (err) {
      // Error is already set in context
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#070914] text-[#EBE7D8] ${outfit.className} overflow-hidden relative selection:bg-[#EBE7D8] selection:text-[#070914] flex flex-col justify-center`}
    >
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#1A2552] blur-[120px] opacity-60 mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#3D294D] blur-[150px] opacity-70 mix-blend-screen animate-[pulse_15s_ease-in-out_infinite_reverse]" />
      <div className="absolute top-[30%] left-[50%] w-[30vw] h-[30vw] rounded-full bg-[#755D30] blur-[180px] opacity-30 mix-blend-lighten animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-12">
        {/* Back Link & Brand */}
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className={`${cormorant.className} text-3xl tracking-wide flex items-center gap-2 text-[#F2E0AE] hover:text-white transition-colors duration-300`}
          >
            <Sparkles
              className="w-5 h-5 text-current opacity-70"
              strokeWidth={1.5}
            />
            <span className="italic">Event</span>Chain
          </Link>
        </div>

        {/* Auth Glassmorphic Panel */}
        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/10 p-8 md:p-10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2
                className={`${cormorant.className} text-4xl text-[#F2E0AE] mb-2 italic`}
              >
                {mode === "signin" ? "Welcome Back" : "Join the Collection"}
              </h2>
              <p className="text-sm tracking-widest uppercase text-white/50 font-light">
                {mode === "signin"
                  ? "Authenticate via wallet"
                  : "Establish your identity"}
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex rounded-xl bg-black/20 p-1 gap-1 mb-8 border border-white/5">
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 cursor-pointer py-2 px-4 rounded-lg text-xs tracking-widest uppercase font-light transition-all duration-300 ${
                  mode === "signin"
                    ? "bg-white/10 text-[#F2E0AE] shadow-md border border-white/10"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 cursor-pointer py-2 px-4 rounded-lg text-xs tracking-widest uppercase font-light transition-all duration-300 ${
                  mode === "signup"
                    ? "bg-white/10 text-[#F2E0AE] shadow-md border border-white/10"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {/* Wallet Connection */}
              <div>
                <label className="block text-xs tracking-widest uppercase text-white/50 mb-4 text-center">
                  01. Establish Connection
                </label>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
                {isConnected && address && (
                  <p className="text-center text-xs tracking-wider text-[#F2E0AE]/80 mt-4 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500/80 animate-pulse" />
                    Connected: {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                )}
              </div>

              {/* Role Selection (Sign Up only) */}
              {mode === "signup" && (
                <div className="border-t border-white/10 pt-8 mt-2">
                  <label className="block text-xs tracking-widest uppercase text-white/50 mb-4 text-center">
                    02. Select Designation
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedRole("USER")}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 ${
                        selectedRole === "USER"
                          ? "border-[#F2E0AE]/50 bg-[#F2E0AE]/10 text-[#F2E0AE]"
                          : "border-white/10 bg-black/20 text-white/40 hover:border-white/30 hover:text-white/80"
                      }`}
                    >
                      <Ticket className="w-6 h-6" strokeWidth={1.5} />
                      <div className="text-sm tracking-widest uppercase font-light">
                        Attendee
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedRole("ORGANIZER")}
                      className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all duration-300 ${
                        selectedRole === "ORGANIZER"
                          ? "border-[#F2E0AE]/50 bg-[#F2E0AE]/10 text-[#F2E0AE]"
                          : "border-white/10 bg-black/20 text-white/40 hover:border-white/30 hover:text-white/80"
                      }`}
                    >
                      <Building2 className="w-6 h-6" strokeWidth={1.5} />
                      <div className="text-sm tracking-widest uppercase font-light">
                        Organizer
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {(error || localError) && (
                <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-xl text-red-200/80 text-sm font-light flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500/60" />
                  <span>{error || localError}</span>
                </div>
              )}

              <div
                className={
                  mode === "signup"
                    ? "border-t border-white/10 pt-8 mt-2"
                    : "border-t border-white/10 pt-8 mt-2"
                }
              >
                {mode === "signup" && (
                  <label className="block text-xs tracking-widest uppercase text-white/50 mb-4 text-center">
                    03. Finalize
                  </label>
                )}
                <button
                  onClick={mode === "signin" ? handleSignIn : handleSignUp}
                  disabled={!isConnected || isLoading}
                  className={`w-full py-4 rounded-xl font-medium tracking-widest uppercase text-sm transition-all duration-500 backdrop-blur-md border ${
                    !isConnected || isLoading
                      ? "bg-black/40 border-white/5 text-white/20 cursor-not-allowed"
                      : "bg-white/10 hover:bg-[#F2E0AE]/20 border-white/20 hover:border-[#F2E0AE]/50 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(242,224,174,0.2)]"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Authenticating...
                    </span>
                  ) : mode === "signin" ? (
                    "Authenticate"
                  ) : (
                    "Initialize Profile"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs tracking-widest text-white/30 font-light mt-8 uppercase">
          Your wallet is your credential. <br className="md:hidden" />
          No passwords required.
        </p>
      </div>
    </div>
  );
}
