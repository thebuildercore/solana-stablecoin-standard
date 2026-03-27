import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createTransferCheckedInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import os from 'os';

// Connect to Localnet
const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// Load your Admin Wallet (Fee Payer & Sender)
const secretKeyString = fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, 'utf8');
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKeyString)));

// The Addresses
const mint = new PublicKey("A2VRqE93vzC7RadpGjcLhu8jCNbBuoy1TTCD9QoRzS5J");
const sourceTokenAccount = new PublicKey("3g1wGWNTw6SFkavpidmkVTs4XJpLFr2JFiZgRcrPhtm6"); // Your ATA
const destinationTokenAccount = new PublicKey("GF7hr3iJM5STVwbiU3vV8br8LcMgaqopcT7vYhKgzcwV"); // Bob's ATA

async function main() {
    console.log("🚀 Forcing Transaction...");

    const tx = new Transaction().add(
        createTransferCheckedInstruction(
            sourceTokenAccount,
            mint,
            destinationTokenAccount,
            payer.publicKey, // Owner of the source account
            10, // Amount
            6, // Decimals
            [], // Multisig signers
            TOKEN_2022_PROGRAM_ID
        )
    );

    try {
        const signature = await sendAndConfirmTransaction(connection, tx, [payer], { skipPreflight: false });
        console.log("❌ CRITICAL FAILURE: The transaction went through! The Blacklist failed.");
        console.log("Signature:", signature);
    } catch (error: any) {
        console.log("\n✅ SUCCESS! THE SMART CONTRACT BLOCKED THE TRANSFER.");
        console.log("Look for 'Custom Program Error' below:");
        console.log("--------------------------------------------------");
        console.error(error.message || error);
    }
}

main().catch(console.error);