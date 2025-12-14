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
| claim_gift_card | Current NFT owner claims funds to their wallet |
| merchant_redeem | Merchant redeems card and receives funds |
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

# Solana Gift Cards with x402 Integration

This project combines a **fixed Solana gift card smart contract** with an **x402-enabled API layer** for monetizing gift card operations.

## 🔧 Smart Contract Fixes

### Problems in Original Contract

1. **Redemption Logic Bug**: The original `redeem_gift_card` function required the merchant to own the NFT (`gift_card.current_owner == gift_card.merchant`). This created confusion about the intended workflow.

2. **Unclear User Flow**: It wasn't clear whether users should claim their own gift cards or if only merchants could redeem them.

### Solutions Implemented

#### 1. **New `claim_gift_card` Function** (For Users)
```rust
pub fn claim_gift_card(
    ctx: Context<ClaimGiftCard>,
    amount_to_claim: Option<u64>,
) -> Result<()>
```

**What it does:**
- Allows ANY current NFT owner to claim funds to their wallet
- No merchant verification required
- Perfect for digital gift cards where users spend directly

**Use case:** Alice receives a $50 gift card NFT. She calls `claim_gift_card` and gets the USDC directly to her wallet.

#### 2. **Improved `merchant_redeem` Function** (For Merchants)
```rust
pub fn merchant_redeem(
    ctx: Context<MerchantRedeem>,
    amount_to_redeem: Option<u64>,
) -> Result<()>
```

**What it does:**
- Merchant can only redeem if they OWN the NFT (customer transferred it to them)
- Verifies the signer is the designated merchant
- Transfers funds from escrow to merchant's wallet

**Use case:** Bob has a $100 Starbucks gift card. He transfers the NFT to Starbucks' wallet, then Starbucks calls `merchant_redeem` to get the USDC.

#### 3. **Updated Status Enum**
```rust
pub enum GiftCardStatus {
    Active,
    Claimed,   // User claimed it themselves
    Redeemed,  // Merchant redeemed it
    Expired,   // Expired and burned
}
```

### Typical User Flows

#### Flow 1: Direct User Claim (No Merchant)
```
1. Issuer mints gift card → Alice
2. Alice receives NFT + escrow has USDC
3. Alice calls claim_gift_card()
4. Alice receives USDC directly
5. NFT burned, status = Claimed
```

#### Flow 2: Merchant Redemption (Physical Store)
```
1. Issuer mints gift card → Bob  
2. Bob receives NFT (e.g., $100 Starbucks card)
3. Bob goes to Starbucks store
4. Bob transfers NFT to Starbucks wallet
5. Starbucks calls merchant_redeem()
6. Starbucks receives USDC
7. NFT burned, status = Redeemed
```

#### Flow 3: Partial Claims
```
1. Alice has $100 gift card
2. Alice calls claim_gift_card(amount: $30)
3. Alice receives $30, card still active with $70 balance
4. Later, Alice claims remaining $70
5. NFT burned when balance reaches 0
```

---

## 💳 x402 Integration

### What is x402?

**x402 is an HTTP payment protocol** that enables APIs to require payment before serving content. It uses:
- HTTP 402 status code ("Payment Required")
- Stablecoin micropayments (USDC on Solana)
- No accounts or subscriptions needed
- Perfect for AI agents and autonomous payments

### Why x402 for Gift Cards?

