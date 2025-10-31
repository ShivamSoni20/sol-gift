import { AnchorProvider, Program, web3, BN, Idl } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  Keypair,
  Transaction,
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";

// Your deployed program ID
export const PROGRAM_ID = new PublicKey("HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem");

// Metaplex Token Metadata Program ID
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3yjjNP3pwxV6woEdGfbksxiqVem");

// USDC Devnet Mint
export const USDC_MINT_DEVNET = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

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
export function getProgram(provider: AnchorProvider): Program {
  // Simplified IDL - just the structure we need
  const idl: Idl = {
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
    ],
  };

  return new Program(idl, PROGRAM_ID, provider);
}

/**
 * Mint Gift Card - Real Implementation
 */
export async function mintGiftCard(
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
  const issuerTokenAccount = await getAssociatedTokenAddress(
    paymentMint,
    issuer
  );

  const escrowTokenAccount = await getAssociatedTokenAddress(
    paymentMint,
    giftCardPDA,
    true // Allow PDA
  );

  const issuerNftAccount = await getAssociatedTokenAddress(
    nftMint.publicKey,
    issuer
  );

  // Calculate expiry
  const expiryTimestamp = Math.floor(Date.now() / 1000) + (expiryDays * 24 * 60 * 60);

  // Convert amount (USDC has 6 decimals)
  const amountBN = new BN(amount * 1_000_000);

  // Merchant address (using issuer for now)
  const merchantAddress = issuer;

  // Metadata URI
  const uri = `https://arweave.net/gift-card-${nftMint.publicKey.toString()}`;

  console.log("Minting gift card:", {
    nftMint: nftMint.publicKey.toString(),
    giftCard: giftCardPDA.toString(),
    amount: amountBN.toString(),
    expiryTimestamp,
  });

  // Build transaction
  const tx = await (program.methods as any)
    .mintGiftCard(
      amountBN,
      new BN(expiryTimestamp),
      merchantName,
      merchantAddress,
      uri
    )
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

  return {
    signature: tx,
    nftMint: nftMint.publicKey.toString(),
    giftCard: giftCardPDA.toString(),
  };
}
