import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ParticlesBackground } from "@/components/particles-background";
import { Header } from "@/components/header";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://namerai.frontera.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Namer.ai - AI-Powered Brand Name Generator",
    template: "%s | Namer.ai",
  },
  description:
    "Create unique, multilingual brand names powered by AI. Fast, memorable, and globally ready with automated domain availability checks. 500 free queries per month.",
  keywords: [
    "brand name generator",
    "AI name generator",
    "business name generator",
    "company name generator",
    "domain name checker",
    "brand naming tool",
    "multilingual names",
    "AI branding",
    "startup name generator",
    "creative business names",
    "name generator free",
    "business name ideas",
  ],
  authors: [{ name: "Frontera", url: "https://namer.ai" }],
  creator: "Frontera",
  publisher: "Frontera",
  applicationName: "Namer.ai",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "Business Tools",
  classification: "AI-Powered Business Name Generator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: "Namer.ai - AI-Powered Brand Name Generator",
    description:
      "Create unique, multilingual brand names powered by AI. Fast, memorable, and globally ready with automated domain availability checks.",
    siteName: "Namer.ai",

  },
  twitter: {
    card: "summary_large_image",
    title: "Namer.ai - AI-Powered Brand Name Generator",
    description:
      "Create unique, multilingual brand names powered by AI with automated domain checks.",

    creator: process.env.NEXT_PUBLIC_TWITTER_CREATOR || "@frontera",
    site: process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@namer_ai",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
    types: {
      "application/rss+xml": `${APP_URL}/rss.xml`,
    },
  },
  // Verification tags for search engines (add actual codes in .env)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  other: {
    "revisit-after": "7 days",
    rating: "General",
    distribution: "Global",
    language: "EN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full relative flex flex-col bg-linear-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 font-(family-name:--font-geist-sans) text-slate-900`}
      >
        <Analytics />
        <ParticlesBackground />
        <Header />
        {children}
      </body>
    </html>
  );
}
