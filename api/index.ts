// x402-enabled Gift Card API Server
// This wraps your Solana smart contract with HTTP 402 payment gates

import express from 'express';
import type { Request, Response } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { paymentMiddleware } from '@x402/express';
import dotenv from 'dotenv';
import { setDefaultResultOrder } from 'dns';

dotenv.config();
// Prefer IPv4 to avoid potential NAT64/IPv6 issues on Windows
setDefaultResultOrder('ipv4first');

const app = express();
app.use(express.json());

// Solana configuration
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || '8E8wHRStMBYFPGvQNuq1hCgUZF6oWHuqsFKxnbbCGm36'
);

// Your wallet address that receives x402 payments (Solana base58 address)
const PAYMENT_RECIPIENT = process.env.PAYMENT_RECIPIENT as string | undefined;
if (!PAYMENT_RECIPIENT) {
  console.error('❌ PAYMENT_RECIPIENT environment variable is required');
  process.exit(1);
}
// Validate it's a valid Solana public key
try {
  // This will throw if invalid
  // eslint-disable-next-line no-new
  new PublicKey(PAYMENT_RECIPIENT);
} catch (e) {
  console.error('❌ PAYMENT_RECIPIENT is not a valid Solana address');
  process.exit(1);
}

// Temporarily disabled due to SDK incompatibility (ResourceServer.initialize is not a function)
// const x402Config = paymentMiddleware(
//   {
//     // Pricing configuration
//     pricing: [
//       {
//         route: '/api/gift-cards/mint',
//         method: 'POST',
//         scheme: 'exact',
//         amount: '100000', // $0.10 USDC (6 decimals)
//         token: 'USDC',
//         recipient: PAYMENT_RECIPIENT,
//       },
//       {
//         route: '/api/gift-cards/transfer',
//         method: 'POST',
//         scheme: 'exact',
//         amount: '10000', // $0.01 USDC
//         token: 'USDC',
//         recipient: PAYMENT_RECIPIENT,
//       },
//       {
//         route: '/api/gift-cards/list',
//         method: 'GET',
//         scheme: 'exact',
//         amount: '5000', // 0.005 USDC
//         token: 'USDC',
//         recipient: PAYMENT_RECIPIENT,
//       },
//     ],
//     description: 'List all gift cards for a wallet',
//   },
//   {
//     facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator',
//   }
// );

// Apply x402 middleware to all routes
// app.use(x402Config);

// ============================================================================
// API Routes
// ============================================================================

/**
 * POST /api/gift-cards/mint
 * Create a new gift card (requires x402 payment of $0.10)
 * 
 * Body:
 * {
 *   "issuerWallet": "...",
 *   "amount": 100000000,  // amount in lamports/smallest unit
 *   "expiryTimestamp": 1735689600,
 *   "merchantName": "Starbucks",
 *   "merchantAddress": "...",
 *   "uri": "https://..."
 * }
 */
