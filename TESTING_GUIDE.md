# 🎫 EventChain Complete Testing Guide

## Table of Contents
- [Step 0: Prerequisites Setup](#step-0-prerequisites-setup)
- [Step 1: Start Your Services](#step-1-start-your-services)
- [Step 2: Test Authentication](#step-2-test-authentication-postman)
- [Step 3: Organizer Creates Event](#step-3-organizer-creates-event)
- [Step 4: Deploy Smart Contract](#step-4-deploy-smart-contract)
- [Step 5: User Buys Ticket](#step-5-user-buys-ticket)
- [Step 6: User Views Tickets](#step-6-user-views-their-tickets)
- [Step 7: Verify Ticket at Entry](#step-7-organizer-verifies-ticket-at-entry)
- [Quick Reference: All Endpoints](#-quick-reference-all-endpoints)
- [Common Issues](#-common-issues)

---

## Step 0: Prerequisites Setup

### 0.1 Install MetaMask Browser Extension
1. Go to https://metamask.io/download/
2. Install for your browser (Chrome recommended)
3. Create a new wallet or import existing
4. **Save your Secret Recovery Phrase** safely!

### 0.2 Add Hardhat Local Network to MetaMask (For Local Testing)
1. Open MetaMask → Click network dropdown (top left)
2. Click **"Add Network"** → **"Add a network manually"**
3. Enter these details:
   ```
   Network Name: Hardhat Local
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   ```
4. Click **Save**

### 0.3 Add Polygon Amoy Testnet to MetaMask (For Testnet Testing)
1. Open MetaMask → Click network dropdown
2. Click **"Add Network"** → **"Add a network manually"**
3. Enter these details:
   ```
   Network Name: Polygon Amoy Testnet
   RPC URL: https://polygon-amoy.drpc.org
   Chain ID: 80002
   Currency Symbol: POL (or MATIC)
   Block Explorer: https://amoy.polygonscan.com
   ```
4. Click **Save**

### 0.4 Get Free Test POL/MATIC (For Testnet Only)
1. Go to: https://faucet.polygon.technology/
2. Select **"Amoy"** network
3. Paste your MetaMask wallet address
4. Complete captcha → Click **"Submit"**
5. Wait 1-2 minutes, check MetaMask for POL

### 0.5 Import Hardhat Test Account to MetaMask (For Local Testing)
When you run `npm run node` in contracts folder, it shows test accounts with private keys.

**Account #0 Private Key (example):**
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

To import into MetaMask:
1. Click account icon (top right) → **"Add account or hardware wallet"**
2. Select **"Import account"**
3. Paste the private key from Hardhat output
4. Click **Import**

⚠️ **This account has 10000 test ETH on local network only!**

### 0.6 Create Two Accounts for Testing
You need **2 accounts** for testing:
- **Account 1**: Organizer (creates events) - Import Hardhat Account #0
- **Account 2**: Buyer (buys tickets) - Import Hardhat Account #1

---

## Step 1: Start Your Services

### 1.1 Start PostgreSQL Database
```bash
cd c:\Users\Admin\OneDrive\Desktop\Projects\EventChain
docker-compose up -d
```

### 1.2 Start HTTP Server
```bash
cd apps\http-server
npm run dev
```
Server runs at: `http://localhost:3001`

### 1.3 Start Local Blockchain
```bash
cd packages\contracts
npm run node
```
This starts a local blockchain at `http://127.0.0.1:8545` with 20 test accounts, each having 10000 ETH.

**Important:** Copy the private keys shown in the terminal output!

---

## Step 2: Test Authentication (Postman)

### 2.1 Sign Up as ORGANIZER
**Request:**
```
POST http://localhost:3001/auth/sign-up
Content-Type: application/json

{
    "walletAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "role": "ORGANIZER"
}
```
*(Use the address from Hardhat Account #0)*

**Expected Response:**
```json
{
    "message": "User registered successfully",
    "userId": "uuid-here",
    "user": {
        "id": "uuid",
        "walletAddress": "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        "role": "ORGANIZER"
    }
}
```

### 2.2 Sign In as ORGANIZER
**Request:**
```
POST http://localhost:3001/auth/sign-in
Content-Type: application/json

{
    "walletAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
}
```

**Expected Response:**
```json
{
    "message": "Sign-in successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
}
```

📌 **SAVE THE TOKEN** - You need it for all authenticated requests!

### 2.3 Sign Up as USER (Buyer)
```
POST http://localhost:3001/auth/sign-up
Content-Type: application/json

{
    "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "role": "USER"
}
```
*(Use the address from Hardhat Account #1)*

### 2.4 Sign In as USER
```
POST http://localhost:3001/auth/sign-in
Content-Type: application/json

{
    "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
}
```

📌 **SAVE THIS TOKEN TOO** - For buyer actions!

---

## Step 3: Organizer Creates Event

### 3.1 Create Event
**Request:** (Use ORGANIZER token)
```
POST http://localhost:3001/events
Content-Type: application/json
Authorization: Bearer <ORGANIZER_TOKEN>

{
    "title": "Summer Music Festival 2026",
    "description": "The biggest music festival of the year!",
    "venue": "Central Park Arena",
    "location": "New York, USA",
    "category": "Music",
    "startTime": "2026-06-15T18:00:00Z",
    "endTime": "2026-06-15T23:00:00Z"
}
```

**Expected Response:**
```json
{
    "id": "EVENT_UUID_HERE",
    "title": "Summer Music Festival 2026",
    "isActive": false,
    "contractAddress": null,
    ...
}
```

📌 **SAVE THE EVENT ID**

### 3.2 Add Ticket Tiers
**Request:** (Use ORGANIZER token)
```
POST http://localhost:3001/tiers/<EVENT_ID>/tiers/bulk
Content-Type: application/json
Authorization: Bearer <ORGANIZER_TOKEN>

{
    "tiers": [
        {
            "name": "General",
            "price": 0.01,
            "totalSupply": 100
        },
        {
            "name": "VIP",
            "price": 0.05,
            "totalSupply": 20
        }
    ]
}
```

**Expected Response:**
```json
{
    "message": "Created 2 tiers",
    "tiers": [
        {
            "id": "TIER_0_UUID",
            "name": "General",
            "price": "0.01",
            "totalSupply": 100,
            "soldCount": 0
        },
        {
            "id": "TIER_1_UUID",
            "name": "VIP",
            "price": "0.05",
            "totalSupply": 20,
            "soldCount": 0
        }
    ]
}
```

📌 **SAVE TIER IDs**

---

## Step 4: Deploy Smart Contract

### 4.1 Deploy to Local Hardhat Network

**Terminal 1:** Make sure hardhat node is running
```bash
cd packages\contracts
npm run node
```

**Terminal 2:** Deploy contract
```bash
cd packages\contracts
npm run deploy:local
```

Or for full test flow:
```bash
npx hardhat run scripts/test-flow.ts --network localhost
```

This outputs:
```
✅ EventTicket deployed!
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

📌 **SAVE CONTRACT ADDRESS**

### 4.2 Activate Event with Contract Address
**Request:** (Use ORGANIZER token)
```
PUT http://localhost:3001/events/<EVENT_ID>/activate
Content-Type: application/json
Authorization: Bearer <ORGANIZER_TOKEN>

{
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3"
}
```

**Expected Response:**
```json
{
    "message": "Event activated successfully",
    "event": {
        "id": "EVENT_UUID",
        "isActive": true,
        "contractAddress": "0x..."
    }
}
```

---

## Step 5: User Buys Ticket

### 5.1 Understanding the Buy Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    TICKET PURCHASE FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User calls contract.mintTicket(tierId) via MetaMask     │
│     └── Pays ETH/MATIC from wallet                          │
│                                                              │
│  2. Blockchain mines transaction                            │
│     └── Returns txHash + tokenId                            │
│                                                              │
│  3. User calls POST /tickets/confirm                        │
│     └── Backend creates ticket record in DB                 │
│                                                              │
│  4. User now owns NFT ticket!                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Buy Ticket via Hardhat Console

```bash
cd packages\contracts
npx hardhat console --network localhost
```

Then in the console:
```javascript
// Get accounts (Account #1 is our buyer)
const [organizer, buyer] = await ethers.getSigners();

// Connect to deployed contract
const contract = await ethers.getContractAt("EventTicket", "0x5FbDB2315678afecb367f032d93F642f64180aa3");

// Check buyer balance before
console.log("Before:", ethers.formatEther(await ethers.provider.getBalance(buyer.address)), "ETH");

// Buy General ticket (tier 0) - costs 0.01 ETH
const tx = await contract.connect(buyer).mintTicket(0, { 
    value: ethers.parseEther("0.01") 
});
const receipt = await tx.wait();

// Check buyer balance after
console.log("After:", ethers.formatEther(await ethers.provider.getBalance(buyer.address)), "ETH");

// Get transaction details
console.log("txHash:", receipt.hash);

// Get tokenId from event
const event = receipt.logs.find(log => {
    try {
        return contract.interface.parseLog(log)?.name === "TicketMinted";
    } catch { return false; }
});
const parsed = contract.interface.parseLog(event);
console.log("tokenId:", parsed.args.tokenId.toString());
```

📌 **SAVE txHash and tokenId**

### 5.3 Confirm Ticket Purchase in Backend
**Request:** (Use USER/BUYER token)
```
POST http://localhost:3001/tickets/confirm
Content-Type: application/json
Authorization: Bearer <USER_TOKEN>

{
    "eventId": "EVENT_UUID",
    "tierId": "TIER_0_UUID",
    "txHash": "0xTRANSACTION_HASH",
    "tokenId": 1
}
```

**Expected Response:**
```json
{
    "ticket": {
        "id": "TICKET_UUID",
        "tokenId": 1,
        "status": "VALID",
        "mintTxHash": "0x...",
        "event": { ... },
        "tier": { ... }
    }
}
```

📌 **SAVE TICKET ID**

---

## Step 6: User Views Their Tickets

### 6.1 Get All My Tickets
**Request:** (Use USER token)
```
GET http://localhost:3001/tickets
Authorization: Bearer <USER_TOKEN>
```

### 6.2 Get QR Code for Entry
**Request:** (Use USER token)
```
GET http://localhost:3001/tickets/<TICKET_ID>/qr
Authorization: Bearer <USER_TOKEN>
```

**Expected Response:**
```json
{
    "qrData": "{\"ticketId\":\"...\",\"tokenId\":1,\"timestamp\":1234567890,\"signature\":\"abc123...\"}",
    "expiresAt": 1234567890000,
    "ticket": {
        "id": "...",
        "eventTitle": "Summer Music Festival 2026",
        "venue": "Central Park Arena"
    }
}
```

---

## Step 7: Organizer Verifies Ticket at Entry

### 7.1 Verify Ticket
**Request:** (Use ORGANIZER token)
```
POST http://localhost:3001/tickets/<TICKET_ID>/verify
Content-Type: application/json
Authorization: Bearer <ORGANIZER_TOKEN>

{
    "qrData": "{\"ticketId\":\"...\",\"tokenId\":1,\"timestamp\":1234567890,\"signature\":\"abc123...\"}"
}
```

**Expected Response:**
```json
{
    "valid": true,
    "ticket": {
        "id": "...",
        "tokenId": 1,
        "tierName": "General",
        "ownerWallet": "0x...",
        "eventTitle": "Summer Music Festival 2026",
        "usedAt": "2026-01-31T..."
    },
    "message": "Ticket verified and marked as used"
}
```

---

## 📋 Quick Reference: All Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/sign-up` | ❌ | - | Register new user |
| POST | `/auth/sign-in` | ❌ | - | Login, get token |
| GET | `/auth/me` | ✅ | Any | Get current user |
| GET | `/events` | ✅ | Any | List all events |
| GET | `/events/:id` | ✅ | Any | Get event details |
| POST | `/events` | ✅ | ORGANIZER | Create event |
| PUT | `/events/:id` | ✅ | ORGANIZER | Update event |
| PUT | `/events/:id/activate` | ✅ | ORGANIZER | Activate with contract |
| GET | `/tiers/:eventId/tiers` | ❌ | - | Get event tiers |
| POST | `/tiers/:eventId/tiers` | ✅ | ORGANIZER | Add single tier |
| POST | `/tiers/:eventId/tiers/bulk` | ✅ | ORGANIZER | Add multiple tiers |
| DELETE | `/tiers/:tierId` | ✅ | ORGANIZER | Delete a tier |
| GET | `/tickets` | ✅ | Any | Get my tickets |
| POST | `/tickets/confirm` | ✅ | Any | Confirm purchase |
| GET | `/tickets/:id/qr` | ✅ | Owner | Get QR code |
| POST | `/tickets/:id/verify` | ✅ | ORGANIZER | Verify at entry |

---

## 🔧 Postman Environment Variables

Create these variables in Postman:
```
BASE_URL: http://localhost:3001
ORGANIZER_TOKEN: <paste after sign-in>
USER_TOKEN: <paste after sign-in>
EVENT_ID: <paste after creating event>
TIER_ID: <paste after creating tiers>
CONTRACT_ADDRESS: <paste after deploy>
TICKET_ID: <paste after buying>
```

---

## ❓ Common Issues

| Issue | Solution |
|-------|----------|
| "User not found" | Sign up first before sign in |
| "Forbidden" | Check you're using correct token (Organizer vs User) |
| "Event not active" | Run `/events/:id/activate` first |
| "Tier not found" | Add tiers before buying |
| Connection refused | Make sure server (`npm run dev`) is running |
| Database error | Make sure Docker PostgreSQL is running |
| MetaMask shows 10 ETH after purchase | You're looking at wrong network - switch to "Hardhat Local" |
| Transaction failed | Make sure Hardhat node is running |

---

## 🔗 Network Comparison

| Network | Purpose | Currency | Cost |
|---------|---------|----------|------|
| Hardhat Local | Development & Testing | Fake ETH | Free |
| Polygon Amoy | Testnet | Test POL | Free (faucet) |
| Polygon Mainnet | Production | Real POL | Real money |

---

## 📱 MetaMask Networks

### Hardhat Local (for testing)
```
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency: ETH
```

### Polygon Amoy Testnet
```
Network Name: Polygon Amoy
RPC URL: https://polygon-amoy.drpc.org
Chain ID: 80002
Currency: POL
```
