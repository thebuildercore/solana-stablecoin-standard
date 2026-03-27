import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey
} from '@solana/web3.js';
import {
    ExtensionType,
    createInitializeMintInstruction,
    getMintLen,
    TOKEN_2022_PROGRAM_ID,
    createInitializeTransferHookInstruction,
} from '@solana/spl-token';
import fs from 'fs';
import os from 'os';

// 1. Connect to Localnet
const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// 2. Load your Admin Wallet
const secretKeyString = fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, 'utf8');
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKeyString)));

// 3. Set the Program IDs
const TRANSFER_HOOK_PROGRAM_ID = new PublicKey("6ZoCZGV5CtMC2fYrt3GBWB6tmFgUpFYioLAD4JPPMQm4");

async function main() {
    console.log("🚀 Creating Perfect SSS-2 Mint on Localnet...");

    // Generate a fresh Mint Keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    const decimals = 6;

    // We ONLY need the Transfer Hook extension for this demo to work
    const extensions = [ExtensionType.TransferHook];
    const mintLen = getMintLen(extensions);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new Transaction().add(
        // 1. Create the Account
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        // 2. Initialize the Transfer Hook (THIS IS WHAT YOUR SDK MISSED)
        createInitializeTransferHookInstruction(
            mint,
            payer.publicKey, // Admin controls the hook
            TRANSFER_HOOK_PROGRAM_ID, // Point it to your compliance program
            TOKEN_2022_PROGRAM_ID
        ),
        // 3. Initialize the Mint
        createInitializeMintInstruction(
            mint,
            decimals,
            payer.publicKey, // Mint Authority
            null, // Freeze Authority
            TOKEN_2022_PROGRAM_ID
        )
    );

    // Send the transaction
    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payer, mintKeypair],
        { commitment: 'confirmed' }
    );

    console.log("✅ Perfect Mint Created!");
    console.log("Mint Address:", mint.toBase58());
    console.log("TX Signature:", signature);
}

main().catch(console.error);