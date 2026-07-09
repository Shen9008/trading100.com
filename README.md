# Trading 100

Financial markets content website — live prices, news, forecasts, and trading education.

**Domain:** trading100.com

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + shadcn/ui components
- TradingView embed widgets (ticker, charts, economic calendar)
- CoinGecko, Frankfurter, Finnhub APIs
- Deployed to Cloudflare Workers via [OpenNext Cloudflare](https://opennext.js.org/cloudflare)

## Getting Started

```bash
cp .env.example .env.local
# Add FINNHUB_API_KEY for wire headlines (optional)
# Add CRON_SECRET for daily forecast cron (production)

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site URL (default: https://trading100.com) |
| `FINNHUB_API_KEY` | No | Wire headlines + S&P proxy quotes for auto-forecasts |
| `CRON_SECRET` | Prod | Bearer token for `POST /api/cron/daily-forecasts` |
| `NEWSAPI_API_KEY` | Yes* | Primary source for auto-posted market news |
| `MARKETAUX_API_KEY` | No | Fallback news source if NewsAPI unavailable |
| `FRED_API_KEY` | No | Optional economic indicator data |

## Deploy to Cloudflare Workers

```bash
npm run deploy
```

Set secrets on the Worker (not plain vars):

```bash
npx wrangler secret put NEWSAPI_API_KEY
npx wrangler secret put MARKETAUX_API_KEY
npx wrangler secret put FINNHUB_API_KEY
npx wrangler secret put CRON_SECRET
```

### Daily auto-forecasts

A GitHub Actions workflow (`.github/workflows/daily-forecasts.yml`) calls the cron API at 06:00 UTC. Add these in your GitHub repo:

- **Secret:** `CRON_SECRET` — same value as the Worker secret
- **Variable (optional):** `SITE_URL` — defaults to `https://trading100.spartasoftofficial.workers.dev`

Generated drafts are stored in Cloudflare KV (`FORECASTS_KV`) and merged with hand-written forecasts on `/forecasts` and the homepage.

Manual trigger:

```bash
curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://trading100.spartasoftofficial.workers.dev/api/cron/daily-forecasts
```

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
