# Forecast Analysis — Live Data Sourcing Workflow

**Run this checklist for every instrument before filling `forecast-analysis-template.mdx`.**  
If any field cannot be reliably sourced, write `[DATA UNAVAILABLE: reason]` in the draft and do not invent a number.

---

## Step 0 — Select instrument & verify site coverage

1. Pick instrument from the daily subagent rotation (forex, commodity, index, or crypto).
2. Grep `src/lib/data/forecasts.ts` and `.cursor/agents/references/internal-links.md` for existing slugs/keywords — avoid duplicating a primary keyword already targeted.
3. Note `category`: `forex` | `crypto` | `commodities` | `indices` | `stocks`.

---

## Step 1 — Price & session range (required)

| Field | Where to source | Maps to template token |
|-------|-----------------|------------------------|
| Current price | Yahoo chart API, CoinGecko, Frankfurter, Finnhub | `{{CURRENT_PRICE}}` |
| Session/day high | Same source `regularMarketDayHigh` or 24h high | `{{SESSION_HIGH}}` |
| Session/day low | Same source `regularMarketDayLow` or 24h low | `{{SESSION_LOW}}` |
| % change vs prior close | Compute from source close fields | `{{SESSION_CHANGE_PCT}}` |
| Source URL + timestamp | Log in frontmatter `dataSources` or run notes | `{{PRICE_SOURCE}}` |

### Approved APIs (repo)

| Instrument type | Primary source | Symbol / endpoint |
|-----------------|----------------|-------------------|
| Gold, silver, oil | Yahoo Finance | `GC=F`, `SI=F`, `BZ=F`, `CL=F` |
| Indices | Yahoo / Finnhub | `^GSPC`, `^NDX`, `SPY` |
| Crypto | CoinGecko | `bitcoin`, `ethereum` |
| FX | Frankfurter ECB fix | `fetchLatestRates("USD", ["EUR","JPY",...])` |
| Headlines | Wire news | `src/lib/api/wire-news.ts` |

**Cross-check:** Compare primary price against a second live source (web search headline quote, Investing.com, FXStreet). If quotes differ by >0.5%, note the spread and use the exchange/trading-hours-appropriate figure.

---

## Step 2 — Chart context (required, words not image)

Describe the last 5–10 sessions using sourced OHLC/closes:

- Trending up / down / ranging / reversing?
- Recent swing high and swing low (exact prices from chart data)
- Is price above or below a cited moving average?

| Field | Maps to token |
|-------|---------------|
| 5–10 session narrative | `{{CHART_CONTEXT}}` |
| Recent swing high | `{{SWING_HIGH}}` |
| Recent swing low | `{{SWING_LOW}}` |

---

## Step 3 — Support & resistance levels (required)

Each level must trace to Step 1 or Step 2 data:

| Level type | Typical source |
|------------|----------------|
| Session high/low | Day range from Step 1 |
| Prior day high/low | Previous bar from Yahoo `high`/`low` array |
| Swing high/low | Max/min of last N closes or highs/lows |
| Round numbers | Only when price is within ~1% (e.g. 4100, 4000) |
| Moving average | Cite platform (e.g. "50-DMA near $X per [source]") |

| Field | Maps to token |
|-------|---------------|
| Resistance 1 (nearest) | `{{RESISTANCE_1}}` |
| Resistance 2 (major) | `{{RESISTANCE_2}}` |
| Support 1 (nearest) | `{{SUPPORT_1}}` |
| Support 2 (major) | `{{SUPPORT_2}}` |
| Pivot / equilibrium | `{{PIVOT_LEVEL}}` |

---

## Step 4 — Indicator signals (required, at least one)

Source or derive from current setup — **never copy stale training values**.

| Indicator | Acceptable sources |
|-----------|-------------------|
| RSI (14) | TradingView snapshot, broker analysis with date, or compute from downloaded closes |
| Moving averages | Quote 20/50/200-DMA level + whether price is above/below |
| MACD | State bullish/bearish/neutral + histogram direction if sourced |

| Field | Maps to token |
|-------|---------------|
| Primary indicator + reading | `{{INDICATOR_PRIMARY}}` |
| What it implies | `{{INDICATOR_INTERPRETATION}}` |
| Secondary (optional) | `{{INDICATOR_SECONDARY}}` |

If RSI/MA cannot be verified, write: *"RSI reading unavailable from primary API; defer to price structure at {{SUPPORT_1}} / {{RESISTANCE_1}}."*

---

## Step 5 — Fundamental catalyst (required)

| Field | Requirement | Maps to token |
|-------|-------------|---------------|
| Headline event | Real news from today or this session | `{{CATALYST_HEADLINE}}` |
| Why it matters | 2–3 sentences linking catalyst → price | `{{CATALYST_IMPACT}}` |
| Next scheduled data | Economic calendar event with **date** | `{{UPCOMING_EVENT}}` |
| Source | Publication + URL | `{{CATALYST_SOURCE}}` |

Use web search or wire headlines. Cross-check date matches `{{DATE}}`.

---

## Step 6 — SEO tokens (fill last)

| Token | Rule |
|-------|------|
| `{{PRIMARY_KEYWORD}}` | `[instrument] forecast today` or `[instrument] price analysis` |
| `{{SECONDARY_KEYWORD_1}}` | LSI variant (e.g. `XAUUSD technical analysis`) |
| `{{SECONDARY_KEYWORD_2}}` | Level-focused (e.g. `gold support resistance`) |
| `{{INSTRUMENT_SLUG}}` | Lowercase hyphenated (`xauusd`, `eur-usd`, `sp500`) |
| `{{ANGLE}}` | 1–3 words (`Gold Price`, `Euro Dollar`, `Index`) |
| Internal links | Only paths listed in `internal-links.md` |

---

## Step 7 — Quality gate (before save)

- [ ] Every number in the article appears in Steps 1–4 notes
- [ ] 800–1,100 words (update `wordCount` in frontmatter)
- [ ] Primary keyword in title, description, H1, first 100 words, one H2
- [ ] 1–2 verified internal links
- [ ] One `[CHART: ...]` placeholder with specific levels
- [ ] Bullish/bearish scenarios use conditional framing ("if price breaks…")
- [ ] Disclaimer present
- [ ] No buy/sell directives

---

## Output paths

| File | Purpose |
|------|---------|
| `content/templates/forecast-analysis-template.mdx` | Reusable fill-in template |
| `content/drafts/forecasts/[slug].mdx` | Daily subagent output (5 per run) |
| `content/articles/[slug].mdx` | Worked examples / reference articles only |

Production forecasts publish to KV via `scripts/publish-forecast-drafts.mjs` — not from `content/articles/` directly.
