# 🎁 SolGift - Solana NFT Gift Card Platform

A complete decentralized gift card ecosystem built on Solana. Create, transfer, and redeem NFT-backed gift cards with USDC/SOL escrow protection.

## 🌟 Overview

SolGift is a full-stack Solana application that revolutionizes gift cards by combining NFT technology with secure escrow mechanisms. The platform enables businesses and individuals to issue digital gift cards that are transferable, redeemable, and backed by real value locked on-chain.

**✨ Latest Updates**:
- ✅ Fixed program ID mismatch - synchronized across all components
- ✅ Improved IDL structure with complete account type definitions
- ✅ Unified npm scripts - run from root directory with `npm run dev`
- ✅ Created comprehensive QUICK_START.md guide
- ✅ Dark mode support with theme toggle
- ✅ Animated WarpBackground on dashboard
- ✅ Fully responsive design across all devices

### Key Features

- **🎨 NFT-Backed Gift Cards** - Each gift card is a unique NFT with metadata
- **💰 Escrow Protection** - Funds locked in program-controlled accounts
- **🔄 Transferable** - Send gift cards to anyone with a Solana wallet
- **⏰ Expiry Management** - Automatic fund reclamation for expired cards
- **🏪 Merchant System** - Authorized merchants can redeem cards
- **🌐 Modern Web UI** - Beautiful Next.js interface with wallet integration
- **🔒 Secure** - Built with Anchor framework and audited patterns

## 📦 Project Structure

```
sol-gift/
├── solgiftcards/          # Anchor smart contract & tests
│   ├── programs/          # Solana program (Rust)
│   ├── tests/             # TypeScript integration tests
│   ├── web/               # Next.js web application
│   └── README.md          # Detailed program documentation
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (Required)
- **Rust** 1.70+ (Optional - only for building smart contracts)
- **Solana CLI** 1.18+ (Optional - only for deployment)
- **Anchor** 0.32.1 (Optional - only for smart contract development)

### Installation & Running

**Simple Setup (Recommended)**

```bash
# Clone the repository
git clone https://github.com/ShivamSoni20/sol-gift.git
cd sol-gift/solgiftcards

# Install dependencies
npm install

# Start the application (runs from root directory)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

**Alternative Setup (Web directory)**

```bash
# Navigate to web directory
cd sol-gift/solgiftcards/web

# Install dependencies
npm install

# Start development server
npm run dev
```

### For Smart Contract Development

```bash
# Install dependencies
yarn install

# Build the program
anchor build

# Run tests
anchor test
```

## 📚 Documentation

- **[Quick Start Guide](./solgiftcards/QUICK_START.md)** - 🚀 Get started in 5 minutes
- **[Smart Contract Documentation](./solgiftcards/README.md)** - Complete program architecture, API reference, and usage examples
- **[Web UI Documentation](./solgiftcards/web/README.md)** - Frontend setup and features
- **[Build Instructions](./solgiftcards/BUILD_INSTRUCTIONS.md)** - Detailed build and deployment guide
- **[Contract Verification](./solgiftcards/CONTRACT_VERIFICATION.md)** - Security audit and verification
- **[Workflow Examples](./solgiftcards/WORKFLOW_EXAMPLES.md)** - Step-by-step usage scenarios
- **[Web Setup Guide](./solgiftcards/WEB_SETUP.md)** - Frontend configuration

## 🎯 Use Cases

### For Businesses
- Issue branded gift cards to customers
- Run promotional campaigns
- Manage loyalty programs
- Accept gift card payments

### For Individuals
- Send digital gifts to friends and family
- Transfer value across wallets
- Redeem at participating merchants
- Collect and trade gift card NFTs

### For Developers
- Build gift card marketplaces
- Integrate into e-commerce platforms
- Create custom redemption flows
- Develop merchant dashboards

## 🏗️ Architecture

### Smart Contract (Rust/Anchor)
- **Program ID**: `8E8wHRStMBYFPGvQNuq1hCgUZF6oWHuqsFKxnbbCGm36`
- **Framework**: Anchor 0.32.1
- **Token Standard**: SPL Token + Metaplex
- **Network**: Devnet (ready for Mainnet)
- **Escrow**: PDA-based secure fund locking

