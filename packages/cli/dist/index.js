#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Connection, Keypair } from '@solana/web3.js';
import { SolanaStablecoin, Presets } from '@stbr/sss-token'; // Your SDK!
const program = new Command();
// Setup standard Solana connection (Devnet for testing)
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
// Mock: Load a local keypair. In a real app, you'd load from ~/.config/solana/id.json
const payer = Keypair.generate();
// Dynamically generating valid mock Program IDs for testing
const MANAGER_PROGRAM_ID = Keypair.generate().publicKey;
const HOOK_PROGRAM_ID = Keypair.generate().publicKey;
program
    .name('sss-token')
    .description('Superteam Solana Stablecoin Standard CLI')
    .version('1.0.0');
// --------------------------------------------------------
// COMMAND: INIT (The Factory)
// --------------------------------------------------------
program
    .command('init')
    .description('Initialize a new stablecoin mint')
    .option('-p, --preset <type>', 'Standard preset to use (sss-1 or sss-2)')
    .option('-c, --custom <path>', 'Path to custom config.toml/json')
    .option('-n, --name <name>', 'Name of the token', 'My Stablecoin')
    .option('-s, --symbol <symbol>', 'Symbol of the token', 'USDX')
    .action(async (options) => {
    console.log(chalk.cyanBright(`\n🚀 Solana Stablecoin Standard (SSS) Launcher\n`));
    const spinner = ora('Parsing configuration...').start();
    try {
        let presetEnum;
        if (options.preset === 'sss-1')
            presetEnum = Presets.SSS_1;
        else if (options.preset === 'sss-2')
            presetEnum = Presets.SSS_2;
        else if (!options.custom) {
            spinner.fail(chalk.red("Error: Must specify either --preset or --custom"));
            return;
        }
        spinner.text = `Deploying ${options.name} (${options.symbol}) to Devnet...`;
        // Calling YOUR SDK Factory Method!
        const stablecoin = await SolanaStablecoin.create(connection, {
            name: options.name,
            symbol: options.symbol,
            preset: presetEnum,
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
