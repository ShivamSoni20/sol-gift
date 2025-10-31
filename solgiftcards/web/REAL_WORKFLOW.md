# 🎯 Real Workflow - How Your Program Actually Works

## Understanding Your Solana Program

### Core Concept
Your program creates **NFT-backed gift cards** where:
1. User locks USDC/SOL in escrow
2. Receives an NFT representing the gift card
3. NFT can be transferred to anyone
4. Merchant redeems the gift card to get funds
5. NFT is burned after redemption

---

## 📋 The Real Workflow

### 1. **Mint Gift Card** (User/Issuer)
```
User → Approves Transaction
  ↓
Deducts USDC/SOL from user's wallet
  ↓
Transfers to Program Escrow Account
  ↓
Mints NFT to user's wallet
  ↓
Creates Metaplex Metadata
  ↓
Stores Gift Card Data (PDA)
```

**What Happens:**
- User pays the gift card amount (e.g., 100 USDC)
- Funds locked in program-controlled escrow
- User receives NFT (proof of gift card)
- Gift card data stored on-chain

### 2. **Transfer Gift Card** (Current Owner)
```
Current Owner → Approves Transfer
  ↓
NFT transferred to new owner
  ↓
Gift card ownership updated
  ↓
New owner can now use it
```

**What Happens:**
- NFT moves from one wallet to another
- Gift card ownership changes
- Funds stay in escrow
- New owner can give to merchant

### 3. **Redeem Gift Card** (Merchant)
```
Merchant receives NFT from customer
  ↓
Merchant calls redeem
  ↓
Funds transferred from escrow to merchant
  ↓
NFT burned (if fully redeemed)
  ↓
Gift card marked as redeemed
```

**What Happens:**
- Merchant must own the NFT
- Funds released from escrow
- Partial or full redemption
- NFT burned if fully used

### 4. **Burn Expired** (Anyone after expiry)
```
Gift card expires
  ↓
Anyone can burn it
  ↓
Remaining funds returned to issuer
  ↓
NFT burned
```

---

## 🔑 Key Accounts

### 1. **Gift Card PDA**
- Stores all gift card data
- Derived from: `["gift_card", nft_mint]`
- Contains: issuer, owner, merchant, balance, etc.

### 2. **NFT Mint**
- Unique mint for each gift card
- 0 decimals, 1 token
- Transferable
- Represents ownership

### 3. **Escrow Account**
- Holds USDC/SOL
- Controlled by Gift Card PDA
- Released on redemption

### 4. **Metadata Account**
- Metaplex standard
- Name: "Gift Card - {merchant}"
- Symbol: "GIFTCARD"

---

## 💡 Important Details

### Payment Mint
- Can be USDC or any SPL token
- User must have token account
- Merchant must have token account

### Merchant Address
- Set when minting
- Only merchant can redeem
- Customer transfers NFT to merchant

### Expiry
- Unix timestamp
- After expiry, funds return to issuer
- Anyone can trigger burn

---

## 🎯 Correct Implementation Flow

### For Web App:

**Mint:**
1. User enters amount, merchant, expiry
2. Create NFT mint keypair
3. Derive Gift Card PDA
4. Get/create all token accounts
5. Call `mint_gift_card` instruction
6. User approves in wallet
7. USDC deducted, NFT received

**Transfer:**
1. Select gift card (NFT)
2. Enter recipient address
3. Call `transfer_gift_card`
4. NFT moves to recipient

**Redeem:**
1. Merchant owns NFT
2. Calls `redeem_gift_card`
3. Funds released to merchant
4. NFT burned

---

## 🔧 What Needs to be Fixed in Web App

1. **Use correct account names:**
   - `payment_mint` not `token_mint`
   - `issuer_token_account` not `issuerTokenAccount`

2. **Proper PDA derivation:**
   - Gift Card: `["gift_card", nft_mint]`
   - Escrow: Associated token account of gift_card PDA

3. **Correct instruction params:**
   - `amount` (u64)
   - `expiry_timestamp` (i64 unix timestamp)
   - `merchant_name` (String, max 32 chars)
   - `merchant_address` (Pubkey)
   - `uri` (String for metadata)

4. **Account setup:**
   - Create NFT mint
   - Create issuer's NFT token account
   - Create escrow token account
   - Derive metadata PDA

---

This is the REAL workflow your program implements!
