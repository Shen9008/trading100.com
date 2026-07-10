export type MarketInstrument = {
  symbol: string;
  name: string;
  tvSymbol: string;
  group?: string;
  /** URL slug override (e.g. coingecko id for crypto) */
  slug?: string;
};

const fx = (
  symbol: string,
  name: string,
  group: string
): MarketInstrument => ({
  symbol,
  name,
  tvSymbol: `FX:${symbol.replace("/", "")}`,
  group,
});

const crypto = (
  symbol: string,
  name: string,
  coingeckoId: string,
  group = "Top Cryptocurrencies"
): MarketInstrument => ({
  symbol,
  name,
  tvSymbol: `BINANCE:${symbol}USDT`,
  group,
  slug: coingeckoId,
});

const stock = (
  symbol: string,
  name: string,
  exchange: "NASDAQ" | "NYSE" | "AMEX",
  group = "US Stocks"
): MarketInstrument => ({
  symbol,
  name,
  tvSymbol: `${exchange}:${symbol}`,
  group,
});

const etf = (
  symbol: string,
  name: string,
  exchange: "NASDAQ" | "NYSE" | "AMEX" = "AMEX",
  group = "Popular ETFs"
): MarketInstrument => ({
  symbol,
  name,
  tvSymbol: `${exchange}:${symbol}`,
  group,
});

export type MarketAssetClassId =
  | "currencies"
  | "commodities"
  | "crypto"
  | "indices"
  | "stocks"
  | "etfs";

export const MARKET_INSTRUMENTS: Record<
  MarketAssetClassId,
  MarketInstrument[]
