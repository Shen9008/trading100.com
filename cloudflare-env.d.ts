interface CloudflareEnv {
  FORECASTS_KV: KVNamespace;
  FINNHUB_API_KEY?: string;
  CRON_SECRET?: string;
  NEXT_PUBLIC_SITE_URL?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var process: NodeJS.Process & { env: CloudflareEnv & NodeJS.ProcessEnv };
}

export {};
