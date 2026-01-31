# EventChain Smart Contracts

## Setup

```bash
cd packages/contracts
npm install
```

## Commands

### Compile contracts
```bash
npm run compile
```

### Run tests
```bash
npm run test
```

### Start local blockchain
```bash
npm run node
```
This starts a local Hardhat node at `http://127.0.0.1:8545` with test accounts.

### Deploy to local network
In a new terminal (while node is running):
```bash
npm run deploy:local
```

### Test full flow locally
```bash
npm run node                    # Terminal 1
npx hardhat run scripts/test-flow.ts --network localhost  # Terminal 2
```

### Deploy to Polygon Amoy Testnet
1. Copy `.env.example` to `.env`
2. Add your private key (from MetaMask)
3. Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
4. Run:
```bash
npm run deploy:amoy
```

## Contract ABI

After compiling, the ABI is at:
```
artifacts/contracts/EventTicket.sol/EventTicket.json
```

Use this in your frontend:
```javascript
import EventTicketABI from '@repo/contracts/artifacts/contracts/EventTicket.sol/EventTicket.json';
const abi = EventTicketABI.abi;
```

## Contract Functions

| Function | Access | Description |
|----------|--------|-------------|
| `mintTicket(tierId)` | Public (payable) | Mint a ticket NFT |
| `getTierInfo(tierId)` | View | Get tier price, supply, minted |
| `getTicketTier(tokenId)` | View | Get tier for a token |
| `getTierCount()` | View | Get number of tiers |
| `getBalance()` | View | Get contract balance |
| `withdraw()` | Organizer only | Withdraw funds |

## Events

| Event | Data |
|-------|------|
| `TicketMinted` | `(buyer, tokenId, tierId)` |
| `FundsWithdrawn` | `(organizer, amount)` |
