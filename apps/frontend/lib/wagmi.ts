import { http, createConfig } from 'wagmi';
import { hardhat, polygonAmoy } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';

export const hardhatLocal = {
  ...hardhat,
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
} as const;

export const config = createConfig({
  chains: [hardhatLocal, polygonAmoy],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),
    [polygonAmoy.id]: http(),
  },
});

export { polygonAmoy };
