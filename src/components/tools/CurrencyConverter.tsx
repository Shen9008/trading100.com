"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENCY_OPTIONS } from "@/lib/api/frankfurter";
import { formatPrice } from "@/lib/utils";

export function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/forex/convert?amount=${amount}&from=${from}&to=${to}`
      );
      if (!res.ok) throw new Error("Conversion failed");
      const data = (await res.json()) as {
        result: number;
        rate: number;
        date: string;
      };
      setResult(data.result);
      setRate(data.rate);
      setDate(data.date);
    } catch {
      setError("Unable to fetch rates. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [amount, from, to]);

  useEffect(() => {
    const timer = setTimeout(convert, 300);
    return () => clearTimeout(timer);
  }, [convert]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="glass-panel mx-auto max-w-lg p-6 sm:p-8">
      <h2 className="font-display text-xl font-bold">Currency Converter</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        ECB reference rates, updated daily
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="amount" className="mb-1 block text-sm text-muted-foreground">
            Amount
          </label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-3">
          <div>
            <label htmlFor="from" className="mb-1 block text-sm text-muted-foreground">
              From
            </label>
            <select
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm transition-colors focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={swap}
            aria-label="Swap currencies"
            className="mb-0.5"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          <div>
            <label htmlFor="to" className="mb-1 block text-sm text-muted-foreground">
              To
            </label>
            <select
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm transition-colors focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-brand/20 bg-brand/5 p-5 text-center">
          {loading ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : result !== null ? (
            <>
              <p className="text-2xl font-bold tabular-nums">
                {formatPrice(result, 4)} {to}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                1 {from} = {formatPrice(rate ?? 0, 4)} {to}
              </p>
              {date && (
                <p className="mt-1 text-xs text-muted-foreground">
                  ECB rate as of {date}
                </p>
              )}
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Rates sourced from Frankfurter (European Central Bank reference rates).
        For informational purposes only.
      </p>
    </div>
  );
}
