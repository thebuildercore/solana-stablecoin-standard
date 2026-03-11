use anchor_lang::prelude::*;
use anchor_spl::token_interface::{transfer_checked, Mint, TokenAccount, Token2022, TransferChecked};
use crate::state::StablecoinConfig;
use crate::errors::StablecoinError;

#[derive(Accounts)]
pub struct SeizeFunds<'info> {
    #[account(mut)]
    pub seizer: Signer<'info>, 

    // ADDED SEEDS VALIDATION: Prevents hackers from passing a fake Config PDA
    #[account(
        seeds = [b"config", mint.key().as_ref()],
        bump = config.bump,
        constraint = config.seizer_authority == seizer.key() @ StablecoinError::UnauthorizedAccess,
        constraint = config.is_compliant() @ StablecoinError::ComplianceNotEnabled
    )]
    pub config: Account<'info, StablecoinConfig>,

    // SECURITY FIX: Ensures the mint passed in actually belongs to this specific config
    #[account(mut, address = config.mint)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub target_account: InterfaceAccount<'info, TokenAccount>, 

    #[account(mut)]
    pub treasury_account: InterfaceAccount<'info, TokenAccount>, 

    pub token_program: Program<'info, Token2022>,
}

pub fn seize(ctx: Context<SeizeFunds>, amount: u64) -> Result<()> {
    // The StablecoinConfig PDA acts as the Permanent Delegate for the token.
    // We must mathematically "sign" the transaction using the PDA's seeds.
    let mint_key = ctx.accounts.mint.key();
    let seeds = &[
        b"config".as_ref(),
        mint_key.as_ref(),
        &[ctx.accounts.config.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    // Execute the forced transfer via CPI
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.target_account.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.treasury_account.to_account_info(),
        authority: ctx.accounts.config.to_account_info(), // The PDA is the authority!
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

    transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;

    msg!("Compliance Action: Seized {} tokens from target account.", amount);
    Ok(())
}