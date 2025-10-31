use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount},
    token::{self, Token, Transfer, Burn, MintTo},
};
use mpl_token_metadata::instructions::{CreateMetadataAccountV3, CreateMetadataAccountV3InstructionArgs};

declare_id!("HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem");

#[program]
pub mod solgiftcards {
    use super::*;

    /// Mint a new gift card NFT with locked USDC/SOL in escrow
    pub fn mint_gift_card(
        ctx: Context<MintGiftCard>,
        amount: u64,
        expiry_timestamp: i64,
        merchant_name: String,
        merchant_address: Pubkey,
        uri: String,
    ) -> Result<()> {
        require!(amount > 0, GiftCardError::InvalidAmount);
        require!(expiry_timestamp > Clock::get()?.unix_timestamp, GiftCardError::InvalidExpiry);
        require!(merchant_name.len() <= 32, GiftCardError::NameTooLong);

        let gift_card = &mut ctx.accounts.gift_card;
        let clock = Clock::get()?;

        // Initialize gift card state
        gift_card.issuer = ctx.accounts.issuer.key();
        gift_card.current_owner = ctx.accounts.issuer.key();
        gift_card.merchant = merchant_address;
        gift_card.merchant_name = merchant_name.clone();
        gift_card.amount = amount;
        gift_card.remaining_balance = amount;
        gift_card.mint = ctx.accounts.nft_mint.key();
        gift_card.escrow_account = ctx.accounts.escrow_token_account.key();
        gift_card.created_at = clock.unix_timestamp;
        gift_card.expiry_timestamp = expiry_timestamp;
        gift_card.status = GiftCardStatus::Active;
        gift_card.bump = ctx.bumps.gift_card;

        // Transfer tokens to escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.issuer_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.issuer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Mint NFT (1 token, 0 decimals)
        let cpi_accounts = MintTo {
            mint: ctx.accounts.nft_mint.to_account_info(),
            to: ctx.accounts.issuer_nft_account.to_account_info(),
            authority: ctx.accounts.issuer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, 1)?;

        // Create Metaplex metadata
        let create_metadata_ix = CreateMetadataAccountV3 {
            metadata: ctx.accounts.metadata.key(),
            mint: ctx.accounts.nft_mint.key(),
            mint_authority: ctx.accounts.issuer.key(),
            payer: ctx.accounts.issuer.key(),
            update_authority: (ctx.accounts.issuer.key(), true),
            system_program: ctx.accounts.system_program.key(),
            rent: Some(ctx.accounts.rent.key()),
        };

        let create_metadata_args = CreateMetadataAccountV3InstructionArgs {
            data: mpl_token_metadata::types::DataV2 {
                name: format!("Gift Card - {}", merchant_name),
                symbol: "GIFTCARD".to_string(),
                uri,
                seller_fee_basis_points: 0,
                creators: Some(vec![mpl_token_metadata::types::Creator {
                    address: ctx.accounts.issuer.key(),
                    verified: true,
                    share: 100,
                }]),
                collection: None,
                uses: None,
            },
            is_mutable: true,
            collection_details: None,
        };

        let create_metadata_instruction = create_metadata_ix.instruction(create_metadata_args);

        invoke_signed(
            &create_metadata_instruction,
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.nft_mint.to_account_info(),
                ctx.accounts.issuer.to_account_info(),
                ctx.accounts.issuer.to_account_info(),
                ctx.accounts.issuer.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
            &[],
        )?;

        emit!(GiftCardMinted {
            gift_card: gift_card.key(),
            issuer: ctx.accounts.issuer.key(),
            merchant: merchant_address,
            amount,
            expiry_timestamp,
            nft_mint: ctx.accounts.nft_mint.key(),
        });

        Ok(())
    }

    /// Transfer gift card NFT to another wallet
    pub fn transfer_gift_card(
        ctx: Context<TransferGiftCard>,
    ) -> Result<()> {
        let gift_card = &mut ctx.accounts.gift_card;

        require!(
            gift_card.status == GiftCardStatus::Active,
            GiftCardError::GiftCardNotActive
        );

        require!(
            Clock::get()?.unix_timestamp < gift_card.expiry_timestamp,
            GiftCardError::GiftCardExpired
        );

        // Update owner
        let old_owner = gift_card.current_owner;
        gift_card.current_owner = ctx.accounts.new_owner.key();

        // Transfer NFT
        let cpi_accounts = Transfer {
            from: ctx.accounts.current_owner_nft_account.to_account_info(),
            to: ctx.accounts.new_owner_nft_account.to_account_info(),
            authority: ctx.accounts.current_owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, 1)?;

        emit!(GiftCardTransferred {
            gift_card: gift_card.key(),
            from: old_owner,
            to: ctx.accounts.new_owner.key(),
            nft_mint: gift_card.mint,
        });

        Ok(())
    }

