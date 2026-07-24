import type { Article, ArticleCategory } from "@/lib/data/articles";
import { STOCK_IMAGES } from "@/lib/constants/images";
import type { DailyInstrumentId } from "@/lib/forecasts/instrument-rotation";
import {
  type MarketSnapshot,
  describeMovingAverages,
  describeRsi,
  describeTrend,
  formatMarketPrice,
} from "@/lib/services/market-analysis";

const IMAGES: Record<string, string> = {
  crypto: STOCK_IMAGES.crypto,
  forex: STOCK_IMAGES.forex,
  indices: STOCK_IMAGES.indices,
  commodities: STOCK_IMAGES.gold,
};

const SLUG_PREFIX: Record<DailyInstrumentId, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  "eur-usd": "eur-usd",
  "gbp-usd": "gbp-usd",
  "usd-jpy": "usd-jpy",
  "aud-usd": "aud-usd",
  "gold-xauusd": "gold-xauusd",
  "silver-xagusd": "silver-xagusd",
  "brent-crude": "brent-crude",
  sp500: "sp500",
  "nasdaq-100": "nasdaq-100",
};

const TITLES: Record<DailyInstrumentId, string> = {
  bitcoin: "Bitcoin Forecast Today: BTC Price Analysis & Key Levels",
  ethereum: "Ethereum Forecast Today: ETH Price Analysis & Key Levels",
  "eur-usd": "EUR/USD Forecast Today: Euro Dollar Analysis & Key Levels",
  "gbp-usd": "GBP/USD Forecast Today: Cable Analysis & Key Levels",
  "usd-jpy": "USD/JPY Forecast Today: Yen Analysis & Key Levels",
  "aud-usd": "AUD/USD Forecast Today: Aussie Dollar Analysis & Key Levels",
  "gold-xauusd": "XAUUSD Forecast Today: Gold Price Analysis & Key Levels",
  "silver-xagusd": "XAGUSD Forecast Today: Silver Price Analysis & Key Levels",
  "brent-crude": "Brent Crude Forecast Today: Oil Price Analysis & Key Levels",
  sp500: "S&P 500 Forecast Today: Index Analysis & Key Levels",
  "nasdaq-100": "Nasdaq 100 Forecast Today: Index Analysis & Key Levels",
};

const CATEGORY: Record<DailyInstrumentId, ArticleCategory> = {
  bitcoin: "crypto",
  ethereum: "crypto",
  "eur-usd": "forex",
  "gbp-usd": "forex",
  "usd-jpy": "forex",
  "aud-usd": "forex",
  "gold-xauusd": "commodities",
  "silver-xagusd": "commodities",
  "brent-crude": "commodities",
  sp500: "indices",
  "nasdaq-100": "indices",
};

const WORD_COUNT_MIN = 950;

