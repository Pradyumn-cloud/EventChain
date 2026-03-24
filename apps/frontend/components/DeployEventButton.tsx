'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { Loader2, Zap, AlertCircle } from 'lucide-react';
import { deployEventTicketContract } from '@/lib/web3-deploy';
import { activateEvent, Event, TicketTier } from '@/lib/api';

interface DeployEventButtonProps {
  event: Event & { tiers: TicketTier[] };
  onSuccess?: () => void;
}

export function DeployEventButton({ event, onSuccess }: DeployEventButtonProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConnected || !address) {
    return (
      <button
        disabled
        className="w-full px-4 py-3 bg-gray-700 disabled:opacity-50 rounded-lg text-white font-medium transition flex items-center justify-center gap-2"
        title="Connect wallet to deploy"
      >
        <AlertCircle className="w-4 h-4" />
        Connect Wallet to Deploy
      </button>
    );
  }

  const handleDeploy = async () => {
    if (!walletClient || event.tiers.length === 0) {
      setError(event.tiers.length === 0 ? 'Event must have at least one tier' : 'Wallet not connected');
      return;
    }

    try {
      setIsDeploying(true);
      setError(null);

      // Convert wagmi wallet client into an ethers signer for ContractFactory deployment.
      const provider = new BrowserProvider(walletClient as any);
      const ethersSigner = await provider.getSigner(address);

      // Deploy the smart contract
      const deployResult = await deployEventTicketContract({
        eventId: event.id,
        eventTitle: event.title,
        tiers: event.tiers || [],
        signer: ethersSigner,
      });

      if (!/^0x[a-fA-F0-9]{40}$/.test(deployResult.contractAddress)) {
        throw new Error('Deployment failed to return a valid contract address');
      }

      // Activate event with contract address on backend
      const token = localStorage.getItem('eventchain_token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await activateEvent(event.id, deployResult.contractAddress, token);

      // Success!
      console.log('Event deployed successfully:', deployResult.contractAddress);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Deployment failed');
      console.error('Deployment error:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      <button
        disabled={isDeploying}
        onClick={handleDeploy}
        className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:opacity-50 rounded-lg text-white font-medium transition flex items-center justify-center gap-2"
      >
        {isDeploying ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Deploying Contract...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Deploy to Blockchain
          </>
        )}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded flex items-center gap-2 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </>
  );
}
