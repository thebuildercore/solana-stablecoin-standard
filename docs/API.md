# Backend API Reference (`API.md`)

## Overview
The SSS Off-Chain API bridges the gap between traditional fiat banking rails and the on-chain Solana Stablecoin Standard. It provides a standard REST interface for institutional partners to trigger mints, manage compliance, and retrieve audit logs without needing to manage Solana keypairs directly.



## Authentication
All API endpoints require institutional authentication via a Bearer token.
```http
Authorization: Bearer sk_live_...
```

---

## 1. Core Treasury Endpoints

### Request a Mint (Fiat Inflow)
Triggered when a verified fiat deposit clears in the central bank account. This queues an on-chain `mint` instruction via the protocol's Minter wallet.

**`POST /v1/treasury/mint`**

**Request:**
```json
{
  "recipient_address": "UserWallet1111111111111111111111111111111",
  "amount": "100000.00",
  "fiat_reference_id": "wire_8f72kx9",
  "idempotency_key": "idem_99x21"
}
```

**Response (202 Accepted):**
```json
{
  "status": "processing",
  "transaction_id": "tx_55928a",
  "estimated_on_chain_settlement": "1-3 seconds"
}
```

### Request a Burn (Fiat Outflow)
Triggered when a user requests a fiat withdrawal. The backend verifies the tokens have been deposited to the protocol's treasury wallet, burns them on-chain, and signals the bank API to release the fiat wire.

**`POST /v1/treasury/burn`**

**Request:**
```json
{
  "amount": "50000.00",
  "fiat_destination_account": "iban_DE89...",
  "user_address": "UserWallet1111111111111111111111111111111"
}
```

---

## 2. Compliance Endpoints (SSS-2 Only)
These endpoints interact directly with the `compliance_hook` and Permanent Delegate.

### Update Blacklist
Automated KYT (Know Your Transaction) providers call this endpoint to instantly block sanctioned addresses.

**`POST /v1/compliance/blacklist`**

**Request:**
```json
{
  "target_address": "BadActorWallet2222222222222222222222222",
  "action": "ADD",
  "reason_code": "OFAC_SANCTIONS_MATCH"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "on_chain_signature": "4vJ9...2a1b",
  "hook_updated": true
}
```

### Execute Legal Seizure
Executes the Permanent Delegate clawback mechanism.

**`POST /v1/compliance/seize`**

**Request:**
```json
{
  "target_address": "CompromisedWallet333333333333333333333",
  "destination_address": "RecoveryTreasury444444444444444444444",
  "amount": "ALL",
  "legal_reference": "Subpoena_NYDFS_2026_03"
}
```

---

## 3. Data & Audit Endpoints

### Retrieve Audit Logs
Export cryptographically verifiable logs of all protocol actions (Mints, Burns, Seizures, Blacklistings) for regulatory reporting.

**`GET /v1/audit/logs`**

**Query Parameters:**
* `start_date`: `2026-03-01T00:00:00Z`
* `end_date`: `2026-03-31T23:59:59Z`
* `action_type`: `SEIZE` (Optional)
* `format`: `json` | `csv`

**Response (200 OK):**
```json
{
  "data": [
    {
      "event_id": "evt_8f7d9a",
      "timestamp": "2026-03-11T12:00:00Z",
      "action_type": "BLACKLIST_ADD",
      "target_address": "BadActorWallet...",
      "executor_address": "AdminWallet...",
      "reason_code": "OFAC_SANCTIONS_MATCH",
      "transaction_signature": "5k8v...9f2a"
    }
  ],
  "pagination": {
    "has_more": false
  }
}
```

---

## 4. Webhooks

Institutions can register HTTP callbacks to listen for on-chain events parsed by the SSS Indexer.

**`POST /v1/webhooks/register`**

**Request:**
```json
{
  "endpoint_url": "[https://api.exchange.com/webhooks/sss](https://api.exchange.com/webhooks/sss)",
  "events": [
    "mint.completed",
    "compliance.blacklist_updated",
    "compliance.funds_seized"
  ],
  "secret": "whsec_..."
}
```