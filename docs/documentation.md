# EventChain
### Blockchain-Based Ticket Management System

**Technical Documentation | v1.0 | March 2026**

**Authors:** Pradyumn · Hamza · Priyanshu · Charmi  
**Institution:** IIIT Vadodara  
**Repository:** [github.com/Pradyumn-cloud/EventChain](https://github.com/Pradyumn-cloud/EventChain)

---

## 1. Project Overview

EventChain is a blockchain-based ticket management system built to eliminate fraudulent ticket resales and enable transparent, trustless event ticketing. By issuing tickets as on-chain assets governed by smart contracts, EventChain ensures that ownership is verifiable, transfers are auditable, and scalpers cannot counterfeit or duplicate tickets.

The project is structured as a Turborepo monorepo containing multiple applications and shared packages, making it easy to develop, build, and deploy each piece independently while sharing common logic and types.

| Attribute | Value |
|---|---|
| Repository | github.com/Pradyumn-cloud/EventChain |
| Primary Language | TypeScript (95.6%) |
| Smart Contracts | Solidity (3.0%) |
| Build Orchestrator | Turborepo v2.7.6 |
| Package Manager | npm v10.9.2 (workspaces) |
| Node.js Requirement | ≥ 18 |
| Database | PostgreSQL 16 (Docker) |
| Architecture | Monorepo (apps + packages) |

---

## 2. Technology Stack

### 2.1 Frontend

The web application is built with Next.js (TypeScript), providing server-side rendering, file-based routing, and an optimised production build via the `.next` output directory configured in Turborepo.

### 2.2 Blockchain / Smart Contracts

Ticketing logic is enforced on-chain using Solidity smart contracts. Tickets are represented as verifiable on-chain tokens; the contract governs minting, ownership transfer, and validation rules such as anti-scalping limits or maximum resale price caps.

### 2.3 Backend & Database

Off-chain data (user profiles, event metadata, search indices) is stored in PostgreSQL 16. A Docker Compose configuration is provided to spin up the database locally with a persistent named volume so data survives container restarts.

### 2.4 Tooling

| Tool | Role |
|---|---|
| Turborepo | Monorepo task orchestration — parallelises build, lint, type-check, and dev tasks with caching |
| TypeScript 5.9 | Strict static typing across all apps and packages |
| Prettier | Unified code formatting (TS, TSX, MD files) |
| Docker Compose | Local PostgreSQL database provisioning |
| npm workspaces | Shared dependency hoisting across the monorepo |

---

## 3. Repository Structure

The repository follows a standard Turborepo layout:

```
EventChain/
├── apps/                  # Deployable applications
│   └── web/               # Next.js frontend (primary user interface)
├── packages/              # Shared internal libraries
│   ├── ui/                # Shared React component library
│   ├── db/                # Database client & Prisma schema
│   └── contracts/         # Compiled Solidity ABI & type bindings
├── docs/                  # Project documentation assets
├── .vscode/               # Recommended editor settings
├── docker-compose.yml     # Local PostgreSQL service
├── turbo.json             # Turborepo pipeline configuration
├── package.json           # Root workspace manifest
├── .npmrc                 # npm registry settings
└── .gitignore
```

### 3.1 apps/web

The web application is the primary interface for event organisers and ticket buyers. It is responsible for displaying events, connecting to a user's blockchain wallet, purchasing tickets through smart contract calls, and showing owned tickets with QR-based verification.

### 3.2 packages/

Shared packages eliminate code duplication across apps. Common patterns in a Turborepo monorepo include a UI package for shared design-system components, a `db` package containing the database schema and Prisma client, and a `contracts` package that exports typed ABI wrappers generated from compiled Solidity. This setup ensures that any app in the monorepo can import these packages as internal dependencies without publishing them to npm.

---

## 4. System Architecture

### 4.1 High-Level Flow

EventChain connects three layers: the user-facing Next.js web app, the off-chain PostgreSQL database, and the on-chain smart contracts deployed on an EVM-compatible blockchain.

| Layer | Technology | Responsibility |
|---|---|---|
| Presentation | Next.js (TypeScript) | Event listings, wallet connection, ticket purchase UI, QR display |
| Off-chain Data | PostgreSQL 16 | Event metadata, user accounts, transaction history |
| On-chain Logic | Solidity Smart Contract | Ticket minting, ownership transfer, anti-fraud rules |
| Blockchain Node | EVM RPC endpoint | Broadcasting & reading smart contract state |

### 4.2 Turborepo Pipeline

The `turbo.json` defines the dependency graph for all build tasks. The `dev` task depends on all packages being built first (`^build`), ensuring shared packages are compiled before applications start. The `build` task caches the `.next` directory for fast rebuilds.

| Task | Depends On | Cache Output |
|---|---|---|
| build | ^build (all dependencies first) | .next (excludes cache) |
| dev | ^build | None (persistent, cache disabled) |
| lint | ^lint | None |
| check-types | ^check-types | None |

---

## 5. Database Configuration

PostgreSQL 16 is the off-chain data store. The `docker-compose.yml` provisions a local instance with the following settings:

| Parameter | Value |
|---|---|
| Container name | eventchain-postgres |
| Image | postgres:16 |
| Host port | 5432 |
| Database name | eventchain_db |
| Username | postgres |
| Password | postgres *(local dev only — change in production)* |
| Persistent volume | eventchain_postgres_data |

The named volume (`eventchain_postgres_data`) ensures that database state is preserved across `docker compose down / up` cycles. For production, credentials must be rotated and injected via environment variables.

---

## 6. Smart Contract Layer

### 6.1 Purpose

The Solidity component (3% of the codebase) encodes the core ticketing rules on-chain. Because the contract runs on a public or permissioned blockchain, its logic is immutable and transparent — no centralised party can forge or invalidate a ticket after it has been minted.

### 6.2 Expected Contract Capabilities

- Mint a ticket NFT tied to a specific event and seat/category.
- Transfer ownership with optional royalty/resale cap enforcement.
- Mark a ticket as used (checked-in) to prevent double entry.
- Query ticket validity and current owner from any client.

### 6.3 Integration

The compiled contract ABI and deployed address are packaged in `packages/contracts`, from which the Next.js frontend imports type-safe wrappers to call contract functions (e.g., via ethers.js or viem).

---

## 7. Getting Started

### 7.1 Prerequisites

- Node.js ≥ 18 and npm ≥ 10
- Docker Desktop (for local PostgreSQL)
- A browser wallet extension (e.g., MetaMask) for blockchain interactions

### 7.2 Installation

**1. Clone the repository:**

```bash
git clone https://github.com/Pradyumn-cloud/EventChain.git
cd EventChain
```

**2. Install dependencies:**

```bash
npm install
```

**3. Start the local database:**

```bash
docker compose up -d
```

**4. Run all apps in development mode:**

```bash
npm run dev
```

### 7.3 Available Scripts

| Script | Command | Description |
|---|---|---|
| dev | `npm run dev` | Start all apps in watch mode via Turborepo |
| build | `npm run build` | Production build of all apps and packages |
| lint | `npm run lint` | Lint entire monorepo |
| check-types | `npm run check-types` | TypeScript type-checking across all packages |
| format | `npm run format` | Prettier format for all .ts, .tsx, and .md files |

---

## 8. Team & Contribution

EventChain was developed as a collaborative academic project at IIIT Vadodara.

| Contributor | GitHub Handle | Primary Focus |
|---|---|---|
| Pradyumn | @Pradyumn-cloud | Project lead, repository setup, Turborepo config |
| Hamza | — | Backend integration, database schema |
| Priyanshu | — | Smart contract development (Solidity) |
| Charmi | — | Frontend (Next.js), UI/UX |

---

## 9. Future Scope

- Deploy smart contracts to a public testnet (Sepolia / Mumbai) with automated CI/CD.
- Add QR-code-based ticket verification at event entry gates.
- Implement a secondary marketplace with on-chain royalty enforcement for resales.
- Mobile-responsive PWA or React Native companion app.
- Event analytics dashboard for organisers (total sales, wallet activity, check-in rates).
- Multi-chain support (Polygon, Base) for lower gas fees.

---

## 10. Glossary

| Term | Definition |
|---|---|
| Monorepo | Single repository containing multiple apps and packages managed together |
| Turborepo | Build system for JavaScript/TypeScript monorepos with task-level caching |
| Smart Contract | Self-executing code deployed on a blockchain that enforces business rules |
| Solidity | Statically typed language for writing EVM-compatible smart contracts |
| ABI | Application Binary Interface — the interface spec for calling contract functions |
| EVM | Ethereum Virtual Machine — runtime for smart contracts on Ethereum-compatible chains |
| NFT | Non-Fungible Token — unique on-chain asset; used here to represent an individual ticket |
| Prisma | TypeScript ORM for database access (likely used in the db package) |
| Docker Compose | Tool for defining and running multi-container Docker applications |

---

*EventChain — IIIT Vadodara | Confidential*
