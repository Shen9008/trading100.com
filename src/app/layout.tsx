import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppBackground } from "@/components/layout/AppBackground";
import { TickerTape } from "@/components/widgets/TickerTape";
import { buildMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const plusJakartaDisplay = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = buildMetadata({
  title: SITE_NAME,
  description:
    "Live forex, crypto, commodities, and stock market data with news, forecasts, and trading education.",
  path: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakarta.variable} ${plusJakartaDisplay.variable} ${ibmPlexMono.variable} flex min-h-screen flex-col font-sans`}
      >
        <AppBackground />
        <Header />
        <TickerTape />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
