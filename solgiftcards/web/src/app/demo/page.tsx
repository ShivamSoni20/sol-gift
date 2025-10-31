"use client";

import Link from "next/link";
import { ArrowLeft, Gift, Users, Store, Wallet, CheckCircle } from "lucide-react";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <Gift className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SolGiftCards
              </span>
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How It Works</h1>
          <p className="text-xl text-gray-600">
            Understanding the NFT Gift Card Workflow
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-8">
          {/* Step 1: Mint */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-4 rounded-xl">
                <Wallet className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">1. Mint Gift Card</h2>
                <p className="text-gray-600 mb-4">
                  User creates a gift card by locking funds
                </p>
                
                <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">What Happens:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>User enters amount (e.g., 100 USDC)</li>
                    <li>Selects merchant and expiry date</li>
                    <li>Approves transaction in wallet</li>
                    <li><strong>USDC deducted from wallet</strong></li>
                    <li><strong>Funds locked in program escrow</strong></li>
                    <li><strong>NFT minted to user's wallet</strong></li>
                    <li>Gift card data stored on-chain</li>
                  </ul>
                </div>

                <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>💰 Cost:</strong> 100 USDC (gift card value) + ~0.01 SOL (transaction fees)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Transfer */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-4 rounded-xl">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">2. Transfer Gift Card</h2>
                <p className="text-gray-600 mb-4">
                  User gives the gift card to someone (optional)
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">What Happens:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Current owner enters recipient's wallet address</li>
                    <li>Approves transfer transaction</li>
                    <li><strong>NFT transferred to recipient</strong></li>
                    <li>Gift card ownership updated on-chain</li>
                    <li>Funds stay in escrow</li>
                    <li>Recipient can now use or transfer again</li>
                  </ul>
                </div>

                <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>🎁 Use Case:</strong> Give gift card to friend, family, or customer
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Redeem */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-4 rounded-xl">
                <Store className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">3. Redeem at Merchant</h2>
                <p className="text-gray-600 mb-4">
                  Customer gives NFT to merchant, merchant redeems
                </p>
                
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">What Happens:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Customer transfers NFT to merchant</li>
                    <li>Merchant calls redeem function</li>
                    <li><strong>Funds released from escrow</strong></li>
                    <li><strong>USDC transferred to merchant</strong></li>
                    <li>Partial or full redemption supported</li>
                    <li><strong>NFT burned if fully redeemed</strong></li>
                    <li>Gift card marked as redeemed</li>
                  </ul>
                </div>

                <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>✅ Result:</strong> Merchant receives 100 USDC, customer gets goods/services
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Expiry */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 p-4 rounded-xl">
                <CheckCircle className="h-8 w-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">4. Expiry (If Unused)</h2>
                <p className="text-gray-600 mb-4">
                  After expiry date, funds return to issuer
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold">What Happens:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Gift card reaches expiry date</li>
                    <li>Anyone can trigger burn function</li>
                    <li><strong>Remaining funds returned to issuer</strong></li>
                    <li>NFT burned</li>
                    <li>Gift card marked as expired</li>
                  </ul>
                </div>

                <div className="mt-4 bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800">
                    <strong>🔒 Protection:</strong> Issuer gets money back if gift card unused
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Key Points</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold mb-2">🔐 Secure</h3>
              <p className="text-sm">Funds locked in program escrow, only released on redemption</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold mb-2">🎁 Transferable</h3>
              <p className="text-sm">NFT can be given to anyone, like a physical gift card</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold mb-2">⚡ Fast</h3>
              <p className="text-sm">Instant transfers and redemptions on Solana</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold mb-2">💰 Low Cost</h3>
              <p className="text-sm">~$0.01 transaction fees vs traditional payment processors</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition shadow-lg"
          >
            <span>Try It Now</span>
            <Gift className="h-6 w-6" />
          </Link>
          <p className="mt-4 text-gray-600">
            Connect your wallet and mint your first gift card
          </p>
        </div>
      </div>
    </div>
  );
}
