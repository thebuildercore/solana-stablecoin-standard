# Operations & CLI Runbook (`OPERATIONS.md`)



## Overview
The SSS Admin CLI (`sss-token`) is a powerful, terminal-based tool built on top of the `@stbr/sss-token` SDK. It allows treasury managers, compliance officers, and protocol operators to safely execute on-chain actions without needing to write custom scripts.

All commands require the operator to hold the appropriate Role-Based Access Control (RBAC) keys defined during initialization.

---

## 1. Initialization & Deployment
The `init` command is the entry point for creating a new stablecoin. It supports the opinionated standard presets or a fully custom TOML/JSON configuration.

```bash
# SSS-1: Deploy a Minimal Utility Stablecoin
sss-token init --preset sss-1 --name "Ecosystem USD" --symbol "ecoUSD" --decimals 6

# SSS-2: Deploy a Regulated Institutional Stablecoin
sss-token init --preset sss-2 --name "Institutional USD" --symbol "iUSD" --decimals 6

# Custom: Deploy using a local config file for granular extension control
sss-token init --custom ./config.toml
```

---

## 2. Core Treasury Operations
These commands are available for both SSS-1 and SSS-2 tokens.

### Minting & Burning
Minting is restricted by the quota assigned to the specific Minter key.

```bash
# Mint tokens to a specific recipient
sss-token mint <recipient_address> <amount> --keypair ./minter.json

# Burn tokens from the treasury
sss-token burn <amount> --keypair ./burner.json
```

### Freezing & Pausing (Reactive Compliance)
Emergency controls to halt protocol activity.

```bash
# Freeze a specific user's account (prevents sending/receiving)
sss-token freeze <user_address>

# Thaw a user's account (used for KYC onboarding in SSS-2)
sss-token thaw <user_address>

# Globally pause ALL protocol actions (Emergency only)
sss-token pause

# Resume protocol operations
sss-token unpause
```

### State & Supply
```bash
# Check current circulating supply and protocol status
sss-token status

# List all current token holders above a certain threshold
sss-token holders --min-balance 1000
```

---

## 3. SSS-2 Compliance Operations
These commands interact with the Transfer Hook and Permanent Delegate. They will fail if executed on an SSS-1 token.

### Blacklist Management (Transfer Hook)
Adding an address to the blacklist instantly blocks them from participating in any token transfers.

```bash
# Add a wallet to the on-chain blacklist
sss-token blacklist add <address> --reason "OFAC Sanctions Match"

# Remove a wallet from the blacklist
sss-token blacklist remove <address>
```

### Token Seizure (Permanent Delegate)
Clawback funds from a compromised, blacklisted, or lost wallet.

```bash
# Forcibly transfer funds from a target wallet to the recovery treasury
sss-token seize <target_address> --to <treasury_address> --keypair ./seizer.json
```

---

## 4. Protocol Management
Commands for the Master Authority to manage roles and pull audit logs.

```bash
# List all authorized minters and their current quotas
sss-token minters list

# Authorize a new minter with a specific quota
sss-token minters add <address> --quota 1000000

# Pull the structured audit log for regulatory reporting
sss-token audit-log --action SEIZE --export csv
```