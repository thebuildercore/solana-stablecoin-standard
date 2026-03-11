use anchor_lang::prelude::*;
use anchor_spl::token_interface::Token2022;
use crate::state::StablecoinConfig;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitParams {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
    pub enable_permanent_delegate: bool,
    pub enable_transfer_hook: bool,
    pub default_account_frozen: bool,
}

#[derive(Accounts)]
#[instruction(params: InitParams)]
pub struct InitializeStandard<'info> {
    #[account(mut)]
    pub master_authority: Signer<'info>,

    /// The Token-2022 Mint account. 
    /// Note: The TypeScript CLI will create the raw Mint with extensions enabled,
    /// and then pass it here so our Manager program can register it and take control.
    /// CHECK: Validated by the TypeScript client before CPI.
    pub mint: UncheckedAccount<'info>,

    /// The "Constitution" PDA we defined earlier
    #[account(
        init,
        payer = master_authority,
        space = 8 + 32 + 32 + 32 + 32 + 32 + 32 + 32 + 1 + 1 + 1 + 1 + 1, // Approx size
        seeds = [b"config", mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, StablecoinConfig>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token2022>,
}

pub fn handler(ctx: Context<InitializeStandard>, params: InitParams) -> Result<()> {
    let config = &mut ctx.accounts.config;

    // 1. Link the Config to the Token Mint
    config.mint = ctx.accounts.mint.key();
    config.master_authority = ctx.accounts.master_authority.key();
    
    // 2. Set initial roles (The master gets all powers to start. 
    // They can delegate them to other wallets later using an update_roles instruction).
    config.minter_admin = ctx.accounts.master_authority.key();
    config.burner_authority = ctx.accounts.master_authority.key();
    config.blacklister_authority = ctx.accounts.master_authority.key();
    config.pauser_authority = ctx.accounts.master_authority.key();
    config.seizer_authority = ctx.accounts.master_authority.key();

    // 3. Save the SSS-1 or SSS-2 settings
    config.enable_permanent_delegate = params.enable_permanent_delegate;
    config.enable_transfer_hook = params.enable_transfer_hook;
    config.default_account_frozen = params.default_account_frozen;

    // 4. Set operational state
    config.is_paused = false;
    config.bump = ctx.bumps.config;

    // Log a message to the Solana block explorer so developers can see what was created
    msg!("Stablecoin Config initialized for Mint: {}", config.mint);
    if config.is_compliant() {
        msg!("Standard: SSS-2 (Compliant / Regulated Mode)");
    } else {
        msg!("Standard: SSS-1 (Minimal Mode)");
    }

    Ok(())
}