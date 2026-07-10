export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={`border-t border-brand/15 bg-gradient-to-r from-brand/[0.06] via-brand/[0.03] to-transparent text-foreground/85 ${
        compact ? "px-4 py-3 text-xs" : "px-4 py-4 text-sm"
      }`}
      role="note"
      aria-label="Financial disclaimer"
    >
      <p className="mx-auto max-w-6xl leading-relaxed">
        <strong className="font-semibold text-brand">Risk disclosure:</strong>{" "}
        Content on Trading 100 is for educational and informational purposes only
        and does not constitute financial advice. Prices may be delayed and sourced
        from third parties. Trading forex, CFDs, and crypto involves substantial
        risk of loss. Conduct your own research and consult a licensed advisor.
      </p>
    </aside>
  );
}