function fp(snapshot: MarketSnapshot, value: number): string {
  return formatMarketPrice(
    value,
    snapshot.priceDecimals,
    snapshot.pricePrefix,
    snapshot.priceSuffix
  );
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isForexInstrument(id: DailyInstrumentId): boolean {
  return (
    id === "eur-usd" ||
    id === "gbp-usd" ||
    id === "usd-jpy" ||
    id === "aud-usd"
  );
}

function buildLearningGoals(id: DailyInstrumentId, dateLabel: string): string {
  const goals: Record<DailyInstrumentId, string> = {
    bitcoin: `You will learn where BTC sits inside its recent swing range on ${dateLabel}, which levels matter on the daily chart, how ETF flow and yield context typically interact with spot, and what conditional bullish versus bearish scenarios look like into the next US data window.`,
    ethereum: `This analysis maps ETH's session structure on ${dateLabel}, compares momentum to typical Bitcoin beta, highlights layer-2 and staking-sensitive catalysts, and outlines support/resistance scenarios for the rest of the week.`,
    "eur-usd": `You will see how EUR/USD is positioned versus the ECB–Fed policy gap on ${dateLabel}, where the pair sits inside its recent range, and which inflation or central-bank headlines are most likely to break the current tape.`,
    "gbp-usd": `Cable's ${dateLabel} setup is broken down across BoE pricing, UK data sensitivity, and broad USD direction — with explicit levels for range traders and breakout watchers.`,
    "usd-jpy": `This ${dateLabel} USD/JPY review covers the US–Japan yield spread, carry positioning, intervention risk zones, and the levels that matter if risk-off yen covering accelerates.`,
    "aud-usd": `The ${dateLabel} AUD/USD forecast links China growth sentiment, commodity tone, and global equity risk to the aussie's support/resistance map for Asia and London sessions.`,
    "gold-xauusd": `Gold's ${dateLabel} structure is framed through real yields, USD direction, and safe-haven demand — with computed levels rather than generic "headline rally" narratives.`,
    "silver-xagusd": `Silver on ${dateLabel} is reviewed through its gold beta, industrial demand context, and the volatility band implied by recent daily ranges.`,
    "brent-crude": `Brent's ${dateLabel} outlook connects OPEC+ guidance, inventory risk, and inflation pass-through to explicit support/resistance from recent price action.`,
    sp500: `The ${dateLabel} S&P 500 forecast separates cap-weighted index moves from breadth, with rate and earnings context tied to computed swing levels.`,
    "nasdaq-100": `Nasdaq 100 analysis for ${dateLabel} focuses on rate-sensitive growth weighting, mega-cap leadership, and the levels that define this week's risk appetite.`,
  };
  return goals[id];
}

function buildRecentSessionsNarrative(snapshot: MarketSnapshot): string {
  const recent = snapshot.bars.slice(-6);
  if (recent.length < 3) {
    return "Recent daily bar history is limited; levels below rely on the longest available chart window.";
  }

  const lines = recent.map((bar) => {
    const change =
      bar.open !== 0 ? ((bar.close - bar.open) / bar.open) * 100 : 0;
    const tone =
      change >= 0.35 ? "green" : change <= -0.35 ? "red" : "mixed";
    return `- **${bar.date}:** closed ${fp(snapshot, bar.close)} (${tone} day; range ${fp(snapshot, bar.low)} – ${fp(snapshot, bar.high)})`;
  });

  const first = recent[0].close;
  const last = recent[recent.length - 1].close;
  const netChange = first !== 0 ? ((last - first) / first) * 100 : 0;
  const sequence =
    netChange >= 0.5
      ? "a net firming sequence"
      : netChange <= -0.5
        ? "a net softening sequence"
        : "a choppy, mean-reverting sequence";

  return `### Recent daily closes

The last ${recent.length} sessions from ${snapshot.dataSource}:

${lines.join("\n")}

Taken together, the closes show **${sequence}** into ${snapshot.label}'s latest print near **${fp(snapshot, snapshot.price)}**.`;
}

function buildRangePosition(snapshot: MarketSnapshot): string {
  const range = snapshot.swingHigh - snapshot.swingLow;
  if (range <= 0) return "";

  const position = ((snapshot.price - snapshot.swingLow) / range) * 100;
  const zone =
    position >= 70
      ? "the upper third of the recent swing range — where breakouts need follow-through"
      : position <= 30
        ? "the lower third of the swing range — where buyers often defend unless macro de-risking dominates"
        : "the middle of the established swing band — consistent with range trading until a catalyst arrives";

  const sessionRange = snapshot.sessionHigh - snapshot.sessionLow;
  const sessionRangePct =
    snapshot.price !== 0 ? (sessionRange / snapshot.price) * 100 : 0;

  return `${snapshot.label} sits in **${zone}** (${position.toFixed(0)}% through the ${fp(snapshot, snapshot.swingLow)}–${fp(snapshot, snapshot.swingHigh)} band). Today's session range spans **${fp(snapshot, snapshot.sessionLow)} – ${fp(snapshot, snapshot.sessionHigh)}**, roughly **${sessionRangePct.toFixed(2)}%** of spot — ${sessionRangePct >= 1.2 ? "elevated intraday volatility" : sessionRangePct <= 0.5 ? "compressed volatility inside the broader trend" : "normal daily volatility for this instrument"}.`;
}

function buildVolatilityContext(snapshot: MarketSnapshot): string {
  const recent = snapshot.bars.slice(-10);
  if (recent.length < 5) return "";

  const ranges = recent.map((bar) =>
    bar.close !== 0 ? ((bar.high - bar.low) / bar.close) * 100 : 0
  );
  const avgRange = ranges.reduce((sum, value) => sum + value, 0) / ranges.length;
  const latestRange =
    snapshot.price !== 0
      ? ((snapshot.sessionHigh - snapshot.sessionLow) / snapshot.price) * 100
      : 0;

  const comparison =
    latestRange >= avgRange * 1.15
      ? "wider than the recent average — moves can extend if momentum confirms"
      : latestRange <= avgRange * 0.85
        ? "tighter than average — a volatility expansion often follows a multi-day squeeze"
        : "in line with the recent average daily range";

  return `Average daily range over the last ${recent.length} sessions is **${avgRange.toFixed(2)}%** of price; today's range is **${latestRange.toFixed(2)}%**, which is **${comparison}**.`;
}

function buildCrossAssetContext(id: DailyInstrumentId, snapshot: MarketSnapshot): string {
  const price = fp(snapshot, snapshot.price);
  const contexts: Record<DailyInstrumentId, string> = {
    bitcoin: `Cross-asset read for BTC at ${price}: when **US 2-year yields** rise and the **DXY** firms, Bitcoin often struggles to hold ${fp(snapshot, snapshot.support1)} even if crypto-native headlines are neutral. Conversely, stable yields plus improving **Nasdaq** tone frequently supports retests of ${fp(snapshot, snapshot.resistance1)}. Treat ETF flow prints as the tie-breaker when macro signals conflict.`,
    ethereum: `ETH at ${price} typically tracks Bitcoin beta first, then diverges when **DeFi TVL**, **L2 fee revenue**, or **staking-product regulation** headlines dominate. If BTC holds support while ETH lags, altcoin breadth is weak; if ETH outperforms on the session, risk appetite is broadening across the crypto complex.`,
    "eur-usd": `EUR/USD at ${price} rarely moves in isolation. A firm **DXY** on US data usually caps euro rallies near ${fp(snapshot, snapshot.resistance1)}, while **Bund–Treasury yield spreads** explain most multi-day direction. Energy-driven CPI surprises can lift the euro briefly via terms-of-trade effects, then reverse if yields spike.`,
    "gbp-usd": `Cable at ${price} is sensitive to **UK gilt yields** versus **USTs** and to **FTSE** risk tone. Sterling can outperform on hawkish UK inflation, but sustained USD safe-haven demand often pulls cable toward ${fp(snapshot, snapshot.support1)} regardless of domestic data.`,
    "usd-jpy": `USD/JPY at ${price} tracks the **US–Japan 2-year spread** closely. When yields widen and **Nikkei** risk appetite is strong, gradual yen weakness is common; risk-off episodes or MoF rhetoric can trigger fast moves toward ${fp(snapshot, snapshot.support1)} independent of the slow-moving rate gap.`,
    "aud-usd": `AUD/USD at ${price} functions as an APAC risk barometer. **Iron ore** and **China equity** tone often lead the aussie by a session; when **S&P futures** are soft, AUD dips toward ${fp(snapshot, snapshot.support1)} even if domestic RBA messaging is steady.`,
    "gold-xauusd": `Gold at ${price} competes with **real yields** and the **USD**. Haven headlines alone rarely sustain rallies if shocks are priced as inflationary (yields up). Watch whether ${fp(snapshot, snapshot.resistance1)} holds only when yields fall and DXY softens together — that combination confirms a proper bullion bid.`,
    "silver-xagusd": `Silver at ${price} amplifies gold direction with higher beta and adds **industrial demand** sensitivity. A rising gold-silver ratio with soft silver often signals defensive positioning; simultaneous strength in both metals supports ${fp(snapshot, snapshot.resistance1)} as a precious-metals complex breakout.`,
    "brent-crude": `Brent at ${price} feeds into **inflation expectations**, **USD** direction, and **energy equity** tone. Supply headlines can spike oil intra-day, but sustained breaks above ${fp(snapshot, snapshot.resistance1)} usually need inventory draws or OPEC+ guidance — not geopolitical noise alone.`,
    sp500: `The S&P 500 at ${price} reflects **mega-cap tech** versus **cyclical breadth**. Index-level gains with weak equal-weight performance often mean narrow leadership — rallies toward ${fp(snapshot, snapshot.resistance1)} are fragile if **VIX** rises and **credit spreads** widen simultaneously.`,
    "nasdaq-100": `The Nasdaq 100 at ${price} is the most **rate-sensitive** major US index. **10-year real yields** and **AI capex** narratives tug in opposite directions; when yields jump on CPI surprises, ${fp(snapshot, snapshot.support1)} is the first support test even if earnings headlines are constructive.`,
  };
  return contexts[id];
}

function buildMacroCatalystWatch(
  id: DailyInstrumentId,
  snapshot: MarketSnapshot,
  dateLabel: string
): string {
  const res1 = fp(snapshot, snapshot.resistance1);
  const sup1 = fp(snapshot, snapshot.support1);

  const watches: Record<DailyInstrumentId, string> = {
    bitcoin: `On ${dateLabel}, BTC traders typically watch **US inflation and labour data**, **FOMC speaker tone**, and **spot BTC ETF flow summaries**. A hot CPI print that lifts front-end yields often pressures ${sup1}; cooler data with stable rates supports a retest of ${res1}. Crypto-specific regulation headlines matter only when they change liquidity or exchange access — otherwise macro leads.`,
    ethereum: `ETH-sensitive catalysts on ${dateLabel} include **Bitcoin direction**, **SEC/CFTC crypto enforcement headlines**, and **Ethereum network fee trends**. Macro US data still dominates the beta; L2 adoption or staking-product news can create short ETH/BTC outperformance that fades if BTC loses ${sup1}.`,
    "eur-usd": `Key catalysts for EUR/USD on ${dateLabel}: **eurozone CPI/HICP**, **ECB speakers**, **US PPI/CPI**, and **Bund auctions**. The pair usually needs a relative rate surprise to break ${sup1}–${res1}; low-volatility days often reflect balanced central-bank expectations rather than absent interest.`,
    "gbp-usd": `Cable watches **UK CPI/employment**, **BoE commentary**, and **US data** on ${dateLabel}. UK inflation surprises move front-end gilt yields fast; if the US calendar is heavier, cable can drift with the dollar even on quiet UK sessions.`,
    "usd-jpy": `USD/JPY on ${dateLabel} reacts to **US yield moves**, **BoJ/MoF rhetoric**, and **risk sentiment**. Intervention risk rises when the pair approaches ${res1} with disorderly, one-way yen weakness — verbal warnings often precede actual action by weeks, not hours.`,
    "aud-usd": `AUD/USD on ${dateLabel} tracks **China data/trade headlines**, **RBA minutes/speakers**, and **US risk sentiment**. Commodity price moves in iron ore and copper often lead the aussie; US equity direction confirms or rejects the move into ${sup1} or ${res1}.`,
    "gold-xauusd": `Gold on ${dateLabel} responds to **real yields**, **USD index moves**, and **geopolitical escalation/de-escalation**. Scheduled **US data** that shifts Fed pricing is usually more durable than headline-driven spikes; watch whether ${res1} holds on falling real yields, not just fear headlines.`,
    "silver-xagusd": `Silver on ${dateLabel} adds **industrial metals demand** and **solar/tech capex** sensitivity to gold's macro drivers. US data that moves yields affects both metals, but silver can lag gold when growth fears dominate — watch the gold-silver ratio alongside ${sup1}.`,
    "brent-crude": `Oil on ${dateLabel} focuses on **EIA/API inventory**, **OPEC+ commentary**, and **Middle East supply risk**. Inventory surprises change the inflation narrative quickly; sustained breaks need data confirmation, not headline spikes alone, to hold above ${res1}.`,
    sp500: `The S&P 500 on ${dateLabel} weighs **mega-cap earnings guidance**, **CPI/PCE inflation**, and **Fed speakers**. Index futures often fade initial CPI spikes if the reaction is purely rates-driven; breadth improvement is required for a durable push through ${res1}.`,
    "nasdaq-100": `Nasdaq 100 on ${dateLabel} is especially sensitive to **CPI/PCE**, **10-year yields**, and **AI/semiconductor earnings**. Long-duration growth multiples compress quickly when yields rise; ${sup1} is the first line if inflation surprises hawkishly, even with strong single-stock beats.`,
  };
  return watches[id];
}

function buildExtendedFundamentals(
  id: DailyInstrumentId,
  snapshot: MarketSnapshot
): string {
  const price = fp(snapshot, snapshot.price);
  const extensions: Record<DailyInstrumentId, string> = {
    bitcoin: `Positioning-wise, BTC near ${price} often sees **spot ETF arbitrage desks** and **perpetual funding rates** lean the same direction as spot — when funding is elevated while price stalls below ${fp(snapshot, snapshot.resistance1)}, long exhaustion is a common explanation. On-chain exchange inflow spikes are secondary for daily forecasts unless they coincide with macro de-risking.`,
    ethereum: `ETH near ${price} reflects whether traders are paying for **altcoin beta** or hiding in BTC. Elevated gas and L2 activity can support ETH independently for short windows, but multi-day trends still require Bitcoin holding its range and stable macro liquidity conditions.`,
    "eur-usd": `EUR/USD near ${price} often trades as a **relative rates** story: euro resilience without ECB hawkish repricing usually means USD softness, not euro strength. Watch whether rallies stall at ${fp(snapshot, snapshot.resistance1)} when US front-end yields rise — that pattern confirms USD leadership despite stable eurozone data.`,
    "gbp-usd": `Cable near ${price} balances **UK inflation persistence** against **growth concerns**. Sterling can rally on CPI beats, but if the market interprets higher inflation as growth-negative, the move fades — ${fp(snapshot, snapshot.support1)} then acts as the magnet on broad USD bids.`,
    "usd-jpy": `USD/JPY near ${price} embeds **carry trade** positioning. Gradual yen weakness with orderly moves is tolerated; gap-style weakness toward ${fp(snapshot, snapshot.resistance2)} raises intervention chatter. Risk-off yen covering can overwhelm yield spreads for 24–48 hours — plan for ${fp(snapshot, snapshot.support1)} tests on sharp equity drawdowns.`,
    "aud-usd": `AUD/USD near ${price} mirrors **China-linked sentiment** more than domestic Australian data on most days. Iron ore stability with firm APAC equities supports ${fp(snapshot, snapshot.resistance1)} probes; simultaneous USD strength and China growth fears often target ${fp(snapshot, snapshot.support1)} even if the RBA sounds patient.`,
    "gold-xauusd": `Gold near ${price} reflects **central-bank accumulation narratives** versus **opportunity cost**. Official sector buying provides a long-term floor story, but daily traders focus on whether ${fp(snapshot, snapshot.resistance1)} caps price when real yields and USD rise together — that combination has capped multiple 2026 rallies.`,
    "silver-xagusd": `Silver near ${price} blends **precious-metal flows** with **industrial demand**. Solar and electronics demand provide a medium-term bid, but daily moves track gold first — silver-specific industrial headlines rarely sustain breaks without gold confirmation above ${fp(snapshot, snapshot.resistance1)}.`,
    "brent-crude": `Brent near ${price} balances **OPEC+ discipline** against **demand-side fears**. Supply cuts support the back of the curve, but prompt prices need inventory confirmation; repeated failures at ${fp(snapshot, snapshot.resistance1)} often mean the market is prioritising demand anxiety over disruption headlines.`,
    sp500: `The S&P 500 near ${price} reflects **Mag 7 concentration**. Index-level support can hold while equal-weight S&P components weaken — a fragile setup. Watch whether cyclicals participate in rallies toward ${fp(snapshot, snapshot.resistance1)}; narrow megacap-led gains often reverse on the first rates spike.`,
    "nasdaq-100": `The Nasdaq 100 near ${price} discounts **long-duration earnings** aggressively. AI capex stories support the index, but rising discount rates hit Nasdaq first — ${fp(snapshot, snapshot.support1)} is the level where growth investors typically reassess risk if yields jump on inflation surprises.`,
  };
  return extensions[id];
}

function buildSessionPlaybook(
  id: DailyInstrumentId,
  snapshot: MarketSnapshot,
  dateLabel: string
): string {
  const price = fp(snapshot, snapshot.price);
  const res1 = fp(snapshot, snapshot.resistance1);
  const sup1 = fp(snapshot, snapshot.support1);

  return `For ${dateLabel}, a practical read is: **hold above ${sup1}** to keep the ${snapshot.trend} intact toward ${res1}; **lose ${sup1} on a daily close** to open ${fp(snapshot, snapshot.support2)}. ${snapshot.label} at ${price} is the session pivot — ${isForexInstrument(id) ? "London–New York overlap often sets the directional leg for FX" : id === "bitcoin" || id === "ethereum" ? "US equity hours frequently coincide with the largest crypto liquidity" : id.includes("gold") || id.includes("silver") ? "US data releases typically move metals more than Asian sessions" : id === "brent-crude" ? "inventory data windows often define the week's oil range" : "US cash equity hours usually provide the clearest breadth signal"}. This is educational context, not a trade recommendation.`;
}

function buildSupplementalDepth(
  id: DailyInstrumentId,
  snapshot: MarketSnapshot,
  dateLabel: string
): string {
  const price = fp(snapshot, snapshot.price);
  const extras: Record<DailyInstrumentId, string> = {
    bitcoin: `## How to read today's BTC tape

Bitcoin at ${price} on ${dateLabel} should be read as a **macro-sensitive risk asset**, not an isolated crypto chart. When US front-end yields rise, BTC often behaves like a long-duration asset: ${fp(snapshot, snapshot.support1)} becomes the first test. When yields stabilize and equities firm, ${fp(snapshot, snapshot.resistance1)} is the natural ceiling until ETF flows confirm sustained demand. Combine the levels in this report with the cross-asset section above before treating any single indicator as decisive.`,
    ethereum: `## ETH session notes

Ethereum at ${price} on ${dateLabel} inherits Bitcoin's macro beta unless there is a clear ETH-specific catalyst. Track whether ETH/BTC holds on dips — weakness there while BTC stabilizes often signals altcoin de-risking rather than a macro turn. Use ${fp(snapshot, snapshot.support1)} and ${fp(snapshot, snapshot.resistance1)} as the daily map, with Bitcoin direction as the primary filter.`,
    "eur-usd": `## EUR/USD playbook

EUR/USD at ${price} on ${dateLabel} is a **relative-rates** market. Without a clear ECB–Fed surprise, ${fp(snapshot, snapshot.support1)}–${fp(snapshot, snapshot.resistance1)} range trading dominates. Breakout traders need confirmation from yield spreads, not just a single data beat in one economy.`,
    "gbp-usd": `## Cable playbook

GBP/USD at ${price} on ${dateLabel} requires both **UK and US** calendars. Cable can spike on UK inflation, but USD dominance on US data often pulls price back toward ${fp(snapshot, snapshot.support1)} — watch the dollar leg, not domestic headlines alone.`,
    "usd-jpy": `## USD/JPY playbook

USD/JPY at ${price} on ${dateLabel} balances **carry** and **intervention risk**. Orderly moves toward ${fp(snapshot, snapshot.resistance1)} are common in yield-widening environments; disorderly spikes invite official rhetoric and sharp reversals toward ${fp(snapshot, snapshot.support1)}.`,
    "aud-usd": `## AUD/USD playbook

AUD/USD at ${price} on ${dateLabel} is a **risk-proxy** pair. China-linked sentiment and commodity tone often set the Asian direction; US equities confirm or reject the move into London. ${fp(snapshot, snapshot.support1)} is the level to watch if global risk appetite fades.`,
    "gold-xauusd": `## Gold playbook

Gold at ${price} on ${dateLabel} needs **real yields and USD** alignment for sustained breaks. Headline-driven spikes that lift yields often fail at ${fp(snapshot, snapshot.resistance1)} — the level is more meaningful when yields fall concurrently.`,
    "silver-xagusd": `## Silver playbook

Silver at ${price} on ${dateLabel} trades with **higher beta** than gold. Use gold direction as the primary filter; silver-specific industrial headlines rarely sustain multi-day trends without bullion confirmation.`,
    "brent-crude": `## Brent playbook

Brent at ${price} on ${dateLabel} reacts to **inventory data** and **OPEC+ guidance** more than intraday geopolitical noise. ${fp(snapshot, snapshot.resistance1)} holds until the market believes demand is intact — watch EIA prints for confirmation.`,
    sp500: `## S&P 500 playbook

The S&P 500 at ${price} on ${dateLabel} can rise on **narrow megacap strength** while breadth weakens. Treat ${fp(snapshot, snapshot.resistance1)} as durable only if cyclicals and equal-weight indices participate — otherwise, rates spikes tend to fade the move quickly.`,
    "nasdaq-100": `## Nasdaq 100 playbook

The Nasdaq 100 at ${price} on ${dateLabel} is the first index to react to **yield spikes** on inflation data. ${fp(snapshot, snapshot.support1)} is the risk-management reference if CPI or PCE surprises hawkishly, even when AI earnings headlines are positive.`,
  };
  return extras[id];
}

function sessionDirection(changePct: number): string {  if (changePct >= 0.5) return "firm";
  if (changePct <= -0.5) return "soft";
  return "mixed";
}

function buildFundamentals(
  id: DailyInstrumentId,
  snapshot: MarketSnapshot,
  headline?: string
): string {
  const headlineNote = headline
    ? `Today's headline flow includes: "${headline.slice(0, 100)}${headline.length > 100 ? "…" : ""}". `
    : "";

  const drivers: Record<DailyInstrumentId, string> = {
    bitcoin: `${headlineNote}Bitcoin's session direction remains tied to **US front-end Treasury yields**, **spot BTC ETF net flows**, and the **US dollar**. With BTC ${snapshot.changePct >= 0 ? "firmer" : "softer"} at ${fp(snapshot, snapshot.price)}, traders are weighing whether rates pressure or risk appetite dominates. ETF inflow/outflow prints often explain whether dips toward ${fp(snapshot, snapshot.support1)} are bought or sold through.`,
    ethereum: `${headlineNote}Ethereum trades as **high-beta crypto** relative to Bitcoin, with additional sensitivity to **layer-2 activity**, **staking-product regulation**, and **DeFi liquidity**. ETH at ${fp(snapshot, snapshot.price)} (${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}%) reflects whether altcoin breadth is improving or whether macro de-risking is compressing the entire crypto complex.`,
    "eur-usd": `${headlineNote}EUR/USD at ${fp(snapshot, snapshot.price)} reflects the **ECB–Fed policy gap**, **US inflation surprises**, and **energy-driven CPI repricing**. The euro often lags USD safe-haven bids on geopolitical headlines even when eurozone data is stable. Watch whether ${fp(snapshot, snapshot.resistance1)} caps rallies when US yields rise.`,
    "gbp-usd": `${headlineNote}Cable at ${fp(snapshot, snapshot.price)} balances **BoE rate expectations**, **UK growth data**, and **broad USD direction**. Sterling can outperform when UK inflation surprises hawkishly, but a firm dollar on US data often drags cable toward ${fp(snapshot, snapshot.support1)} regardless of domestic headlines.`,
    "usd-jpy": `${headlineNote}USD/JPY at ${fp(snapshot, snapshot.price)} is driven by the **US–Japan yield spread**, **carry positioning**, and **MoF/BoJ intervention rhetoric**. Wider rate differentials support gradual yen weakness, but verbal intervention risk rises as the pair approaches ${fp(snapshot, snapshot.resistance1)}. Risk-off episodes can trigger sharp JPY short-covering toward ${fp(snapshot, snapshot.support1)}.`,
    "aud-usd": `${headlineNote}AUD/USD at ${fp(snapshot, snapshot.price)} functions as an **APAC risk proxy**, linked to **China growth sentiment**, **iron ore demand**, and **global equity tone**. The aussie tends to lead or lag equity risk by a session — today's ${sessionDirection(snapshot.changePct)} tone ${snapshot.changePct >= 0 ? "supports" : "pressures"} commodity-linked FX.`,
    "gold-xauusd": `${headlineNote}Gold at ${fp(snapshot, snapshot.price)} balances **real-yield direction**, **USD strength**, and **safe-haven demand**. Geopolitical headlines alone rarely sustain rallies when shocks are priced as inflation events that lift yields. Central-bank accumulation provides a long-term bid, but daily moves track whether ${fp(snapshot, snapshot.resistance1)} holds as dynamic resistance.`,
    "silver-xagusd": `${headlineNote}Silver at ${fp(snapshot, snapshot.price)} combines **precious-metal flows** with **industrial demand** (solar, electronics). XAG often amplifies gold moves with higher beta — watch whether gold's direction and the gold-silver ratio confirm today's ${sessionDirection(snapshot.changePct)} silver tape.`,
    "brent-crude": `${headlineNote}Brent at ${fp(snapshot, snapshot.price)} reflects **OPEC+ supply guidance**, **Middle East supply risk**, and **EIA inventory surprises**. Oil moves feed back into inflation expectations and Fed pricing, which in turn affects USD, yields, and risk assets. ${fp(snapshot, snapshot.resistance1)} is the near-term ceiling until inventory data shifts the narrative.`,
    sp500: `${headlineNote}The S&P 500 at ${fp(snapshot, snapshot.price)} is anchored by **mega-cap tech earnings** while **rates, oil, and credit spreads** cap broader multiples. Cap-weighted strength can mask weak breadth — today's ${snapshot.changePct >= 0 ? "gain" : "loss"} of ${Math.abs(snapshot.changePct).toFixed(2)}% should be read alongside whether cyclicals participate or only megacaps lead.`,
    "nasdaq-100": `${headlineNote}The Nasdaq 100 at ${fp(snapshot, snapshot.price)} is **more rate-sensitive** than the broad S&P due to long-duration growth weighting. AI capex narratives and megacap guidance support the index, but rising yields compress multiples quickly — ${fp(snapshot, snapshot.support1)} is the first support test if rates spike.`,
  };

  return drivers[id];
}

function buildFaq(
  id: DailyInstrumentId,
  snapshot: MarketSnapshot
): { question: string; answer: string }[] {
  const price = fp(snapshot, snapshot.price);
  const res1 = fp(snapshot, snapshot.resistance1);
  const sup1 = fp(snapshot, snapshot.support1);

  const faqs: Record<DailyInstrumentId, { question: string; answer: string }[]> =
    {
      bitcoin: [
        {
          question: "Is Bitcoin bullish or bearish today?",
          answer: `${sessionDirection(snapshot.changePct) === "firm" ? "Constructive" : sessionDirection(snapshot.changePct) === "soft" ? "Soft" : "Neutral"} — BTC at ${price} (${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}%) with support at ${sup1} and resistance at ${res1}.`,
        },
        {
          question: "What is the next resistance for BTC?",
          answer: `${res1} is the nearest resistance, then ${fp(snapshot, snapshot.resistance2)} on extension.`,
        },
        {
          question: "What moves Bitcoin fastest today?",
          answer: "US Treasury yield shifts, spot BTC ETF flow data, and USD direction — crypto-native headlines are secondary unless they change regulatory or liquidity conditions.",
        },
        {
          question: "What invalidates the bullish BTC scenario?",
          answer: `A daily close below ${sup1} while front-end yields rise and ETF flows turn negative — that combination usually retargets ${fp(snapshot, snapshot.support2)} rather than a shallow dip.`,
        },
      ],
      ethereum: [
        {
          question: "Does ETH follow Bitcoin today?",
          answer: `ETH at ${price} is trading with ${snapshot.changePct >= 0 ? "positive" : "negative"} session momentum (${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}%), typically tracking BTC beta unless L2 or staking headlines create divergence.`,
        },
        {
          question: "What is the next ETH resistance?",
          answer: `${res1}, then ${fp(snapshot, snapshot.resistance2)} if risk appetite improves.`,
        },
        {
          question: "What is the key ETH support?",
          answer: `${sup1} — a daily close below opens ${fp(snapshot, snapshot.support2)}.`,
        },
      ],
      "eur-usd": [
        {
          question: "What level matters most for EUR/USD today?",
          answer: `Pivot ${price}; resistance ${res1}, support ${sup1}.`,
        },
        {
          question: "Why is EUR/USD range-bound?",
          answer: "Balanced ECB–Fed expectations and low realized volatility keep the pair anchored until US or eurozone data surprises arrive.",
        },
        {
          question: "What breaks EUR/USD out of range?",
          answer: "A decisive US inflation surprise or major ECB policy shift that reprices front-end yields.",
        },
      ],
      "gbp-usd": [
        {
          question: "What is cable's near-term range?",
          answer: `Support ${sup1}, resistance ${res1}, pivot ${price}.`,
        },
        {
          question: "What moves GBP/USD fastest?",
          answer: "UK inflation surprises, BoE communication, and broad USD safe-haven flows.",
        },
        {
          question: "Is cable trending today?",
          answer: `The daily structure is in a ${snapshot.trend} with ${describeTrend(snapshot).replace(/\*\*/g, "")}.`,
        },
      ],
      "usd-jpy": [
        {
          question: "When does intervention risk rise for USD/JPY?",
          answer: `When the pair approaches ${fp(snapshot, snapshot.resistance2)} with rapid, disorderly yen weakness and official rhetoric intensifies.`,
        },
        {
          question: "What is USD/JPY's lead indicator?",
          answer: "The US–Japan 2-year yield spread — divergence between USD/JPY and yields often resolves toward the rate move.",
        },
        {
          question: "What is today's USD/JPY pivot?",
          answer: `${price} — loss of ${sup1} signals short-term yen recovery.`,
        },
      ],
      "aud-usd": [
        {
          question: "Why is AUD called a risk proxy?",
          answer: "Commodity exports and carry appeal tie AUD to global growth sentiment and APAC equity tone.",
        },
        {
          question: "What are today's AUD/USD levels?",
          answer: `Resistance ${res1}, support ${sup1}, spot ${price}.`,
        },
        {
          question: "What hurts the aussie most?",
          answer: "USD strength combined with China growth fears or broad risk-off flows.",
        },
      ],
      "gold-xauusd": [
        {
          question: "Why isn't gold rallying on headlines alone?",
          answer: "When shocks lift yields and USD, the opportunity cost of holding non-yielding bullion often outweighs short-lived haven demand.",
        },
        {
          question: "What confirms a gold uptrend?",
          answer: `A sustained break above ${res1} on falling real yields and USD softness.`,
        },
        {
          question: "What is gold's key support today?",
          answer: `${sup1}, then ${fp(snapshot, snapshot.support2)} on extension lower.`,
        },
      ],
      "silver-xagusd": [
        {
          question: "Why is silver more volatile than gold?",
          answer: "Smaller market depth and a larger industrial demand component amplify moves in both directions.",
        },
        {
          question: "What are today's silver levels?",
          answer: `Spot ${price}, resistance ${res1}, support ${sup1}.`,
        },
        {
          question: "Does silver follow gold?",
          answer: "Directionally yes, but with higher beta — industrial demand can create short-term divergence.",
        },
      ],
      "brent-crude": [
        {
          question: "Why does oil affect inflation expectations?",
          answer: "Energy pass-through influences CPI forecasts and Fed hike pricing, which feeds back into USD and risk assets.",
        },
        {
          question: "What are today's Brent levels?",
          answer: `${price} with resistance ${res1} and support ${sup1}.`,
        },
        {
          question: "What catalyst matters most for oil?",
          answer: "EIA inventory surprises and OPEC+ supply guidance, plus geopolitical supply disruption headlines.",
        },
      ],
      sp500: [
        {
          question: "Why is the index holding despite macro risk?",
          answer: "Cap-weighted mega-cap tech earnings often cushion index-level drawdowns even when breadth is weak.",
        },
        {
          question: "What would break S&P support quickly?",
          answer: `A sustained close below ${sup1}, especially if accompanied by credit spread widening or a rates spike.`,
        },
        {
          question: "What is today's S&P pivot?",
          answer: `${price} — ${res1} is the nearest resistance.`,
        },
      ],
      "nasdaq-100": [
        {
          question: "Why is Nasdaq more rate-sensitive?",
          answer: "Long-duration growth stocks discount future earnings more aggressively when yields rise.",
        },
        {
          question: "What are today's Nasdaq levels?",
          answer: `Spot ${price}, support ${sup1}, resistance ${res1}.`,
        },
        {
          question: "What supports the Nasdaq tape?",
          answer: "Mega-cap AI capex narratives and earnings beats — but yields cap multiples if inflation surprises hawkishly.",
        },
      ],
    };

  return faqs[id];
}

function buildContent(
  snapshot: MarketSnapshot,
  dateLabel: string,
  headline?: string
): string {
  const id = snapshot.instrumentId;
  const price = fp(snapshot, snapshot.price);
  const hi = fp(snapshot, snapshot.sessionHigh);
  const lo = fp(snapshot, snapshot.sessionLow);
  const res1 = fp(snapshot, snapshot.resistance1);
  const res2 = fp(snapshot, snapshot.resistance2);
  const sup1 = fp(snapshot, snapshot.support1);
  const sup2 = fp(snapshot, snapshot.support2);
  const dir = sessionDirection(snapshot.changePct);
  const headlineBlock = headline
    ? `Relevant headline: "${headline.slice(0, 120)}${headline.length > 120 ? "…" : ""}".\n\n`
    : "";

  const intro = `${snapshot.label} is trading near **${price}** on ${dateLabel}, ${snapshot.changePct >= 0 ? "up" : "down"} roughly **${Math.abs(snapshot.changePct).toFixed(2)}%** from the prior close (${snapshot.dataSource}). This ${TITLES[id].split(":")[0].toLowerCase()} connects live price structure to instrument-specific drivers — covering today's session range, computed technical levels, indicator readings from recent daily bars, and balanced scenarios without trade signals.

${buildLearningGoals(id, dateLabel)}`;

  const priceAction = `${headlineBlock}**Spot reference:** ${price} (${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}% vs prior close)
**Session range:** ${lo} – ${hi}

${snapshot.label} is trading **${dir}** on the session. Over the last ${Math.min(snapshot.bars.length, 10)} daily bars, price has been ${describeTrend(snapshot)}. The move ${snapshot.changePct >= 0 ? "extended toward" : "retreated from"} **${snapshot.changePct >= 0 ? res1 : sup1}**, with **${lo}** marking the recent session low and **${hi}** the session high.

Chart context from ${snapshot.dataSource}: the ${snapshot.trend} structure between **${fp(snapshot, snapshot.swingLow)}** (swing low) and **${fp(snapshot, snapshot.swingHigh)}** (swing high) defines the active trade zone. ${snapshot.changePct >= 0 ? "Buyers defended dips above recent lows" : "Sellers emerged below recent highs"}, keeping the focus on whether **${price}** holds as the session pivot.

${buildRangePosition(snapshot)}

${buildVolatilityContext(snapshot)}

${buildRecentSessionsNarrative(snapshot)}`;

  const technical = `On the daily chart, ${snapshot.label} is in a **${snapshot.trend}** with nearest resistance at **${res1}** and support at **${sup1}**.

${describeRsi(snapshot.rsi14)}

${describeMovingAverages(snapshot)}

A daily close above **${res1}** would signal bulls regained near-term control toward **${res2}**. Loss of **${sup1}** on a closing basis opens a move toward **${sup2}** — especially if cross-asset flows (USD, yields, or related markets) confirm the breakdown.

${buildSessionPlaybook(id, snapshot, dateLabel)}`;

  const keyLevels = [
    `**Resistance:** ${res1}, then ${res2}`,
    `**Support:** ${sup1}, then ${sup2}`,
    `**Pivot:** ${price}`,
  ];

  const chartPlaceholder = `[CHART: ${snapshot.label} daily — resistance ${res1}, support ${sup1}]`;

  const indicatorSignals = `**RSI (14, daily):** ${snapshot.rsi14 !== null ? snapshot.rsi14.toFixed(1) : "N/A"} — ${snapshot.rsi14 !== null ? (snapshot.rsi14 >= 55 ? "constructive momentum" : snapshot.rsi14 <= 45 ? "soft momentum" : "neutral range momentum") : "computed from available bars"}.

**20-day / 50-day moving averages:** ${snapshot.sma20 !== null ? `20-DMA ${fp(snapshot, snapshot.sma20)}` : "20-DMA N/A"}${snapshot.sma50 !== null ? `; 50-DMA ${fp(snapshot, snapshot.sma50)}` : "; 50-DMA N/A"}.

**Session momentum:** ${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}% — ${dir} tone ${snapshot.trend === "range" ? "inside the established range" : `within a ${snapshot.trend}`}.`;

  const fundamentals = `${buildFundamentals(id, snapshot, headline)}

${buildExtendedFundamentals(id, snapshot)}

### Macro & catalyst watch

${buildMacroCatalystWatch(id, snapshot, dateLabel)}

### Cross-asset context

${buildCrossAssetContext(id, snapshot)}`;

  const bullish = `A break above **${res1}** with supportive cross-asset flows targets **${res2}** — confirmation requires ${isForexInstrument(id) ? "USD direction aligning with the move and yield spreads confirming" : id === "gold-xauusd" || id === "silver-xagusd" ? "falling real yields or USD softness" : id === "brent-crude" ? "supply risk escalation or inventory draw" : id === "bitcoin" || id === "ethereum" ? "improving risk appetite and stable yields" : "improving breadth and stable yields"}. Sustained closes above **${res1}** on rising participation (volume or breadth, depending on asset class) increase the odds of a multi-session extension rather than a single-day spike.`;

  const bearish = `Failure at **${sup1}** opens **${sup2}** — particularly if ${id === "usd-jpy" ? "intervention rhetoric or risk-off JPY covering accelerates" : id === "gold-xauusd" || id === "silver-xagusd" ? "real yields and USD rise together" : id === "brent-crude" ? "demand fears or USD strength cap crude" : "macro de-risking lifts USD and compresses risk assets"}. Traders often watch for a **daily close** below **${sup1}** rather than an intraday wick — that filter reduces false breaks on headline volatility.`;

  const baseCase = `${snapshot.label} holds **${sup1}–${res1}** while ${snapshot.trend === "range" ? "range trade dominates" : `the ${snapshot.trend} matures`} — **${price}** remains the session pivot until the next scheduled macro catalyst shifts cross-asset flows. Inside the range, mean-reversion toward **${price}** is common after tests of **${res1}** or **${sup1}** without a clear rates or USD impulse.`;

  const faq = buildFaq(id, snapshot);
  const faqBlock = faq
    .map((item) => `**${item.question}** ${item.answer}`)
    .join("\n\n");

  const disclaimer =
    id === "bitcoin" || id === "ethereum"
      ? "*Not financial advice. Crypto is highly volatile. This auto-generated forecast uses live market data for educational purposes only.*"
      : id === "sp500" || id === "nasdaq-100"
        ? "*For informational purposes only. Index trading involves substantial risk. Auto-generated from live market data — not financial advice.*"
        : "*Educational forecast only — not a recommendation to trade forex, CFDs, or commodities. Auto-generated from live market data.*";

  const body = `${intro}

## Price Action Overview

${priceAction}

## Technical Analysis

${technical}

### Key Support and Resistance Levels

${keyLevels.map((l) => `- ${l}`).join("\n")}

${chartPlaceholder}

### Indicator Signals

${indicatorSignals}

## Fundamental Analysis

${fundamentals}

## Forecast / Outlook

**Bullish scenario:** ${bullish}

**Bearish scenario:** ${bearish}

**Base case:** ${baseCase}

${buildSupplementalDepth(id, snapshot, dateLabel)}

## FAQ

${faqBlock}

${disclaimer}`;

  if (countWords(body) >= WORD_COUNT_MIN) return body;

  return `${body}

## Additional context

${buildCrossAssetContext(id, snapshot)}

${buildMacroCatalystWatch(id, snapshot, dateLabel)}`;
}

export function buildForecastFromSnapshot(
  snapshot: MarketSnapshot,
  now: string,
  headline?: string
): Article {
  const id = snapshot.instrumentId;
  const dateLabel = now.slice(0, 10);
  const cat = CATEGORY[id];
  const price = fp(snapshot, snapshot.price);

  return {
    slug: `${SLUG_PREFIX[id]}-auto-${dateLabel}`,
    title: TITLES[id],
    excerpt: `${snapshot.label} forecast for ${dateLabel}: ${snapshot.label} near ${price} (${snapshot.changePct >= 0 ? "+" : ""}${snapshot.changePct.toFixed(2)}%), ${snapshot.trend} structure, and key support/resistance from live data.`,
    content: buildContent(snapshot, dateLabel, headline),
    category: cat,
    author: "Trading 100 Desk",
    publishedAt: now,
    image: IMAGES[cat === "commodities" ? "commodities" : cat] ?? IMAGES.forex,
    isOriginal: true,
  };
}

export function buildMinimalFallbackArticle(
  id: DailyInstrumentId,
  label: string,
  now: string,
  headline?: string,
  category: ArticleCategory = "forex"
): Article {
  const dateLabel = now.slice(0, 10);
  const headlineNote = headline
    ? `Headline context: "${headline.slice(0, 120)}${headline.length > 120 ? "…" : ""}".`
    : "Live price data was unavailable at generation time — levels below will refresh after the next data sync.";

  const educational: Record<DailyInstrumentId, string> = {
    bitcoin: `Bitcoin forecasts on Trading 100 normally combine **spot reference**, **daily RSI and moving averages**, and **macro drivers** (US yields, DXY, spot BTC ETF flows). When chart data is temporarily unavailable, focus on the prior session's high/low and whether US front-end yields are rising or falling — that pairing usually explains whether BTC behaves as a risk asset or a liquidity-sensitive long-duration proxy.`,
    ethereum: `Ethereum analysis typically tracks **Bitcoin beta** first, then **ETH-specific catalysts** (L2 activity, staking regulation, DeFi liquidity). Without live OHLC, treat the prior day's range as the working map and watch BTC direction as the primary filter for ETH moves.`,
    "eur-usd": `EUR/USD forecasts emphasise the **ECB–Fed policy gap**, **US and eurozone inflation surprises**, and **yield spread direction**. Prior session support/resistance and the 20-day moving average remain the default structure markers until live data returns.`,
    "gbp-usd": `Cable analysis balances **BoE rate expectations**, **UK inflation data**, and **broad USD direction**. Sterling often lags USD moves on heavy US calendar days — use the prior close as the pivot until computed levels reload.`,
    "usd-jpy": `USD/JPY is driven by the **US–Japan yield spread**, **carry positioning**, and **intervention rhetoric**. Risk-off episodes can trigger sharp yen covering independent of slow-moving rate differentials — watch official comments if the pair has been rising quickly.`,
    "aud-usd": `AUD/USD functions as an **APAC risk proxy** linked to China sentiment, iron ore tone, and global equities. The aussie often leads or lags equity risk by one session; prior range boundaries matter until fresh data loads.`,
    "gold-xauusd": `Gold forecasts weigh **real yields**, **USD direction**, and **safe-haven demand**. Headline-driven spikes that lift yields often fail to sustain — the level structure refreshes once live bullion data is restored.`,
    "silver-xagusd": `Silver combines **gold beta** with **industrial demand** sensitivity. XAG typically amplifies gold moves; use gold direction as the primary filter when silver-specific OHLC is unavailable.`,
    "brent-crude": `Brent analysis focuses on **OPEC+ guidance**, **EIA inventory surprises**, and **inflation pass-through** into Fed pricing. Oil can spike on headlines, but sustained trends usually need inventory confirmation.`,
    sp500: `S&P 500 forecasts separate **mega-cap leadership** from **breadth**. Index-level support can hold while equal-weight components weaken — watch whether cyclicals participate once live index data returns.`,
    "nasdaq-100": `The Nasdaq 100 is the most **rate-sensitive** major US index. CPI/PCE surprises that lift yields often hit Nasdaq first, even when AI earnings headlines are constructive.`,
  };

  const content = `${label} is in focus on ${dateLabel}. ${headlineNote}

You will still find a structured read below — price context, technical framework, catalyst watch, and balanced scenarios — while computed levels and indicators repopulate from ${label}'s data feed.

## Price Action Overview

Live chart data was unavailable when this forecast was generated. Until the next sync completes, use the **prior session high and low** as the working range and treat the last published close as the session pivot. ${educational[id]}

When data returns, this article is automatically replaced with computed support/resistance, RSI (14), and 20/50-day moving averages from daily bars.

## Technical Analysis

Without fresh OHLC, rely on these framework rules:

- **Trend filter:** A close above the 20-day moving average suggests constructive near-term structure; a close below it warns of soft momentum.
- **RSI context:** Readings above 70 flag overbought risk on extensions; readings below 30 suggest oversold bounce potential if support holds.
- **Level discipline:** Prior swing highs act as resistance; prior swing lows act as support until a daily close breaks them.

## Fundamental Analysis

${educational[id]}

### Macro & catalyst watch

Scheduled US and global macro data, central-bank speakers, and cross-asset moves (yields, USD, related equities or commodities) remain the primary drivers for ${label} on ${dateLabel}. Revisit this section after live levels reload for instrument-specific support and resistance references.

## Forecast / Outlook

**Bullish scenario:** A reclaim of the prior session high with supportive cross-asset flows (stable yields, softer USD where relevant) would signal bulls regained near-term control.

**Bearish scenario:** A daily close below the prior session low — especially if USD and yields firm together — opens a deeper correction toward the next swing support.

**Base case:** Range trade around the last known pivot until live data and the next scheduled macro catalyst provide clearer direction.

## FAQ

**Why are levels missing?** The market data feed did not respond during generation. The next cron sync or manual refresh repopulates computed levels.

**Is this still useful?** Yes — the catalyst and cross-asset framework above remains valid even when numeric levels are temporarily blank.

**When will data refresh?** Daily forecast cron runs on schedule; revisit this page after the next sync for full RSI, moving averages, and support/resistance.

*Educational forecast only — not financial advice. Generated without live price data; levels refresh automatically.*`;

  return {
    slug: `${SLUG_PREFIX[id]}-auto-${dateLabel}`,
    title: TITLES[id] ?? `${label} Forecast Today: Analysis & Key Levels`,
    excerpt: `${label} forecast for ${dateLabel}: macro and catalyst framework while live levels refresh.`,
    content,
    category,
    author: "Trading 100 Desk",
    publishedAt: now,
    image: IMAGES[category] ?? IMAGES.forex,
    isOriginal: true,
  };
}
