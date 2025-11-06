# Solana NFT Gift Card System

A decentralized NFT gift card platform built on Solana using Anchor Framework. This system allows users to mint gift cards backed by USDC/SOL, transfer them between wallets, redeem them at merchants, and handle expiry scenarios.

**Program ID**: `HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem`

> 📖 **Quick Links**: [Web UI](./web/README.md) | [Build Instructions](./BUILD_INSTRUCTIONS.md) | [Contract Verification](./CONTRACT_VERIFICATION.md) | [Workflow Examples](./WORKFLOW_EXAMPLES.md)

## Features

### Core Functionality

- **🎁 Mint Gift Card NFTs**: Create NFT gift cards with locked USDC/SOL in escrow
- **🔄 Transfer Gift Cards**: Seamlessly transfer gift cards between wallets
- **💰 Merchant Redemption**: Merchants can redeem gift cards and receive locked funds
- **⏰ Expiry Management**: Automatic fund reclamation for expired, unredeemed cards
- **🔍 Status Queries**: Query gift card details, balances, and ownership
- **📊 Event Emissions**: Track all lifecycle events (mint, transfer, redeem, expire)

### Security Features

- ✅ Ownership verification for all operations
- ✅ Escrow protection with PDA-controlled accounts
- ✅ Merchant authorization checks
- ✅ Expiry timestamp validation
- ✅ Balance tracking and validation
- ✅ Metaplex NFT standard compliance

## Architecture

### Program Structure

```
lib.rs
├── Instructions
│   ├── mint_gift_card       - Mint NFT with escrowed funds
│   ├── transfer_gift_card   - Transfer NFT ownership
│   ├── redeem_gift_card     - Redeem at merchant (burns NFT)
│   ├── burn_expired_gift_card - Reclaim expired funds
│   └── get_gift_card_status - Query card details
│
├── Account Structures
│   ├── MintGiftCard         - Mint instruction accounts
│   ├── TransferGiftCard     - Transfer instruction accounts
│   ├── RedeemGiftCard       - Redeem instruction accounts
│   ├── BurnExpiredGiftCard  - Burn instruction accounts
│   └── QueryGiftCard        - Query instruction accounts
│
├── Data Structures
│   ├── GiftCard             - Main state account
│   └── GiftCardStatus       - Status enum (Active/Redeemed/Expired)
│
├── Events
│   ├── GiftCardMinted
│   ├── GiftCardTransferred
│   ├── GiftCardRedeemed
│   └── GiftCardExpired
│
└── Errors
    └── GiftCardError        - Custom error codes
```

### Gift Card State

```rust
pub struct GiftCard {
    pub issuer: Pubkey,              // Original issuer
    pub current_owner: Pubkey,       // Current NFT owner
    pub merchant: Pubkey,            // Authorized merchant
    pub merchant_name: String,       // Merchant display name
    pub amount: u64,                 // Original amount
    pub remaining_balance: u64,      // Current balance
    pub mint: Pubkey,                // NFT mint address
    pub escrow_account: Pubkey,      // Escrow token account
    pub created_at: i64,             // Creation timestamp
    pub expiry_timestamp: i64,       // Expiry timestamp
    pub status: GiftCardStatus,      // Current status
    pub bump: u8,                    // PDA bump seed
}
```

### PDA Seeds

- **Gift Card PDA**: `["gift_card", nft_mint]`
- **Escrow Account**: Standard Associated Token Account for Gift Card PDA
- **NFT Accounts**: Standard Associated Token Accounts for users
- **Metadata Account**: Metaplex standard `["metadata", TOKEN_METADATA_PROGRAM_ID, nft_mint]`

## Installation

### Prerequisites

- Rust 1.70+
- Solana CLI 1.18+
- Anchor 0.32.1
- Node.js 18+
- Yarn

### Setup

```bash
# Clone the repository
cd solgiftcards

# Install dependencies
yarn install

# Build the program
anchor build

# Run tests
anchor test
```

## Usage

### 1. Mint a Gift Card

```typescript
const amount = new BN(100_000_000); // 100 USDC (6 decimals)
const expiryTimestamp = new BN(Date.now() / 1000 + 30 * 24 * 60 * 60); // 30 days

await program.methods
  .mintGiftCard(
    amount,
    expiryTimestamp,
    "Coffee Shop",
    merchantPublicKey,
    "https://arweave.net/metadata-uri"
  )
  .accounts({
    issuer: issuerPublicKey,
    nftMint: nftMintKeypair.publicKey,
    giftCard: giftCardPda,
    paymentMint: usdcMintPublicKey,
    issuerTokenAccount: issuerUsdcAccount,
    escrowTokenAccount: escrowAccount,
    issuerNftAccount: issuerNftAccount,
    metadata: metadataAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  })
  .signers([issuer, nftMintKeypair])
  .rpc();
```

