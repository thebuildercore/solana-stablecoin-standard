use trident_fuzz::fuzzing::*;

/// Storage for all account addresses used in fuzz testing.
///
/// This struct serves as a centralized repository for account addresses,
/// enabling their reuse across different instruction flows and test scenarios.
///
/// Docs: https://ackee.xyz/trident/docs/latest/trident-api-macro/trident-types/fuzz-accounts/
#[derive(Default)]
pub struct AccountAddresses {
    pub master_authority: AddressStorage,

    pub mint: AddressStorage,

    pub config: AddressStorage,

    pub system_program: AddressStorage,

    pub token_program: AddressStorage,

    pub minter: AddressStorage,

    pub minter_record: AddressStorage,

    pub destination: AddressStorage,

    pub minter_admin: AddressStorage,

    pub seizer: AddressStorage,

    pub target_account: AddressStorage,

    pub treasury_account: AddressStorage,

    pub admin: AddressStorage,

    pub target_wallet: AddressStorage,

    pub blacklist_record: AddressStorage,

    pub source_token: AddressStorage,

    pub destination_token: AddressStorage,

    pub owner: AddressStorage,

    pub sender_blacklist_record: AddressStorage,

    pub receiver_blacklist_record: AddressStorage,
}
