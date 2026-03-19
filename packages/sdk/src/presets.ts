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
