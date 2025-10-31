import { AnchorProvider, Program, web3, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

// Program ID from your deployed contract
export const PROGRAM_ID = new PublicKey("HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem");
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3yjjNP3pwxV6woEdGfbksxiqVem");

// USDC Devnet mint
export const USDC_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

// Simple IDL type (you can expand this based on your actual IDL)
export const IDL = {
  version: "0.1.0",
  name: "solgiftcards",
  instructions: [
    {
      name: "mintGiftCard",
      accounts: [
        { name: "issuer", isMut: true, isSigner: true },
        { name: "giftCard", isMut: true, isSigner: false },
        { name: "nftMint", isMut: true, isSigner: true },
        { name: "metadata", isMut: true, isSigner: false },
        { name: "issuerTokenAccount", isMut: true, isSigner: false },
        { name: "issuerNftAccount", isMut: true, isSigner: false },
        { name: "escrowTokenAccount", isMut: true, isSigner: false },
        { name: "tokenMint", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "associatedTokenProgram", isMut: false, isSigner: false },
        { name: "metadataProgram", isMut: false, isSigner: false },
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

export function getProgram(provider: AnchorProvider) {
  return new Program(IDL as any, PROGRAM_ID, provider);
}

export async function deriveGiftCardPDA(nftMint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("gift_card"), nftMint.toBuffer()],
    PROGRAM_ID
  );
}

export async function deriveMetadataPDA(mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

export async function deriveEscrowPDA(giftCard: PublicKey, tokenMint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), giftCard.toBuffer(), tokenMint.toBuffer()],
    PROGRAM_ID
  );
}
