# Quickstart & Usage Guide (`USAGE.md`)

This guide walks you through the end-to-end process of deploying the Solana Stablecoin Standard (SSS) contracts to a local test network, and interacting with them using the CLI and SDK.

## 1. Prerequisites
Ensure your local environment has the following installed:
* **Rust** (v1.75.0+)
* **Solana CLI** (v1.18.x+)
* **Anchor CLI** (v0.32.x+)
* **Node.js** (v18+) & Yarn

---

## 2. Local Network Setup

First, open a terminal and start a local Solana validator. This simulates the Solana blockchain on your machine.
```bash
solana-test-validator
```

In a **second terminal**, configure your Solana CLI to talk to this local network and generate a temporary deployment keypair:
```bash
solana config set --url localhost
solana-keygen new -o ~/.config/solana/id.json
solana airdrop 100 # Fund your local wallet with test SOL
```

---

## 3. Build & Deploy the Smart Contracts

Navigate to the root of the SSS repository to build and deploy the core `manager` and `compliance_hook` programs.

```bash
# Install NPM dependencies for the SDK/CLI
yarn install

# Compile the Rust smart contracts
anchor build

# Sync the generated Program IDs with your Anchor.toml and Rust macros
anchor keys sync

# Deploy the compiled programs to your local validator
anchor deploy
```

---

## 4. Using the CLI (Treasury Operator)

Now that the contracts are live on your local network, you can use the SSS CLI to initialize a new stablecoin. 

Navigate to the CLI package (assuming it is built and linked globally or run via `npx`):

```bash
# Initialize a new Regulated Stablecoin (SSS-2)
sss-token init \
  --preset sss-2 \
  --name "Local USD" \
  --symbol "locUSD" \
  --decimals 6 \
  --keypair ~/.config/solana/id.json
```

The CLI will output the newly created **Mint Address** (e.g., `Mint: 8xT...9qZ`). Save this address for the next step.

---

## 5. Using the SDK (Frontend/Backend Developer)

If you are building a Web3 application or a Node.js backend, you will interact with the token using the `@stbr/sss-token` SDK. 

Create a test script (`test-mint.ts`) to mint tokens to a user:

```typescript
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SolanaStablecoin } from "@stbr/sss-token";
import * as fs from "fs";

async function main() {
    // 1. Connect to the local network
    const connection = new Connection("[http://127.0.0.1:8899](http://127.0.0.1:8899)", "confirmed");
    
    // 2. Load your local wallet
    const secretKeyString = fs.readFileSync("/home/user/.config/solana/id.json", "utf8");
    const adminKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKeyString)));

    // 3. Load the Token you created via the CLI
    const mintAddress = new PublicKey("YOUR_MINT_ADDRESS_HERE");
    const stable = await SolanaStablecoin.load(connection, mintAddress);

    // 4. Create a random user wallet to receive funds
    const userWallet = Keypair.generate();

    console.log("Minting 1,000 locUSD to User...");

    // 5. Mint the tokens (1,000 tokens with 6 decimals = 1_000_000_000)
    const signature = await stable.mint({
        recipient: userWallet.publicKey,
        amount: 1_000_000_000,
        minter: adminKeypair 
    });

    console.log(`Success! Transaction Signature: ${signature}`);
    
    // 6. Check the user's new balance
    const balance = await stable.getBalance(userWallet.publicKey);
    console.log(`User Balance: ${balance} locUSD`);
}

main();
```

Run the script using `ts-node`:
```bash
npx ts-node test-mint.ts
```

