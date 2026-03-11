# Standard 1: Minimal Stablecoin (SSS-1)

## 1. Abstract
The **SSS-1 (Minimal Stablecoin Standard)** defines the foundational tier of the Solana Stablecoin Standard framework. It leverages Solana's Token-2022 (Token Extensions) program to provide a lightweight, gas-efficient, and transparent stablecoin architecture. 

SSS-1 is designed for internal ecosystem tokens, DAO treasuries, and decentralized settlement layers where proactive on-chain compliance (like transfer hooks) is unnecessary, but robust access control and metadata management are strictly required.



## 2. Token-2022 Extension Profile
An SSS-1 compliant token strictly limits its Token-2022 extensions to reduce compute unit (CU) overhead. 

When initializing an SSS-1 token via the SDK (`preset: Presets.UTILITY`), the following extension profile is enforced:

| Extension | Status | Rationale |
| :--- | :--- | :--- |
| **Token Metadata** | `REQUIRED` | Stores Name, Symbol, and URI natively on the Mint account. |
| **Metadata Pointer** | `REQUIRED` | Points to the Mint account itself for metadata resolution. |
| **Mint & Freeze Authority** | `REQUIRED` | Delegated to the `Manager` PDA for programmatic control. |
| **Transfer Hook** | `DISABLED` | SSS-1 relies on reactive compliance; no per-transfer toll booth. |
| **Permanent Delegate** | `DISABLED` | No clawback or seizure capabilities exist in SSS-1. |
| **Default Account State** | `DISABLED` | Accounts default to `Initialized` (unfrozen) upon creation. |

## 3. Account Architecture

### 3.1 The Mint Account
The core Token-2022 Mint account. Its authorities (Mint, Freeze, Metadata) are strictly owned by the `Manager` Program Derived Address (PDA). No single Keypair directly holds minting rights.

### 3.2 The `StablecoinConfig` PDA
The source of truth for the stablecoin's rules. Derived via `["config", mint_pubkey]`.

```rust
pub struct StablecoinConfig {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
    
    // RBAC Authorities
    pub master_authority: Pubkey,
    pub pause_authority: Pubkey,
    
    // Protocol State
    pub is_paused: bool,
    
    // SSS-1 Enforced Flags
    pub enable_permanent_delegate: bool, // Always false for SSS-1
    pub enable_transfer_hook: bool,      // Always false for SSS-1
    pub default_account_frozen: bool,    // Always false for SSS-1
}
## 4. Role-Based Access Control (RBAC)
SSS-1 implements a decentralized operational model. The `master_authority` acts as the root admin but does not hold day-to-day operational keys, severely limiting the protocol's attack surface.

* **Master Authority:** Can update roles and upgrade the protocol. Cannot mint or burn tokens.
* **Pauser:** Can globally halt all mints, burns, and transfers in an emergency by toggling the `is_paused` state.
* **Minter:** Authorized to mint tokens strictly up to a mathematically defined limit (Quota).
* **Burner:** Authorized to burn tokens directly from the treasury.

## 5. Security & Constraints
* **Reactive Compliance:** Since SSS-1 intentionally omits a Transfer Hook for gas efficiency, compliance is enforced *reactively*. The Manager program can execute a `freeze_account` instruction to lock a specific malicious actor's token account, but it cannot reverse past transactions or seize the funds.
* **Minter Quotas:** To prevent a compromised minter key from infinitely inflating the token supply, SSS-1 enforces a `MinterRecord` state. This on-chain record tracks and caps the maximum allowable mint volume per key, ensuring strict issuance control at the protocol level.