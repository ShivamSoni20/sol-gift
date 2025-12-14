# Quick Start

## 1) Smart Contract
- Ensure `programs/solgiftcards/src/lib.rs` includes:
  - `claim_gift_card`
  - `merchant_redeem`
  - Updated `GiftCardStatus`
- Set program ID in `declare_id!` and Anchor.toml.
- Build & deploy to devnet:

```bash
anchor build
anchor deploy --provider.cluster devnet
```

## 2) API Layer
```bash
# Install deps
cd api
npm install

# Configure env
cp .env.example .env
# Edit .env: PROGRAM_ID, PAYMENT_RECIPIENT

# Run
npm run dev
```

## 3) Test
```bash
# Health
curl http://localhost:3000/health

# Example client (Node 18+)
node examples/x402-client.ts
```

## Notes
- Keep program ID consistent across `lib.rs`, `Anchor.toml`, and `api/.env`.
- x402 facilitator: https://x402.org/facilitator
