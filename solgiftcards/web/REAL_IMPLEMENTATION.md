# 🎯 REAL Implementation - USDC Deduction & Addition

## ✅ What You Wanted

**When minting:**
- USDC/SOL deducted from your wallet
- Funds locked in program escrow
- NFT minted to your wallet

**When redeeming:**
- USDC/SOL released from escrow
- Funds added to merchant's wallet
- NFT burned

---

## 🔧 How to Make It Work

### Step 1: Copy IDL File

The IDL (Interface Definition Language) file describes your program's structure.

```bash
# From project root
cp target/idl/solgiftcards.json web/src/lib/idl.json
```

### Step 2: Update useGiftCards Hook

Replace the current implementation in `web/src/hooks/useGiftCards.ts` with calls to your Anchor program.

**Key Changes Needed:**

```typescript
// Instead of demo transaction:
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: publicKey,
    lamports: 1000,
  })
);

// Use real Anchor program call:
const tx = await program.methods
  .mintGiftCard(
    new BN(amount * 1_000_000), // USDC has 6 decimals
    new BN(expiryTimestamp),
    merchantName,
    merchantAddress,
    uri
  )
  .accounts({
    issuer: publicKey,
    nftMint: nftMint.publicKey,
    giftCard: giftCardPDA,
    paymentMint: USDC_MINT,
    issuerTokenAccount,
    escrowTokenAccount,
    issuerNftAccount,
    metadata: metadataPDA,
    tokenProgram: TOKEN_PROGRAM_ID,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  })
  .signers([nftMint])
  .rpc();
```

---

## 💰 Real Transaction Flow

### Minting (USDC Deducted)

```
User clicks "Mint Gift Card" (100 USDC)
  ↓
Wallet popup appears
  ↓
User approves transaction
  ↓
Program executes:
  1. Deducts 100 USDC from user's token account
  2. Transfers to escrow (program-controlled)
  3. Mints NFT (1 token, 0 decimals)
  4. Sends NFT to user's wallet
  5. Creates Metaplex metadata
  6. Stores gift card data (PDA)
  ↓
Transaction confirmed
  ↓
User's wallet: -100 USDC, +1 NFT
Escrow: +100 USDC
```

### Redeeming (USDC Added)

```
Merchant receives NFT from customer
  ↓
Merchant clicks "Redeem"
  ↓
Wallet popup appears
  ↓
Merchant approves transaction
  ↓
Program executes:
  1. Verifies merchant owns NFT
  2. Transfers 100 USDC from escrow
  3. Sends to merchant's token account
  4. Burns NFT
  5. Marks gift card as redeemed
  ↓
Transaction confirmed
  ↓
Merchant's wallet: +100 USDC
Escrow: -100 USDC
NFT: Burned
```

---

## 🔑 Required Accounts

### For Minting:

1. **Issuer** (your wallet) - Signs transaction
2. **NFT Mint** - New keypair for each gift card
3. **Gift Card PDA** - Stores gift card data
4. **Payment Mint** - USDC mint address
5. **Issuer Token Account** - Your USDC account (source)
6. **Escrow Token Account** - Program's USDC account (destination)
7. **Issuer NFT Account** - Your NFT account (receives NFT)
8. **Metadata** - Metaplex metadata account

### For Redeeming:

1. **Merchant** (merchant wallet) - Signs transaction
2. **Gift Card PDA** - Gift card data
3. **NFT Mint** - The gift card NFT
4. **Merchant NFT Account** - Merchant's NFT account (must own NFT)
5. **Escrow Token Account** - Program's USDC account (source)
6. **Merchant Token Account** - Merchant's USDC account (destination)
7. **Payment Mint** - USDC mint address

---

## 📋 Prerequisites

### 1. USDC on Devnet

You need devnet USDC to test:

```bash
# Get devnet SOL first
solana airdrop 2 --url devnet

# Then get devnet USDC from a faucet
# Or swap SOL for USDC on devnet
```

### 2. Token Accounts

Your wallet needs:
- USDC token account (for payment)
- Will create NFT token account automatically

### 3. Program Deployed

Your program must be deployed:
```
Program ID: HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem
```

---

## 🎯 Implementation Steps

### 1. Install Anchor CLI (if not installed)

```bash
npm install -g @coral-xyz/anchor-cli
```

### 2. Build Program

```bash
cd d:\newproject\solgiftcards
anchor build
```

### 3. Copy IDL

```bash
cp target/idl/solgiftcards.json web/src/lib/idl.json
```

### 4. Update Hook

Modify `web/src/hooks/useGiftCards.ts`:
- Import Anchor and SPL Token libraries
- Use real program calls
- Handle all required accounts
- Parse transaction results

### 5. Test on Devnet

```bash
cd web
npm run dev
```

Then:
1. Connect wallet
2. Make sure you have devnet USDC
3. Mint gift card
4. Approve transaction
5. **100 USDC will be deducted**
6. NFT appears in wallet
7. Gift card shows in dashboard

---

## 💡 Key Points

### USDC Deduction
- Happens during `mint_gift_card` instruction
- Uses SPL Token `transfer` instruction
- From: Your token account
- To: Escrow token account
- Amount: Exact USDC you specify

### USDC Addition
- Happens during `redeem_gift_card` instruction
- Uses SPL Token `transfer` with PDA signer
- From: Escrow token account
- To: Merchant's token account
- Amount: Full or partial balance

### Escrow Security
- Controlled by Gift Card PDA
- Only program can move funds
- Released only on valid redemption
- Returned to issuer if expired

---

## 🔒 Safety Features

1. **Amount Validation**
   - Must be > 0
   - Checked in smart contract

2. **Expiry Validation**
   - Must be future date
   - Checked in smart contract

3. **Ownership Checks**
   - Only owner can transfer
   - Only merchant can redeem
   - Enforced by program

4. **Balance Tracking**
   - Remaining balance stored
   - Partial redemption supported
   - NFT burned when fully redeemed

---

## 🚀 Next Steps

1. **Get Devnet USDC**
   - Need for testing
   - Use faucet or swap

2. **Copy IDL File**
   - From target/idl/
   - To web/src/lib/

3. **Update Hook**
   - Replace demo code
   - Use real Anchor calls

4. **Test Thoroughly**
   - Mint on devnet
   - Verify USDC deducted
   - Transfer NFT
   - Redeem and verify USDC added

5. **Deploy to Mainnet**
   - After testing works
   - Use real USDC
   - Real money!

---

## ✅ Expected Behavior

### After Minting:
- Your USDC balance: **-100 USDC**
- Your NFT balance: **+1 NFT**
- Escrow balance: **+100 USDC**
- Transaction fee: **~0.01 SOL**

### After Redeeming:
- Merchant USDC balance: **+100 USDC**
- Merchant NFT balance: **-1 NFT** (burned)
- Escrow balance: **-100 USDC**
- Transaction fee: **~0.01 SOL**

---

This is how your program ACTUALLY works with real USDC deduction and addition! 🎁✨
