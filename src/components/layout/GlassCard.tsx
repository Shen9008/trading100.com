import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
};

export function GlassCard({
  children,
  className,
  hover = false,
  padding = true,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        hover ? "glass-panel-hover" : "glass-panel",
        padding && "p-4 sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
