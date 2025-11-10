import { AnchorProvider, Program, BN, web3 } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  Connection,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import type { SolgiftcardsIDL } from "./types";

// Program ID from your deployed contract
export const PROGRAM_ID = new PublicKey("HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem");

// Metaplex Token Metadata Program (well-known address)
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// USDC Devnet Mint
export const USDC_MINT_DEVNET = new PublicKey(
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
);

/**
 * Derive Gift Card PDA
 */
export function deriveGiftCardPDA(nftMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("gift_card"), nftMint.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive Metadata PDA (Metaplex)
 */
export function deriveMetadataPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

/**
 * Get Program Instance
 */
export function getProgram(provider: AnchorProvider): Program<SolgiftcardsIDL> {
  const IDL: SolgiftcardsIDL = {
    version: "0.1.0",
    name: "solgiftcards",
    instructions: [
      {
        name: "mintGiftCard",
        accounts: [
          { name: "issuer", isMut: true, isSigner: true },
          { name: "nftMint", isMut: true, isSigner: true },
          { name: "giftCard", isMut: true, isSigner: false },
          { name: "paymentMint", isMut: false, isSigner: false },
          { name: "issuerTokenAccount", isMut: true, isSigner: false },
          { name: "escrowTokenAccount", isMut: true, isSigner: false },
          { name: "issuerNftAccount", isMut: true, isSigner: false },
          { name: "metadata", isMut: true, isSigner: false },
          { name: "tokenProgram", isMut: false, isSigner: false },
          { name: "associatedTokenProgram", isMut: false, isSigner: false },
          { name: "systemProgram", isMut: false, isSigner: false },
          { name: "rent", isMut: false, isSigner: false },
        ],
        args: [
          { name: "amount", type: "u64" },
          { name: "expiryTimestamp", type: "i64" },
          { name: "merchantName", type: "string" },
          { name: "merchantAddress", type: "publicKey" },
          { name: "uri", type: "string" },
        ],
      },
      {
        name: "transferGiftCard",
        accounts: [
          { name: "currentOwner", isMut: true, isSigner: true },
          { name: "newOwner", isMut: false, isSigner: false },
          { name: "nftMint", isMut: false, isSigner: false },
          { name: "giftCard", isMut: true, isSigner: false },
          { name: "currentOwnerNftAccount", isMut: true, isSigner: false },
          { name: "newOwnerNftAccount", isMut: true, isSigner: false },
          { name: "tokenProgram", isMut: false, isSigner: false },
          { name: "associatedTokenProgram", isMut: false, isSigner: false },
          { name: "systemProgram", isMut: false, isSigner: false },
        ],
        args: [],
      },
      {
        name: "redeemGiftCard",
        accounts: [
          { name: "merchant", isMut: true, isSigner: true },
          { name: "giftCard", isMut: true, isSigner: false },
          { name: "nftMint", isMut: true, isSigner: false },
          { name: "merchantNftAccount", isMut: true, isSigner: false },
          { name: "escrowTokenAccount", isMut: true, isSigner: false },
          { name: "merchantTokenAccount", isMut: true, isSigner: false },
          { name: "paymentMint", isMut: false, isSigner: false },
          { name: "tokenProgram", isMut: false, isSigner: false },
          { name: "associatedTokenProgram", isMut: false, isSigner: false },
          { name: "systemProgram", isMut: false, isSigner: false },
        ],
        args: [{ name: "amountToRedeem", type: { option: "u64" } }],
      },
    ],
    accounts: [
      {
        name: "GiftCard",
        type: {
          kind: "struct",
          fields: [
            { name: "issuer", type: "publicKey" },
            { name: "currentOwner", type: "publicKey" },
            { name: "merchant", type: "publicKey" },
            { name: "merchantName", type: "string" },
            { name: "amount", type: "u64" },
            { name: "remainingBalance", type: "u64" },
            { name: "mint", type: "publicKey" },
            { name: "escrowAccount", type: "publicKey" },
            { name: "createdAt", type: "i64" },
            { name: "expiryTimestamp", type: "i64" },
            { name: "status", type: { defined: "GiftCardStatus" } },
            { name: "bump", type: "u8" },
          ],
        },
      },
    ],
    types: [
      {
        name: "GiftCardStatus",
        type: {
          kind: "enum",
          variants: [{ name: "Active" }, { name: "Redeemed" }, { name: "Expired" }],
        },
      },
    ],
  };

  return new Program(IDL as any, PROGRAM_ID, provider);
}

/**
 * Mint Gift Card - Calls your deployed contract
 */
export async function mintGiftCardTransaction(
  provider: AnchorProvider,
  amount: number,
  expiryDays: number,
  merchantName: string,
  paymentMint: PublicKey = USDC_MINT_DEVNET
) {
  const program = getProgram(provider);
  const issuer = provider.wallet.publicKey;

  // Generate new NFT mint
  const nftMint = Keypair.generate();

  // Derive PDAs
  const [giftCardPDA] = deriveGiftCardPDA(nftMint.publicKey);
  const [metadataPDA] = deriveMetadataPDA(nftMint.publicKey);

  // Get token accounts
  const issuerTokenAccount = await getAssociatedTokenAddress(paymentMint, issuer);
  const escrowTokenAccount = await getAssociatedTokenAddress(paymentMint, giftCardPDA, true);
  const issuerNftAccount = await getAssociatedTokenAddress(nftMint.publicKey, issuer);

  // Calculate expiry
  const expiryTimestamp = Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;

  // Convert amount (USDC has 6 decimals)
  const amountBN = new anchor.BN(amount * 1_000_000);

  // Merchant address (using issuer for now)
  const merchantAddress = issuer;

  // Metadata URI
  const uri = `https://arweave.net/gift-card-${nftMint.publicKey.toString()}`;

  console.log("🎁 Minting gift card with real USDC...");
  console.log("Amount:", amount, "USDC");
  console.log("Expiry:", expiryDays, "days");
  console.log("NFT Mint:", nftMint.publicKey.toString());

  // Call the program
  const tx = await (program.methods as any)
    .mintGiftCard(amountBN, new anchor.BN(expiryTimestamp), merchantName, merchantAddress, uri)
    .accounts({
      issuer,
      nftMint: nftMint.publicKey,
      giftCard: giftCardPDA,
      paymentMint,
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

  console.log("✅ Transaction successful!");
  console.log("Signature:", tx);

  return {
    signature: tx,
    nftMint: nftMint.publicKey.toString(),
    giftCard: giftCardPDA.toString(),
  };
}

/**
 * Transfer Gift Card
 */
export async function transferGiftCardTransaction(
  provider: AnchorProvider,
  nftMintAddress: string,
  newOwnerAddress: string
) {
  const program = getProgram(provider);
  const currentOwner = provider.wallet.publicKey;
  const nftMint = new PublicKey(nftMintAddress);
  const newOwner = new PublicKey(newOwnerAddress);

  const [giftCardPDA] = deriveGiftCardPDA(nftMint);
  const currentOwnerNftAccount = await getAssociatedTokenAddress(nftMint, currentOwner);
  const newOwnerNftAccount = await getAssociatedTokenAddress(nftMint, newOwner);

  console.log("📤 Transferring gift card...");

  const tx = await (program.methods as any)
    .transferGiftCard()
    .accounts({
      currentOwner,
      newOwner,
      nftMint,
      giftCard: giftCardPDA,
      currentOwnerNftAccount,
      newOwnerNftAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Transfer successful!");
  console.log("Signature:", tx);

  return tx;
}

/**
 * Redeem Gift Card
 */
export async function redeemGiftCardTransaction(
  provider: AnchorProvider,
  nftMintAddress: string,
  amountToRedeem: number | null,
  paymentMint: PublicKey = USDC_MINT_DEVNET
) {
  const program = getProgram(provider);
  const merchant = provider.wallet.publicKey;
  const nftMint = new PublicKey(nftMintAddress);

  const [giftCardPDA] = deriveGiftCardPDA(nftMint);
  const merchantNftAccount = await getAssociatedTokenAddress(nftMint, merchant);
  const escrowTokenAccount = await getAssociatedTokenAddress(paymentMint, giftCardPDA, true);
  const merchantTokenAccount = await getAssociatedTokenAddress(paymentMint, merchant);

  const redeemAmount = amountToRedeem ? new anchor.BN(amountToRedeem * 1_000_000) : null;

  console.log("💰 Redeeming gift card...");
  console.log("Amount:", amountToRedeem || "Full balance");

  const tx = await (program.methods as any)
    .redeemGiftCard(redeemAmount)
    .accounts({
      merchant,
      giftCard: giftCardPDA,
      nftMint,
      merchantNftAccount,
      escrowTokenAccount,
      merchantTokenAccount,
      paymentMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("✅ Redemption successful!");
  console.log("Signature:", tx);

  return tx;
}

/**
 * Fetch Gift Card Account Data
 */
export async function fetchGiftCard(
  connection: Connection,
  nftMintAddress: string
): Promise<any> {
  const nftMint = new PublicKey(nftMintAddress);
  const [giftCardPDA] = deriveGiftCardPDA(nftMint);

  const accountInfo = await connection.getAccountInfo(giftCardPDA);
  if (!accountInfo) {
    throw new Error("Gift card not found");
  }

  // Parse account data (simplified - you'd use program.account.giftCard.fetch in real app)
  return {
    address: giftCardPDA.toString(),
    mint: nftMintAddress,
    // Add more parsing as needed
  };
}
