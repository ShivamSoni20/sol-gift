# Quick Start Guide

## Running the Application

This project has been configured to run from a single command at the root level.

### Start Development Server

From the root directory (`solgiftcards/`), run:

```bash
npm run dev
```

This will start the Next.js development server on **http://localhost:3000**

### Available Commands

All commands can be run from the root directory:

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm start`** - Start production server
- **`npm run lint`** - Check code formatting
- **`npm run lint:fix`** - Fix code formatting

## Architecture

This is a **full-stack Solana dApp** with:

### Frontend (Next.js)
- Located in `/web` directory
- React-based UI with Tailwind CSS
- Wallet adapter integration
- Runs on port 3000

### Smart Contract (Solana Program)
- Located in `/programs/solgiftcards` directory
- Written in Rust using Anchor framework
- Deployed to Solana blockchain
- Program ID: `8E8wHRStMBYFPGvQNuq1hCgUZF6oWHuqsFKxnbbCGm36`

### How It Works

1. **Frontend** - Next.js app serves the UI and handles user interactions
2. **Blockchain** - Solana program runs on-chain (no traditional backend needed)
3. **Communication** - Frontend connects directly to Solana RPC nodes to interact with the program

## Development Workflow

1. **Start the server**: `npm run dev`
2. **Open browser**: Navigate to http://localhost:3000
3. **Connect wallet**: Use Phantom, Solflare, or another Solana wallet
4. **Interact**: Mint, transfer, or redeem gift cards

## Important Notes

- Ensure you're connected to **Devnet** in your wallet
- You need **SOL** for transaction fees
- You need **USDC** (Devnet) to mint gift cards
- The Solana program is already deployed - no backend server needed!

## Troubleshooting

If the server doesn't start:
1. Make sure you're in the root `solgiftcards/` directory
2. Check if port 3000 is available
3. Run `npm install` in the `/web` directory if dependencies are missing

## Project Structure

```
solgiftcards/
├── web/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and program client
│   └── package.json
├── programs/              # Solana smart contracts
│   └── solgiftcards/     # Gift card program (Rust)
├── tests/                # Integration tests
└── package.json          # Root package.json with unified scripts
```
