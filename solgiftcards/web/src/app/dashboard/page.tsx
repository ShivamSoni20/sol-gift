"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { Gift, ArrowLeft, Plus, Send, ShoppingBag, Clock } from "lucide-react";
import { MintModal } from "@/components/gift-cards/MintModal";
import { TransferModal } from "@/components/gift-cards/TransferModal";
import { RedeemModal } from "@/components/gift-cards/RedeemModal";
import { WalletButton } from "@/components/WalletButton";
import { useGiftCards } from "@/hooks/useGiftCards";
import { TestConnection } from "./test-connection";

export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const [mintModalOpen, setMintModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const { giftCards, fetchGiftCards } = useGiftCards();

  // Fetch gift cards when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchGiftCards();
    }
  }, [connected, publicKey, fetchGiftCards]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              <Gift className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SolGiftCards
              </span>
            </Link>
            <WalletButton />
          </div>
          {connected ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
              {/* Test Connection */}
              <TestConnection />
            </div>
          ) : null}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!connected ? (
          <div className="text-center py-12 sm:py-16 md:py-20 animate-fadeIn">
            <Gift className="h-16 w-16 sm:h-20 sm:w-20 text-purple-600 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Connect Your Wallet</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-4">
              Connect your Solana wallet to start managing gift cards
            </p>
            <WalletButton />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 sm:mb-8 animate-fadeIn">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 break-all">
                Wallet: {publicKey?.toBase58().slice(0, 4)}...
                {publicKey?.toBase58().slice(-4)}
              </p>
            </div>

            {/* Test Connection */}
            <TestConnection />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <button 
                onClick={() => setMintModalOpen(true)}
                className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 text-left transform hover:-translate-y-1 group"
              >
                <div className="bg-purple-100 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Mint Gift Card</h3>
                <p className="text-sm sm:text-base text-gray-600">Create a new NFT gift card</p>
              </button>

              <button 
                onClick={() => setTransferModalOpen(true)}
                className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 text-left transform hover:-translate-y-1 group"
              >
                <div className="bg-blue-100 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Send className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Transfer</h3>
                <p className="text-sm sm:text-base text-gray-600">Send gift card to someone</p>
              </button>

              <button 
                onClick={() => setRedeemModalOpen(true)}
                className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200 text-left transform hover:-translate-y-1 group sm:col-span-2 lg:col-span-1"
              >
                <div className="bg-green-100 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Redeem</h3>
                <p className="text-sm sm:text-base text-gray-600">Redeem gift card value</p>
              </button>
            </div>

            {/* Gift Cards Section */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your Gift Cards</h2>
              
              {giftCards.length === 0 ? (
                <div className="text-center py-10 sm:py-12 text-gray-500">
                  <Gift className="h-14 w-14 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-base sm:text-lg font-medium">No gift cards yet</p>
                  <p className="text-sm">Mint your first gift card to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {giftCards.map((card) => (
                    <div
                      key={card.id}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          card.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        }`}>
                          {card.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-base sm:text-lg mb-1">{card.merchantName}</h3>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600 mb-2">
                        {card.remainingBalance} {card.currency}
                      </p>
                      
                      <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                        <p>Original: {card.amount} {card.currency}</p>
                        <p>Expires: {new Date(card.expiresAt).toLocaleDateString()}</p>
                        <p className="font-mono text-xs truncate">
                          {card.mint.slice(0, 8)}...{card.mint.slice(-8)}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => setTransferModalOpen(true)}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-100 transition-colors"
                        >
                          Transfer
                        </button>
                        <button
                          onClick={() => setRedeemModalOpen(true)}
                          className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-100 transition-colors"
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Recent Activity</h2>
              
              <div className="text-center py-10 sm:py-12 text-gray-500">
                <Clock className="h-14 w-14 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                <p className="text-base sm:text-lg font-medium">No recent activity</p>
                <p className="text-sm">Your transactions will appear here</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <MintModal isOpen={mintModalOpen} onClose={() => setMintModalOpen(false)} />
      <TransferModal isOpen={transferModalOpen} onClose={() => setTransferModalOpen(false)} />
      <RedeemModal isOpen={redeemModalOpen} onClose={() => setRedeemModalOpen(false)} />
    </div>
  );
}
