# SDK Reference (`@stbr/sss-token`)

## Overview
The `@stbr/sss-token` TypeScript SDK provides a developer-friendly wrapper around the Solana Token-2022 program and the SSS architecture. It completely abstracts the underlying complexity of calculating rent-exemptions, deriving Program Derived Addresses (PDAs), and sequencing exact Extension initialization instructions.

## Installation
*(Note: Package is currently in beta for this repository)*
```bash
npm install @stbr/sss-token @solana/web3.js @solana/spl-token
```

---

## 1. Initialization (The Factory Method)
The SDK uses a single factory method to deploy fully compliant stablecoins based on your chosen standard. The SDK automatically calculates exact byte sizes and bundles the required instructions.

### Standard 1: Utility (SSS-1)
Initializes a lightweight stablecoin with basic RBAC and metadata, but no Transfer Hooks or Permanent Delegates.

```typescript
import { SolanaStablecoin, Presets } from "@stbr/sss-token";

const stable = await SolanaStablecoin.create(
    connection, 
    {
        preset: Presets.UTILITY,
        name: "Ecosystem USD",
        symbol: "ecoUSD",
        decimals: 6,
        authority: adminKeypair,
    },
    payerKeypair,
    MANAGER_PROGRAM_ID
);
```

### Standard 2: Regulated (SSS-2)
Initializes an institutional-grade stablecoin. The SDK automatically configures the Transfer Hook, Permanent Delegate, and sets the Default Account State to Frozen.

```typescript
const regulatedStable = await SolanaStablecoin.create(
    connection, 
    {
        preset: Presets.REGULATED,
        name: "Institutional USD",
        symbol: "iUSD",
        decimals: 6,
        authority: adminKeypair,
    },
    payerKeypair,
    MANAGER_PROGRAM_ID,
    COMPLIANCE_HOOK_PROGRAM_ID // Required for SSS-2
);
```

### Custom Configurations
If the opinionated standard presets don't fit your exact business needs, you can override the extensions manually via the `extensions` object:

```typescript
const customStable = await SolanaStablecoin.create(
    connection, 
    {
        name: "Custom Token",
        symbol: "CTK",
        decimals: 6,
        extensions: {
            permanentDelegate: true,
            transferHook: false,
            defaultAccountFrozen: false
        },
        authority: adminKeypair,
    },
    payerKeypair,
    MANAGER_PROGRAM_ID
);
```

---

## 2. Core Operations (Layer 1)
These methods are available on all SSS tokens, regardless of the preset used.

```typescript
// Mint tokens to a recipient (Requires Minter role & respects quotas)
await stable.mint({
    recipient: userPublicKey,
    amount: 1_000_000, // 1 Token (assuming 6 decimals)
    minter: minterKeypair
});

// Burn tokens from the treasury (Requires Burner role)
await stable.burn({
    amount: 500_000,
    burner: burnerKeypair
});

// Reactively freeze an account (Requires Pause/Manager authority)
await stable.freezeAccount(userPublicKey, adminKeypair);

// Query total supply
const supply = await stable.getTotalSupply();
console.log(`Current Supply: ${supply}`);
```

---

## 3. Compliance Operations (Layer 2)
These methods interact with the `compliance_hook` and Permanent Delegate. They will gracefully fail if the token was initialized using the `UTILITY` (SSS-1) preset.

```typescript
// Add a wallet to the on-chain blacklist (Transfer Hook)
await stable.compliance.blacklistAdd(
    maliciousAddress, 
    "OFAC Sanctions Match",
    blacklisterKeypair
);

// Remove a wallet from the blacklist
await stable.compliance.blacklistRemove(
    maliciousAddress,
    blacklisterKeypair
);

// Seize tokens using the Permanent Delegate (Clawback)
await stable.compliance.seize(
    frozenAccount,       // The account to seize from
    recoveryTreasury,    // The destination account
    seizerKeypair        // The authorized Seizer role
);
```