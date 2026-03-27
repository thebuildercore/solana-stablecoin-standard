import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair, Connection } from "@solana/web3.js";
import fs from 'fs';
import os from 'os';

async function main() {
    // 1. Manually force the Connection & Wallet to Localnet
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const walletPath = `${os.homedir()}/.config/solana/id.json`;
    const adminKeypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
    );
    
    const wallet = new anchor.Wallet(adminKeypair);
    const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
    anchor.setProvider(provider);

    // 2. Constants
    const PROGRAM_ID = new PublicKey("Euf94rZebzsHaypDMc34QBWs8LBcKcp3vr1xRsL2QidN");
    const ADMIN_WALLET = new PublicKey("3g1wGWNTw6SFkavpidmkVTs4XJpLFr2JFiZgRcrPhtm6");

    // 3. Derive PDA
    const [blacklistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("blacklist"), ADMIN_WALLET.toBuffer()],
        PROGRAM_ID
    );

    console.log(`🔓 Attempting to Authorize Admin: ${ADMIN_WALLET.toBase58()}`);

    // 4. Load Program (Fixed for modern Anchor versions)
    const idl = JSON.parse(fs.readFileSync("./target/idl/solana_stablecoin_standard.json", "utf8"));
    const program = new anchor.Program(idl as anchor.Idl, provider);

    try {
        // 5. Update Status (1 = Authorized)
        const tx = await program.methods
            .updateStatus(1) 
            .accounts({
                blacklistAccount: blacklistPda,
                admin: adminKeypair.publicKey,
            })
            .signers([adminKeypair])
            .rpc();

        console.log("✅ SUCCESS: Admin Wallet is now AUTHORIZED.");
        console.log("TX Signature:", tx);
    } catch (e) {
        console.error("❌ Failed to update status. Check logs below:");
        console.error(e);
    }
}

main();