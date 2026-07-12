"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  onNavigate?: () => void;
};

export function MobileNav({ onNavigate }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="rounded-2xl border border-white/[0.06] bg-header/95 p-3 backdrop-blur-2xl lg:hidden"
      aria-label="Mobile"
    >
      <Link
        href="/markets"
        onClick={onNavigate}
        className="mb-2 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground shadow-glow-sm transition-all hover:brightness-110"
      >
        <TrendingUp className="h-4 w-4" aria-hidden="true" />
        Live Markets
      </Link>

      <ul className="flex flex-col gap-1">
        {NAV_LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "block min-h-11 cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
        <li className="mt-1 border-t border-white/[0.05] pt-1">
          <Link
            href="/tools/currency-converter"
            onClick={onNavigate}
            className="block min-h-11 cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
          >
            Currency Converter
          </Link>
        </li>
      </ul>
    </nav>
  );
}
