# SolGiftCards Web UI

Beautiful, modern web interface for the Solana NFT Gift Card system.

> 🔗 **Live Demo**: Coming soon | **Program ID**: `HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem`

## Features

- 🎨 **Modern UI** - Built with Next.js 14, React, and TailwindCSS
- 💳 **Wallet Integration** - Connect with Phantom, Solflare, and other Solana wallets
- 🎁 **Gift Card Management** - Mint, transfer, and redeem NFT gift cards
- ⚡ **Fast & Responsive** - Optimized for performance
- 🔒 **Secure** - All transactions on Solana blockchain

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install
# or
yarn install
# or
bun install

# Run development server
npm run dev
# or
yarn dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
web/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── page.tsx      # Landing page
│   │   ├── dashboard/    # Dashboard pages
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── WalletProvider.tsx
│   │   ├── ui/          # UI components
│   │   └── gift-cards/  # Gift card components
│   └── lib/             # Utilities and helpers
├── public/              # Static assets
└── package.json
```

## Features

### Landing Page
- Hero section with call-to-action
- Features showcase
- How it works section
- Responsive design

### Dashboard
- Connect Solana wallet
- View your gift cards
- Mint new gift cards
- Transfer gift cards
- Redeem gift cards
- View transaction history

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem
```

## Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **Blockchain**: Solana Web3.js, Anchor
- **Wallet**: Solana Wallet Adapter
- **Language**: TypeScript

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t solgift-web .

# Run container
docker run -p 3000:3000 solgift-web
```

## Troubleshooting

### Wallet Connection Issues
- Ensure you have a Solana wallet extension installed
- Check that you're on the correct network (devnet/mainnet)
- Clear browser cache and reload

### Transaction Failures
- Verify sufficient SOL for transaction fees
- Check program is deployed on the selected network
- Ensure wallet has necessary token accounts

### Build Errors
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Check Node.js version (18+ required)

## Contributing

See the main [repository README](../../README.md) for contribution guidelines.

## License

MIT
