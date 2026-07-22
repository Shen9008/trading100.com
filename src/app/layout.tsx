import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SiteContextLinks } from "@/components/layout/SiteContextLinks";
import { AppBackground } from "@/components/layout/AppBackground";
import { buildMetadata } from "@/lib/metadata";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import {
  BRAND_APPLE_TOUCH,
  BRAND_FAVICON,
  BRAND_ICON,
} from "@/lib/constants/brand";
import { HOME_KEYWORDS } from "@/lib/seo/page-seo";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#06080f",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  ...buildMetadata({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: "/",
    keywords: HOME_KEYWORDS,
  }),
  icons: {
    icon: [
      { url: BRAND_FAVICON, type: "image/webp", sizes: "32x32" },
      { url: BRAND_ICON, type: "image/webp", sizes: "512x512" },
    ],
    apple: [{ url: BRAND_APPLE_TOUCH, type: "image/webp", sizes: "180x180" }],
    shortcut: BRAND_FAVICON,
  },
};

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
        <main className="flex-1">{children}</main>
        <SiteContextLinks />
        <Footer />
      </body>
    </html>
  );
}
