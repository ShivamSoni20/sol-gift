"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Shield, Zap, ArrowRight, Wallet, Send, ShoppingBag, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Gift className="h-7 w-7 md:h-8 md:w-8 text-purple-600" />
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SolGiftCards
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">How It Works</a>
              <ThemeToggle />
              <Link 
                href="/dashboard" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2 font-semibold"
              >
                <span>Launch App</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-slideDown">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#features" 
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  How It Works
                </a>
                <Link 
                  href="/dashboard" 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Launch App</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="text-center animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            NFT Gift Cards
            <br />
            on Solana
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Create, send, and redeem digital gift cards as NFTs. Secure, instant, and powered by Solana blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link 
              href="/dashboard" 
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-base sm:text-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Launch App
            </Link>
            <Link 
              href="/demo" 
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-400 rounded-xl font-bold text-base sm:text-lg hover:bg-purple-50 dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-200"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-16 md:mt-20 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">$0</div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Transaction Fees</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">&lt;1s</div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Settlement Time</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center transform hover:-translate-y-1">
            <div className="text-3xl sm:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">100%</div>
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Secure on Solana</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white dark:bg-gray-800 py-12 sm:py-16 md:py-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 dark:text-white">Why SolGiftCards?</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">The future of digital gifting is here</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white dark:bg-gray-900">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 dark:text-white">Secure & Transparent</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                All gift cards are NFTs on Solana blockchain. Fully auditable, tamper-proof, and secure.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white dark:bg-gray-900">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 dark:text-white">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Powered by Solana's high-speed blockchain. Send and redeem gift cards in seconds.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white dark:bg-gray-900">
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 sm:h-7 sm:w-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 dark:text-white">Low Fees</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Minimal transaction costs thanks to Solana. More value for your gift cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 dark:text-white">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">Simple, fast, and secure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white text-xl sm:text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <Gift className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 dark:text-purple-400 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 dark:text-white">Create Gift Card</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xs mx-auto">
                Mint an NFT gift card backed by USDC or SOL. Set the value and expiry date.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white text-xl sm:text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <Send className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 dark:text-white">Send to Anyone</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xs mx-auto">
                Transfer the NFT to any Solana wallet. Instant delivery, no intermediaries.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white text-xl sm:text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 dark:text-white">Redeem Value</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xs mx-auto">
                Merchants redeem the gift card for funds. NFT is burned, value is released.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 dark:text-purple-200 mb-6 sm:mb-8 px-4">
            Join the future of digital gifting on Solana blockchain
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center space-x-2 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-10 sm:py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Gift className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-lg sm:text-xl font-bold">SolGiftCards</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 dark:text-gray-500">
                NFT gift cards on Solana blockchain
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400 dark:text-gray-500">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400 dark:text-gray-500">
                <li><a href="https://docs.solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Solana Docs</a></li>
                <li><a href="https://github.com" className="hover:text-white transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">Program</h4>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 break-all">
                HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-900 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-400 dark:text-gray-500">
            <p>&copy; 2024 SolGiftCards. Built on Solana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