> = {
  currencies: [
    // Major pairs (FX Empire)
    fx("EUR/USD", "Euro / US Dollar", "Major Pairs"),
    fx("GBP/USD", "British Pound / US Dollar", "Major Pairs"),
    fx("USD/JPY", "US Dollar / Japanese Yen", "Major Pairs"),
    fx("USD/CHF", "US Dollar / Swiss Franc", "Major Pairs"),
    fx("AUD/USD", "Australian Dollar / US Dollar", "Major Pairs"),
    fx("USD/CAD", "US Dollar / Canadian Dollar", "Major Pairs"),
    fx("NZD/USD", "New Zealand Dollar / US Dollar", "Major Pairs"),
    // JPY crosses
    fx("EUR/JPY", "Euro / Japanese Yen", "JPY Crosses"),
    fx("GBP/JPY", "British Pound / Japanese Yen", "JPY Crosses"),
    fx("AUD/JPY", "Australian Dollar / Japanese Yen", "JPY Crosses"),
    fx("NZD/JPY", "New Zealand Dollar / Japanese Yen", "JPY Crosses"),
    fx("CAD/JPY", "Canadian Dollar / Japanese Yen", "JPY Crosses"),
    fx("CHF/JPY", "Swiss Franc / Japanese Yen", "JPY Crosses"),
    // EUR crosses
    fx("EUR/GBP", "Euro / British Pound", "EUR Crosses"),
    fx("EUR/AUD", "Euro / Australian Dollar", "EUR Crosses"),
    fx("EUR/CAD", "Euro / Canadian Dollar", "EUR Crosses"),
    fx("EUR/CHF", "Euro / Swiss Franc", "EUR Crosses"),
    fx("EUR/NZD", "Euro / New Zealand Dollar", "EUR Crosses"),
    // GBP crosses
    fx("GBP/AUD", "British Pound / Australian Dollar", "GBP Crosses"),
    fx("GBP/CAD", "British Pound / Canadian Dollar", "GBP Crosses"),
    fx("GBP/CHF", "British Pound / Swiss Franc", "GBP Crosses"),
    fx("GBP/NZD", "British Pound / New Zealand Dollar", "GBP Crosses"),
    // AUD / NZD / CAD crosses
    fx("AUD/CAD", "Australian Dollar / Canadian Dollar", "Commodity Crosses"),
    fx("AUD/CHF", "Australian Dollar / Swiss Franc", "Commodity Crosses"),
    fx("AUD/NZD", "Australian Dollar / New Zealand Dollar", "Commodity Crosses"),
    fx("NZD/CAD", "New Zealand Dollar / Canadian Dollar", "Commodity Crosses"),
    fx("NZD/CHF", "New Zealand Dollar / Swiss Franc", "Commodity Crosses"),
    fx("CAD/CHF", "Canadian Dollar / Swiss Franc", "Commodity Crosses"),
    // CHF crosses
    fx("CHF/AUD", "Swiss Franc / Australian Dollar", "Other Crosses"),
    fx("CHF/CAD", "Swiss Franc / Canadian Dollar", "Other Crosses"),
    fx("CHF/EUR", "Swiss Franc / Euro", "Other Crosses"),
    fx("CHF/GBP", "Swiss Franc / British Pound", "Other Crosses"),
    fx("CHF/NZD", "Swiss Franc / New Zealand Dollar", "Other Crosses"),
  ],
  commodities: [
    { symbol: "XAU/USD", name: "Gold", tvSymbol: "TVC:GOLD", group: "Precious Metals" },
    { symbol: "XAG/USD", name: "Silver", tvSymbol: "TVC:SILVER", group: "Precious Metals" },
    { symbol: "XPT/USD", name: "Platinum", tvSymbol: "TVC:PLATINUM", group: "Precious Metals" },
    { symbol: "XPD/USD", name: "Palladium", tvSymbol: "TVC:PALLADIUM", group: "Precious Metals" },
    { symbol: "WTI", name: "Crude Oil WTI", tvSymbol: "TVC:USOIL", group: "Energy" },
    { symbol: "BRENT", name: "Brent Crude Oil", tvSymbol: "TVC:UKOIL", group: "Energy" },
    { symbol: "NGAS", name: "Natural Gas", tvSymbol: "TVC:NATURALGAS", group: "Energy" },
    { symbol: "COPPER", name: "Copper", tvSymbol: "TVC:COPPER", group: "Industrial Metals" },
    { symbol: "CORN", name: "Corn", tvSymbol: "CBOT:ZC1!", group: "Agriculture" },
    { symbol: "SOYBEANS", name: "Soybeans", tvSymbol: "CBOT:ZS1!", group: "Agriculture" },
    { symbol: "WHEAT", name: "Wheat", tvSymbol: "CBOT:ZW1!", group: "Agriculture" },
    { symbol: "SUGAR", name: "Sugar", tvSymbol: "ICE:SB1!", group: "Agriculture" },
  ],
  crypto: [
    crypto("BTC", "Bitcoin", "bitcoin"),
    crypto("ETH", "Ethereum", "ethereum"),
    crypto("USDT", "Tether", "tether"),
    crypto("BNB", "BNB", "binancecoin"),
    crypto("XRP", "XRP", "ripple"),
    crypto("SOL", "Solana", "solana"),
    crypto("USDC", "USD Coin", "usd-coin"),
    crypto("TRX", "TRON", "tron"),
    crypto("DOGE", "Dogecoin", "dogecoin"),
    crypto("ADA", "Cardano", "cardano"),
    crypto("LINK", "Chainlink", "chainlink"),
    crypto("AVAX", "Avalanche", "avalanche-2"),
    crypto("DOT", "Polkadot", "polkadot"),
    crypto("MATIC", "Polygon", "matic-network"),
    crypto("LTC", "Litecoin", "litecoin"),
    crypto("BCH", "Bitcoin Cash", "bitcoin-cash"),
    crypto("UNI", "Uniswap", "uniswap"),
    crypto("XLM", "Stellar", "stellar"),
    crypto("ATOM", "Cosmos", "cosmos"),
    crypto("ETC", "Ethereum Classic", "ethereum-classic"),
    crypto("HBAR", "Hedera", "hedera-hashgraph"),
    crypto("NEAR", "NEAR Protocol", "near"),
    crypto("FIL", "Filecoin", "filecoin"),
    crypto("ICP", "Internet Computer", "internet-computer"),
    crypto("APT", "Aptos", "aptos"),
    crypto("ARB", "Arbitrum", "arbitrum"),
    crypto("OP", "Optimism", "optimism"),
    crypto("INJ", "Injective", "injective-protocol"),
    crypto("SUI", "Sui", "sui"),
    crypto("TON", "Toncoin", "the-open-network"),
    crypto("SHIB", "Shiba Inu", "shiba-inu"),
    crypto("PEPE", "Pepe", "pepe"),
    crypto("AAVE", "Aave", "aave"),
    crypto("MKR", "Maker", "maker"),
    crypto("CRV", "Curve DAO", "curve-dao-token"),
    crypto("RENDER", "Render", "render-token"),
    crypto("FET", "Fetch.ai", "fetch-ai"),
    crypto("IMX", "Immutable", "immutable-x"),
    crypto("GRT", "The Graph", "the-graph"),
    crypto("ALGO", "Algorand", "algorand"),
    crypto("VET", "VeChain", "vechain"),
    crypto("THETA", "Theta Network", "theta-token"),
    crypto("EGLD", "MultiversX", "elrond-erd-2"),
    crypto("SAND", "The Sandbox", "the-sandbox"),
    crypto("MANA", "Decentraland", "decentraland"),
    crypto("AXS", "Axie Infinity", "axie-infinity"),
    crypto("FLOW", "Flow", "flow"),
    crypto("XTZ", "Tezos", "tezos"),
    crypto("EOS", "EOS", "eos"),
    crypto("XMR", "Monero", "monero"),
    crypto("ZEC", "Zcash", "zcash"),
  ],
  indices: [
    { symbol: "SPX", name: "S&P 500", tvSymbol: "SP:SPX", group: "United States" },
    { symbol: "NDX", name: "Nasdaq 100", tvSymbol: "NASDAQ:NDX", group: "United States" },
    { symbol: "DJI", name: "Dow Jones", tvSymbol: "DJ:DJI", group: "United States" },
    { symbol: "RUT", name: "Russell 2000", tvSymbol: "TVC:RUT", group: "United States" },
    { symbol: "VIX", name: "CBOE Volatility Index", tvSymbol: "TVC:VIX", group: "United States" },
    { symbol: "FTSE", name: "FTSE 100", tvSymbol: "TVC:UKX", group: "Europe" },
    { symbol: "DAX", name: "DAX 40", tvSymbol: "XETR:DAX", group: "Europe" },
    { symbol: "CAC", name: "CAC 40", tvSymbol: "EURONEXT:PX1", group: "Europe" },
    { symbol: "EU50", name: "Euro Stoxx 50", tvSymbol: "STOXX:SX5E", group: "Europe" },
    { symbol: "AEX", name: "AEX 25", tvSymbol: "EURONEXT:AEX", group: "Europe" },
    { symbol: "NI225", name: "Nikkei 225", tvSymbol: "TVC:NI225", group: "Asia Pacific" },
    { symbol: "HSI", name: "Hang Seng", tvSymbol: "HSI:HSI", group: "Asia Pacific" },
    { symbol: "CN50", name: "China A50", tvSymbol: "SGX:CN1!", group: "Asia Pacific" },
    { symbol: "STI", name: "Straits Times", tvSymbol: "SGX:STI", group: "Asia Pacific" },
    { symbol: "ASX200", name: "ASX 200", tvSymbol: "ASX:XJO", group: "Asia Pacific" },
  ],
  stocks: [
    stock("NVDA", "NVIDIA", "NASDAQ", "Technology"),
    stock("AAPL", "Apple", "NASDAQ", "Technology"),
    stock("GOOGL", "Alphabet Class A", "NASDAQ", "Technology"),
    stock("GOOG", "Alphabet Class C", "NASDAQ", "Technology"),
    stock("MSFT", "Microsoft", "NASDAQ", "Technology"),
    stock("AMZN", "Amazon", "NASDAQ", "Technology"),
    stock("META", "Meta Platforms", "NASDAQ", "Technology"),
    stock("TSLA", "Tesla", "NASDAQ", "Technology"),
    stock("AVGO", "Broadcom", "NASDAQ", "Technology"),
    stock("AMD", "Advanced Micro Devices", "NASDAQ", "Technology"),
    stock("MU", "Micron Technology", "NASDAQ", "Technology"),
    stock("INTC", "Intel", "NASDAQ", "Technology"),
    stock("QCOM", "Qualcomm", "NASDAQ", "Technology"),
    stock("AMAT", "Applied Materials", "NASDAQ", "Technology"),
    stock("LRCX", "Lam Research", "NASDAQ", "Technology"),
    stock("KLAC", "KLA Corporation", "NASDAQ", "Technology"),
    stock("ARM", "Arm Holdings", "NASDAQ", "Technology"),
    stock("PLTR", "Palantir", "NASDAQ", "Technology"),
    stock("CRM", "Salesforce", "NYSE", "Technology"),
    stock("ORCL", "Oracle", "NYSE", "Technology"),
    stock("IBM", "IBM", "NYSE", "Technology"),
    stock("CSCO", "Cisco", "NASDAQ", "Technology"),
    stock("ADBE", "Adobe", "NASDAQ", "Technology"),
    stock("NFLX", "Netflix", "NASDAQ", "Communication"),
    stock("DIS", "Walt Disney", "NYSE", "Communication"),
    stock("VZ", "Verizon", "NYSE", "Communication"),
    stock("JPM", "JPMorgan Chase", "NYSE", "Financials"),
    stock("BAC", "Bank of America", "NYSE", "Financials"),
    stock("WFC", "Wells Fargo", "NYSE", "Financials"),
    stock("GS", "Goldman Sachs", "NYSE", "Financials"),
    stock("MS", "Morgan Stanley", "NYSE", "Financials"),
    stock("V", "Visa", "NYSE", "Financials"),
    stock("MA", "Mastercard", "NYSE", "Financials"),
    stock("AXP", "American Express", "NYSE", "Financials"),
    stock("BRK.B", "Berkshire Hathaway B", "NYSE", "Financials"),
    stock("LLY", "Eli Lilly", "NYSE", "Healthcare"),
    stock("JNJ", "Johnson & Johnson", "NYSE", "Healthcare"),
    stock("UNH", "UnitedHealth", "NYSE", "Healthcare"),
    stock("MRK", "Merck", "NYSE", "Healthcare"),
    stock("ABBV", "AbbVie", "NYSE", "Healthcare"),
    stock("PFE", "Pfizer", "NYSE", "Healthcare"),
    stock("AMGN", "Amgen", "NASDAQ", "Healthcare"),
    stock("GILD", "Gilead Sciences", "NASDAQ", "Healthcare"),
    stock("WMT", "Walmart", "NYSE", "Consumer"),
    stock("COST", "Costco", "NASDAQ", "Consumer"),
    stock("HD", "Home Depot", "NYSE", "Consumer"),
    stock("MCD", "McDonald's", "NYSE", "Consumer"),
    stock("KO", "Coca-Cola", "NYSE", "Consumer"),
    stock("PEP", "PepsiCo", "NASDAQ", "Consumer"),
    stock("PG", "Procter & Gamble", "NYSE", "Consumer"),
    stock("NKE", "Nike", "NYSE", "Consumer"),
    stock("XOM", "Exxon Mobil", "NYSE", "Energy"),
    stock("CVX", "Chevron", "NYSE", "Energy"),
    stock("COP", "ConocoPhillips", "NYSE", "Energy"),
    stock("SLB", "Schlumberger", "NYSE", "Energy"),
    stock("CAT", "Caterpillar", "NYSE", "Industrials"),
    stock("BA", "Boeing", "NYSE", "Industrials"),
    stock("GE", "GE Aerospace", "NYSE", "Industrials"),
    stock("RTX", "RTX Corporation", "NYSE", "Industrials"),
    stock("UNP", "Union Pacific", "NYSE", "Industrials"),
    stock("TSM", "Taiwan Semiconductor", "NYSE", "Technology"),
    stock("BABA", "Alibaba", "NYSE", "Technology"),
    stock("SHOP", "Shopify", "NASDAQ", "Technology"),
    stock("UBER", "Uber", "NYSE", "Technology"),
    stock("PYPL", "PayPal", "NASDAQ", "Financials"),
    stock("SQ", "Block", "NYSE", "Financials"),
    stock("COIN", "Coinbase", "NASDAQ", "Financials"),
    stock("SMCI", "Super Micro Computer", "NASDAQ", "Technology"),
    stock("DELL", "Dell Technologies", "NYSE", "Technology"),
    stock("PANW", "Palo Alto Networks", "NASDAQ", "Technology"),
    stock("CRWD", "CrowdStrike", "NASDAQ", "Technology"),
    stock("SNOW", "Snowflake", "NYSE", "Technology"),
    stock("MRVL", "Marvell Technology", "NASDAQ", "Technology"),
    stock("ASML", "ASML Holding", "NASDAQ", "Technology"),
    stock("NOW", "ServiceNow", "NYSE", "Technology"),
    stock("UBS", "UBS Group", "NYSE", "Financials"),
    stock("HSBC", "HSBC Holdings", "NYSE", "Financials"),
    stock("SAP", "SAP SE", "NYSE", "Technology"),
    stock("TM", "Toyota Motor", "NYSE", "Consumer"),
    stock("NVS", "Novartis", "NYSE", "Healthcare"),
    stock("AZN", "AstraZeneca", "NASDAQ", "Healthcare"),
    stock("NVO", "Novo Nordisk", "NYSE", "Healthcare"),
    stock("BHP", "BHP Group", "NYSE", "Materials"),
    stock("RIO", "Rio Tinto", "NYSE", "Materials"),
    stock("LIN", "Linde", "NASDAQ", "Materials"),
    stock("NEE", "NextEra Energy", "NYSE", "Utilities"),
    stock("TMO", "Thermo Fisher", "NYSE", "Healthcare"),
    stock("ABT", "Abbott Laboratories", "NYSE", "Healthcare"),
    stock("TXN", "Texas Instruments", "NASDAQ", "Technology"),
    stock("ADI", "Analog Devices", "NASDAQ", "Technology"),
    stock("SCHW", "Charles Schwab", "NYSE", "Financials"),
    stock("DE", "Deere & Company", "NYSE", "Industrials"),
    stock("LOW", "Lowe's", "NYSE", "Consumer"),
    stock("TJX", "TJX Companies", "NYSE", "Consumer"),
    stock("PM", "Philip Morris", "NYSE", "Consumer"),
    stock("SHEL", "Shell", "NYSE", "Energy"),
    stock("TTE", "TotalEnergies", "NYSE", "Energy"),
  ],
  etfs: [
    etf("SPY", "SPDR S&P 500 ETF Trust", "AMEX", "Broad Market"),
    etf("IVV", "iShares Core S&P 500 ETF", "AMEX", "Broad Market"),
    etf("VTI", "Vanguard Total Stock Market ETF", "AMEX", "Broad Market"),
    etf("QQQ", "Invesco QQQ Trust", "NASDAQ", "Broad Market"),
    etf("IWM", "iShares Russell 2000 ETF", "AMEX", "Broad Market"),
    etf("DIA", "SPDR Dow Jones Industrial Average ETF", "AMEX", "Broad Market"),
    etf("VTV", "Vanguard Value ETF", "AMEX", "Factor"),
    etf("VUG", "Vanguard Growth ETF", "AMEX", "Factor"),
    etf("IEMG", "iShares Core MSCI Emerging Markets ETF", "AMEX", "International"),
    etf("VWO", "Vanguard FTSE Emerging Markets ETF", "AMEX", "International"),
    etf("EFA", "iShares MSCI EAFE ETF", "AMEX", "International"),
    etf("EEM", "iShares MSCI Emerging Markets ETF", "AMEX", "International"),
    etf("GLD", "SPDR Gold Shares", "AMEX", "Commodities"),
    etf("SLV", "iShares Silver Trust", "AMEX", "Commodities"),
    etf("USO", "United States Oil Fund", "AMEX", "Commodities"),
    etf("UNG", "United States Natural Gas Fund", "AMEX", "Commodities"),
    etf("BND", "Vanguard Total Bond Market ETF", "NASDAQ", "Fixed Income"),
    etf("AGG", "iShares Core US Aggregate Bond ETF", "NASDAQ", "Fixed Income"),
    etf("TLT", "iShares 20+ Year Treasury Bond ETF", "NASDAQ", "Fixed Income"),
    etf("VCIT", "Vanguard Intermediate-Term Corporate Bond ETF", "NASDAQ", "Fixed Income"),
    etf("LQD", "iShares iBoxx Investment Grade Corporate Bond ETF", "AMEX", "Fixed Income"),
    etf("HYG", "iShares iBoxx High Yield Corporate Bond ETF", "AMEX", "Fixed Income"),
    etf("XLK", "Technology Select Sector SPDR Fund", "AMEX", "Sector"),
    etf("XLF", "Financial Select Sector SPDR Fund", "AMEX", "Sector"),
    etf("XLE", "Energy Select Sector SPDR Fund", "AMEX", "Sector"),
    etf("XLV", "Health Care Select Sector SPDR Fund", "AMEX", "Sector"),
    etf("XLI", "Industrial Select Sector SPDR Fund", "AMEX", "Sector"),
    etf("SOXX", "iShares Semiconductor ETF", "NASDAQ", "Sector"),
    etf("SMH", "VanEck Semiconductor ETF", "NASDAQ", "Sector"),
    etf("SOXL", "Direxion Daily Semiconductor Bull 3X ETF", "AMEX", "Leveraged"),
    etf("TQQQ", "ProShares UltraPro QQQ", "NASDAQ", "Leveraged"),
    etf("SQQQ", "ProShares UltraPro Short QQQ", "NASDAQ", "Leveraged"),
    etf("UUP", "Invesco DB US Dollar Index Bullish Fund", "AMEX", "Currency"),
    etf("FXE", "Invesco CurrencyShares Euro Trust", "AMEX", "Currency"),
    etf("FXB", "Invesco CurrencyShares British Pound Trust", "AMEX", "Currency"),
    etf("ARKK", "ARK Innovation ETF", "AMEX", "Thematic"),
    etf("IBIT", "iShares Bitcoin Trust", "NASDAQ", "Crypto"),
    etf("FBTC", "Fidelity Wise Origin Bitcoin Fund", "AMEX", "Crypto"),
    etf("ETHA", "iShares Ethereum Trust", "NASDAQ", "Crypto"),
  ],
};

export function instrumentHref(
  assetClassSlug: string,
  instrument: MarketInstrument
): string {
  const slug =
    instrument.slug ?? instrument.symbol.toLowerCase().replace("/", "-");
  return `/markets/${assetClassSlug}/${slug}`;
}

export function getInstrumentGroups(
  instruments: MarketInstrument[]
): { group: string; items: MarketInstrument[] }[] {
  const map = new Map<string, MarketInstrument[]>();
  for (const item of instruments) {
    const group = item.group ?? "All";
    const list = map.get(group) ?? [];
    list.push(item);
    map.set(group, list);
  }
  return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
}

export function countInstruments(): number {
  return Object.values(MARKET_INSTRUMENTS).reduce(
    (sum, list) => sum + list.length,
    0
  );
}
