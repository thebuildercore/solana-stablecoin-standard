# Regulatory Compliance & Audit Trail (`COMPLIANCE.md`)



## 1. Regulatory Overview
The **Solana Stablecoin Standard (SSS-2)** is explicitly engineered to satisfy the strict requirements of tier-1 financial regulators, including the **NYDFS** (New York Department of Financial Services), **MiCA** (European Union), and **OFAC** (Office of Foreign Assets Control).

Traditional smart contracts rely on centralized backends or reactive manual intervention to stop illicit activity. SSS-2 enforces compliance synchronously on-chain, ensuring zero gaps in enforcement.

---

## 2. Regulatory Mapping & On-Chain Mechanics

### 2.1 OFAC Sanctions Screening
* **Requirement:** Issuers must block transactions involving sanctioned addresses immediately.
* **SSS-2 Solution:** The **Transfer Hook (`compliance_hook`)**. Every token transfer invokes this program. If the sender or receiver's `BlacklistRecord` PDA resolves to `is_blacklisted = true`, the transaction fails at the protocol level. It is mathematically impossible to bypass this check.

### 2.2 Asset Recovery & Legal Subpoenas
* **Requirement:** Issuers must be able to seize and return stolen or illicitly obtained funds when presented with a binding court order.
* **SSS-2 Solution:** The **Permanent Delegate Extension**. The SSS Manager program retains global clawback authority. The authorized `Seizer` role can forcibly move tokens from a frozen or blacklisted account to a designated recovery treasury, bypassing the user's private key signature.

### 2.3 KYC/AML Onboarding
* **Requirement:** Issuers must ensure only verified users can hold the stablecoin (Allow-list model).
* **SSS-2 Solution:** **Default Account State**. SSS-2 sets all newly created token accounts to `Frozen`. Users can generate deposit addresses, but they cannot send or receive the asset until the backend verifies their KYC and calls `thaw_account`.

---

## 3. The Audit Trail (Off-Chain Indexer)

Regulators require comprehensive logs of all compliance actions. SSS includes a backend event listener (Indexer) that monitors on-chain program logs and formats them into a structured database for regulatory reporting.

### 3.1 Captured Events
The indexer listens for the following Anchor events:
* `MintEvent`: Tracks fiat-inflow and minter quotas.
* `BurnEvent`: Tracks fiat-outflow.
* `BlacklistEvent`: Tracks when an address is added/removed from the sanctions list.
* `SeizeEvent`: Tracks the execution of the Permanent Delegate clawback.

### 3.2 Audit Log Data Schema
Below is the standard JSON structure our indexer maintains for regulatory export:

```json
{
  "event_id": "evt_8f7d9a...",
  "timestamp": "2026-03-11T12:00:00Z",
  "action_type": "BLACKLIST_ADD",
  "target_address": "BadGuy11111111111111111111111111111111",
  "executor_address": "AdminWallet222222222222222222222222222222",
  "reason_code": "OFAC_MATCH",
  "transaction_signature": "5k8v...9f2a",
  "on_chain_slot": 254890123
}
```

---

## 4. Incident Response Runbook

In the event of a regulatory mandate or protocol exploit, operators using the SSS CLI should follow this execution path:

1. **Immediate Threat:** Execute a global pause to halt all network activity.
   ```bash
   sss-token pause
   ```
2. **Isolate:** Add the offending addresses to the blacklist.
   ```bash
   sss-token blacklist add <address> --reason "Court Order XYZ"
   ```
3. **Recover:** Seize the funds to the recovery treasury.
   ```bash
   sss-token seize <address> --to <treasury_address>
   ```
4. **Resume:** Unpause the protocol and export the audit log for the regulator.
   ```bash
   sss-token unpause
   sss-token audit-log --action SEIZE --export csv
   ```