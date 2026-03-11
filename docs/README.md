# Solana Stablecoin Standard (SSS)

[![Solana Token-2022](https://img.shields.io/badge/Solana-Token--2022-blueviolet)](https://spl.solana.com/token-2022)
[![Trident Fuzzing](https://img.shields.io/badge/Security-Trident--Fuzzed-green)](https://github.com/ackee-blockchain/trident)
[![TypeScript SDK](https://img.shields.io/badge/SDK-TypeScript-blue)](./packages/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade, modular framework for launching compliant stablecoins on the Solana blockchain. 

Built specifically to leverage **Token-2022 (Token Extensions)**, the Solana Stablecoin Standard (SSS) abstracts the complexity of deriving PDAs, sequencing instructions, and managing regulatory compliance into a clean, developer-first protocol and SDK.

##  Live Deployments (Devnet)

The core Anchor programs for the Solana Stablecoin Standard (SSS) have been successfully deployed and verified on the Solana Devnet.

* **Manager Program:** [`Euf94rZebzsHaypDMc34QBWs8LBcKcp3vr1xRsL2QidN`](https://explorer.solana.com/address/Euf94rZebzsHaypDMc34QBWs8LBcKcp3vr1xRsL2QidN?cluster=devnet)
* **Compliance Hook:** [`6ZoCZGV5CtMC2fYrt3GBWB6tmFgUpFYioLAD4JPPMQm4`](https://explorer.solana.com/address/6ZoCZGV5CtMC2fYrt3GBWB6tmFgUpFYioLAD4JPPMQm4?cluster=devnet)

*Note: The Layer 2 off-chain services (Indexer & Webhook API) are architecturally scaffolded in the repository for V2 implementation.*

##  Table of Contents
1. [Overview & Motivation](#-overview--motivation)
2. [The Standards (SSS-1 & SSS-2)](#-the-standards)
3. [Repository Structure](#-repository-structure)
4. [Getting Started (Local Development)](#-getting-started)
5. [Documentation Suite](#-documentation-suite)
6. [Security & Access Control](#-security--access-control)

---

##  Overview & Motivation

Legacy stablecoins on Solana rely heavily on off-chain indexing and reactive freezing to maintain compliance. With the advent of Token-2022, compliance can now be enforced **proactively at the protocol level**.

SSS provides a 3-Layer Architecture:
1. **Layer 1 (Base Engine):** Core Token-2022 initialization, metadata, and Role-Based Access Control (RBAC).
2. **Layer 2 (Modules):** Composable `Transfer Hooks` (for real-time blacklisting) and `Permanent Delegates` (for legal clawbacks).
3. **Layer 3 (Presets):** Opinionated configurations bundled into an easy-to-use TypeScript SDK.

---

##  The Standards

Instead of a one-size-fits-all approach, SSS defines two primary deployment standards:

### [SSS-1: Minimal Utility Stablecoin](./docs/SSS-1.md)
Designed for DAOs, internal ecosystem credits, and transparent settlement layers. 
* **Extensions:** Token Metadata, Metadata Pointer, Mint Authority, Freeze Authority.
* **Compliance:** Reactive (Manual Account Freezing).
* **Speed:** Maximum gas-efficiency; no Transfer Hook overhead.

### [SSS-2: Regulated Compliant Stablecoin](./docs/SSS-2.md)
Designed for fiat-backed, institutional-grade stablecoins (e.g., USDC, EURC equivalents) requiring strict regulatory adherence (OFAC, MiCA).
* **Extensions:** SSS-1 + Transfer Hook + Permanent Delegate + Default Account State (Frozen).
* **Compliance:** Proactive. Every transfer is validated against an on-chain blacklist.
* **Clawbacks:** Authorized roles can legally seize and recover funds.

---

##  Repository Structure

This repository is designed as a monorepo containing the on-chain programs, the off-chain SDK, and the security testing environment.

```text
solana-stablecoin-standard/
├── programs/
│   ├── manager/               # Core RBAC and StablecoinConfig logic
│   └── compliance_hook/       # SSS-2 Transfer Hook toll-booth program
├── packages/
│   ├── sdk/                   # @stbr/sss-token TypeScript SDK & Presets
│   └── cli/                   # Operator runbook & treasury management CLI
├── docs/                      # Extensive protocol documentation
├── tests/                     # Mocha/Chai Integration Tests
└── trident-tests/             # Ackee Blockchain Trident Fuzz Testing
```

---

##  Getting Started

### Prerequisites
* Rust 1.75.0+
* Solana CLI 1.18.x+
* Anchor CLI 0.32.x+
* Node.js 18+ & Yarn/npm

### Build & Test
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/thebuildercore/solana-stablecoin-standard.git](https://github.com/thebuildercore/solana-stablecoin-standard.git)
   cd solana-stablecoin-standard
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Compile the smart contracts:**
   ```bash
   anchor build
   ```

4. **Run Integration Tests:**
   *Note: Ensure your `Anchor.toml` test section has `startup_wait = 10000` to allow the local validator to boot.*
   ```bash
   anchor test
   ```

---

##  Documentation Suite

For a deep dive into the protocol, SDK, and regulatory mechanics, please refer to the comprehensive documentation suite:

* **[Architecture & Data Flow](./docs/ARCHITECTURE.md)**
* **[SDK Integration Guide](./docs/SDK.md)**
* **[Operator CLI Runbook](./docs/OPERATIONS.md)**
* **[Regulatory Compliance & Audit Trails](./docs/COMPLIANCE.md)**
* **[SSS-1 Specification](./docs/SSS-1.md)**
* **[SSS-2 Specification](./docs/SSS-2.md)**

---

##  Security & Access Control

The Solana Stablecoin Standard (SSS) prioritizes deterministic execution, modular authority, and mathematically provable boundaries. Security is paramount for fiat-backed protocols. Beyond standard unit and integration testing, this protocol is integrated with **Trident** (Ackee Blockchain's fuzzing framework).

### Role-Based Access Control (RBAC)
To prevent a single-point-of-failure compromise, SSS implements a granular RBAC system via the `StablecoinConfig` PDA. Instead of a single "Admin" key, powers are strictly separated:
* **`master_authority`**: Can upgrade the contract and re-assign roles.
* **`minter_admin`**: Can issue quotas to individual minters.
* **`burner_authority`**: Can burn tokens from the treasury.
* **`blacklister_authority`**: The *only* key allowed to update the Transfer Hook PDA state.
* **`seizer_authority`**: The *only* key allowed to trigger the Permanent Delegate.

> **Production Recommendation:** In a live environment, these authorities MUST NOT be individual hot wallets. They should be assigned to a Multisig (e.g., Squads Protocol) requiring an m-of-n threshold of hardware wallet signatures.

### Mathematical Safety
All token minting and supply arithmetic utilizes Rust's `checked_add` and `checked_sub` to prevent integer overflow/underflow attacks. 

### The "Fail Closed" Compliance Hook
For SSS-2 regulated stablecoins, the `compliance_hook` is designed to "Fail Closed." 
* State is stored in localized PDAs derived from `target_wallet`. This prevents the "bloated array" attack vector where an attacker fills a blacklist array until it exceeds Solana's compute limits, bricking the token.
* Read operations pass the Blacklist PDAs as `Option<Account>`. If a user is not blacklisted, the PDA is `None`, allowing the Hook to bypass data deserialization and approve the transaction with minimal Compute Units (CUs).

### Fuzz Testing
To run the fuzz tests and bombard the contracts with randomized chaotic inputs:

```bash
# Ensure you have the Trident CLI installed
cargo install trident-cli

# Navigate to the testing arena and fire the fuzzer
cd trident-tests
trident fuzz run fuzz_0
```