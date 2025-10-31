# Gift Card Workflow Examples

This document provides detailed examples of common gift card workflows.

## Example 1: Complete Lifecycle (Mint → Transfer → Redeem)

### Scenario
A company issues a $100 USDC gift card for "Coffee Shop", gives it to an employee, who then uses it at the merchant.

### Step 1: Company Mints Gift Card

```typescript
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, Keypair } from '@solana/web3.js';

// Setup
const company = Keypair.fromSecretKey(/* company wallet */);
const merchantAddress = new PublicKey("Merchant123...");
const usdcMint = new PublicKey("USDC_MINT_ADDRESS");

// Create NFT mint
const nftMint = Keypair.generate();

// Calculate expiry (90 days)
const expiryTimestamp = new BN(
  Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60
);

// Derive PDAs
const [giftCardPda] = PublicKey.findProgramAddressSync(
  [Buffer.from("gift_card"), nftMint.publicKey.toBuffer()],
  program.programId
);

// Mint gift card
const tx = await program.methods
  .mintGiftCard(
    new BN(100_000_000), // 100 USDC
    expiryTimestamp,
    "Coffee Shop",
    merchantAddress,
    "https://arweave.net/coffee-shop-gift-card"
  )
  .accounts({
    issuer: company.publicKey,
    nftMint: nftMint.publicKey,
    giftCard: giftCardPda,
    paymentMint: usdcMint,
    issuerTokenAccount: companyUsdcAccount,
    escrowTokenAccount: escrowAccount,
    issuerNftAccount: companyNftAccount,
    metadata: metadataAccount,
    // ... other accounts
  })
  .signers([company, nftMint])
  .rpc();

console.log("✅ Gift card minted!");
console.log("NFT Mint:", nftMint.publicKey.toBase58());
console.log("Gift Card PDA:", giftCardPda.toBase58());
```

### Step 2: Company Transfers to Employee

```typescript
const employee = new PublicKey("Employee123...");

// Derive NFT accounts
const [companyNftAccount] = PublicKey.findProgramAddressSync(
  [
    company.publicKey.toBuffer(),
    TOKEN_PROGRAM_ID.toBuffer(),
    nftMint.publicKey.toBuffer(),
  ],
  ASSOCIATED_TOKEN_PROGRAM_ID
);

const [employeeNftAccount] = PublicKey.findProgramAddressSync(
  [
    employee.toBuffer(),
    TOKEN_PROGRAM_ID.toBuffer(),
    nftMint.publicKey.toBuffer(),
  ],
  ASSOCIATED_TOKEN_PROGRAM_ID
);

// Transfer
await program.methods
  .transferGiftCard()
  .accounts({
    currentOwner: company.publicKey,
    newOwner: employee,
    giftCard: giftCardPda,
    currentOwnerNftAccount: companyNftAccount,
    newOwnerNftAccount: employeeNftAccount,
    nftMint: nftMint.publicKey,
    // ... other accounts
  })
  .signers([company])
  .rpc();

console.log("✅ Gift card transferred to employee");

// Verify
const giftCard = await program.account.giftCard.fetch(giftCardPda);
console.log("New owner:", giftCard.currentOwner.toBase58());
```

### Step 3: Employee Transfers to Merchant

```typescript
const employeeWallet = Keypair.fromSecretKey(/* employee wallet */);

const [employeeNftAccount] = PublicKey.findProgramAddressSync(
  [
    employeeWallet.publicKey.toBuffer(),
    TOKEN_PROGRAM_ID.toBuffer(),
    nftMint.publicKey.toBuffer(),
  ],
  ASSOCIATED_TOKEN_PROGRAM_ID
);

const [merchantNftAccount] = PublicKey.findProgramAddressSync(
  [
    merchantAddress.toBuffer(),
    TOKEN_PROGRAM_ID.toBuffer(),
    nftMint.publicKey.toBuffer(),
  ],
  ASSOCIATED_TOKEN_PROGRAM_ID
);

await program.methods
  .transferGiftCard()
  .accounts({
    currentOwner: employeeWallet.publicKey,
    newOwner: merchantAddress,
    giftCard: giftCardPda,
    currentOwnerNftAccount: employeeNftAccount,
    newOwnerNftAccount: merchantNftAccount,
    nftMint: nftMint.publicKey,
    // ... other accounts
  })
  .signers([employeeWallet])
  .rpc();

console.log("✅ Gift card transferred to merchant");
```