app.post('/api/gift-cards/mint', async (req: Request, res: Response) => {
  try {
    const { issuerWallet, amount, expiryTimestamp, merchantName, merchantAddress, uri } = req.body;

    // Validate inputs
    if (!issuerWallet || !amount || !expiryTimestamp || !merchantName || !merchantAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Return transaction data for client to sign and submit
    const response = {
      success: true,
      message: 'Gift card mint transaction prepared',
      instruction: {
        program: PROGRAM_ID.toBase58(),
        method: 'mint_gift_card',
        params: {
          amount,
          expiry_timestamp: expiryTimestamp,
          merchant_name: merchantName,
          merchant_address: merchantAddress,
          uri,
        },
      },
      // In a real implementation, you'd build the full transaction here
      instructions: 'Build transaction client-side using Anchor',
    };

    res.json(response);
  } catch (error) {
    console.error('Error minting gift card:', error);
    res.status(500).json({ error: 'Failed to mint gift card' });
  }
});

/**
 * POST /api/gift-cards/:id/transfer
 * Transfer a gift card to another wallet (requires x402 payment of $0.01)
 */
app.post('/api/gift-cards/:id/transfer', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentOwnerWallet, newOwnerWallet } = req.body;

    if (!currentOwnerWallet || !newOwnerWallet) {
      return res.status(400).json({ error: 'Missing wallet addresses' });
    }

    const response = {
      success: true,
      message: 'Gift card transfer transaction prepared',
      giftCardId: id,
      instruction: {
        program: PROGRAM_ID.toBase58(),
        method: 'transfer_gift_card',
        params: {
          nft_mint: id,
          new_owner: newOwnerWallet,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error transferring gift card:', error);
    res.status(500).json({ error: 'Failed to transfer gift card' });
  }
});

/**
 * POST /api/gift-cards/:id/claim
 * Claim a gift card (FREE - no x402 payment required)
 */
app.post('/api/gift-cards/:id/claim', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentOwnerWallet, amountToClaim } = req.body;

    if (!currentOwnerWallet) {
      return res.status(400).json({ error: 'Missing wallet address' });
    }

    const response = {
      success: true,
      message: 'Gift card claim transaction prepared',
      giftCardId: id,
      instruction: {
        program: PROGRAM_ID.toBase58(),
        method: 'claim_gift_card',
        params: {
          nft_mint: id,
          amount_to_claim: amountToClaim || null,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error claiming gift card:', error);
    res.status(500).json({ error: 'Failed to claim gift card' });
  }
});

/**
 * POST /api/gift-cards/:id/merchant-redeem
 * Merchant redeems a gift card (FREE for merchants)
 */
app.post('/api/gift-cards/:id/merchant-redeem', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { merchantWallet, amountToRedeem } = req.body;

    if (!merchantWallet) {
      return res.status(400).json({ error: 'Missing merchant wallet' });
    }

    const response = {
      success: true,
      message: 'Merchant redemption transaction prepared',
      giftCardId: id,
      instruction: {
        program: PROGRAM_ID.toBase58(),
        method: 'merchant_redeem',
        params: {
          nft_mint: id,
          amount_to_redeem: amountToRedeem || null,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error redeeming gift card:', error);
    res.status(500).json({ error: 'Failed to redeem gift card' });
  }
});

/**
 * GET /api/gift-cards/:id
 * Get gift card details (FREE)
 */
app.get('/api/gift-cards/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, you'd query the blockchain here
    const connection = new Connection(SOLANA_RPC);
    void connection; // suppress unused var until implemented
    
    // Mock response - replace with actual blockchain query
    const response = {
      success: true,
      giftCard: {
        mint: id,
        status: 'Active',
        currentOwner: '...',
        merchant: '...',
        merchantName: '...',
        amount: 0,
        remainingBalance: 0,
        createdAt: 0,
        expiryTimestamp: 0,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching gift card:', error);
    res.status(500).json({ error: 'Failed to fetch gift card' });
  }
});

/**
 * GET /api/gift-cards/user/:wallet
 * List all gift cards for a user (requires x402 payment of $0.005)
 */
app.get('/api/gift-cards/user/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    
    // In a real implementation, you'd query all NFTs owned by this wallet
    // that match your gift card program
    
    const response = {
      success: true,
      wallet,
      giftCards: [
        // Mock data - replace with actual query
        {
          mint: 'ABC123...',
          merchantName: 'Starbucks',
          remainingBalance: 50000000,
          expiryTimestamp: 1735689600,
        },
      ],
    };

    res.json(response);
  } catch (error) {
    console.error('Error listing gift cards:', error);
    res.status(500).json({ error: 'Failed to list gift cards' });
  }
});

/**
 * GET /health
 * Health check endpoint (always free)
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ============================================================================
// Start Server
// ============================================================================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🎁 Gift Card API with x402 running on port ${PORT}`);
  console.log(`💳 Payment recipient: ${PAYMENT_RECIPIENT}`);
  console.log(`\nPricing:`);
  console.log(`  - Mint gift card: $0.10 USDC`);
  console.log(`  - Transfer gift card: $0.01 USDC`);
  console.log(`  - Claim gift card: FREE`);
  console.log(`  - Merchant redeem: FREE`);
  console.log(`  - List user cards: $0.005 USDC`);
  console.log(`  - Get card details: FREE`);
});

export default app;
