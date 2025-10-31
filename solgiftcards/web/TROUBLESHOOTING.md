# 🔧 Troubleshooting: Money Not Being Deducted/Added

## Issue: Transactions Not Using Real USDC

If you're seeing demo mode instead of real transactions, follow these steps:

---

## Step 1: Check Console Logs

When you click "Mint Gift Card", check the browser console for:

### ✅ **Good (Real Mode):**
```
🔍 Debug Info:
- publicKey: ABC123...
- anchorWallet: Available ✅
- useRealTransactions: true
🎁 Minting REAL gift card with USDC...
```

### ❌ **Bad (Demo Mode):**
```
🔍 Debug Info:
- publicKey: ABC123...
- anchorWallet: NOT Available ❌
- useRealTransactions: true
❌ Anchor wallet not available!
⚠️ Using DEMO mode - no real USDC transaction
```

---

## Step 2: Fix Anchor Wallet Issue

If you see "anchorWallet: NOT Available ❌", the issue is that `useAnchorWallet()` is not working.

### **Solution: Verify Wallet Adapter Version**

The `useAnchorWallet` hook requires specific wallet adapter versions.

**Check your versions:**
```json
"@solana/wallet-adapter-react": "^0.15.35"
"@coral-xyz/anchor": "^0.30.1"
```

**If different, update:**
```bash
cd web
npm install @solana/wallet-adapter-react@latest @coral-xyz/anchor@latest
```

---

## Step 3: Verify Wallet Connection

### **Make sure:**
1. ✅ Wallet is connected (you see your address)
2. ✅ You're on Devnet (check Phantom settings)
3. ✅ You have USDC in wallet
4. ✅ You have SOL for fees

### **Test Connection:**
Open browser console and run:
```javascript
// Check if wallet is connected
console.log("Connected:", window.solana?.isConnected);
console.log("PublicKey:", window.solana?.publicKey?.toString());
```

---

## Step 4: Alternative Solution - Use Direct Wallet

If `useAnchorWallet()` still doesn't work, we can modify the code to use the wallet directly.

I can update the code to work without `useAnchorWallet` if needed.

---

## Step 5: Verify You Have Devnet USDC

Even if the wallet connects, you need USDC to test:

### **Get Devnet SOL:**
```bash
solana airdrop 2 --url devnet
```

### **Get Devnet USDC:**
Visit: https://spl-token-faucet.com/?token-name=USDC-Dev

Or use this devnet USDC faucet:
```
https://faucet.circle.com/ (for USDC)
```

### **Check Balance in Phantom:**
1. Switch to Devnet
2. You should see USDC balance
3. If not, use faucet above

---

## Step 6: Test with Console Commands

Try this in browser console to test if Anchor works:

```javascript
import { AnchorProvider } from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

// This should not be undefined
const wallet = useAnchorWallet();
console.log("Anchor Wallet:", wallet);
```

---

## Common Issues & Solutions

### Issue 1: "Anchor wallet not available"
**Cause:** `useAnchorWallet()` returning undefined  
**Solution:** 
- Reconnect wallet
- Refresh page
- Clear browser cache
- Update wallet adapter packages

### Issue 2: "Transaction failed"
**Cause:** Insufficient funds or wrong network  
**Solution:**
- Check you're on Devnet
- Verify USDC balance
- Verify SOL balance (for fees)

### Issue 3: "Demo mode" always
**Cause:** Code falling back to demo  
**Solution:**
- Check `useRealTransactions` is true
- Verify `anchorWallet` is available
- See Step 4 for alternative solution

---

## Quick Test Checklist

Before minting, verify:

- [ ] Wallet connected (see address in UI)
- [ ] On Devnet network
- [ ] Have USDC in wallet (check Phantom)
- [ ] Have SOL for fees (at least 0.01 SOL)
- [ ] Console shows "anchorWallet: Available ✅"
- [ ] Console shows "🎁 Minting REAL gift card"
- [ ] NOT seeing "⚠️ Demo mode"

---

## If Still Not Working

**Tell me what you see in the console when you click "Mint Gift Card":**

1. Does it say "anchorWallet: Available ✅" or "NOT Available ❌"?
2. Does it say "🎁 Minting REAL gift card" or "⚠️ Demo mode"?
3. Any error messages?

**Then I can provide a specific fix for your situation!**

---

## Alternative: Force Real Mode

If you want to bypass the check temporarily for testing, I can modify the code to always use real transactions regardless of anchor wallet status.

Let me know what the console shows and I'll fix it! 🔧
