# Trading 100

Financial markets content website — live prices, news, forecasts, and trading education.

**Domain:** trading100.com

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + shadcn/ui components
- TradingView embed widgets (ticker, charts, economic calendar)
- CoinGecko, Frankfurter, Finnhub APIs
- Deployed to Cloudflare Pages via `@cloudflare/next-on-pages`

## Getting Started

```bash
cp .env.example .env.local
# Add FINNHUB_API_KEY for external news headlines (optional)

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site URL (default: https://trading100.com) |
| `FINNHUB_API_KEY` | No | External market news headlines |
| `MARKETAUX_API_KEY` | No | Optional news supplement |
| `FRED_API_KEY` | No | Optional economic indicator data |

## Deploy to Cloudflare Pages

```bash
npm run pages:build
npm run pages:deploy
```

Set environment variables in the Cloudflare Pages dashboard under **Settings → Environment variables**.

> **Note:** `@cloudflare/next-on-pages` is deprecated in favor of [OpenNext Cloudflare](https://opennext.js.org/cloudflare). Consider migrating before production launch.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with ticker, featured news, market tables |
| `/markets` | Markets hub with asset class tabs |
| `/markets/[asset-class]/[symbol]` | Individual instrument page |
| `/news` | News listing (original + Finnhub headlines) |
| `/news/[slug]` | Article page |
| `/forecasts` | Forecast articles |
| `/education` | Trading guides |
| `/tools/economic-calendar` | Economic calendar widget |
| `/tools/currency-converter` | Frankfurter-powered converter |

## Legal

Disclaimer, privacy policy, and terms pages are **DRAFT** placeholders — have reviewed by a lawyer before launch.
