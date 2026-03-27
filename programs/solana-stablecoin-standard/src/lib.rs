use anchor_lang::prelude::*;

declare_id!("Hfm2QXmG3sGUBSrRf1VbCPs6PaHh6wngt1bZXxKWWDdZ");

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
