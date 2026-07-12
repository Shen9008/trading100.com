"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { MobileNav } from "./MobileNav";
import { SiteLogo } from "./SiteLogo";
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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] lg:px-6">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border px-3 transition-all duration-500 sm:px-4 lg:px-5",
          scrolled
            ? "border-white/[0.08] bg-header/85 shadow-premium backdrop-blur-2xl"
            : "border-white/[0.04] bg-header/50 backdrop-blur-xl"
        )}
      >
        <SiteLogo />

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

        <div className="flex items-center gap-1">
          <Link
            href="/news"
            className="touch-target cursor-pointer rounded-xl text-muted-foreground transition-all duration-200 hover:bg-white/[0.05] hover:text-foreground"
            aria-label="Search news"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/markets"
            className="hidden cursor-pointer items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-glow-sm transition-all duration-200 hover:brightness-110 sm:inline-flex sm:min-h-11"
          >
            Live Markets
          </Link>
          <button
            type="button"
            className="touch-target cursor-pointer rounded-xl text-muted-foreground transition-all hover:bg-white/[0.05] hover:text-foreground lg:hidden"
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
          "mx-auto max-w-7xl transition-all duration-300 lg:hidden",
          mobileOpen
            ? "mt-2 max-h-[min(32rem,calc(100dvh-5.5rem))] overflow-y-auto opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        )}
      >
        <MobileNav onNavigate={() => setMobileOpen(false)} />
      </div>
    </header>
  );
}
