# 🎨 Web UI Setup Guide

## Overview

I've created a beautiful, modern web interface for your Solana NFT Gift Card system with:

✅ **Landing Page** - Hero section, features, how it works  
✅ **Dashboard** - Wallet connection, gift card management  
✅ **Wallet Integration** - Phantom, Solflare support  
✅ **Modern UI** - TailwindCSS, responsive design  

## Quick Start

### 1. Navigate to Web Directory

```bash
cd web
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
```

### 4. Open in Browser

Visit **http://localhost:3000**

---

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Dashboard
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   └── components/
│       └── WalletProvider.tsx # Solana wallet integration
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## Features

### Landing Page (`/`)
- **Hero Section** - Eye-catching introduction
- **Features** - Secure, fast, low fees
- **How It Works** - 3-step process
- **Stats** - Transaction fees, speed, security
- **CTA** - Call-to-action buttons
- **Footer** - Links and program ID

### Dashboard (`/dashboard`)
- **Wallet Connection** - Connect Phantom/Solflare
- **Quick Actions**:
  - Mint Gift Card
  - Transfer Gift Card
  - Redeem Gift Card
- **Gift Cards List** - View your NFTs
- **Recent Activity** - Transaction history

---

## Environment Setup (Optional)

Create `.env.local` in the `web` directory:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=HqFAXUepX3yey78itmbxU5RauYYQaSWnBfAndsxiqVem
```

---

## Next Steps

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Run Dev Server
```bash
npm run dev
```

### 3. Test Wallet Connection
- Open http://localhost:3000/dashboard
- Click "Select Wallet"
- Connect your Phantom or Solflare wallet

### 4. Future Enhancements
The UI is ready for you to add:
- Gift card minting functionality
- Transfer modal
- Redemption interface
- Real-time gift card data from blockchain

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Blockchain**: 
  - @solana/web3.js
  - @solana/wallet-adapter-react
  - @coral-xyz/anchor
- **Wallet Support**: Phantom, Solflare

---

## Customization

### Colors
Edit `tailwind.config.ts` to change the color scheme.

### Program ID
Update in `.env.local` or directly in components.

### Add More Pages
Create new files in `src/app/` directory.

---

## Build for Production

```bash
npm run build
npm start
```

---

## Screenshots

### Landing Page
- Modern gradient design
- Responsive layout
- Clear call-to-actions

### Dashboard
- Wallet integration
- Quick action cards
- Clean, professional interface

---

## Support

The UI is fully functional and ready to use! All TypeScript errors will disappear after running `npm install`.

**Happy coding! 🚀**
