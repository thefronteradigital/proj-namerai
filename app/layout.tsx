import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ParticlesBackground } from "@/components/particles-background";
import { Header } from "@/components/header";

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

export const metadata: Metadata = {
  metadataBase: new URL('https://namer.ai'),
  title: {
    default: "Namer.ai - AI-Powered Brand Name Generator",
    template: "%s | Namer.ai"
  },
  description: "Create unique, multilingual brand names powered by AI. Fast, memorable, and globally ready with automated domain availability checks. 500 free queries per month.",
  keywords: ["brand name generator", "AI name generator", "business name", "company name", "domain name", "brand naming", "multilingual names", "AI branding"],
  authors: [{ name: "Frontera" }],
  creator: "Frontera",
  publisher: "Frontera",
  applicationName: "Namer.ai",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://namer.ai",
    title: "Namer.ai - AI-Powered Brand Name Generator",
    description: "Create unique, multilingual brand names powered by AI. Fast, memorable, and globally ready with automated domain availability checks.",
    siteName: "Namer.ai",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Namer.ai - AI Brand Name Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Namer.ai - AI-Powered Brand Name Generator",
    description: "Create unique, multilingual brand names powered by AI with automated domain checks.",
    images: ["/og-image.png"],
    creator: "@frontera",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://namer.ai",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full relative flex flex-col bg-linear-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 font-[family-name:var(--font-geist-sans)] text-slate-900`}
      >
        <ParticlesBackground />
        <Header />
        {children}
      </body>
    </html>
  );
}
