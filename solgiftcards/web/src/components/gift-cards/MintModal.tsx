"use client";

import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Gift, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGiftCards } from "@/hooks/useGiftCards";
import { useWallet } from "@solana/wallet-adapter-react";

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MintModal({ isOpen, onClose, onSuccess }: MintModalProps) {
  const { connected } = useWallet();
  const { mintGiftCard, loading, fetchGiftCards } = useGiftCards();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDC");
  const [expiryDays, setExpiryDays] = useState("30");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleMint = async () => {
    if (!connected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!expiryDays || parseInt(expiryDays) <= 0) {
      setError("Please enter valid expiry days");
      return;
    }

    setError("");
    setSuccess(false);

    try {
      await mintGiftCard(parseFloat(amount), currency, parseInt(expiryDays));
      setSuccess(true);
      
      // Refresh the gift cards list
      await fetchGiftCards();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        onClose();
        setAmount("");
        setExpiryDays("30");
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to mint gift card. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mint Gift Card">
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg flex items-center space-x-3">
          <Gift className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm sm:text-base">Create NFT Gift Card</h3>
            <p className="text-xs sm:text-sm text-gray-600">Backed by real value on Solana</p>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm sm:text-base transition-colors"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm sm:text-base transition-colors"
            >
              <option value="USDC">USDC</option>
              <option value="SOL">SOL</option>
            </select>
          </div>
        </div>

        {/* Expiry Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Expiry (Days)</label>
          <input
            type="number"
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            placeholder="30"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-sm sm:text-base transition-colors"
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Gift card will expire in {expiryDays} days</p>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-gray-600">Value:</span>
            <span className="font-semibold">{amount || "0"} {currency}</span>
          </div>
          <div className="flex justify-between text-sm sm:text-base">
            <span className="text-gray-600">Network Fee:</span>
            <span className="font-semibold">~0.001 SOL</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-sm sm:text-base">
            <span className="font-semibold">Total Cost:</span>
            <span className="font-bold text-purple-600">{amount || "0"} {currency}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">Gift card minted successfully!</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <Button
            onClick={handleMint}
            disabled={!amount || loading || !connected}
            className="flex-1 text-sm sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Minting...
              </span>
            ) : (
              "Mint Gift Card"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