### 2. Transfer Gift Card

```typescript
await program.methods
  .transferGiftCard()
  .accounts({
    currentOwner: currentOwnerPublicKey,
    newOwner: newOwnerPublicKey,
    giftCard: giftCardPda,
    currentOwnerNftAccount: currentOwnerNftAccount,
    newOwnerNftAccount: newOwnerNftAccount,
    nftMint: nftMintPublicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .signers([currentOwner])
  .rpc();
```

### 3. Redeem at Merchant

```typescript
// Full redemption (pass null)
await program.methods
  .redeemGiftCard(null)
  .accounts({
    merchant: merchantPublicKey,
    giftCard: giftCardPda,
    nftMint: nftMintPublicKey,
    merchantNftAccount: merchantNftAccount,
    escrowTokenAccount: escrowAccount,
    merchantTokenAccount: merchantUsdcAccount,
    paymentMint: usdcMintPublicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .signers([merchant])
  .rpc();

// Partial redemption
await program.methods
  .redeemGiftCard(new BN(50_000_000)) // Redeem 50 USDC
  .accounts({...})
  .rpc();
```

### 4. Burn Expired Gift Card

```typescript
await program.methods
  .burnExpiredGiftCard()
  .accounts({
    currentOwner: currentOwnerPublicKey,
    giftCard: giftCardPda,
    nftMint: nftMintPublicKey,
    ownerNftAccount: ownerNftAccount,
    escrowTokenAccount: escrowAccount,
    issuerTokenAccount: issuerUsdcAccount,
    issuer: issuerPublicKey,
    paymentMint: usdcMintPublicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .signers([currentOwner])
  .rpc();
```

### 5. Query Gift Card Status

```typescript
await program.methods
  .getGiftCardStatus()
  .accounts({
    giftCard: giftCardPda,
  })
  .rpc();

// Or fetch account data directly
const giftCard = await program.account.giftCard.fetch(giftCardPda);
console.log("Owner:", giftCard.currentOwner.toBase58());
console.log("Balance:", giftCard.remainingBalance.toString());
console.log("Status:", giftCard.status);
```

## Gift Card Lifecycle

### Standard Flow

```
1. MINT
   ├─ Issuer creates gift card
   ├─ USDC locked in escrow
   ├─ NFT minted to issuer
   └─ Status: Active

2. TRANSFER (Issuer → Customer)
   ├─ NFT transferred to customer
   ├─ Funds remain in escrow
   └─ Status: Active

3. TRANSFER (Customer → Merchant)
   ├─ NFT transferred to merchant
   ├─ Funds remain in escrow
   └─ Status: Active

4. REDEEM
   ├─ Merchant redeems gift card
   ├─ USDC transferred from escrow to merchant
   ├─ NFT burned
   └─ Status: Redeemed
```

### Expiry Flow

```
1. MINT
   └─ Gift card created with expiry date

2. EXPIRY REACHED (Unredeemed)
   ├─ Current owner calls burn_expired_gift_card
   ├─ Remaining USDC returned to issuer
   ├─ NFT burned
   └─ Status: Expired
```

## Security Considerations

### Ownership Checks

- **Transfer**: Only current owner can transfer
- **Redeem**: Only authorized merchant can redeem, and must own the NFT
- **Burn Expired**: Anyone can burn after expiry, but funds go to original issuer

### Escrow Protection

- Funds locked in PDA-controlled Associated Token Account
- Only program can authorize transfers from escrow
- PDA seeds ensure unique escrow per gift card

### Validation

- Amount must be > 0
- Expiry must be in the future at mint time
- Cannot transfer/redeem expired cards
- Cannot redeem if not owned by merchant
- Balance tracking prevents over-redemption

## Events

All major operations emit events for off-chain tracking:

```rust
// Minting
GiftCardMinted {
    gift_card: Pubkey,
    issuer: Pubkey,
    merchant: Pubkey,
    amount: u64,
    expiry_timestamp: i64,
    nft_mint: Pubkey,
}

// Transfer
GiftCardTransferred {
    gift_card: Pubkey,
    from: Pubkey,
    to: Pubkey,
    nft_mint: Pubkey,
}

// Redemption
GiftCardRedeemed {
    gift_card: Pubkey,
    merchant: Pubkey,
    amount: u64,
    remaining_balance: u64,
    nft_mint: Pubkey,
}

// Expiry
GiftCardExpired {
    gift_card: Pubkey,
    issuer: Pubkey,
    reclaimed_amount: u64,
    nft_mint: Pubkey,
}
```

## Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 6000 | InvalidAmount | Amount must be greater than 0 |
| 6001 | InvalidExpiry | Expiry must be in the future |
| 6002 | NameTooLong | Merchant name max 32 characters |
| 6003 | GiftCardNotActive | Gift card is not in active status |
| 6004 | GiftCardExpired | Gift card has expired |
| 6005 | GiftCardNotExpired | Gift card has not expired yet |
| 6006 | NotCurrentOwner | Not the current owner |
| 6007 | NotOwnedByMerchant | Gift card not owned by merchant |
| 6008 | UnauthorizedMerchant | Unauthorized merchant |
| 6009 | InsufficientBalance | Insufficient balance for redemption |

## Testing

The test suite covers:

- ✅ Complete gift card lifecycle (mint → transfer → redeem)
- ✅ Expired gift card workflow
- ✅ Security tests (unauthorized transfers, unauthorized redemptions)
- ✅ Balance tracking and validation
- ✅ Event emissions
- ✅ Metaplex metadata creation

Run tests:

```bash
# Run all tests
anchor test

# Run with logs
anchor test -- --nocapture

# Run specific test
anchor test -- --test "Mints a gift card NFT"
```

## Deployment

### Localnet

```bash
# Start local validator
solana-test-validator

# Deploy
anchor deploy
```

### Devnet

```bash
# Configure for devnet
solana config set --url devnet

# Airdrop SOL
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet
```

### Mainnet

```bash
# Configure for mainnet
solana config set --url mainnet-beta

# Deploy (ensure sufficient SOL)
anchor deploy --provider.cluster mainnet-beta
```

## Integration Examples

### Frontend Integration

```typescript
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { Solgiftcards } from './target/types/solgiftcards';

// Initialize
const provider = AnchorProvider.env();
const program = new Program<Solgiftcards>(IDL, programId, provider);

// Derive gift card PDA
const [giftCardPda] = web3.PublicKey.findProgramAddressSync(
  [Buffer.from("gift_card"), nftMint.toBuffer()],
  program.programId
);

// Fetch gift card data
const giftCard = await program.account.giftCard.fetch(giftCardPda);
```

### Event Listening

```typescript
// Listen for gift card mints
program.addEventListener('GiftCardMinted', (event, slot) => {
  console.log('New gift card minted:', {
    giftCard: event.giftCard.toBase58(),
    issuer: event.issuer.toBase58(),
    merchant: event.merchant.toBase58(),
    amount: event.amount.toString(),
    nftMint: event.nftMint.toBase58(),
  });
});

// Listen for redemptions
program.addEventListener('GiftCardRedeemed', (event, slot) => {
  console.log('Gift card redeemed:', {
    giftCard: event.giftCard.toBase58(),
    merchant: event.merchant.toBase58(),
    amount: event.amount.toString(),
    remainingBalance: event.remainingBalance.toString(),
  });
});
```

## Best Practices

### For Issuers

- Set reasonable expiry dates (30-365 days)
- Use descriptive merchant names
- Store metadata on Arweave or IPFS
- Monitor expiry dates for reclamation

### For Merchants

- Verify gift card ownership before accepting
- Check remaining balance before redemption
- Consider partial redemptions for change
- Track redemptions off-chain

### For Users

- Transfer gift cards only to trusted recipients
- Redeem before expiry date
- Verify merchant address matches expected merchant

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Related Documentation

- **[Web Application](./web/README.md)** - Next.js frontend documentation
- **[Build Instructions](./BUILD_INSTRUCTIONS.md)** - Detailed build and deployment guide
- **[Contract Verification](./CONTRACT_VERIFICATION.md)** - Security audit and verification details
- **[Workflow Examples](./WORKFLOW_EXAMPLES.md)** - Complete usage scenarios and examples
- **[Web Setup](./WEB_SETUP.md)** - Frontend configuration and setup

## Roadmap

### Current Features ✅
- NFT gift card minting with escrow
- Transfer between wallets
- Merchant redemption (full & partial)
- Expiry management
- Event emissions
- Web UI with wallet integration

### Planned Features 🚧
- Multi-token support (SOL, USDC, custom SPL tokens)
- Gift card marketplace
- Batch minting
- QR code redemption
- Mobile app
- Analytics dashboard
- Gift card templates

## Support

For questions or issues:
- Open a [GitHub Issue](https://github.com/ShivamSoni20/sol-gift/issues)
- Check existing documentation
- Review test files for examples
