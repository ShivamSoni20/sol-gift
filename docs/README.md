# Solana Gift Cards with x402 Integration

A Solana-based gift card system with an x402-enabled API for monetizing operations.

## Overview
- Fixed smart contract with `claim_gift_card` and `merchant_redeem`
- API layer with x402 (HTTP 402 Payment Required) for micropayments
- Examples and quick start included

## Pricing (via x402)
- Mint gift card: $0.10 USDC
- Transfer: $0.01 USDC
- Claim/Redeem: FREE
- Queries: $0.005 USDC

## Repos & Structure
```
api/                 # x402 Express API (TypeScript)
examples/            # Example client(s)
solgiftcards/        # Anchor workspace (program + web)
docs/                # This documentation
```

See QUICK_START.md for setup and run instructions.
