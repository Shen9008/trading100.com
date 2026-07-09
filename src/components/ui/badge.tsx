import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border-brand/30 bg-brand/10 text-brand",
        secondary: "border-white/10 bg-white/[0.04] text-muted-foreground",
        outline: "border-white/15 text-foreground",
        forex: "border-blue-500/30 bg-blue-500/10 text-blue-400",
        crypto: "border-purple-500/30 bg-purple-500/10 text-purple-400",
        commodities: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        indices: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
        stocks: "border-slate-400/30 bg-slate-400/10 text-slate-300",
        education: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        forecast: "border-orange-500/30 bg-orange-500/10 text-orange-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