While your **smart contract is on-chain** (doesn't need x402), you can monetize **API access** to gift card operations:

- Charge for minting gift cards via API
- Charge for premium features like batch transfers
- Charge for analytics and reporting
- Free for essential user operations (claiming)

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │  x402   │  Express API │  RPC    │   Solana    │
│  (Browser/  │ Payment │   (Node.js)  │ Calls   │  Blockchain │
│   Agent)    │────────▶│   with x402  │────────▶│  (Contract) │
└─────────────┘         └──────────────┘         └─────────────┘
```

**How it works:**
1. Client requests API endpoint (e.g., POST /api/gift-cards/mint)
2. Server responds with 402 Payment Required + payment details
3. Client pays in USDC on Solana
4. Server verifies payment on-chain
5. Server returns gift card transaction instructions
6. Client signs and submits to Solana blockchain

---

## 🚀 Setup Guide

### Prerequisites

- Node.js 18+
- Solana CLI tools
- Anchor framework
- A Solana wallet with devnet USDC

### 1. Deploy the Smart Contract

```bash
# Build the contract
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Note the program ID and update it in your code
```

### 2. Set Up the x402 API

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# PAYMENT_RECIPIENT=<your_solana_wallet_address>
```

### 3. Get Devnet USDC

```bash
# Get devnet SOL
solana airdrop 2

# Get devnet USDC from Circle's faucet
# Visit: https://faucet.circle.com/
# Select "Solana Devnet" and enter your wallet address
```

### 4. Run the API Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The API will start on `http://localhost:3000`

---

## 📖 API Usage Examples

### Mint a Gift Card ($0.10 payment required)

```bash
# First request - get payment requirements
curl -X POST http://localhost:3000/api/gift-cards/mint \
  -H "Content-Type: application/json" \
  -d '{
    "issuerWallet": "YOUR_WALLET",
    "amount": 100000000,
    "expiryTimestamp": 1735689600,
    "merchantName": "Starbucks",
    "merchantAddress": "MERCHANT_WALLET",
    "uri": "https://example.com/metadata.json"
  }'

# Response: 402 Payment Required with payment details
# Client pays 0.10 USDC via x402 protocol
# Retry request with X-Payment header
# Response: Transaction instructions for minting
```

### Claim Gift Card (FREE)

```bash
# No payment required for users to claim their cards
curl -X POST http://localhost:3000/api/gift-cards/:id/claim \
  -H "Content-Type: application/json" \
  -d '{
    "currentOwnerWallet": "YOUR_WALLET",
    "amountToClaim": null
  }'

# Returns transaction instructions immediately
```

### List User's Gift Cards ($0.005 payment required)

```bash
curl http://localhost:3000/api/gift-cards/user/YOUR_WALLET

# Requires small payment for analytics query
# Returns all gift cards owned by the wallet
```

---

## 💰 Pricing Structure

| Operation | Cost | Why? |
|-----------|------|------|
| **Mint Gift Card** | $0.10 USDC | Cover infrastructure costs |
| **Transfer Card** | $0.01 USDC | Small fee for transfers |
| **Claim Card** | FREE | Users should claim for free |
| **Merchant Redeem** | FREE | Merchants shouldn't pay |
| **List User Cards** | $0.005 USDC | Analytics query cost |
| **Get Card Details** | FREE | Basic info is free |

### Customize Pricing

Edit `x402-gift-card-api.ts`:

```typescript
const x402Config = paymentMiddleware({
  'POST /api/gift-cards/mint': {
    accepts: [{
      network: 'solana-devnet',
      amount: '100000', // Change this (0.1 USDC = 100000)
      ...
    }],
  },
});
```

---

## 🤖 AI Agent Integration (MCP Server)

You can also create an **MCP (Model Context Protocol) server** so AI agents like Claude can create and manage gift cards:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withPaymentInterceptor } from "@x402/axios";
import axios from "axios";

// Create axios client with x402 support
const client = withPaymentInterceptor(
  axios.create({ baseURL: 'http://localhost:3000' }),
  account
);

// Add tool for AI agent
server.tool(
  "create-gift-card",
  "Create a new Solana gift card",
  { amount: { type: "number" }, merchant: { type: "string" } },
  async (params) => {
    const res = await client.post('/api/gift-cards/mint', params);
    return { content: [{ type: "text", text: JSON.stringify(res.data) }] };
  }
);
```

Now Claude Desktop can autonomously create gift cards and pay for them!

---

## 🔐 Security Considerations

### Smart Contract
- ✅ PDA-based escrow (secure)
- ✅ Bump seed validation
- ✅ Ownership checks on all operations
- ✅ Expiry validation
- ⚠️ Consider adding admin pause functionality
- ⚠️ Consider partial redemption limits

### x402 API
- ✅ Payment verification via facilitator
- ✅ On-chain payment validation
- ⚠️ Add rate limiting for DOS protection
- ⚠️ Add request signing for transaction endpoints
- ⚠️ Implement proper CORS policies

### Production Checklist
- [ ] Audit smart contract code
- [ ] Test all edge cases
- [ ] Set up monitoring and alerts
- [ ] Configure proper rate limits
- [ ] Add request authentication
- [ ] Use mainnet facilitator
- [ ] Set up error logging (Sentry, etc.)

---

## 📚 Resources

### x402 Resources
- [x402 Documentation](https://x402.gitbook.io/x402)
- [Coinbase x402 Guide](https://docs.cdp.coinbase.com/x402/welcome)
- [x402 GitHub](https://github.com/coinbase/x402)
- [Solana x402 Guide](https://solana.com/developers/guides/getstarted/intro-to-x402)

### Solana Resources
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Metaplex Docs](https://docs.metaplex.com/)

### MCP Integration
- [MCP Server with x402](https://docs.cdp.coinbase.com/x402/mcp-server)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

## 🐛 Troubleshooting

### "Gift card not active" error
- Check if the card has already been claimed/redeemed
- Verify the card hasn't expired
- Ensure you're using the correct gift card account

### "Not current owner" error
- Verify you own the NFT in your wallet
- Check that the NFT hasn't been transferred
- Ensure correct wallet is signing the transaction

### "Unauthorized merchant" error
- Only the designated merchant can call `merchant_redeem`
- Verify the merchant address matches the gift card
- Consider using `claim_gift_card` if you're the user

### x402 payment failures
- Ensure you have USDC in your wallet
- Check you're on the correct network (devnet/mainnet)
- Verify facilitator is accessible
- Check payment amount matches requirement

---

## 📝 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly
4. Submit a pull request

---

## 📞 Support

- GitHub Issues: [Report bugs or request features]
- Discord: [Join the x402 Discord]
- Twitter: [@x402protocol]

---

**Built with ❤️ using Solana, Anchor, and x402**
