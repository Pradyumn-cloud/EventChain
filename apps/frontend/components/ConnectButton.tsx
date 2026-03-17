"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Loader2, Wallet } from "lucide-react";

export function ConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex  items-center gap-2">
        <span className="px-3 py-2 bg-white/[0.06] border border-white/15 rounded-xl text-sm tracking-wide text-[#EBE7D8] backdrop-blur-md">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2  rounded-xl text-sm tracking-widest uppercase font-light border border-red-300/20 bg-red-900/30 text-red-100/90 hover:bg-red-800/40 hover:border-red-200/40 transition-all duration-300"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Find MetaMask or injected connector
  const connector =
    connectors.find((c) => c.name === "MetaMask") || connectors[0];

  return (
    <button
      onClick={() => connect({ connector })}
      disabled={isConnecting}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm tracking-widest uppercase font-light border transition-all duration-500 ${
        isConnecting
          ? "bg-black/40 border-white/10 text-white/30 cursor-wait"
          : "bg-white/10 hover:bg-[#F2E0AE]/20 border-white/20 hover:border-[#F2E0AE]/50 text-[#EBE7D8] hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.04)] hover:shadow-[0_0_28px_rgba(242,224,174,0.2)]"
      }`}
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </button>
  );
}
