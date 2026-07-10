"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 lg:px-6">
      <div
        className={cn(
          "mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between rounded-2xl border px-4 transition-all duration-500 lg:px-5",
          scrolled
            ? "border-white/[0.08] bg-header/85 shadow-premium backdrop-blur-2xl"
            : "border-white/[0.04] bg-header/50 backdrop-blur-xl"
        )}
      >
        <Link
          href="/"
          className="group flex cursor-pointer items-center gap-3"
          aria-label={`${SITE_NAME} home`}
        >
          <div className="relative flex h-10 w-10 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand/25 to-accent/10 opacity-80 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 rounded-xl border border-brand/30" />
            <span className="relative font-display text-sm font-extrabold tracking-tighter text-brand">
              T1
            </span>
          </div>
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-[15px] font-bold tracking-tight">
              <span className="text-brand">Trading</span>
              <span className="text-foreground/95">100</span>
            </span>
            <span className="mt-0.5 font-mono text-[9px] uppercase tracking-luxury text-muted-foreground">
              Markets Intelligence
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "nav-link cursor-pointer",
                  active && "nav-link-active"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/news"
            className="cursor-pointer rounded-xl p-2.5 text-muted-foreground transition-all duration-200 hover:bg-white/[0.05] hover:text-foreground"
            aria-label="Search news"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/markets"
            className="hidden cursor-pointer items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-glow-sm transition-all duration-200 hover:brightness-110 sm:inline-flex"
          >
            Live Markets
          </Link>
          <button
            type="button"
            className="cursor-pointer rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-white/[0.05] hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mx-auto max-w-7xl overflow-hidden transition-all duration-300 lg:hidden",
          mobileOpen ? "mt-2 max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <MobileNav onNavigate={() => setMobileOpen(false)} />
      </div>
    </header>
  );
}
