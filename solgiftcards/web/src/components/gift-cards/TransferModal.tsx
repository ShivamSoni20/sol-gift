"use client";

import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { useGiftCards } from "@/hooks/useGiftCards";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const { connected } = useWallet();
  const { transferGiftCard, loading, giftCards } = useGiftCards();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectedCard, setSelectedCard] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateAddress = (address: string) => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const handleTransfer = async () => {
    if (!connected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!recipientAddress) {
      setError("Please enter a recipient address");
      return;
    }

    if (!validateAddress(recipientAddress)) {
      setError("Invalid Solana address");
      return;
    }

    if (!selectedCard && giftCards.length > 0) {
      setError("Please select a gift card to transfer");
      return;
    }

    setError("");
    setSuccess(false);

    try {
      await transferGiftCard(selectedCard || "demo-card", recipientAddress);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setRecipientAddress("");
        setSelectedCard("");
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to transfer gift card. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Gift Card">
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
          <Send className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold">Send Gift Card</h3>
            <p className="text-sm text-gray-600">Transfer NFT to another wallet</p>
          </div>
        </div>

        {/* Recipient Address Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Recipient Wallet Address</label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Enter Solana wallet address..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
          />
          <p className="text-sm text-gray-500 mt-1">
            Make sure the address is correct. Transfers cannot be reversed.
          </p>
        </div>

        {/* Gift Card Selection (Placeholder) */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Gift Card</label>
          <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Gift Card #1</p>
                <p className="text-sm text-gray-600">100 USDC • Expires in 30 days</p>
              </div>
              <input type="radio" name="giftcard" defaultChecked className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            You don't have any gift cards yet. Mint one first!
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Important:</strong> Double-check the recipient address. Transactions on the blockchain are irreversible.
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
            <p className="text-sm text-green-800">Gift card transferred successfully!</p>
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
            onClick={handleTransfer}
            disabled={!recipientAddress || loading || !connected}
            variant="secondary"
            className="flex-1"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Transferring...
              </span>
            ) : (
              "Transfer"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
