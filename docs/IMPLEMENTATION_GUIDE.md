# EventChain Implementation Guide - Web3 Integration

## ✅ Current Status

### COMPLETED
1. **Create Event Form** (`/dashboard/create-event`)
   - Full form with validation
   - Image preview (base64 storage)
   - API integration
   - Redirects to my-events on success

2. **Tier Management** (`/dashboard/my-events`)
   - Add multiple tiers per event
   - Delete tiers
   - Modal UI with validation
   - Real-time updates

3. **My-Events Page**
   - Draft and Active tabs
   - Event listing with details
   - Tier display
   - Deploy button (placeholder)

4. **Backend API** (All ready)
   - POST /events - Create event
   - PUT /events/:id - Update event
   - PUT /events/:id/activate - Activate with contract address
   - POST /tiers/:eventId/tiers - Add tier
   - DELETE /tiers/:tierId - Delete tier

## 🟡 In Progress: Web3 Smart Contract Deployment

### What You Need to Do:

#### 1. Get Contract Bytecode
```bash
cd packages/contracts
npm run compile  # or npx hardhat compile
```

Find bytecode in: `artifacts/contracts/EventTicket.sol/EventTicket.json`

Look for the `"object"` field under `"bytecode"` - it starts with `0x6080...`

#### 2. Update Web3 Deployment File
Edit: `apps/frontend/lib/web3-deploy.ts`

Replace line ~20:
```typescript
const EVENT_TICKET_BYTECODE = '0x60806040523480156200001157600080fd5b50...'
// ^ Replace this entire string with your actual bytecode from artifacts
```

#### 3. Configuration (Polygon Amoy Testnet)

Create `packages/contracts/.env`:
```
AMOY_RPC_URL=https://polygon-amoy.drpc.org
PRIVATE_KEY=your_wallet_private_key  # For deploying from scripts
```

#### 4. Test Setup

**For Local Development (Hardhat):**
```bash
# Terminal 1
cd packages/contracts
npx hardhat node

# Terminal 2
npm run dev  # from root
```

