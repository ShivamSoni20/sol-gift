"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState, useCallback } from "react";
import { createAnchorProvider } from "@/lib/wallet-adapter-anchor";
import { 
  mintGiftCardTransaction, 
  transferGiftCardTransaction, 
  redeemGiftCardTransaction 
} from "@/lib/program-client";

export interface GiftCard {
  id: string;
  mint: string;
  owner: string;
  amount: number;
  currency: string;
  expiresAt: Date;
  isActive: boolean;
  merchantName: string;
  remainingBalance: number;
}

export function useGiftCards() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction, signTransaction, signAllTransactions } = wallet;
  const [loading, setLoading] = useState(false);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [useRealTransactions, setUseRealTransactions] = useState(true); // Toggle for real vs demo

  // Fetch user's gift cards from localStorage
  const fetchGiftCards = useCallback(async () => {
    if (!publicKey) return [];

    try {
      setLoading(true);
      // Fetch from localStorage
      const stored = localStorage.getItem(`giftcards_${publicKey.toString()}`);
      const cards = stored ? JSON.parse(stored) : [];
      
      // Convert date strings back to Date objects
      const parsedCards = cards.map((card: any) => ({
        ...card,
        expiresAt: new Date(card.expiresAt),
      }));
      
      setGiftCards(parsedCards);
      return parsedCards;
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  // Demo mint function (fallback)
  const mintGiftCardDemo = async (amount: number, currency: string, expiryDays: number) => {
    console.log("⚠️ Using DEMO mode - no real USDC transaction");
    const signature = `demo_${Date.now()}`;
    const expiryTimestamp = Date.now() + (expiryDays * 24 * 60 * 60 * 1000);
    
    const newCard: GiftCard = {
      id: signature,
      mint: PublicKey.unique().toString(),
      owner: publicKey!.toString(),
      amount,
      currency,
      expiresAt: new Date(expiryTimestamp),
      isActive: true,
      merchantName: "Gift Card Store",
      remainingBalance: amount,
    };

    setGiftCards((prev) => [...prev, newCard]);
    const stored = localStorage.getItem(`giftcards_${publicKey!.toString()}`);
    const cards = stored ? JSON.parse(stored) : [];
    cards.push(newCard);
    localStorage.setItem(`giftcards_${publicKey!.toString()}`, JSON.stringify(cards));
    
    return newCard;
  };

  // Mint a new gift card - REAL USDC TRANSACTION
  const mintGiftCard = useCallback(
    async (amount: number, currency: string, expiryDays: number) => {
      if (!publicKey) throw new Error("Wallet not connected");
      
      // Debug logging
      console.log("🔍 Debug Info:");
      console.log("- publicKey:", publicKey?.toString());
      console.log("- signTransaction:", signTransaction ? "Available ✅" : "NOT Available ❌");
      console.log("- useRealTransactions:", useRealTransactions);
      
      // Check if wallet can sign transactions
      if (!signTransaction || !signAllTransactions) {
        console.error("❌ Wallet cannot sign transactions!");
        console.error("Please make sure your wallet is properly connected.");
        console.error("Falling back to demo mode...");
        return mintGiftCardDemo(amount, currency, expiryDays);
      }

      try {
        setLoading(true);

        console.log("🎁 Minting REAL gift card with USDC...");
        console.log("Amount:", amount, currency);
        console.log("Expiry:", expiryDays, "days");

        // Create Anchor provider from wallet
        const provider = createAnchorProvider(connection, wallet);

        // Call the REAL mint function
        const result = await mintGiftCardTransaction(
          provider,
          amount,
          expiryDays,
          "Gift Card Store"
        );

        console.log("✅ Gift card minted successfully!");
        console.log("Transaction:", result.signature);
        console.log("NFT Mint:", result.nftMint);
        console.log("Gift Card PDA:", result.giftCard);

        // Calculate expiry
        const expiryTimestamp = Date.now() + (expiryDays * 24 * 60 * 60 * 1000);

        // Create new card object
        const newCard: GiftCard = {
          id: result.signature,
          mint: result.nftMint,
          owner: publicKey.toString(),
          amount,
          currency,
          expiresAt: new Date(expiryTimestamp),
          isActive: true,
          merchantName: "Gift Card Store",
          remainingBalance: amount,
        };

        setGiftCards((prev) => [...prev, newCard]);
        
        // Store in localStorage for persistence
        const stored = localStorage.getItem(`giftcards_${publicKey.toString()}`);
        const cards = stored ? JSON.parse(stored) : [];
        cards.push(newCard);
        localStorage.setItem(`giftcards_${publicKey.toString()}`, JSON.stringify(cards));

        return newCard;
      } catch (error: any) {
        console.error("Error minting gift card:", error);
        
        // Provide helpful error messages
        let errorMessage = "Failed to mint gift card. ";
        if (error.message?.includes("Insufficient")) {
          errorMessage += error.message;
        } else if (error.message?.includes("User rejected")) {
          errorMessage += "Transaction was rejected in wallet.";
        } else if (error.message?.includes("Unexpected error")) {
          errorMessage += "Please make sure: 1) Your wallet is on Devnet, 2) You have SOL for transaction fees, 3) Try refreshing the page.";
        } else {
          errorMessage += error.message || "Please try again.";
        }
        
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [publicKey, connection, wallet, signTransaction, signAllTransactions, useRealTransactions]
  );

  // Transfer gift card - REAL TRANSACTION
  const transferGiftCard = useCallback(
    async (giftCardId: string, recipientAddress: string) => {
      if (!publicKey) throw new Error("Wallet not connected");

      try {
        setLoading(true);

        // Find the gift card
        const card = giftCards.find((c) => c.id === giftCardId);
        if (!card) throw new Error("Gift card not found");

        if (useRealTransactions && signTransaction) {
          console.log("📤 Transferring REAL gift card NFT...");
          
          const provider = createAnchorProvider(connection, wallet);

          const signature = await transferGiftCardTransaction(
            provider,
            card.mint,
            recipientAddress
          );

          console.log("✅ Transfer successful!", signature);
        } else {
          console.log("⚠️ Demo transfer");
        }

        // Update local state
        setGiftCards((prev) =>
          prev.map((c) =>
            c.id === giftCardId
              ? { ...c, owner: recipientAddress }
              : c
          )
        );

        // Update localStorage
        const stored = localStorage.getItem(`giftcards_${publicKey.toString()}`);
        const cards = stored ? JSON.parse(stored) : [];
        const updated = cards.map((c: any) =>
          c.id === giftCardId ? { ...c, owner: recipientAddress } : c
        );
        localStorage.setItem(`giftcards_${publicKey.toString()}`, JSON.stringify(updated));

      } catch (error: any) {
        console.error("Error transferring gift card:", error);
        throw new Error(error.message || "Failed to transfer gift card");
      } finally {
        setLoading(false);
      }
    },
    [publicKey, giftCards, connection, wallet, signTransaction, useRealTransactions]
  );

  // Redeem gift card - REAL TRANSACTION (ADDS USDC TO WALLET)
  const redeemGiftCard = useCallback(
    async (giftCardId: string, amount?: number) => {
      if (!publicKey) throw new Error("Wallet not connected");

      try {
        setLoading(true);

        // Find the gift card
        const card = giftCards.find((c) => c.id === giftCardId);
        if (!card) throw new Error("Gift card not found");

        const redeemAmount = amount || card.remainingBalance;

        if (useRealTransactions && signTransaction) {
          console.log("💰 Redeeming REAL gift card - USDC will be ADDED to your wallet!");
          console.log("Amount:", redeemAmount, "USDC");
          
          const provider = createAnchorProvider(connection, wallet);

          const signature = await redeemGiftCardTransaction(
            provider,
            card.mint,
            amount || null
          );

          console.log("✅ Redemption successful!");
          console.log("💰 USDC added to your wallet!");
          console.log("Transaction:", signature);
        } else {
          console.log("⚠️ Demo redemption");
        }

        // Update local state
        const newBalance = card.remainingBalance - redeemAmount;
        setGiftCards((prev) =>
          prev.map((c) => {
            if (c.id === giftCardId) {
              return {
                ...c,
                remainingBalance: newBalance,
                isActive: newBalance > 0,
              };
            }
            return c;
          })
        );

        // Update localStorage
        const stored = localStorage.getItem(`giftcards_${publicKey.toString()}`);
        const cards = stored ? JSON.parse(stored) : [];
        const updated = cards.map((c: any) =>
          c.id === giftCardId
            ? { ...c, remainingBalance: newBalance, isActive: newBalance > 0 }
            : c
        );
        localStorage.setItem(`giftcards_${publicKey.toString()}`, JSON.stringify(updated));

      } catch (error: any) {
        console.error("Error redeeming gift card:", error);
        throw new Error(error.message || "Failed to redeem gift card");
      } finally {
        setLoading(false);
      }
    },
    [publicKey, giftCards, connection, wallet, signTransaction, useRealTransactions]
  );

  return {
    giftCards,
    loading,
    fetchGiftCards,
    mintGiftCard,
    transferGiftCard,
    redeemGiftCard,
    useRealTransactions,
    setUseRealTransactions,
  };
}