### Step 4: Merchant Redeems Gift Card

```typescript
const merchantWallet = Keypair.fromSecretKey(/* merchant wallet */);

// Get merchant's USDC account
const merchantUsdcAccount = await getAssociatedTokenAddress(
  usdcMint,
  merchantAddress
);

// Check balance before
const balanceBefore = await connection.getTokenAccountBalance(merchantUsdcAccount);
console.log("Merchant USDC before:", balanceBefore.value.amount);

// Redeem
await program.methods
  .redeemGiftCard(null) // null = redeem full amount
  .accounts({
    merchant: merchantAddress,
    giftCard: giftCardPda,
    nftMint: nftMint.publicKey,
    merchantNftAccount: merchantNftAccount,
    escrowTokenAccount: escrowAccount,
    merchantTokenAccount: merchantUsdcAccount,
    paymentMint: usdcMint,
    // ... other accounts
  })
  .signers([merchantWallet])
  .rpc();

// Check balance after
const balanceAfter = await connection.getTokenAccountBalance(merchantUsdcAccount);
console.log("Merchant USDC after:", balanceAfter.value.amount);
console.log("✅ Gift card redeemed! NFT burned.");

// Verify status
const giftCard = await program.account.giftCard.fetch(giftCardPda);
console.log("Remaining balance:", giftCard.remainingBalance.toString());
console.log("Status:", giftCard.status); // { redeemed: {} }
```

---

## Example 2: Partial Redemption

### Scenario
Customer has a $100 gift card, uses $60 at the merchant, keeps the rest for later.

```typescript
// First redemption: $60
await program.methods
  .redeemGiftCard(new BN(60_000_000)) // 60 USDC
  .accounts({
    merchant: merchantAddress,
    giftCard: giftCardPda,
    // ... accounts
  })
  .signers([merchantWallet])
  .rpc();

// Check remaining balance
let giftCard = await program.account.giftCard.fetch(giftCardPda);
console.log("Remaining balance:", giftCard.remainingBalance.toString());
// Output: 40000000 (40 USDC)
console.log("Status:", giftCard.status); // Still { active: {} }

// Later: Second redemption: $40
await program.methods
  .redeemGiftCard(new BN(40_000_000)) // 40 USDC
  .accounts({
    merchant: merchantAddress,
    giftCard: giftCardPda,
    // ... accounts
  })
  .signers([merchantWallet])
  .rpc();

// Now fully redeemed
giftCard = await program.account.giftCard.fetch(giftCardPda);
console.log("Remaining balance:", giftCard.remainingBalance.toString()); // 0
console.log("Status:", giftCard.status); // { redeemed: {} }
console.log("NFT burned: true");
```

---

## Example 3: Expired Gift Card Reclamation

### Scenario
A gift card expires without being redeemed. The issuer reclaims the funds.

### Step 1: Mint with Short Expiry (for testing)

```typescript
// Mint with 1-day expiry
const expiryTimestamp = new BN(
  Math.floor(Date.now() / 1000) + 24 * 60 * 60
);

await program.methods
  .mintGiftCard(
    new BN(50_000_000), // 50 USDC
    expiryTimestamp,
    "Test Shop",
    merchantAddress,
    "https://arweave.net/test"
  )
  .accounts({
    // ... accounts
  })
  .signers([issuer, nftMint])
  .rpc();

console.log("✅ Gift card minted with 1-day expiry");
```

### Step 2: Wait for Expiry (or simulate)

```typescript
// In production, wait for actual expiry
// For testing, mint with past expiry timestamp

const now = Math.floor(Date.now() / 1000);
const giftCard = await program.account.giftCard.fetch(giftCardPda);

if (now >= giftCard.expiryTimestamp.toNumber()) {
  console.log("⏰ Gift card has expired");
} else {
  console.log("⏳ Gift card still valid");
}
```

### Step 3: Burn and Reclaim Funds

