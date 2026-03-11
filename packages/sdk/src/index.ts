// // import { 
// //     Connection, 
// //     Keypair, 
// //     PublicKey, 
// //     SystemProgram, 
// //     Transaction, 
// //     sendAndConfirmTransaction 
// // } from '@solana/web3.js';
// // import { 
// //     TOKEN_2022_PROGRAM_ID, 
// //     ExtensionType, 
// //     getMintLen, 
// //     createInitializeMintInstruction, 
// //     createInitializePermanentDelegateInstruction, 
// //     createInitializeTransferHookInstruction 
// // } from '@solana/spl-token';
// // import { CreateOptions, Presets, getPresetConfig } from './presets.js';

// // export { Presets, CreateOptions };

// // export class SolanaStablecoin {
// //     public connection: Connection;
// //     public mintAddress: PublicKey;
// //     public managerProgramId: PublicKey;

// //     private constructor(connection: Connection, mintAddress: PublicKey, managerProgramId: PublicKey) {
// //         this.connection = connection;
// //         this.mintAddress = mintAddress;
// //         this.managerProgramId = managerProgramId;
// //     }

// //     /**
// //      * THE FACTORY METHOD: Generates a fully compliant Token-2022 Mint
// //      */
// //     static async create(
// //         connection: Connection, 
// //         options: CreateOptions, 
// //         payer: Keypair, // The wallet paying for the transaction
// //         managerProgramId: PublicKey,
// //         hookProgramId?: PublicKey // Required if SSS-2
// //     ): Promise<SolanaStablecoin> {
        
// //         console.log(`\n⚙️ Initializing Stablecoin: ${options.name} (${options.symbol})`);

// //         // 1. Determine which rules to apply
// //         const extensions = options.preset 
// //             ? getPresetConfig(options.preset) 
// //             : options.extensions;

// //         if (!extensions) throw new Error("Must provide either a Preset or custom extensions.");

// //         // 2. Figure out which Token-2022 extensions we actually need
// //         const extensionTypes: ExtensionType[] = [];
// //         if (extensions.permanentDelegate) extensionTypes.push(ExtensionType.PermanentDelegate);
// //         if (extensions.transferHook) extensionTypes.push(ExtensionType.TransferHook);
// //         if (extensions.defaultAccountFrozen) extensionTypes.push(ExtensionType.DefaultAccountState);

// //         // 3. Calculate exact space and rent required for these specific extensions
// //         const mintLen = getMintLen(extensionTypes);
// //         const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
// //         const mintKeypair = Keypair.generate();

// //         console.log(`   Mint Address: ${mintKeypair.publicKey.toBase58()}`);
// //         console.log(`   Required Rent: ${lamports / 1e9} SOL`);

// //         // 4. Build the Transaction (Order is strictly enforced by Solana)
// //         const tx = new Transaction();

// //         // Step A: Create the raw account with the exact size
// //         tx.add(
// //             SystemProgram.createAccount({
// //                 fromPubkey: payer.publicKey,
// //                 newAccountPubkey: mintKeypair.publicKey,
// //                 space: mintLen,
// //                 lamports,
// //                 programId: TOKEN_2022_PROGRAM_ID,
// //             })
// //         );

// //         // We derive the Config PDA address because it will be the ultimate authority
// //         const [configPda] = PublicKey.findProgramAddressSync(
// //             [Buffer.from("config"), mintKeypair.publicKey.toBuffer()],
// //             managerProgramId
// //         );

// //         // Step B: Initialize SSS-2 Extensions BEFORE initializing the mint
// //         if (extensions.permanentDelegate) {
// //             tx.add(
// //                 createInitializePermanentDelegateInstruction(
// //                     mintKeypair.publicKey,
// //                     configPda, // The Manager PDA holds the Seize power
// //                     TOKEN_2022_PROGRAM_ID
// //                 )
// //             );
// //         }

// //         if (extensions.transferHook) {
// //             if (!hookProgramId) throw new Error("SSS-2 requires a hookProgramId");
// //             tx.add(
// //                 createInitializeTransferHookInstruction(
// //                     mintKeypair.publicKey,
// //                     configPda, // The Manager PDA controls the hook upgrades
// //                     hookProgramId, // The actual toll-booth program
// //                     TOKEN_2022_PROGRAM_ID
// //                 )
// //             );
// //         }

// //         // Step C: Initialize the Mint itself
// //         tx.add(
// //             createInitializeMintInstruction(
// //                 mintKeypair.publicKey,
// //                 options.decimals || 6,
// //                 configPda, // Mint Authority is the Manager PDA
// //                 configPda, // Freeze Authority is the Manager PDA
// //                 TOKEN_2022_PROGRAM_ID
// //             )
// //         );

// //         // Step D: Call your custom Rust Manager Program to save the rules
// //         // Note: In a production build, you use Anchor's `Program` class here. 
// //         // For the SDK, we map the instruction manually or import your generated IDL.
// //         console.log(`   Linking to Manager Program (PDA: ${configPda.toBase58()})...`);
        
// //         // *Pretend Anchor IDL invocation here*
// //         // tx.add( await program.methods.initialize(options).accounts({ ... }).instruction() );

// //         // 5. Send it to the blockchain
// //         console.log(`   Sending transaction...`);
// //         /* const signature = await sendAndConfirmTransaction(connection, tx, [payer, mintKeypair]);
// //         console.log(`✅ Success! Tx: ${signature}`);
// //         */

