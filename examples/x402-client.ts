// Minimal example client for the x402 Gift Card API
// Requires Node 18+ (global fetch)

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function health() {
  const res = await fetch(`${BASE_URL}/health`);
  console.log('Health:', await res.json());
}

async function tryMint() {
  const res = await fetch(`${BASE_URL}/api/gift-cards/mint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      issuerWallet: 'YOUR_WALLET',
      amount: 100000000,
      expiryTimestamp: 1735689600,
      merchantName: 'Starbucks',
      merchantAddress: 'MERCHANT_WALLET',
      uri: 'https://example.com/metadata.json',
    }),
  });

  if (res.status === 402) {
    console.log('Payment Required (x402):');
    console.log(await res.text());
    return;
  }

  console.log('Mint response:', await res.json());
}

(async () => {
  await health();
  await tryMint();
})();
