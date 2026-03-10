'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function ConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="px-3 py-2 bg-gray-800 rounded-lg text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Find MetaMask or injected connector
  const connector = connectors.find(c => c.name === 'MetaMask') || connectors[0];

  return (
    <button
      onClick={() => connect({ connector })}
      disabled={isConnecting}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        isConnecting
          ? 'bg-gray-700 text-gray-400 cursor-wait'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      }`}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
