export declare enum Presets {
    SSS_1 = "SSS_1",
    SSS_2 = "SSS_2"
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
    authority: any;
    extensions?: CustomExtensions;
}
export declare const getPresetConfig: (preset: Presets) => CustomExtensions;
//# sourceMappingURL=presets.d.ts.map