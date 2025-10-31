import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem");
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3yjjNP3pwxV6woEdGfbksxiqVem");

// USDC Devnet mint
export const USDC_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

// Network
export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
