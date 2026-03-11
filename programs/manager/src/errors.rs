use anchor_lang::prelude::*;

#[error_code]
pub enum StablecoinError {
    #[msg("Operation failed: SSS-2 Compliance modules are not enabled for this token.")]
    ComplianceNotEnabled,
    
    #[msg("Unauthorized: You do not have the required role to perform this action.")]
    UnauthorizedAccess,
    
    #[msg("Quota Exceeded: This minter has reached their maximum minting allowance.")]
    QuotaExceeded,
    
    #[msg("Account inactive: This minter has been deactivated by the admin.")]
    MinterDeactivated,

    #[msg("Emergency Pause: All operations are currently paused.")]
    SystemPaused,

    #[msg("Mathematical Overflow: Calculation exceeded bounds.")]
    MathOverflow,
}