**For Polygon Amoy:**
- Get test MATIC from [Faucet](https://faucet.polygon.technology/)
- Connect MetaMask to Amoy
- The app will automatically use Amoy if connected

## System Architecture

```
User Flow:
  1. Create Event (Draft, not visible)
  2. Add Tiers (Configure prices & supply)
  3. Deploy Button clicked
  4. Wallet pops up (MetaMask)
  5. Smart contract deploys to blockchain
  6. Contract address sent to backend
  7. Event marked as Active & visible to users
  8. Users can purchase tickets
```

## Complete Feature Breakdown

### Create Event Page (`/dashboard/create-event`)
- **Inputs:** title, description, venue, location, category, dates, image
- **Validation:** All fields required, dates valid, future date
- **Output:** Event record (Draft status, isActive=false)
- **API:** POST /events
- **Status:** ✅ Ready to use

### My-Events Page (`/dashboard/my-events`)
- **Draft Tab:** All unpublished events
  - Shows tiers list
  - "Add Tier" button
  - "Deploy to Blockchain" button
- **Active Tab:** All published events
  - Shows contract address
  - Tiers locked (no editing)
- **Status:** ✅ Ready (deployment button needs real bytecode)

### Tier Management
- **Add Tier:** Name, price (MATIC), total supply
- **Delete Tier:** Only before deployment
- **Bulk Add:** Prepare for later
- **Status:** ✅ Fully implemented

### Smart Contract Deployment
- **Trigger:** "Deploy to Blockchain" button
- **Process:**
  1. Check wallet connected
  2. Build tier arrays (prices in wei, supplies)
  3. Deploy EventTicket contract
  4. Wait for deployment
  5. Get contract address
  6. Call backend /events/{id}/activate
  7. Backend sets contractAddress & isActive=true
- **Status:** 🟡 Component ready, needs bytecode

## File Structure

```
apps/frontend/
├── app/dashboard/
│   ├── create-event/page.tsx     ✅ Fully implemented
│   ├── my-events/page.tsx        ✅ Fully implemented
│   └── my-tickets/page.tsx       (existing)
├── components/
│   ├── DeployEventButton.tsx     🟡 Created, needs integration
│   └── (existing components)
├── lib/
│   ├── api.ts                    ✅ Event & tier APIs added
│   ├── web3-deploy.ts            🟡 Ready, needs bytecode
│   └── wagmi.ts                  ✅ Already configured

packages/contracts/
├── contracts/EventTicket.sol     ✅ Contract ready
├── artifacts/                    ← Get bytecode here
├── hardhat.config.ts
└── scripts/deploy.ts

apps/http-server/
├── src/events/events.ts          ✅ All endpoints ready
├── src/tiers/tiers.ts            ✅ All endpoints ready
└── src/ticket/ticket.ts
```

## Key API Endpoints

All endpoints require JWT token in `Authorization: Bearer {token}`

```
POST /events
- Body: {title, description, venue, location, bannerImage, startTime, endTime, category}
- Response: Event object (isActive=false)

GET /events
- Returns: All active events

GET /events/{id}
- Returns: Single event

PUT /events/{id}
- Body: {title?, description?, venue?, location?, bannerImage?, startTime?, endTime?, category?}
- Response: Updated event

PUT /events/{id}/activate  **← CALLED BY DEPLOYMENT**
- Body: {contractAddress: "0x..."}
- Response: Updated event (isActive=true)

POST /tiers/{eventId}/tiers
- Body: {name, price, totalSupply}
- Response: TicketTier object

GET /tiers/{eventId}/tiers
- Returns: Array of tiers

DELETE /tiers/{tierId}
- Returns: Success message
```

## Next: Completing Deployment

### To Make Deployment Production-Ready:

1. **Get Bytecode** ← START HERE
   ```bash
   cd packages/contracts && npm run compile
   ```
   - Find: `artifacts/contracts/EventTicket.sol/EventTicket.json`
   - Copy the `bytecode.object` value
   - Paste into `apps/frontend/lib/web3-deploy.ts` line ~20

2. **Test Local Deployment**
   ```bash
   # Terminal 1
   cd packages/contracts
   npx hardhat node
   
   # Terminal 2
   npm run dev
   # Try creating event + deploying on http://localhost:3000
   ```

3. **Test on Amoy Testnet**
   - Connect MetaMask to Amoy
   - Get test MATIC
   - Create and deploy an event
   - Verify contract on [Polygonscan Testnet](https://amoy.polygonscan.com/)

4. **Production Deployment**
   - Switch network to Polygon Mainnet (if desired)
   - Deploy to production backend
   - Monitor contract interactions

## Current Limitations & Future Improvements

- **Images:** Stored as base64 in DB (should use cloud storage)
- **Gas Optimization:** Deploy without optimization (can add for production)
- **Multi-tier Pricing:** Currently Decimal(18,8) in DB (handles large numbers)
- **Metadata:** Contract points to placeholder URI (should use IPFS/API)
- **Events Visibility:** Hidden until deployed (working as designed)

## Troubleshooting

**"Deploy to Blockchain" button disabled?**
- ✓ Check: At least 1 tier added
- ✓ Check: Wallet is connected
- ✓ Check: Network is correct (Amoy)

**Deployment fails with "Invalid bytecode"?**
- ✓ Verify: Bytecode starts with `0x6080`
- ✓ Verify: No extra quotes or formatting
- ✓ Verify: Value copied completely

**Event not marked as Active after deploy?**
- ✓ Check: Backend received correct contract address
- ✓ Check: Token still valid
- ✓ Check: Database migration ran (`prisma migrate deploy`)

## Testing Checklist

```
[ ] Event form validates correctly
[ ] Create event saves to database
[ ] My-events page loads draft events
[ ] Can add multiple tiers
[ ] Can delete tiers before deployment
[ ] Wallet connects properly
[ ] Deploy button appears when tier added
[ ] Deploy transaction popups in MetaMask
[ ] Contract deploys successfully
[ ] Event becomes Active after deploy
[ ] Users can see event in /events
[ ] Contract visible on blockchain explorer
```

---

**Next Step:** Extract contract bytecode and update `web3-deploy.ts`