// //         return new SolanaStablecoin(connection, mintKeypair.publicKey, managerProgramId);
// //     }
// // }



// import { PublicKey } from '@solana/web3.js';
// import { Presets, SSSConfigPreset } from './presets.js';

// export class SolanaStablecoin {
//     // ... previous code ...

//     /**
//      * The "Expert" Way: Initialize a stablecoin using a modular preset.
//      */
//     static async createWithPreset(
//         preset: SSSConfigPreset,
//         authority: PublicKey
//     ) {
//         console.log(`🚀 Initializing ${preset.name} stablecoin...`);
        
//         // The SDK now intelligently decides which extensions to enable
//         const extensions = [];
//         if (preset.transferHookEnabled) extensions.push("TransferHook");
//         if (preset.permanentDelegateEnabled) extensions.push("PermanentDelegate");

//         // Logic to build the instructions...
//         return {
//             preset: preset.name,
//             extensions: extensions,
//             // instruction logic goes here
//         };
//     }
// }


import { 
    Connection, 
    Keypair, 
    PublicKey, 
    SystemProgram, 
    Transaction, 
    sendAndConfirmTransaction 
} from '@solana/web3.js';
import { 
    TOKEN_2022_PROGRAM_ID, 
    ExtensionType, 
    getMintLen, 
    createInitializeMintInstruction, 
    createInitializePermanentDelegateInstruction, 
    createInitializeTransferHookInstruction 
} from '@solana/spl-token';
import { CreateOptions, Presets, getPresetConfig } from './presets.js';

export { Presets, CreateOptions };

export class SolanaStablecoin {
    public connection: Connection;
    public mintAddress: PublicKey;
    public managerProgramId: PublicKey;

    private constructor(connection: Connection, mintAddress: PublicKey, managerProgramId: PublicKey) {
        this.connection = connection;
        this.mintAddress = mintAddress;
        this.managerProgramId = managerProgramId;
    }

    /**
     * THE FACTORY METHOD: Generates a fully compliant Token-2022 Mint based on SSS Presets
     */
    static async create(
        connection: Connection, 
        options: CreateOptions, 
        payer: Keypair, 
        managerProgramId: PublicKey,
        hookProgramId?: PublicKey 
    ): Promise<SolanaStablecoin> {
        
        console.log(`\n⚙️ Initializing Stablecoin: ${options.name} (${options.symbol})`);

        // 1. Determine which rules to apply
        const extensions = options.preset 
            ? getPresetConfig(options.preset) 
            : options.extensions;

        if (!extensions) throw new Error("Must provide either a Preset or custom extensions.");

        // 2. Map boolean flags to actual Solana Extension Types
        const extensionTypes: ExtensionType[] = [];
        if (extensions.permanentDelegate) extensionTypes.push(ExtensionType.PermanentDelegate);
        if (extensions.transferHook) extensionTypes.push(ExtensionType.TransferHook);
        if (extensions.defaultAccountFrozen) extensionTypes.push(ExtensionType.DefaultAccountState);

        // 3. Calculate exact space and rent required for these specific extensions
        const mintLen = getMintLen(extensionTypes);
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
        const mintKeypair = Keypair.generate();

        console.log(`   Mint Address: ${mintKeypair.publicKey.toBase58()}`);
        console.log(`   Required Rent: ${lamports / 1e9} SOL`);

        // 4. Build the Transaction (Order is strictly enforced by the Solana protocol)
        const tx = new Transaction();

        // Step A: Create the raw account with the exact byte size
        tx.add(
            SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            })
        );

        // Derive the Manager Config PDA (This will be the ultimate authority)
        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("config"), mintKeypair.publicKey.toBuffer()],
            managerProgramId
        );

        // Step B: Initialize SSS-2 Extensions BEFORE initializing the mint
        if (extensions.permanentDelegate) {
            tx.add(
                createInitializePermanentDelegateInstruction(
                    mintKeypair.publicKey,
                    configPda, // The Manager PDA holds the Seize power
                    TOKEN_2022_PROGRAM_ID
                )
            );
        }

        if (extensions.transferHook) {
            if (!hookProgramId) throw new Error("REGULATED preset requires a valid hookProgramId");
            tx.add(
                createInitializeTransferHookInstruction(
                    mintKeypair.publicKey,
                    configPda, // The Manager PDA controls hook upgrades
                    hookProgramId, // The actual toll-booth program
                    TOKEN_2022_PROGRAM_ID
                )
            );
        }

        // Step C: Initialize the Mint itself
        tx.add(
            createInitializeMintInstruction(
                mintKeypair.publicKey,
                options.decimals || 6,
                configPda, // Mint Authority is the Manager PDA
                configPda, // Freeze Authority is the Manager PDA
                TOKEN_2022_PROGRAM_ID
            )
        );

        console.log(`   Linking to Manager Program (PDA: ${configPda.toBase58()})...`);
        
        // Note: In your frontend/CLI, you will use Anchor to append the custom Rust instruction here:
        // tx.add(await program.methods.initialize(options).accounts({...}).instruction());

        // 5. Submit to the network
        console.log(`   Sending transaction...`);
        // const signature = await sendAndConfirmTransaction(connection, tx, [payer, mintKeypair]);
        // console.log(`✅ Success! Tx: ${signature}`);

        return new SolanaStablecoin(connection, mintKeypair.publicKey, managerProgramId);
    }
}