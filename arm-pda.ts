import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet, Idl } from "@coral-xyz/anchor";
import * as fs from "fs";
import * as os from "os";

// Your Localnet Addresses
const MINT_ADDRESS = new PublicKey("A2VRqE93vzC7RadpGjcLhu8jCNbBuoy1TTCD9QoRzS5J");
const MANAGER_PROGRAM_ID = new PublicKey("Euf94rZebzsHaypDMc34QBWs8LBcKcp3vr1xRsL2QidN");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

async function run() {
    // 1. Load your CLI Admin Wallet
    const keypairPath = os.homedir() + "/.config/solana/id.json";
    if (!fs.existsSync(keypairPath)) throw new Error("Wallet not found at " + keypairPath);
    
    const keypairFile = fs.readFileSync(keypairPath, "utf-8");
    const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(keypairFile)));
    const wallet = new Wallet(keypair);

    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });

    // 2. Load your compiled Manager IDL
    // Ensure this path is correct based on where you are running the script
    const idlPath = "./target/idl/manager.json";
    if (!fs.existsSync(idlPath)) throw new Error("IDL not found at " + idlPath + ". Run 'anchor build' first.");
    
    const idl = JSON.parse(fs.readFileSync(idlPath, "utf8")) as Idl;
    
    // 🚀 FIXED ORDER: IDL, Provider (NOT ProgramID first)
    const program = new Program(idl, provider); 

    // 3. Derive the empty PDA
    const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config"), MINT_ADDRESS.toBuffer()],
        MANAGER_PROGRAM_ID
    );

    console.log(`🚀 Sending Ignition Transaction...`);
    console.log(`Target Mint: ${MINT_ADDRESS.toBase58()}`);
    console.log(`Target PDA:  ${configPda.toBase58()}`);

    // 4. Fire the Anchor Instruction
    try {
        const tx = await program.methods.initialize({
            name: "Institutional USD",
            symbol: "iUSD",
            uri: "",
            decimals: 6,
            enablePermanentDelegate: true,
            enableTransferHook: true,
            defaultAccountFrozen: false
        }).accounts({
            masterAuthority: wallet.publicKey,
            mint: MINT_ADDRESS,
            config: configPda,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_2022_PROGRAM_ID
        }).rpc();

        console.log(`\n✅ SUCCESS! PDA is fully armed and initialized.`);
        console.log(`TX Signature: ${tx}`);
        console.log(`\nYou can now go to your dashboard and Revoke Bob's access!`);
    } catch (e) {
        console.error("\n❌ Failed to initialize PDA:", e);
    }
}

run();