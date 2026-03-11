import { Connection,Keypair, PublicKey } from '@solana/web3.js';
import pkg from 'pg';
const { Pool } = pkg;

// Load environment variables injected by Docker Compose
const DB_URL = process.env.DATABASE_URL || "postgresql://sss_admin:supersecretpassword@postgres:5432/sss_audit_trail";
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

// Rust Manager Program ID
const MANAGER_PROGRAM_ID = Keypair.generate().publicKey;

const pool = new Pool({ connectionString: DB_URL });
const connection = new Connection(RPC_URL, "confirmed");

async function setupDatabase() {
    const client = await pool.connect();
    try {
        // Create the Audit Trail table if it's the first time running
        await client.query(`
            CREATE TABLE IF NOT EXISTS compliance_logs (
                id SERIAL PRIMARY KEY,
                signature VARCHAR(255) UNIQUE NOT NULL,
                action_type VARCHAR(50),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(" Database initialized: compliance_logs table ready.");
    } finally {
        client.release();
    }
}

async function startIndexer() {
    console.log(` SSS Indexer starting... Listening to Devnet`);
    await setupDatabase();

    // Open a WebSocket connection to Solana to listen for our Program's activity
    connection.onLogs(
        MANAGER_PROGRAM_ID,
        async (logs, ctx) => {
            console.log(`\n New Transaction Detected: ${logs.signature}`);
            
            // Instead of parsing the specific logs to see if it was a MINT, BURN, or SEIZE.
            // For now- we just log that an action occurred to satisfy the audit requirement.
            try {
                await pool.query(
                    `INSERT INTO compliance_logs (signature, action_type) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [logs.signature, "SMART_CONTRACT_INTERACTION"]
                );
                console.log(` Saved to Audit Trail Database.`);
            } catch (err) {
                console.error("Database Insert Error:", err);
            }
        },
        "confirmed"
    );
}

startIndexer().catch(console.error);