```typescript
// Current owner (or anyone) can burn expired card
// Funds automatically return to original issuer

const issuerUsdcAccount = await getAssociatedTokenAddress(
  usdcMint,
  issuer.publicKey
);

// Check issuer balance before
const balanceBefore = await connection.getTokenAccountBalance(issuerUsdcAccount);
console.log("Issuer USDC before:", balanceBefore.value.amount);

// Burn expired card
await program.methods
  .burnExpiredGiftCard()
  .accounts({
    currentOwner: currentOwner.publicKey,
    giftCard: giftCardPda,
    nftMint: nftMint.publicKey,
    ownerNftAccount: ownerNftAccount,
    escrowTokenAccount: escrowAccount,
    issuerTokenAccount: issuerUsdcAccount,
    issuer: issuer.publicKey,
    paymentMint: usdcMint,
    // ... other accounts
  })
  .signers([currentOwner])
  .rpc();

// Check issuer balance after
const balanceAfter = await connection.getTokenAccountBalance(issuerUsdcAccount);
console.log("Issuer USDC after:", balanceAfter.value.amount);
console.log("✅ Expired gift card burned, funds reclaimed");

// Verify status
const giftCard = await program.account.giftCard.fetch(giftCardPda);
console.log("Status:", giftCard.status); // { expired: {} }
console.log("Remaining balance:", giftCard.remainingBalance.toString()); // 0
```

---

## Example 4: Query Gift Card Information

### Get All Gift Card Details

```typescript
const giftCard = await program.account.giftCard.fetch(giftCardPda);

console.log("=== Gift Card Details ===");
console.log("NFT Mint:", giftCard.mint.toBase58());
console.log("Issuer:", giftCard.issuer.toBase58());
console.log("Current Owner:", giftCard.currentOwner.toBase58());
console.log("Merchant:", giftCard.merchant.toBase58());
console.log("Merchant Name:", giftCard.merchantName);
console.log("Original Amount:", giftCard.amount.toString());
console.log("Remaining Balance:", giftCard.remainingBalance.toString());
console.log("Created At:", new Date(giftCard.createdAt.toNumber() * 1000));
console.log("Expires At:", new Date(giftCard.expiryTimestamp.toNumber() * 1000));
console.log("Status:", giftCard.status);
console.log("Escrow Account:", giftCard.escrowAccount.toBase58());
```

### Check if Gift Card is Valid

```typescript
function isGiftCardValid(giftCard: GiftCard): boolean {
  const now = Math.floor(Date.now() / 1000);
  
  return (
    giftCard.status.active !== undefined &&
    now < giftCard.expiryTimestamp.toNumber() &&
    giftCard.remainingBalance.toNumber() > 0
  );
}

const giftCard = await program.account.giftCard.fetch(giftCardPda);
if (isGiftCardValid(giftCard)) {
  console.log("✅ Gift card is valid and can be used");
} else {
  console.log("❌ Gift card is invalid or expired");
}
```

### Get All Gift Cards for a User

```typescript
// Get all gift card accounts
const allGiftCards = await program.account.giftCard.all();

// Filter by current owner
const userGiftCards = allGiftCards.filter(
  (gc) => gc.account.currentOwner.toBase58() === userAddress.toBase58()
);

console.log(`Found ${userGiftCards.length} gift cards for user`);

userGiftCards.forEach((gc, index) => {
  console.log(`\nGift Card ${index + 1}:`);
  console.log("  Merchant:", gc.account.merchantName);
  console.log("  Balance:", gc.account.remainingBalance.toString());
  console.log("  Status:", gc.account.status);
});
```

---

## Example 5: Event Listening

### Listen for All Gift Card Events

```typescript
// Listen for mints
const mintListener = program.addEventListener(
  'GiftCardMinted',
  (event, slot) => {
    console.log("🎁 New Gift Card Minted!");
    console.log("  Gift Card:", event.giftCard.toBase58());
    console.log("  Issuer:", event.issuer.toBase58());
    console.log("  Merchant:", event.merchant.toBase58());
    console.log("  Amount:", event.amount.toString());
    console.log("  Expiry:", new Date(event.expiryTimestamp.toNumber() * 1000));
    console.log("  NFT Mint:", event.nftMint.toBase58());
  }
);

// Listen for transfers
const transferListener = program.addEventListener(
  'GiftCardTransferred',
  (event, slot) => {
    console.log("🔄 Gift Card Transferred!");
    console.log("  From:", event.from.toBase58());
    console.log("  To:", event.to.toBase58());
    console.log("  Gift Card:", event.giftCard.toBase58());
  }
);

// Listen for redemptions
const redeemListener = program.addEventListener(
  'GiftCardRedeemed',
  (event, slot) => {
    console.log("💰 Gift Card Redeemed!");
    console.log("  Merchant:", event.merchant.toBase58());
    console.log("  Amount:", event.amount.toString());
    console.log("  Remaining:", event.remainingBalance.toString());
  }
);

// Listen for expirations
const expireListener = program.addEventListener(
  'GiftCardExpired',
  (event, slot) => {
    console.log("⏰ Gift Card Expired!");
    console.log("  Issuer:", event.issuer.toBase58());
    console.log("  Reclaimed:", event.reclaimedAmount.toString());
  }
);

// Remove listeners when done
// program.removeEventListener(mintListener);
// program.removeEventListener(transferListener);
// program.removeEventListener(redeemListener);
// program.removeEventListener(expireListener);
```

