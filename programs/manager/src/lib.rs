use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;

declare_id!("Euf94rZebzsHaypDMc34QBWs8LBcKcp3vr1xRsL2QidN"); // We will update this later

#[program]
pub mod manager {
    use super::*;

    // This exposes the initialize function to the outside world
    pub fn initialize(ctx: Context<InitializeStandard>, params: InitParams) -> Result<()> {
        instructions::initialize::handler(ctx, params)
    }

    pub fn register_minter(ctx: Context<RegisterMinter>, minter_pubkey: Pubkey, quota: u64) -> Result<()> {
        instructions::mint_burn::register_minter(ctx, minter_pubkey, quota)
    }

    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        instructions::mint_burn::mint_tokens(ctx, amount)
    }
    
    pub fn seize(ctx: Context<SeizeFunds>, amount: u64) -> Result<()> {
        instructions::compliance::seize(ctx, amount)
    }
}