### Web Application (Next.js)
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + Custom Design System
- **UI Components**: shadcn/ui inspired components
- **Wallet**: Solana Wallet Adapter
- **Icons**: Lucide React
- **Theme**: Dark mode with persistent theme toggle
- **Responsive**: Mobile-first design with breakpoints (sm: 640px, md: 768px, lg: 1024px)
- **Animations**: Custom CSS animations, WarpBackground starfield effect, smooth transitions

## 🔐 Security Features

- ✅ PDA-based escrow accounts
- ✅ Ownership verification on all operations
- ✅ Merchant authorization checks
- ✅ Expiry timestamp validation
- ✅ Balance tracking and validation
- ✅ Metaplex NFT standard compliance
- ✅ Comprehensive test coverage

## 🛠️ Development

### Build the Program

```bash
cd solgiftcards
anchor build
```

### Run Tests

```bash
# Run all tests
anchor test

# Run with logs
anchor test -- --nocapture
```

### Deploy

```bash
# Deploy to localnet
anchor deploy

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta
```

## 📊 Program Instructions

| Instruction | Description |
|------------|-------------|
| `mint_gift_card` | Create a new gift card NFT with escrowed funds |
| `transfer_gift_card` | Transfer NFT ownership to another wallet |
| `redeem_gift_card` | Merchant redeems card and receives funds |
| `burn_expired_gift_card` | Reclaim funds from expired cards |
| `get_gift_card_status` | Query gift card details and balance |

## 🌐 Web Features

- **Wallet Connection** - Phantom, Solflare, and more
- **Gift Card Dashboard** - View all your cards with beautiful card layouts
- **Mint Interface** - Create new gift cards with intuitive forms
- **Transfer Flow** - Send cards to others seamlessly
- **Redemption Portal** - Merchant redemption interface
- **Transaction History** - Track all activities
- **Dark Mode** - 🌙 Full dark theme support with persistent toggle (light/dark)
- **Animated Background** - ✨ WarpBackground starfield effect on dashboard
- **Fully Responsive Design** - Optimized for mobile, tablet, and desktop
- **Modern UI/UX** - Smooth animations, hover effects, and transitions
- **Mobile Navigation** - Hamburger menu for seamless mobile experience
- **Touch-Friendly** - Large tap targets and optimized spacing for mobile devices
- **Custom Animations** - Fade-in, slide-up, scale effects, and warp speed starfield
- **Accessible** - ARIA labels and keyboard navigation support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **GitHub**: [ShivamSoni20/sol-gift](https://github.com/ShivamSoni20/sol-gift)
- **Solana Docs**: [docs.solana.com](https://docs.solana.com)
- **Anchor Docs**: [anchor-lang.com](https://www.anchor-lang.com)

## 🐛 Troubleshooting

### Common Issues

**Program ID Mismatch Error**
- Ensure you're using the correct program ID: `8E8wHRStMBYFPGvQNuq1hCgUZF6oWHuqsFKxnbbCGm36`
- Check that `idl.json` has the correct address field
- Restart the development server after changes

**Wallet Connection Issues**
- Make sure you're on Devnet in your wallet settings
- Clear browser cache and reconnect wallet
- Try a different wallet adapter (Phantom, Solflare, etc.)

**Transaction Failures**
- Ensure you have SOL for transaction fees (airdrop on Devnet)
- Check that you have USDC (Devnet) for minting gift cards
- Verify the program is deployed on the network you're using

**Build Errors**
- Run `npm install` in both root and `/web` directories
- Clear `.next` cache: `rm -rf web/.next`
- Check Node.js version (18+ required)

## 💬 Support

For questions, issues, or feature requests:
- Open a [GitHub Issue](https://github.com/ShivamSoni20/sol-gift/issues)
- Join our community discussions
- Check the [Quick Start Guide](./solgiftcards/QUICK_START.md) for setup help

## 🙏 Acknowledgments

Built with:
- [Solana](https://solana.com) - High-performance blockchain
- [Anchor](https://www.anchor-lang.com) - Solana development framework
- [Metaplex](https://www.metaplex.com) - NFT standards
- [Next.js](https://nextjs.org) - React framework
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS

---

**Made with ❤️ for the Solana ecosystem**
