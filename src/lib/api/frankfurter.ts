export type FrankfurterRates = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

export async function fetchLatestRates(
  from = "USD",
  to: string[] = ["EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "MYR", "SGD"]
): Promise<FrankfurterRates> {
  const res = await fetch(
    `https://api.frankfurter.app/latest?from=${from}&to=${to.join(",")}`,
    { next: { revalidate: 300 } }
  );

  if (!res.ok) {
    throw new Error(`Frankfurter API error: ${res.status}`);
  }

  return res.json();
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<{ result: number; rate: number; date: string }> {
  const res = await fetch(
    `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Frankfurter conversion error: ${res.status}`);
  }

  const data = (await res.json()) as FrankfurterRates & {
    rates: Record<string, number>;
  };
  return {
    result: data.rates[to],
    rate: data.rates[to] / amount,
    date: data.date,
  };
}

export const CURRENCY_OPTIONS = [
  "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "MYR", "SGD", "HKD", "NZD",
];
