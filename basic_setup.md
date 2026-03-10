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


### DATABASE .env

1) in packages/db
2) in packages/contracts
3) in apps/http-server


### To start

npm run dev
cd packages/contracts npm run node