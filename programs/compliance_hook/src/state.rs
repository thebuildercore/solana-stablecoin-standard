use anchor_lang::prelude::*;

#[account]
pub struct BlacklistRecord {
    pub is_blacklisted: bool,
    pub reason: String,
}

#[error_code]
pub enum ComplianceError {
    #[msg("Sender is currently blacklisted and cannot transfer funds.")]
    SenderBlacklisted,
    #[msg("Receiver is currently blacklisted and cannot receive funds.")]
    ReceiverBlacklisted,
    #[msg("You are not authorized to modify the blacklist.")]
    UnauthorizedAdmin,
}