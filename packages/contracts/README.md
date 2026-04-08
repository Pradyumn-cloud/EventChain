# EventChain Smart Contracts

## Setup

```bash
cd packages/contracts
bun install
```

## Commands

### Compile contracts

```bash
bun run compile
```

### Run tests

```bash
bun run test
```

### Start local blockchain

```bash
bun run node
```

This starts a local Hardhat node at `http://127.0.0.1:8545` with test accounts.

### Deploy to local network

In a new terminal (while node is running):

```bash
bun run deploy:local
```

### Test full flow locally

```bash
bun run node                    # Terminal 1
bunx hardhat run scripts/test-flow.ts --network localhost  # Terminal 2
```

### Deploy to Polygon Amoy Testnet

1. Copy `.env.example` to `.env`
2. Add your private key (from MetaMask)
3. Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
4. Run:

```bash
bun run deploy:amoy
```

## Contract ABI

After compiling, the ABI is at:

```
artifacts/contracts/EventTicket.sol/EventTicket.json
```

Use this in your frontend:

```javascript
import EventTicketABI from "@repo/contracts/artifacts/contracts/EventTicket.sol/EventTicket.json";
const abi = EventTicketABI.abi;
```

## Contract Functions

| Function                 | Access           | Description                    |
| ------------------------ | ---------------- | ------------------------------ |
| `mintTicket(tierId)`     | Public (payable) | Mint a ticket NFT              |
| `getTierInfo(tierId)`    | View             | Get tier price, supply, minted |
| `getTicketTier(tokenId)` | View             | Get tier for a token           |
| `getTierCount()`         | View             | Get number of tiers            |
| `getBalance()`           | View             | Get contract balance           |
| `withdraw()`             | Organizer only   | Withdraw funds                 |

## Events

| Event            | Data                       |
| ---------------- | -------------------------- |
| `TicketMinted`   | `(buyer, tokenId, tierId)` |
| `FundsWithdrawn` | `(organizer, amount)`      |

## White-Box Testing For EventTicket Core Logic

### Theory (Blockchain Context)

White-box testing for smart contracts means designing tests using internal Solidity logic,
state transitions, and branch conditions from contracts/EventTicket.sol.

In black-box testing, we only check API-level behavior (input/output).
In white-box testing, we intentionally target specific internal checks such as require statements,
modifier restrictions, state counter updates, mapping writes, event emissions, and value-transfer paths.

For EventTicket, white-box tests are ideal because core business rules are fully on-chain,
and each rule is explicitly encoded in branch logic.

### Why Your Current Contract Tests Are White-Box

The file test/EventTicket.test.ts is already strongly white-box because test cases map directly
to internal branches in contracts/EventTicket.sol:

1. mintTicket(tierId) branch: require(tierId < tierPrices.length, "Invalid tier")
2. mintTicket(tierId) branch: require(tierMinted[tierId] < tierSupply[tierId], "Tier sold out")
3. mintTicket(tierId) branch: require(msg.value >= tierPrices[tierId], "Insufficient payment")
4. mintTicket(tierId) branch: refund path when msg.value > tierPrices[tierId]
5. withdraw() access branch via onlyOrganizer modifier
6. withdraw() branch: require(balance > 0, "No funds to withdraw")
7. event emission verification: TicketMinted and FundsWithdrawn
8. state mutation verification: totalMinted, tierMinted, ownerOf, ticketTier mapping

This is white-box because tests are based on the contract's internal code paths,
not random external calls.

### White-Box Test Design Flow For Smart Contracts

Use this repeatable process when adding more tests:

1. Read one function and list every require and conditional branch.
2. For each branch, design at least one positive path and one negative path.
3. Assert not only revert/success, but also internal state changes.
4. Assert event arguments for important business events.
5. For payable functions, assert ETH accounting (contract balance + caller balance impact).
6. Keep tests deterministic by controlling signer, payment amount, and mint order.

### Branch Matrix For EventTicket.sol

Recommended white-box checklist for complete core coverage:

1. Constructor tier array length mismatch reverts.
2. Constructor zero tiers reverts.
3. mintTicket invalid tier reverts.
4. mintTicket sold out tier reverts.
5. mintTicket insufficient payment reverts.
6. mintTicket exact payment succeeds and updates counters.
7. mintTicket excess payment triggers refund path.
8. getTierInfo invalid tier reverts.
9. getTicketTier with tokenId 0 reverts.
10. getTicketTier with tokenId > totalMinted reverts.
11. withdraw by non-organizer reverts.
12. withdraw with zero balance reverts.
13. withdraw success transfers full balance and emits FundsWithdrawn.

### How You Will Do White-Box Testing Practically

1. Open contracts/EventTicket.sol and mark each require branch as a test target.
2. Implement one test per target in test/EventTicket.test.ts.
3. Use explicit signer roles (organizer, buyer1, buyer2) to hit role-based branches.
4. Use precise ethers.parseEther values to hit payment branches.
5. Run tests and verify branch intent from test names and assertions.
6. Refactor only after tests pass, then rerun to detect regressions.

### Commands

From packages/contracts:

```bash
bun run compile
bun run test
```

From repository root:

```bash
npm --workspace packages/contracts run test
```

### Suggested Next White-Box Additions

To increase branch coverage, add tests for constructor reverts and getTicketTier/getTierInfo invalid-input reverts,
since these are critical defensive branches in core contract logic.
