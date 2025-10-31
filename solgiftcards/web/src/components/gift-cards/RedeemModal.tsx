"use client";

import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { ShoppingBag, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGiftCards } from "@/hooks/useGiftCards";
import { useWallet } from "@solana/wallet-adapter-react";

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RedeemModal({ isOpen, onClose }: RedeemModalProps) {
  const { connected } = useWallet();
  const { redeemGiftCard, loading, giftCards } = useGiftCards();
  const [redeemAmount, setRedeemAmount] = useState("");
  const [selectedCard, setSelectedCard] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const maxAmount = 100; // This would come from selected gift card

  const handleRedeem = async () => {
    if (!connected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!redeemAmount || parseFloat(redeemAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parseFloat(redeemAmount) > maxAmount) {
      setError(`Amount exceeds gift card balance (${maxAmount} USDC)`);
      return;
    }

    setError("");
    setSuccess(false);

    try {
      await redeemGiftCard(selectedCard || "demo-card", parseFloat(redeemAmount));
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setRedeemAmount("");
        setSelectedCard("");
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to redeem gift card. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Redeem Gift Card">
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3">
          <ShoppingBag className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="font-semibold">Redeem Value</h3>
            <p className="text-sm text-gray-600">Exchange gift card for funds</p>
          </div>
        </div>

        {/* Gift Card Selection (Placeholder) */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Gift Card to Redeem</label>
          <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 cursor-pointer transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Gift Card #1</p>
                <p className="text-sm text-gray-600">Balance: 100 USDC</p>
                <p className="text-xs text-gray-500">Expires in 30 days</p>
              </div>
              <input type="radio" name="giftcard" defaultChecked className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            You don't have any gift cards yet. Mint one first!
          </p>
        </div>

        {/* Redeem Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Redeem Amount</label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(e.target.value)}
              placeholder="50"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <button
              onClick={() => setRedeemAmount("100")}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-semibold transition"
            >
              Max
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Partial redemption supported. Remaining balance stays on card.
          </p>
        </div>

        {/* Redemption Details */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Redeem Amount:</span>
            <span className="font-semibold">{redeemAmount || "0"} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Remaining Balance:</span>
            <span className="font-semibold">{100 - Number(redeemAmount || 0)} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Network Fee:</span>
            <span className="font-semibold">~0.001 SOL</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold">You Receive:</span>
            <span className="font-bold text-green-600">{redeemAmount || "0"} USDC</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Note:</strong> Funds will be transferred to your connected wallet. If you redeem the full amount, the NFT will be burned.
          </p>
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
            <p className="text-sm text-green-800">Gift card redeemed successfully!</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <Button
            onClick={handleRedeem}
            disabled={!redeemAmount || loading || !connected}
            variant="secondary"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redeeming...
              </span>
            ) : (
              "Redeem Now"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
