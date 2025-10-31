import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

/**
 * Create an Anchor-compatible wallet from standard wallet adapter
 */
export function createAnchorWallet(wallet: WalletContextState) {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error("Wallet not properly connected");
  }

  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction.bind(wallet),
    signAllTransactions: wallet.signAllTransactions.bind(wallet),
  };
}

/**
 * Create Anchor Provider from wallet adapter
 */
export function createAnchorProvider(
  connection: Connection,
  wallet: WalletContextState,
  opts?: any
): AnchorProvider {
  const anchorWallet = createAnchorWallet(wallet);
  return new AnchorProvider(connection, anchorWallet as any, opts || { commitment: 'confirmed' });
}
