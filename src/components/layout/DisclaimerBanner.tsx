export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <aside
      className={`border-t border-brand/20 bg-brand/5 text-amber-100/90 ${
        compact ? "px-4 py-3 text-xs" : "px-4 py-4 text-sm"
      }`}
      role="note"
      aria-label="Financial disclaimer"
    >
      <p className="mx-auto max-w-6xl leading-relaxed">
        <strong className="font-semibold text-brand">Risk Disclosure:</strong>{" "}
        Content on Trading 100 is for educational and informational purposes only
        and does not constitute financial advice. Prices may be delayed and sourced
        from third parties. Trading forex, CFDs, and crypto involves substantial
        risk of loss. Conduct your own research and consult a licensed advisor.
      </p>
    </aside>
  );
}
