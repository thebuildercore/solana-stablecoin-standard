// // export enum Presets {
// //     SSS_1 = "SSS_1",
// //     SSS_2 = "SSS_2"
// // }

// // export interface CustomExtensions {
// //     permanentDelegate: boolean;
// //     transferHook: boolean;
// //     defaultAccountFrozen: boolean;
// // }

// // export interface CreateOptions {
// //     preset?: Presets;
// //     name: string;
// //     symbol: string;
// //     uri?: string;
// //     decimals?: number;
// //     authority: any; // Typically a Keypair or Wallet adapter
// //     extensions?: CustomExtensions; // For custom configurations
// // }

// // // The Opinionated Standard Templates
// // export const getPresetConfig = (preset: Presets): CustomExtensions => {
// //     switch (preset) {
// //         case Presets.SSS_1: // Minimal Stablecoin
// //             return {
// //                 permanentDelegate: false,
// //                 transferHook: false,
// //                 defaultAccountFrozen: false
// //             };
// //         case Presets.SSS_2: // Compliant Stablecoin
// //             return {
// //                 permanentDelegate: true,
// //                 transferHook: true,
// //                 defaultAccountFrozen: true
// //             };
// //         default:
// //             throw new Error("Invalid Preset Selected");
// //     }
// // };




// import { PublicKey } from '@solana/web3.js';

// export interface SSSConfigPreset {
//     name: string;
//     description: string;
//     permanentDelegateEnabled: boolean;
//     transferHookEnabled: boolean;
//     defaultQuotas: number;
// }

// export const Presets: Record<string, SSSConfigPreset> = {
//     /**
//      * REGULATED_INSTITUTIONAL (SSS-2)
//      * Designed for maximum compliance (USDC-style). 
//      * Includes real-time blacklisting (Hook) and clawback authority (Delegate).
//      */
//     REGULATED: {
//         name: "Regulated Institutional",
//         description: "Full SSS-2 compliance with real-time transfer hooks and permanent delegate for clawbacks.",
//         permanentDelegateEnabled: true,
//         transferHookEnabled: true,
//         defaultQuotas: 1_000_000,
//     },

//     /**
//      * OPEN_UTILITY (SSS-1)
//      * Designed for speed and gas-efficiency. 
//      * No hooks or clawbacks. Just a transparent, capped mint.
//      */
//     UTILITY: {
//         name: "Open Utility",
//         description: "Lightweight SSS-1 token. No hooks or seizure authority. Ideal for community rewards.",
//         permanentDelegateEnabled: false,
//         transferHookEnabled: false,
//         defaultQuotas: 0,
//     }
// };


export enum Presets {
    UTILITY = "UTILITY",     // SSS-1: Fast, gas-efficient, minimal compliance
    REGULATED = "REGULATED"  // SSS-2: Institutional grade, full compliance
}

export interface CustomExtensions {
    permanentDelegate: boolean;
    transferHook: boolean;
    defaultAccountFrozen: boolean;
}

export interface CreateOptions {
    preset?: Presets;
    name: string;
    symbol: string;
    uri?: string;
    decimals?: number;
    authority: any; // The wallet/keypair acting as the initial manager
    extensions?: CustomExtensions; // Allows developers to override presets
}

// The Opinionated Standard Templates
export const getPresetConfig = (preset: Presets): CustomExtensions => {
    switch (preset) {
        case Presets.UTILITY: 
            return {
                permanentDelegate: false,
                transferHook: false,
                defaultAccountFrozen: false
            };
        case Presets.REGULATED: 
            return {
                permanentDelegate: true,
                transferHook: true,
                defaultAccountFrozen: true // Freezes all new token accounts until KYC'd
            };
        default:
            throw new Error("Invalid Preset Selected. Must be UTILITY or REGULATED.");
    }
};