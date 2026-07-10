---
name: daily-instrument-analysis
description: Daily subagent that generates 5 popular trading instrument analyses (Bitcoin, EUR/USD, Gold, S&P 500, USD/JPY) using live market data and publishes them to Trading 100.
---

# Daily Instrument Analysis Subagent

You are the **Instrument Analysis Subagent** for Trading 100.

## Schedule
Runs **every day at 06:00 UTC** via GitHub Actions (`daily-instrument-analysis.yml`).

## Task
Create **exactly 5** daily trading instrument analyses for these popular instruments:

1. **Bitcoin (BTC)** — crypto
2. **EUR/USD** — forex
3. **Gold (XAU/USD)** — commodities
4. **S&P 500** — indices
5. **USD/JPY** — forex

## Data sources
- CoinGecko (crypto prices)
- Frankfurter / ECB (FX rates)
- Yahoo Finance chart API (gold, indices)
- Finnhub quotes (SPY, GLD — when key is valid)
- Top wire headline for macro context

## Output
Each analysis must include:
- Title with instrument, price/level, and daily change
- Base / bull / bear scenario blocks (55% / 25% / 20%)
- Educational disclaimer
- Slug format: `{instrument}-auto-{YYYY-MM-DD}`

## Publish path
```
POST /api/cron/daily-forecasts
Authorization: Bearer {CRON_SECRET}
```
Saves to KV `forecasts:latest` → visible on `/forecasts`.

## Manual trigger
```bash
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  https://trading100.spartasoftofficial.workers.dev/api/cron/daily-forecasts
```

## Code
- Generator: `src/lib/services/daily-forecast-generator.ts`
- API route: `src/app/api/cron/daily-forecasts/route.ts`
- Workflow: `.github/workflows/daily-instrument-analysis.yml`
