# 🎯 ENABLE REAL USDC TRANSACTIONS

## ⚠️ Current Status: DEMO MODE

**What's happening now:**
- ✅ Wallet connects
- ✅ Transaction is created
- ✅ Wallet popup appears
- ✅ Small SOL transaction (0.000001 SOL) is sent
- ✅ Gift card is stored in localStorage
- ❌ **NO USDC is deducted**
- ❌ **NO real NFT is minted**
- ❌ **NO funds locked in escrow**

**This is intentional** - it's a demo to show the UI/UX flow without risking real money.

---

## 💰 To Enable REAL USDC Deduction & Addition

You need to replace the demo transaction code with actual Anchor program calls.

### Current Code (Demo):
```typescript
// In useGiftCards.ts line 75-86
const transaction = new Transaction();
transaction.recentBlockhash = blockhash;
transaction.feePayer = publicKey;

transaction.add(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: publicKey,
    lamports: 1000, // Just 0.000001 SOL
  })
);
```

### What You Need (Real):
```typescript
// Real Anchor program call
const program = getProgram(provider);
const nftMint = Keypair.generate();

const tx = await program.methods
  .mintGiftCard(
    new BN(amount * 1_000_000), // 100 USDC = 100,000,000
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
    issuerTokenAccount,      // Your USDC account (source)
    escrowTokenAccount,      // Program's USDC account (destination)
    issuerNftAccount,        // Your NFT account
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

## 📋 Step-by-Step: Enable Real Transactions

### Step 1: Copy IDL File

The IDL (Interface Definition Language) describes your program's structure.

```bash
# From project root (d:\newproject\solgiftcards)
cp target\idl\solgiftcards.json web\src\lib\idl.json
```

Or manually copy the file:
- From: `d:\newproject\solgiftcards\target\idl\solgiftcards.json`
- To: `d:\newproject\solgiftcards\web\src\lib\idl.json`

### Step 2: Install Required Packages

Make sure you have all dependencies:

```bash
cd web
npm install @coral-xyz/anchor @solana/spl-token
```

### Step 3: Create Anchor Client Helper

Create `web/src/lib/anchor-program.ts`:

```typescript
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import idl from "./idl.json";

export const PROGRAM_ID = new PublicKey("HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem");
export const USDC_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"); // Devnet
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3yjjNP3pwxV6woEdGfbksxiqVem");

export function getProgram(provider: AnchorProvider) {
  return new Program(idl as any, PROGRAM_ID, provider);
}

export function deriveGiftCardPDA(nftMint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("gift_card"), nftMint.toBuffer()],
    PROGRAM_ID
  );
}

