# SolGift

A decentralized NFT-backed gift card platform built on Solana blockchain.

## Overview

SolGift enables businesses and individuals to create, transfer, and redeem digital gift cards as NFTs with secure on-chain escrow. Each gift card is backed by real value (USDC/SOL) locked in program-controlled accounts.

## Features

- **NFT-Backed Gift Cards** - Each gift card is a unique NFT with metadata
- **Escrow Protection** - Funds securely locked in program-controlled accounts
- **Transferable** - Send gift cards to any Solana wallet
- **Expiry Management** - Automatic fund reclamation for expired cards
- **Merchant System** - Authorized merchants can redeem cards
- **Modern Web UI** - Next.js interface with Solana wallet integration
- **Dark Mode** - Full theme support with persistent toggle

## Project Structure

```
sol-gift/
├── solgiftcards/
│   ├── programs/          # Solana smart contract (Rust)
│   ├── tests/             # Integration tests
│   ├── web/               # Next.js frontend
│   └── README.md          # Detailed documentation
└── README.md              # This file
```

## Prerequisites

- Node.js 18+
- Rust 1.70+ (for smart contract development)
- Solana CLI 1.18+ (for deployment)
- Anchor 0.32.1 (for smart contract development)

## Getting Started

### Quick Start (Web App Only)

```bash
# Clone the repository
git clone https://github.com/ShivamSoni20/sol-gift.git
cd sol-gift/solgiftcards

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Smart Contract Development

```bash
cd solgiftcards

# Install dependencies
yarn install

# Build the program
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Architecture

### Smart Contract
- **Program ID**: `8E8wHRStMBYFPGvQNuq1hCgUZF6oWHuqsFKxnbbCGm36`
- **Framework**: Anchor 0.30.1
- **Network**: Devnet (Mainnet ready)
- **Token Standard**: SPL Token + Metaplex NFT

### Web Application
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Wallet**: Solana Wallet Adapter
- **UI Components**: shadcn/ui inspired
- **Icons**: Lucide React

## Program Instructions

| Instruction | Description |
|------------|-------------|
| `mint_gift_card` | Create a new gift card NFT with escrowed funds |
| `transfer_gift_card` | Transfer NFT ownership to another wallet |
| `redeem_gift_card` | Merchant redeems card and receives funds |
| `burn_expired_gift_card` | Reclaim funds from expired cards |
| `get_gift_card_status` | Query gift card details and balance |

## Security

- PDA-based escrow accounts
- Ownership verification on all operations
- Merchant authorization checks
- Expiry timestamp validation
- Balance tracking and validation
- Metaplex NFT standard compliance

## Documentation

- [Quick Start Guide](./solgiftcards/QUICK_START.md)
- [Smart Contract Documentation](./solgiftcards/README.md)
- [Build Instructions](./solgiftcards/BUILD_INSTRUCTIONS.md)
- [Workflow Examples](./solgiftcards/WORKFLOW_EXAMPLES.md)
- [Contract Verification](./solgiftcards/CONTRACT_VERIFICATION.md)

## Troubleshooting

### Common Issues

**Wallet Connection**
- Ensure wallet is set to Devnet
- Clear browser cache and reconnect
- Try different wallet adapter (Phantom, Solflare)

**Transaction Failures**
- Get SOL from Devnet faucet for transaction fees
- Ensure you have USDC (Devnet) for minting
- Verify program is deployed on correct network

**Build Errors**
- Run `npm install` in project directories
- Clear Next.js cache: `rm -rf web/.next`
- Verify Node.js version (18+ required)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/name`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/name`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Links

- [GitHub Repository](https://github.com/ShivamSoni20/sol-gift)
- [Solana Documentation](https://docs.solana.com)
- [Anchor Documentation](https://www.anchor-lang.com)

## Built With

- [Solana](https://solana.com) - Blockchain platform
- [Anchor](https://www.anchor-lang.com) - Solana framework
- [Metaplex](https://www.metaplex.com) - NFT standards
- [Next.js](https://nextjs.org) - React framework
- [TailwindCSS](https://tailwindcss.com) - CSS framework
