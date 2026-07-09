import { cn, formatPercent } from "@/lib/utils";

type PriceChangeBadgeProps = {
  value: number;
  showSign?: boolean;
  className?: string;
  size?: "sm" | "md";
};

export function PriceChangeBadge({
  value,
  showSign = true,
  className,
  size = "sm",
}: PriceChangeBadgeProps) {
  const isPositive = value >= 0;
  const isZero = value === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-mono font-medium tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        isZero && "bg-white/[0.06] text-muted-foreground",
        !isZero &&
          isPositive &&
          "bg-positive/15 text-positive ring-1 ring-inset ring-positive/20",
        !isZero &&
          !isPositive &&
          "bg-negative/15 text-negative ring-1 ring-inset ring-negative/20",
        className
      )}
    >
      {showSign ? formatPercent(value) : `${Math.abs(value).toFixed(2)}%`}
    </span>
  );
}
