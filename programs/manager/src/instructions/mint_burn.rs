use anchor_lang::prelude::*;
use anchor_spl::token_interface::{mint_to, Mint, MintTo, TokenAccount, Token2022};
use crate::state::{StablecoinConfig, MinterRecord};
use crate::errors::StablecoinError;


// INSTRUCTION 1: Register a new Minter (Only Admin can do this)
// --------------------------------------------------------
#[derive(Accounts)]
#[instruction(minter_pubkey: Pubkey, quota: u64)]
pub struct RegisterMinter<'info> {
    #[account(mut)]
    pub minter_admin: Signer<'info>, // Must be the admin defined in the config

    #[account(
        has_one = minter_admin @ StablecoinError::UnauthorizedAccess,
        constraint = !config.is_paused @ StablecoinError::SystemPaused
    )]
    pub config: Account<'info, StablecoinConfig>,

    #[account(
        init,
        payer = minter_admin,
        space = 8 + 32 + 32 + 8 + 8 + 1 + 1, // Space for MinterRecord
        seeds = [b"minter", config.key().as_ref(), minter_pubkey.as_ref()],
        bump
    )]
    pub minter_record: Account<'info, MinterRecord>,

    pub system_program: Program<'info, System>,
}

pub fn register_minter(ctx: Context<RegisterMinter>, minter_pubkey: Pubkey, quota: u64) -> Result<()> {
    let record = &mut ctx.accounts.minter_record;
    record.minter = minter_pubkey;
    record.config = ctx.accounts.config.key();
    record.mint_quota = quota;
    record.minted_amount = 0;
    record.is_active = true;
    record.bump = ctx.bumps.minter_record;

    msg!("New minter registered: {} with quota: {}", minter_pubkey, quota);
    Ok(())
}


// INSTRUCTION 2: Mint Tokens (Only registered Minters can do this)
// --------------------------------------------------------
#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub minter: Signer<'info>,

    // SECURITY FIX: Enforce seeds so hackers cannot pass a fake Config account
    #[account(
        seeds = [b"config", mint.key().as_ref()],
        bump = config.bump,
        constraint = !config.is_paused @ StablecoinError::SystemPaused
    )]
    pub config: Account<'info, StablecoinConfig>,

    // SECURITY FIX: Enforce seeds so hackers cannot pass a fake MinterRecord
    #[account(
        mut,
        seeds = [b"minter", config.key().as_ref(), minter.key().as_ref()],
        bump = minter_record.bump,
        has_one = minter @ StablecoinError::UnauthorizedAccess,
        constraint = minter_record.config == config.key() @ StablecoinError::UnauthorizedAccess,
        constraint = minter_record.is_active @ StablecoinError::MinterDeactivated
    )]
    pub minter_record: Account<'info, MinterRecord>,

    #[account(mut, address = config.mint)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub destination: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token2022>,
}

pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
    let record = &mut ctx.accounts.minter_record;

    // 1. Math Safety Check: Prevent overflow and enforce the quota
    let new_minted_amount = record.minted_amount.checked_add(amount)
        .ok_or(StablecoinError::MathOverflow)?;

    require!(
        new_minted_amount <= record.mint_quota,
        StablecoinError::QuotaExceeded
    );

    // 2. Perform the Cross-Program Invocation (CPI) to Token-2022
    let mint_key = ctx.accounts.mint.key();
    let seeds = &[
        b"config".as_ref(),
        mint_key.as_ref(),
        &[ctx.accounts.config.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.destination.to_account_info(),
        authority: ctx.accounts.config.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

    mint_to(cpi_ctx, amount)?;

    // 3. Update the state
    record.minted_amount = new_minted_amount;
    
    msg!("[tbc] Successfully minted {} tokens. Remaining quota: {}", amount, record.mint_quota - record.minted_amount);
    Ok(())
}