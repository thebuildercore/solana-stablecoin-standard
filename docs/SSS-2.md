# Standard 2: Compliant Stablecoin (SSS-2)

## 1. Abstract
The **SSS-2 (Compliant Stablecoin Standard)** is the institutional-grade tier of the Solana Stablecoin Standard. Designed specifically for regulated fiat-backed stablecoins (e.g., USDC, EURC equivalents), it enforces rigorous on-chain compliance.

While SSS-1 relies on reactive account freezing, SSS-2 introduces **Proactive Compliance**. It leverages Token-2022 Transfer Hooks to intercept and validate every single token transfer against an on-chain blacklist in real-time. Furthermore, it implements the Permanent Delegate extension to allow authorized entities to legally recover or seize illicit funds.



## 2. Token-2022 Extension Profile
An SSS-2 compliant token utilizes advanced Token-2022 extensions to enforce its rules at the protocol level. 

When initializing an SSS-2 token via the SDK (`preset: Presets.REGULATED`), the following extension profile is strictly enforced:

| Extension | Status | Rationale |
| :--- | :--- | :--- |
| **Token Metadata** | `REQUIRED` | Stores Name, Symbol, and URI natively on the Mint account. |
| **Metadata Pointer** | `REQUIRED` | Points to the Mint account itself for metadata resolution. |
| **Transfer Hook** | `REQUIRED` | Forces every transfer to execute the `compliance_hook` program. |
| **Permanent Delegate** | `REQUIRED` | Grants the Manager PDA "clawback" authority to seize assets. |
| **Default Account State** | `REQUIRED` | New token accounts initialize as `Frozen` until KYC is verified. |

## 3. Architecture & The Compliance Hook

To prevent the core token logic from becoming bloated, SSS-2 separates the treasury logic from the compliance logic into two distinct Solana programs.

### 3.1 The Manager Program
Acts as the central bank. It holds the Permanent Delegate authority and manages the `StablecoinConfig` PDA. 

### 3.2 The Compliance Hook Program ("The Toll Booth")
A standalone program attached to the token via the Transfer Hook extension. It evaluates a `BlacklistRecord` PDA derived from the wallet address. If either the sender or receiver is flagged, the transfer instantly panics with a `ComplianceError`.

```rust
// The state evaluated by the Transfer Hook on every transaction
#[account]
pub struct BlacklistRecord {
    pub is_blacklisted: bool,
    pub reason: String, // e.g., "OFAC Sanctions Match"
}

## 4. Extended Role-Based Access Control (RBAC)
SSS-2 inherits all roles from SSS-1 (Master, Pauser, Minter, Burner) and introduces highly specialized regulatory roles. To prevent abuse, no single key controls the entire compliance stack.

* **Blacklister:** Authorized to execute `add_to_blacklist` and `remove_from_blacklist` within the compliance hook. This role is typically assigned to an automated backend transaction monitoring service.
* **Seizer:** Authorized to utilize the Permanent Delegate to forcibly transfer tokens out of a frozen or blacklisted account into a designated recovery treasury.

## 5. Security & Regulatory Mechanics

### 5.1 Real-Time Sanctions Enforcement
Because the Transfer Hook is invoked natively by the SPL Token program, it is impossible for users to bypass the blacklist check. Even if a user interacts directly with the raw Solana RPC, the transaction will fail if the `compliance_hook` detects a blacklisted participant.


### 5.2 KYC Onboarding (Default Frozen)
By enabling `Default Account State = Frozen`, SSS-2 operates on an "allow-list" model by default. When a user creates a new token account, they cannot receive funds until the `Manager` explicitly calls a `thaw_account` instruction. This mirrors traditional finance KYC/AML onboarding funnels.

### 5.3 Legal Seizure (Clawbacks)
If a user loses their private keys, or if law enforcement mandates the recovery of stolen funds, the `Seizer` role can bypass the user's signature. The Permanent Delegate extension allows the protocol to execute a transfer on the user's behalf, ensuring regulatory bodies have the ultimate recourse they require.