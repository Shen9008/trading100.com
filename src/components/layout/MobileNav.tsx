"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  onNavigate?: () => void;
};

export function MobileNav({ onNavigate }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="border-t border-white/[0.06] bg-header/95 px-4 py-4 backdrop-blur-xl lg:hidden"
      aria-label="Mobile"
    >
      <ul className="flex flex-col gap-1">
        {NAV_LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "block cursor-pointer rounded-lg px-3 py-3 text-sm font-medium transition-colors",
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
        <li className="mt-2 border-t border-white/[0.06] pt-2">
          <Link
            href="/tools/currency-converter"
            onClick={onNavigate}
            className="block cursor-pointer rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
          >
            Currency Converter
          </Link>
        </li>
      </ul>
    </nav>
  );
}
