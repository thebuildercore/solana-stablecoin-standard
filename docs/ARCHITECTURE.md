
# System Architecture (`ARCHITECTURE.md`)

The **Solana Stablecoin Standard (SSS)** is designed as a modular monolith. It separates the core token mechanics from the regulatory compliance logic, allowing issuers to deploy highly customized or strictly standardized stablecoins without writing new smart contracts.

## 1. The 3-Layer Model

### Layer 1: Base Engine
The foundation of the SSS protocol. It handles standard SPL Token-2022 lifecycle events and Role-Based Access Control (RBAC).
* **Token Creation:** Manages the initialization of the Mint, configuring the Mint Authority, Freeze Authority, and Metadata Pointer.
* **Role Management Program:** A dedicated Solana program that stores the `StablecoinConfig` PDA. It enforces permissions for the Master Authority, Minters, Burners, and Pausers.
* **Tooling:** The core `@stbr/sss-token` TypeScript SDK and CLI interface.

### Layer 2: Composable Modules
Independent, optional capability blocks that plug into Layer 1. They are decoupled to ensure they can be upgraded or audited in isolation.
* **Compliance Module:** Introduces the `Transfer Hook` for real-time blacklist enforcement and the `Permanent Delegate` for legal clawbacks.
* **Privacy Module (Extension):** Scaffolding for integrating SPL Confidential Transfers and Zero-Knowledge allowlists.

### Layer 3: Standard Presets
Opinionated, documented combinations of Layer 1 and Layer 2. These are the "Standards" (SSS-1 and SSS-2) that developers actually deploy, ensuring predictable behavior across the ecosystem.

---

## 2. On-Chain Program Design (Anchor)

The on-chain footprint consists of a highly configurable core program and a decoupled Transfer Hook program. 

### The `StablecoinConfig` State
A single initialization instruction configures the entire stablecoin behavior:

```rust
pub struct StablecoinConfig {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
    // SSS-2 Compliance Flags
    pub enable_permanent_delegate: bool,
    pub enable_transfer_hook: bool,
    pub default_account_frozen: bool,
}
```

### Core Instruction Set (Layer 1)
Available to all SSS tokens: `initialize`, `mint`, `burn`, `freeze_account`, `thaw_account`, `pause`, `unpause`, `update_minter`, `update_roles`, `transfer_authority`.

### Compliance Instruction Set (Layer 2)
Restricted to SSS-2 compliant tokens:
* `add_to_blacklist` & `remove_from_blacklist` (Modifies the `BlacklistRecord` PDA).
* `seize` (Executes the Permanent Delegate to clawback funds).
* *Note: These instructions fail gracefully at the Anchor level if `enable_transfer_hook` or `enable_permanent_delegate` were set to false during initialization.*

---

## 3. Off-Chain Backend Services

To operate a production-grade fiat-backed stablecoin, on-chain contracts must be supported by robust off-chain infrastructure. SSS provides a Docker-containerized backend suite built in TypeScript/Rust.



### Core Services (All Presets)
* **Mint/Burn Coordination Service:** Manages the fiat-to-token lifecycle. It receives fiat wire notifications from banking partners, verifies the deposit, executes the on-chain `mint` instruction, and logs the receipt.
* **Event Indexer:** A highly available listener that parses Solana RPC blocks for SSS Anchor events (`MintEvent`, `BurnEvent`), maintaining an off-chain SQL database of the stablecoin's state.

### Compliance Services (SSS-2 Only)
* **Transaction Monitoring & Sanctions Service:** Integrates with third-party KYT (Know Your Transaction) providers. If an address is flagged by OFAC, this service automatically fires the `add_to_blacklist` instruction to the Solana network.
* **Webhook Engine:** Provides configurable HTTP callbacks for institutional clients. (e.g., Firing a webhook to an exchange when a specific `SeizeEvent` or `BlacklistEvent` occurs on-chain).
* **Audit Exporter:** Generates cryptographically verifiable, structured CSV/JSON logs of all regulatory actions for government reporting.

# Repository structure

solana-stablecoin-standard/
│
├── programs/                             # 🦀 ON-CHAIN RUST LOGIC
│   ├── manager/                          # The core Stablecoin Configurator
│   │   ├── src/
│   │   │   ├── instructions/             # Split your logic into separate files
│   │   │   │   ├── initialize.rs
│   │   │   │   ├── mint_burn.rs
│   │   │   │   ├── roles.rs
│   │   │   │   └── mod.rs
│   │   │   ├── state.rs                  # StablecoinConfig & Role definitions
│   │   │   ├── errors.rs                 # Custom graceful failure messages
│   │   │   └── lib.rs                    # Main entrypoint routing
│   │   └── Cargo.toml
│   │
│   └── compliance_hook/                  # The SSS-2 Transfer Hook
│       ├── src/
│       │   ├── state.rs                  # Blacklist PDA structure
│       │   └── lib.rs
│       └── Cargo.toml
│
├── packages/                             # 🟦 TYPESCRIPT TOOLING
│   ├── sdk/                              # @stbr/sss-token library
│   │   ├── src/
│   │   │   ├── presets.ts                # SSS-1 and SSS-2 default configs
│   │   │   └── index.ts                  # Main SolanaStablecoin class
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── cli/                              # The 'sss-token' terminal tool
│       ├── src/
│       │   ├── commands/                 
│       │   │   ├── init.ts               # handles `sss-token init`
│       │   │   ├── operations.ts         # mint, burn, freeze
│       │   │   └── compliance.ts         # blacklist add/remove
│       │   └── index.ts                  # CLI entrypoint (Commander.js)
│       ├── package.json
│       └── tsconfig.json
│
├── services/                             # 🐳 OFF-CHAIN BACKEND
│   ├── indexer/                          # Listens to Solana events
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── api/                              # Webhook for compliance/seizures
│       ├── src/
│       │   └── server.ts
│       ├── Dockerfile
│       └── package.json
│
├── docs/                                 # 📚 REQUIRED DOCUMENTATION
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── SDK.md
│   ├── OPERATIONS.md
│   ├── SSS-1.md
│   ├── SSS-2.md
│   ├── COMPLIANCE.md
│   └── API.md
│
├── tests/                                # 🧪 TESTING SUITE
│   ├── manager.test.ts                   # Unit tests for core logic
│   ├── hook.test.ts                      # Tests for the blacklist
│   └── trident/                          # Fuzz testing directory
│
├── docker-compose.yml                    # Spins up your backend services
├── Anchor.toml                           # Workspace settings & Program IDs
├── package.json                          # Root workspace dependencies
└── tsconfig.json                         # Root TypeScript config

