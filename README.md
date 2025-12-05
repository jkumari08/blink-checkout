# BlinkShop

**Instant social commerce on Solana.** Merchants create products. Buyers purchase directly from social media posts without leaving their feed. Payments settle in 400ms.


---

## Table of Contents
1. [Project Description](#project-description)
2. [Team](#team)
3. [Setup & Installation](#setup--installation)
4. [Architecture](#architecture)
5. [Tech Stack](#tech-stack)
6. [Features](#features)
7. [Merchant Features](#merchant-features)
8. [How to Use](#how-to-use)

---

## Project Description

BlinkShop is a two-sided social commerce platform:

**Merchants** create shareable product cards (Blinks) in seconds - no website needed.

**Buyers** click a Blink on X, Discord, or Reddit → select a token → approve → done in 400ms. No leaving the platform.

**Why it matters:**
- Traditional e-commerce: See post → Click link → Navigate website → Checkout → Wait days → Merchant loses 2-3% + $0.30
- BlinkShop: Click → Approve → Done in 400ms on Solana at $0.001/tx

---

## Team

**Team Name:** BlinkShop  
**Track:** Solana Main Track
**Bounty:** Circle  
**Team Members:** 
- Jagrati Kumari (Full-Stack Blockchain Engineer)
- Smarika Koirala (Creative Director)

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- Git
- A Solana wallet (Phantom, Solflare, Torus, or Ledger)

### Install & Run

```bash
git clone https://github.com/jkumari08/blink-checkout.git
cd blink-checkout
npm install
npm run dev
```

Open `http://localhost:8081` and connect your wallet.

### Get Devnet Tokens
- **SOL:** https://faucet.solana.com/
- **USDC/USDT:** https://spl-token-faucet.vercel.app/

### Test Flow
1. **Create Product:** Go to "Create Blink" → Fill form (name, description, price 5 USDC, image) → Generate link
2. **Purchase:** Switch to another wallet → Click the product link → Select token → Approve in wallet
3. **Verify:** Click Explorer link to see transaction on https://explorer.solana.com/?cluster=devnet

---

## Architecture

### System Design

```
Frontend (React)
    ↓
Web3 Layer (Web3.js + useMultiTokenTransaction)
    ↓
Solana Blockchain (Devnet)
    ├─ Token Transfers (SOL/USDC/USDT)
    ├─ Anchor Program (BlinkPaymentTracker)
    └─ RPC: https://api.devnet.solana.com
    ↓
External Services
    ├─ Circle APIs (Wallets, Payments, Settlement, Bridge)
    └─ Solana Explorer
```

### Data Flow
```
1. Merchant fills form → generates Blink URL
2. Buyer clicks Blink on social media
3. App loads product (BlinkPreview component)
4. Buyer selects token (SOL/USDC/USDT)
5. Clicks "Buy Now"
6. useMultiTokenTransaction hook creates transaction
7. Wallet signs
8. Transaction broadcast to devnet
9. Anchor program records payment on-chain
10. Circle settles funds
11. Success message with Explorer link

⏱️ Total: ~400ms
```

### File Structure

```
src/
├── components/
│   ├── BlinkPreview.tsx       # Product display + payment UI
│   ├── CreateBlink.tsx        # Product creation form
│   ├── Navbar.tsx             # Wallet connection
│   └── ui/                    # 30+ shadcn components
├── hooks/
│   └── useMultiTokenTransaction.ts  # Payment processor
├── lib/
│   ├── anchor-program.ts      # On-chain recording
│   ├── circle-advanced.ts     # Circle APIs
│   └── utils.ts
├── pages/
│   ├── Index.tsx              # Home
│   └── CreateBlink.tsx        # Product creation
└── App.tsx
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Blockchain** | Solana Web3.js, Anchor Framework |
| **Wallets** | Phantom, Solflare, Torus, Ledger |
| **Tokens** | SOL (native), USDC, USDT (SPL) |
| **Payments** | Circle APIs (all 4) |
| **UI** | Tailwind CSS, shadcn/ui |
| **Network** | Solana Devnet |

---

## Features

### Core Features
✅ Multi-token payments (SOL, USDC, USDT)  
✅ 4 wallet support  
✅ Real devnet transactions  
✅ On-chain payment recording (Anchor)  
✅ Circle Payments integration  
✅ Mobile responsive  
✅ Zero TypeScript errors  
✅ 400ms settlement  

### Merchant Features
✅ **Bulk Product Upload** - Import 1-1000+ products via CSV/JSON with batch processing, progress tracking, and error handling  
✅ **Social Sharing** - Pre-written templates for Twitter, Discord, and Telegram with one-click sharing and platform-specific analytics  
✅ **Transaction History** - Track all buyer transactions with timestamps, amounts, tokens, and statuses  
✅ **Wishlist/Favorites** - Buyers can save products for later viewing and sharing  
✅ **Review System** - Customers can rate and review products with detailed feedback

---

## Merchant Features

### Bulk Product Upload (`/bulk-upload`)
Import multiple products at once using CSV or JSON files:
- **Drag-and-drop interface** - Drop CSV/JSON files or click to select
- **Auto-detection** - Automatically detects file format
- **Batch processing** - Upload 1-1000+ products in one go
- **Validation** - Real-time row-by-row validation with specific error messages
- **Progress tracking** - Visual progress bar showing upload percentage
- **Error handling** - Download error CSV to fix and retry
- **Product preview** - See all uploaded products in a grid view

**CSV Format:**
```csv
title,description,price,image_url
Red Running Shoes,Premium athletic footwear,$49.99,https://images.unsplash.com/...
Premium Yoga Mat,High-quality yoga mat for workouts,$24.99,https://images.unsplash.com/...
```

### Social Sharing (`/social-sharing`)
Share products on social media with pre-written templates:
- **Platform templates** - Optimized for Twitter (280 chars), Discord (embeds), Telegram
- **One-click sharing** - Opens native share dialogs for each platform
- **Copy-to-clipboard** - Manual sharing option for any platform
- **Analytics dashboard** - Track shares, clicks, and conversions per product per platform
- **Conversion tracking** - URL parameters automatically track which platform drove conversions
- **Per-platform metrics** - See conversion rates and engagement by platform

### Transaction History (`/transactions`)
Complete record of all product sales:
- **Timestamp** - When the transaction occurred
- **Product** - Which product was purchased
- **Amount** - Sale amount in selected token
- **Token type** - SOL, USDC, or USDT
- **Status** - Transaction status (confirmed/pending)
- **Buyer wallet** - Wallet address of buyer
- **Explorer link** - Click to view transaction on Solana Explorer

### Wishlist (`/wishlist`)
Customers can save favorite products:
- **Save for later** - Add products to personal wishlist
- **Share list** - Generate unique links to share wishlists with friends
- **Quick checkout** - One-click purchase from wishlist
- **Price alerts** - Optional notifications if product prices change
---

## How to Use

### For Merchants
1. **Create Products** - Go to "Create Blink" and add individual products
2. **Bulk Upload** - Or use "Bulk Upload" to import many products at once via CSV/JSON
3. **Share Socially** - Navigate to "Social Sharing" to generate templates
4. **Choose Platform** - Select Twitter, Discord, or Telegram
5. **Copy or Share** - Copy template text or click "Share on [Platform]"
6. **Track Performance** - View analytics dashboard to see shares, clicks, and conversions per platform

### For Buyers
1. **Browse Products** - See products on social media (X, Discord, Reddit)
2. **Click Blink** - Click the product link from any social platform
3. **Select Token** - Choose payment token (SOL, USDC, or USDT)
4. **Approve** - Approve transaction in your wallet
5. **Done** - Purchase completes in ~400ms
6. **Save & Review** - Add to wishlist and leave reviews for future buyers

---

## Token Mints (Devnet)

```
SOL:  Native
USDC: EPjFWaLb3odccccccccccccccccccccccccPEKjAxm
USDT: Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenEqw
```

---

## GitHub

https://github.com/jkumari08/blink-shop

## Demo Video

https://youtu.be/owRuzVE6FGk

## X URL

https://x.com/blinkshop2025

## Pitch Deck
https://docs.google.com/presentation/d/1iAU-e5TLH_vXD3cdvRx53mIWZP5rfrZ570EpBEEDing/edit?usp=sharing

