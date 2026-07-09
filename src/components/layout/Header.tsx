"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X, Zap } from "lucide-react";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-white/[0.08] bg-header/90 shadow-lg shadow-black/20 backdrop-blur-xl"
          : "border-transparent bg-header/70 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link
          href="/"
          className="group flex cursor-pointer items-center gap-2.5"
          aria-label={`${SITE_NAME} home`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand/30 bg-brand/10 shadow-glow transition-all group-hover:border-brand/60 group-hover:bg-brand/20">
            <Zap className="h-4 w-4 text-brand" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">
              <span className="text-brand">TRADING</span>
              <span className="text-foreground">100</span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Markets
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
                  active && "text-brand after:!w-3/4"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/news"
            className="cursor-pointer rounded-lg p-2.5 text-muted-foreground transition-all duration-200 hover:bg-white/[0.06] hover:text-brand"
            aria-label="Search news"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/markets"
            className="hidden cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-glow transition-all duration-200 hover:brightness-110 sm:inline-flex"
          >
            Live Markets
          </Link>
          <button
            type="button"
            className="cursor-pointer rounded-lg p-2.5 text-muted-foreground transition-all hover:bg-white/[0.06] hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className={cn("lg:hidden", mobileOpen ? "block" : "hidden")}>
        <MobileNav onNavigate={() => setMobileOpen(false)} />
      </div>
    </header>
  );
}
