import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-brand/25 bg-brand/10 text-brand",
        secondary: "border-white/[0.08] bg-white/[0.03] text-muted-foreground",
        outline: "border-white/10 text-foreground/90",
        forex: "border-blue-400/25 bg-blue-500/10 text-blue-300",
        crypto: "border-violet-400/25 bg-violet-500/10 text-violet-300",
        commodities: "border-amber-400/25 bg-amber-500/10 text-amber-300",
        indices: "border-teal-400/25 bg-teal-500/10 text-teal-300",
        stocks: "border-slate-400/25 bg-slate-500/10 text-slate-300",
        education: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
        forecast: "border-orange-400/25 bg-orange-500/10 text-orange-300",
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
