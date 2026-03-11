import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { CreateOptions, Presets } from './presets.js';
export { Presets, CreateOptions };
export declare class SolanaStablecoin {
    connection: Connection;
    mintAddress: PublicKey;
    managerProgramId: PublicKey;
    private constructor();
    /**
     * THE FACTORY METHOD: Generates a fully compliant Token-2022 Mint
     */
    static create(connection: Connection, options: CreateOptions, payer: Keypair, // The wallet paying for the transaction
    managerProgramId: PublicKey, hookProgramId?: PublicKey): Promise<SolanaStablecoin>;
}
//# sourceMappingURL=index.d.ts.map