    /// Redeem gift card at merchant - transfers funds and burns NFT
    pub fn redeem_gift_card(
        ctx: Context<RedeemGiftCard>,
        amount_to_redeem: Option<u64>,
    ) -> Result<()> {
        let gift_card = &mut ctx.accounts.gift_card;

        require!(
            gift_card.status == GiftCardStatus::Active,
            GiftCardError::GiftCardNotActive
        );

        require!(
            Clock::get()?.unix_timestamp < gift_card.expiry_timestamp,
            GiftCardError::GiftCardExpired
        );

        // Verify merchant owns the NFT
        require!(
            gift_card.current_owner == gift_card.merchant,
            GiftCardError::NotOwnedByMerchant
        );

        // Determine redemption amount
        let redeem_amount = amount_to_redeem.unwrap_or(gift_card.remaining_balance);
        require!(
            redeem_amount <= gift_card.remaining_balance,
            GiftCardError::InsufficientBalance
        );

        // Transfer tokens from escrow to merchant
        let seeds = &[
            b"gift_card",
            gift_card.mint.as_ref(),
            &[gift_card.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.merchant_token_account.to_account_info(),
            authority: gift_card.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, redeem_amount)?;

        gift_card.remaining_balance -= redeem_amount;

        // If fully redeemed, burn the NFT
        if gift_card.remaining_balance == 0 {
            let cpi_accounts = Burn {
                mint: ctx.accounts.nft_mint.to_account_info(),
                from: ctx.accounts.merchant_nft_account.to_account_info(),
                authority: ctx.accounts.merchant.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::burn(cpi_ctx, 1)?;

            gift_card.status = GiftCardStatus::Redeemed;
        }

        emit!(GiftCardRedeemed {
            gift_card: gift_card.key(),
            merchant: ctx.accounts.merchant.key(),
            amount: redeem_amount,
            remaining_balance: gift_card.remaining_balance,
            nft_mint: gift_card.mint,
        });

        Ok(())
    }

    /// Burn expired gift card and reclaim funds to issuer
    pub fn burn_expired_gift_card(
        ctx: Context<BurnExpiredGiftCard>,
    ) -> Result<()> {
        let gift_card = &mut ctx.accounts.gift_card;

        require!(
            gift_card.status == GiftCardStatus::Active,
            GiftCardError::GiftCardNotActive
        );

        require!(
            Clock::get()?.unix_timestamp >= gift_card.expiry_timestamp,
            GiftCardError::GiftCardNotExpired
        );

        // Transfer remaining balance back to issuer
        let seeds = &[
            b"gift_card",
            gift_card.mint.as_ref(),
            &[gift_card.bump],
        ];
        let signer = &[&seeds[..]];

        if gift_card.remaining_balance > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.issuer_token_account.to_account_info(),
                authority: gift_card.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, gift_card.remaining_balance)?;
        }

        // Burn NFT
        let cpi_accounts = Burn {
            mint: ctx.accounts.nft_mint.to_account_info(),
            from: ctx.accounts.owner_nft_account.to_account_info(),
            authority: ctx.accounts.current_owner.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::burn(cpi_ctx, 1)?;

        let reclaimed_amount = gift_card.remaining_balance;
        gift_card.remaining_balance = 0;
        gift_card.status = GiftCardStatus::Expired;

        emit!(GiftCardExpired {
            gift_card: gift_card.key(),
            issuer: gift_card.issuer,
            reclaimed_amount,
            nft_mint: gift_card.mint,
        });

        Ok(())
    }

    /// Query gift card status
    pub fn get_gift_card_status(
        ctx: Context<QueryGiftCard>,
    ) -> Result<()> {
        let gift_card = &ctx.accounts.gift_card;
        
        msg!("Gift Card Status:");
        msg!("  Mint: {}", gift_card.mint);
        msg!("  Issuer: {}", gift_card.issuer);
        msg!("  Current Owner: {}", gift_card.current_owner);
        msg!("  Merchant: {}", gift_card.merchant);
        msg!("  Merchant Name: {}", gift_card.merchant_name);
        msg!("  Original Amount: {}", gift_card.amount);
        msg!("  Remaining Balance: {}", gift_card.remaining_balance);
        msg!("  Status: {:?}", gift_card.status);
        msg!("  Created At: {}", gift_card.created_at);
        msg!("  Expiry: {}", gift_card.expiry_timestamp);
        
        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

#[derive(Accounts)]
#[instruction(amount: u64, expiry_timestamp: i64, merchant_name: String, merchant_address: Pubkey)]
pub struct MintGiftCard<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    /// The mint for the NFT
    #[account(
        init,
        payer = issuer,
        mint::decimals = 0,
        mint::authority = issuer,
        mint::freeze_authority = issuer,
    )]
    pub nft_mint: InterfaceAccount<'info, Mint>,

