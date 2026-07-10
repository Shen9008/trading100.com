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
    <div className={cn("mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16", className)}>
      <header className="mb-12 animate-fade-up">
        <div className="hero-frame px-6 py-8 sm:px-10 sm:py-10">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
