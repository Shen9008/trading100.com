import { cn } from "@/lib/utils";

type PageShellProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
};

export function PageShell({
  title,
  description,
  eyebrow = "Trading 100",
  children,
  className,
}: PageShellProps) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-14", className)}>
      <header className="mb-10 animate-fade-up border-b border-white/[0.06] pb-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
        )}
      </header>
      {children}
    </div>
  );
}
