use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;
use crate::state::{BlacklistRecord, ComplianceError};
use manager::state::StablecoinConfig;

pub mod state;

// This string is EXACTLY 32 characters long. Do not change it.
declare_id!("6ZoCZGV5CtMC2fYrt3GBWB6tmFgUpFYioLAD4JPPMQm4");

#[program]
pub mod compliance_hook {
    use super::*;

    pub fn add_to_blacklist(ctx: Context<ManageBlacklist>, reason: String) -> Result<()> {
        let record = &mut ctx.accounts.blacklist_record;
        record.is_blacklisted = true;
        record.reason = reason;
        
        msg!("Wallet blacklisted. Reason: {}", record.reason);
        Ok(())
    }

    pub fn remove_from_blacklist(ctx: Context<ManageBlacklist>) -> Result<()> {
        let record = &mut ctx.accounts.blacklist_record;
        record.is_blacklisted = false;
        record.reason = String::from("Removed from blacklist");
        Ok(())
    }

    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        if let Some(sender_record) = &ctx.accounts.sender_blacklist_record {
            require!(!sender_record.is_blacklisted, ComplianceError::SenderBlacklisted);
        }

        if let Some(receiver_record) = &ctx.accounts.receiver_blacklist_record {
            require!(!receiver_record.is_blacklisted, ComplianceError::ReceiverBlacklisted);
        }

        msg!("Transfer Hook Passed: {} tokens allowed.", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct ManageBlacklist<'info> {
    #[account(mut)]
    pub admin: Signer<'info>, 

    // SECURITY FIX: Enforce that this Config belongs to the official Manager program!
    
    #[account(
        owner = "11111111111111111111111111111111".parse::<Pubkey>().unwrap(),
        constraint = config.blacklister_authority == admin.key() @ ComplianceError::UnauthorizedAdmin
    )]
    pub config: Account<'info, StablecoinConfig>, 

    /// CHECK: The specific Token Account (ATA) we are targeting, NOT the wallet.
    pub target_token_account: UncheckedAccount<'info>,

    // SECURITY FIX: Tie the blacklist to the specific Mint so it isn't global
    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + 1 + 50,
        seeds = [b"blacklist", config.mint.as_ref(), target_token_account.key().as_ref()],
        bump
    )]
    pub blacklist_record: Account<'info, BlacklistRecord>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    /// CHECK: The token account sending the funds
    pub source_token: UncheckedAccount<'info>,
    
    /// CHECK: The token mint
    pub mint: InterfaceAccount<'info, Mint>,
    
    /// CHECK: The token account receiving the funds
    pub destination_token: UncheckedAccount<'info>,
    
    /// CHECK: The owner of the source token account
    pub owner: UncheckedAccount<'info>,

    // SECURITY FIX: Match the new seeds (Mint + Token Account)
    #[account(
        seeds = [b"blacklist", mint.key().as_ref(), source_token.key().as_ref()],
        bump
    )]
    pub sender_blacklist_record: Option<Account<'info, BlacklistRecord>>,

    // SECURITY FIX: Match the new seeds (Mint + Token Account)
    #[account(
        seeds = [b"blacklist", mint.key().as_ref(), destination_token.key().as_ref()], 
        bump
    )]
    pub receiver_blacklist_record: Option<Account<'info, BlacklistRecord>>,
}