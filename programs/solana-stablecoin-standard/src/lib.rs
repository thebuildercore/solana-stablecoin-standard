use anchor_lang::prelude::*;

declare_id!("6a9C9EXSpSbXnKDotHu64Mi3UoqbEwniZY5KQZuciu3y");

#[program]
pub mod solana_stablecoin_standard {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
