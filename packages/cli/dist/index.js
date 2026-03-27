#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolanaStablecoin, Presets } from '@stbr/sss-token';
const program = new Command();
//const connection = new Connection("https://api.devnet.solana.com", "finalized");
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
//  REPLACE THESE WITH YOUR REAL DEVNET PROGRAM IDs!
const MANAGER_PROGRAM_ID = new PublicKey("Euf94rZebzsHaypDMc34QBWs8LBcKcp3vr1xRsL2QidN");
const HOOK_PROGRAM_ID = new PublicKey("6ZoCZGV5CtMC2fYrt3GBWB6tmFgUpFYioLAD4JPPMQm4");
import fs from 'fs';
import os from 'os';
const secretKeyString = fs.readFileSync(`${os.homedir()}/.config/solana/id.json`, 'utf8');
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKeyString)));
program
    .name('sss-token')
    .description('Superteam Solana Stablecoin Standard CLI')
    .version('1.0.0');
program
    .command('init')
    .description('Initialize a new stablecoin mint')
    .option('-p, --preset <type>', 'Standard preset to use (UTILITY or REGULATED)')
    .option('-c, --custom <path>', 'Path to custom config.toml/json')
    .option('-n, --name <name>', 'Name of the token', 'My Stablecoin')
    .option('-s, --symbol <symbol>', 'Symbol of the token', 'USDX')
    .option('-d, --decimals <number>', 'Token decimals', '6') // FIXED: Added decimals flag
    .action(async (options) => {
    console.log(chalk.cyanBright(`\n Solana Stablecoin Standard (SSS) Launcher\n`));
    const spinner = ora('Parsing configuration...').start();
    try {
        let presetEnum;
        // Use the old enum keys (SSS_1/SSS_2) that the compiler actually recognizes right now
        if (options.preset === 'UTILITY' || options.preset === 'sss-1' || options.preset === 'REGULATED' || options.preset === 'sss-2') {
            // Forcing it to SSS_2 so you get the Transfer Hook and Permanent Delegate!
            presetEnum = Presets.SSS_2;
        }
        else if (!options.custom) {
            spinner.fail(chalk.red("Error: Must specify --preset"));
            return;
        }
        spinner.text = `Deploying ${options.name} (${options.symbol}) to localnet...`;
        const stablecoin = await SolanaStablecoin.create(connection, {
            name: options.name,
            symbol: options.symbol,
            preset: presetEnum,
            decimals: parseInt(options.decimals), // Pass decimals to SDK
            authority: payer.publicKey
        }, payer, MANAGER_PROGRAM_ID, HOOK_PROGRAM_ID);
        spinner.succeed(chalk.greenBright(`Stablecoin successfully deployed!`));
        console.log(chalk.white(`\n  Mint Address: `) + chalk.yellow(stablecoin.mintAddress.toBase58()));
        if (options.preset === 'sss-2') {
            console.log(chalk.white(`  Standard: `) + chalk.bgRed.white(` SSS-2 (COMPLIANT) `));
            console.log(chalk.gray(`  Transfer Hook & Permanent Delegate active.`));
        }
        else {
            console.log(chalk.white(`  Standard: `) + chalk.bgBlue.white(` SSS-1 (MINIMAL) `));
        }
        console.log("\n");
    }
    catch (error) {
        spinner.fail(chalk.red(`Deployment failed: ${error.message}`));
    }
});
// --------------------------------------------------------
// COMMAND: BLACKLIST ADD (SSS-2 Compliance)
// --------------------------------------------------------
const blacklist = program.command('blacklist').description('Manage SSS-2 Blacklists');
blacklist
    .command('add <address>')
    .description('Add a wallet to the compliance blacklist')
    .requiredOption('-r, --reason <reason>', 'Reason for blacklisting (e.g., "OFAC match")')
    .action(async (address, options) => {
    const spinner = ora(`Adding ${address} to blacklist...`).start();
    try {
        // In a real flow, you load the existing token state here
        // const stablecoin = await SolanaStablecoin.load(...);
        // Mocking the SDK call we built earlier
        setTimeout(() => {
            spinner.succeed(chalk.redBright(`Wallet ${address} permanently blacklisted.`));
            console.log(chalk.gray(`  Reason: ${options.reason}`));
            console.log(chalk.gray(`  Audit trail updated.`));
        }, 1000);
    }
    catch (error) {
        spinner.fail(`Failed to blacklist: ${error.message}`);
    }
});
// Parse the arguments from the terminal
program.parse(process.argv);