    /// Gift card state account
    #[account(
        init,
        payer = issuer,
        space = 8 + GiftCard::INIT_SPACE,
        seeds = [b"gift_card", nft_mint.key().as_ref()],
        bump
    )]
    pub gift_card: Account<'info, GiftCard>,

    /// Token account for the payment token (USDC/SOL)
    pub payment_mint: InterfaceAccount<'info, Mint>,

    /// Issuer's token account
    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = issuer,
    )]
    pub issuer_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Escrow token account to hold locked funds
    #[account(
        init,
        payer = issuer,
        associated_token::mint = payment_mint,
        associated_token::authority = gift_card,
    )]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,

    /// Issuer's NFT token account
    #[account(
        init,
        payer = issuer,
        associated_token::mint = nft_mint,
        associated_token::authority = issuer,
    )]
    pub issuer_nft_account: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: Metadata account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TransferGiftCard<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,

    /// CHECK: New owner account
    pub new_owner: UncheckedAccount<'info>,

    pub nft_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [b"gift_card", nft_mint.key().as_ref()],
        bump,
        has_one = current_owner @ GiftCardError::NotCurrentOwner,
    )]
    pub gift_card: Account<'info, GiftCard>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = current_owner,
    )]
    pub current_owner_nft_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = current_owner,
        associated_token::mint = nft_mint,
        associated_token::authority = new_owner,
    )]
    pub new_owner_nft_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RedeemGiftCard<'info> {
    #[account(mut)]
    pub merchant: Signer<'info>,

    #[account(
        mut,
        seeds = [b"gift_card", nft_mint.key().as_ref()],
        bump,
        has_one = merchant @ GiftCardError::UnauthorizedMerchant,
    )]
    pub gift_card: Account<'info, GiftCard>,

    #[account(mut)]
    pub nft_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = merchant,
    )]
    pub merchant_nft_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = gift_card,
    )]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = merchant,
    )]
    pub merchant_token_account: InterfaceAccount<'info, TokenAccount>,

    pub payment_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BurnExpiredGiftCard<'info> {
    #[account(mut)]
    pub current_owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"gift_card", nft_mint.key().as_ref()],
        bump,
    )]
    pub gift_card: Account<'info, GiftCard>,

    #[account(mut)]
    pub nft_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = current_owner,
    )]
    pub owner_nft_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = gift_card,
    )]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = issuer,
    )]
    pub issuer_token_account: InterfaceAccount<'info, TokenAccount>,

    /// CHECK: Issuer account
    pub issuer: UncheckedAccount<'info>,

    pub payment_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct QueryGiftCard<'info> {
    #[account(
        seeds = [b"gift_card", nft_mint.key().as_ref()],
        bump,
    )]
    pub gift_card: Account<'info, GiftCard>,
    
    pub nft_mint: InterfaceAccount<'info, Mint>,
}

// ============================================================================
// Data Structures
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct GiftCard {
    pub issuer: Pubkey,              // 32
    pub current_owner: Pubkey,       // 32
    pub merchant: Pubkey,            // 32
    #[max_len(32)]
    pub merchant_name: String,       // 4 + 32
    pub amount: u64,                 // 8
    pub remaining_balance: u64,      // 8
    pub mint: Pubkey,                // 32 (NFT mint)
    pub escrow_account: Pubkey,      // 32
    pub created_at: i64,             // 8
    pub expiry_timestamp: i64,       // 8
    pub status: GiftCardStatus,      // 1 + 1 (enum)
    pub bump: u8,                    // 1
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Debug)]
pub enum GiftCardStatus {
    Active,
    Redeemed,
    Expired,
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct GiftCardMinted {
    pub gift_card: Pubkey,
    pub issuer: Pubkey,
    pub merchant: Pubkey,
    pub amount: u64,
    pub expiry_timestamp: i64,
    pub nft_mint: Pubkey,
}

#[event]
pub struct GiftCardTransferred {
    pub gift_card: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
    pub nft_mint: Pubkey,
}

#[event]
pub struct GiftCardRedeemed {
    pub gift_card: Pubkey,
    pub merchant: Pubkey,
    pub amount: u64,
    pub remaining_balance: u64,
    pub nft_mint: Pubkey,
}

#[event]
pub struct GiftCardExpired {
    pub gift_card: Pubkey,
    pub issuer: Pubkey,
    pub reclaimed_amount: u64,
    pub nft_mint: Pubkey,
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum GiftCardError {
    #[msg("Invalid amount: must be greater than 0")]
    InvalidAmount,
    #[msg("Invalid expiry: must be in the future")]
    InvalidExpiry,
    #[msg("Merchant name too long: max 32 characters")]
    NameTooLong,
    #[msg("Gift card is not active")]
    GiftCardNotActive,
    #[msg("Gift card has expired")]
    GiftCardExpired,
    #[msg("Gift card has not expired yet")]
    GiftCardNotExpired,
    #[msg("Not the current owner")]
    NotCurrentOwner,
    #[msg("Not owned by merchant")]
    NotOwnedByMerchant,
    #[msg("Unauthorized merchant")]
    UnauthorizedMerchant,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}
