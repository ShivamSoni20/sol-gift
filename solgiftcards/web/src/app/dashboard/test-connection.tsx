"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { createAnchorProvider } from "@/lib/wallet-adapter-anchor";

export function TestConnection() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions, connected } = wallet;

  const testConnection = async () => {
    console.log("=== WALLET CONNECTION TEST ===");
    console.log("Connected:", connected);
    console.log("PublicKey:", publicKey?.toString());
    console.log("signTransaction:", signTransaction ? "✅ Available" : "❌ Not Available");
    console.log("signAllTransactions:", signAllTransactions ? "✅ Available" : "❌ Not Available");
    
    if (publicKey && signTransaction && signAllTransactions) {
      try {
        console.log("Creating Anchor Provider...");
        const provider = createAnchorProvider(connection, wallet);
        console.log("✅ Anchor Provider created successfully!");
        console.log("Provider wallet:", provider.wallet.publicKey.toString());
      } catch (error) {
        console.error("❌ Failed to create Anchor Provider:", error);
      }
    } else {
      console.error("❌ Wallet not fully connected");
    }
    console.log("=== END TEST ===");
  };

  if (!connected) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800 font-semibold">⚠️ Wallet not connected</p>
        <p className="text-sm text-yellow-700">Please connect your wallet to test</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="font-bold text-blue-900 mb-2">🔍 Connection Diagnostic</h3>
      <button
        onClick={testConnection}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      >
        Test Wallet Connection
      </button>
      <p className="text-xs text-blue-700 mt-2">
        Click to check if wallet can sign transactions (check browser console)
      </p>
    </div>
  );
}
