export var Presets;
(function (Presets) {
    Presets["SSS_1"] = "SSS_1";
    Presets["SSS_2"] = "SSS_2";
})(Presets || (Presets = {}));
// The Opinionated Standard Templates
export const getPresetConfig = (preset) => {
    switch (preset) {
        case Presets.SSS_1: // Minimal Stablecoin
            return {
                permanentDelegate: false,
                transferHook: false,
                defaultAccountFrozen: false
            };
        case Presets.SSS_2: // Compliant Stablecoin
            return {
                permanentDelegate: true,
                transferHook: true,
                defaultAccountFrozen: true
            };
        default:
            throw new Error("Invalid Preset Selected");
    }
};
//# sourceMappingURL=presets.js.map