---

## Example 6: Bulk Operations

### Mint Multiple Gift Cards

```typescript
async function mintBulkGiftCards(
  count: number,
  amount: BN,
  merchantAddress: PublicKey,
  merchantName: string
) {
  const giftCards = [];
  
  for (let i = 0; i < count; i++) {
    const nftMint = Keypair.generate();
    const expiryTimestamp = new BN(
      Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60
    );
    
    const [giftCardPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("gift_card"), nftMint.publicKey.toBuffer()],
      program.programId
    );
    
    await program.methods
      .mintGiftCard(
        amount,
        expiryTimestamp,
        merchantName,
        merchantAddress,
        `https://arweave.net/gift-card-${i}`
      )
      .accounts({
        // ... accounts
      })
      .signers([issuer, nftMint])
      .rpc();
    
    giftCards.push({
      nftMint: nftMint.publicKey,
      giftCardPda,
    });
    
    console.log(`✅ Minted gift card ${i + 1}/${count}`);
  }
  
  return giftCards;
}

// Mint 10 gift cards
const giftCards = await mintBulkGiftCards(
  10,
  new BN(50_000_000), // 50 USDC each
  merchantAddress,
  "Coffee Shop"
);

console.log(`✅ Minted ${giftCards.length} gift cards`);
```

---

## Error Handling

### Handle Common Errors

```typescript
try {
  await program.methods
    .redeemGiftCard(null)
    .accounts({
      // ... accounts
    })
    .signers([merchant])
    .rpc();
} catch (error) {
  if (error.message.includes("NotOwnedByMerchant")) {
    console.error("❌ Gift card must be transferred to merchant first");
  } else if (error.message.includes("GiftCardExpired")) {
    console.error("❌ Gift card has expired");
  } else if (error.message.includes("GiftCardNotActive")) {
    console.error("❌ Gift card is not active (already redeemed or expired)");
  } else if (error.message.includes("InsufficientBalance")) {
    console.error("❌ Insufficient balance for redemption");
  } else {
    console.error("❌ Error:", error.message);
  }
}
```

---

## Best Practices

### 1. Always Verify Before Operations

```typescript
// Before transfer
const giftCard = await program.account.giftCard.fetch(giftCardPda);
if (giftCard.currentOwner.toBase58() !== currentUser.toBase58()) {
  throw new Error("Not the owner");
}

// Before redeem
if (giftCard.currentOwner.toBase58() !== giftCard.merchant.toBase58()) {
  throw new Error("Must transfer to merchant first");
}
```

### 2. Handle Expiry Gracefully

```typescript
const now = Math.floor(Date.now() / 1000);
const daysUntilExpiry = Math.floor(
  (giftCard.expiryTimestamp.toNumber() - now) / (24 * 60 * 60)
);

if (daysUntilExpiry < 7) {
  console.warn(`⚠️ Gift card expires in ${daysUntilExpiry} days`);
}
```

### 3. Use Transaction Confirmations

```typescript
const tx = await program.methods
  .mintGiftCard(/* ... */)
  .rpc();

// Wait for confirmation
await connection.confirmTransaction(tx, 'confirmed');
console.log("✅ Transaction confirmed");
```

### 4. Store Metadata Properly

```typescript
// Upload metadata to Arweave/IPFS first
const metadata = {
  name: `Gift Card - ${merchantName}`,
  symbol: "GIFTCARD",
  description: `$${amount / 1_000_000} gift card for ${merchantName}`,
  image: "https://arweave.net/image-hash",
  attributes: [
    { trait_type: "Merchant", value: merchantName },
    { trait_type: "Amount", value: amount.toString() },
    { trait_type: "Expiry", value: expiryTimestamp.toString() },
  ],
};

const uri = await uploadToArweave(metadata);

// Then mint with the URI
await program.methods.mintGiftCard(
  amount,
  expiryTimestamp,
  merchantName,
  merchantAddress,
  uri // Use the uploaded URI
)
// ...
```
