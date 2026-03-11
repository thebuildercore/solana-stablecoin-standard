use anchor_lang::prelude::*;

/// The Master Configuration
/// This PDA holds the overarching rules for a specific stablecoin.
#[account]
pub struct StablecoinConfig {
    pub mint: Pubkey,                  // The actual Token-2022 Mint address
    pub master_authority: Pubkey,      // The ultimate admin who deployed this
    
    // --- Role Based Access Control (RBAC) Authorities ---
    // Instead of one "God Mode" key, we split powers.
    pub minter_admin: Pubkey,          // Allowed to create MinterRecords
    pub burner_authority: Pubkey,      // Allowed to burn tokens
    pub blacklister_authority: Pubkey, // Allowed to add/remove from blacklist (SSS-2)
    pub pauser_authority: Pubkey,      // Allowed to pause all operations
    pub seizer_authority: Pubkey,      // Allowed to forcefully seize funds (SSS-2)

    // --- SSS-2 Compliance Flags ---
    pub enable_permanent_delegate: bool, 
    pub enable_transfer_hook: bool,      
    pub default_account_frozen: bool,    

    // --- Operational State ---
    pub is_paused: bool,               // Emergency stop switch
    pub bump: u8,                      // PDA derivation bump
}

impl StablecoinConfig {
    // Helper function to easily check if this token is running in "Compliant" mode
    pub fn is_compliant(&self) -> bool {
        self.enable_permanent_delegate && self.enable_transfer_hook
    }
}

/// The Employee ID Card (Per-Minter Quotas)
/// This PDA tracks individual minters to ensure they don't print infinite money.
#[account]
pub struct MinterRecord {
    pub minter: Pubkey,         // The wallet allowed to mint
    pub config: Pubkey,         // Which stablecoin this minter belongs to
    pub mint_quota: u64,        // Maximum total amount they are allowed to mint
    pub minted_amount: u64,     // Running tally of what they have minted so far
    pub is_active: bool,        // Can be toggled off by the minter_admin
    pub bump: u8,
}