export function deriveMetadataPDA(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );
}
```

### Step 4: Update useGiftCards Hook

Replace the mintGiftCard function in `web/src/hooks/useGiftCards.ts`:

```typescript
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { Keypair, SYSVAR_RENT_PUBKEY, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { getProgram, deriveGiftCardPDA, deriveMetadataPDA, USDC_MINT, TOKEN_METADATA_PROGRAM_ID } from "@/lib/anchor-program";

export function useGiftCards() {
  const anchorWallet = useAnchorWallet();
  
  const mintGiftCard = useCallback(
    async (amount: number, currency: string, expiryDays: number) => {
      if (!publicKey || !anchorWallet) throw new Error("Wallet not connected");

      try {
        setLoading(true);

        // Create Anchor provider
        const provider = new AnchorProvider(connection, anchorWallet, {});
        const program = getProgram(provider);

        // Generate NFT mint
        const nftMint = Keypair.generate();

        // Derive PDAs
        const [giftCardPDA] = deriveGiftCardPDA(nftMint.publicKey);
        const [metadataPDA] = deriveMetadataPDA(nftMint.publicKey);

        // Get token accounts
        const issuerTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
        const escrowTokenAccount = await getAssociatedTokenAddress(USDC_MINT, giftCardPDA, true);
        const issuerNftAccount = await getAssociatedTokenAddress(nftMint.publicKey, publicKey);

        // Calculate expiry
        const expiryTimestamp = Math.floor(Date.now() / 1000) + (expiryDays * 24 * 60 * 60);

        // Convert amount (USDC has 6 decimals)
        const amountBN = new BN(amount * 1_000_000);

        // Call program
        const tx = await program.methods
          .mintGiftCard(
            amountBN,
            new BN(expiryTimestamp),
            "Gift Card Store",
            publicKey,
            `https://arweave.net/${nftMint.publicKey.toString()}`
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

        console.log("Transaction signature:", tx);

        // Create gift card object
        const newCard: GiftCard = {
          id: tx,
          mint: nftMint.publicKey.toString(),
          owner: publicKey.toString(),
          amount,
          currency,
          expiresAt: new Date(expiryTimestamp * 1000),
          isActive: true,
          merchantName: "Gift Card Store",
          remainingBalance: amount,
        };

        setGiftCards((prev) => [...prev, newCard]);
        return newCard;
      } catch (error: any) {
        console.error("Error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, connection, anchorWallet]
  );
}
```

---

## 🧪 Testing Real Transactions

### 1. Get Devnet USDC

You need devnet USDC to test:

```bash
# Get devnet SOL first
solana airdrop 2 --url devnet

# Get devnet USDC
# Use: https://spl-token-faucet.com/?token-name=USDC-Dev
```

### 2. Check Your USDC Balance

In Phantom:
- Switch to Devnet
- You should see USDC balance
- Make sure you have at least 1 USDC for testing

### 3. Mint Gift Card

- Enter amount: 1 USDC
- Click "Mint Gift Card"
- Approve transaction
- **1 USDC will be deducted from your wallet**
- **1 USDC will be locked in program escrow**
- **NFT will be minted to your wallet**

### 4. Verify

Check your wallet:
- USDC balance should decrease by 1
- You should have a new NFT
- Gift card appears in dashboard

---

## 💡 What Will Happen

### When You Mint (Real):
```
Your Wallet: 100 USDC
  ↓ (Approve transaction)
Program executes:
  - Deducts 100 USDC from your wallet ✅
  - Transfers to escrow account ✅
  - Mints NFT to your wallet ✅
  - Creates metadata ✅
  ↓
Your Wallet: 0 USDC, 1 NFT
Escrow: 100 USDC
```

### When You Redeem (Real):
```
Merchant has NFT
  ↓ (Approve redemption)
Program executes:
  - Verifies merchant owns NFT ✅
  - Transfers 100 USDC from escrow ✅
  - Sends to merchant's wallet ✅
  - Burns NFT ✅
  ↓
Merchant Wallet: +100 USDC
Escrow: 0 USDC
NFT: Burned
```

---

## ⚠️ Important Notes

1. **Test on Devnet First**
   - Never test with real money
   - Use devnet USDC
   - Verify everything works

2. **Account Setup**
   - You need USDC token account
   - Program creates NFT account
   - Program creates escrow account

3. **Transaction Fees**
   - ~0.01 SOL for transaction
   - ~0.002 SOL for account creation
   - Keep some SOL for fees

4. **Error Handling**
   - Check USDC balance before minting
   - Verify on correct network
   - Handle transaction failures

---

## 🎯 Summary

**Current (Demo):**
- Sends 0.000001 SOL to yourself
- Stores gift card in localStorage
- No real money involved

**After Implementation (Real):**
- Deducts actual USDC from wallet
- Locks in program escrow
- Mints real NFT
- Releases USDC on redemption
- Burns NFT when redeemed

**To Enable:**
1. Copy IDL file
2. Create anchor-program.ts helper
3. Update useGiftCards.ts
4. Get devnet USDC
5. Test thoroughly
6. Deploy to mainnet

---

**The infrastructure is ready - you just need to connect it to your deployed program!** 🚀
