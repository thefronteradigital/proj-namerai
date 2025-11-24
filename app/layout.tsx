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
  title: "Namer.ai - Project Name Generator",
  description: "Create unique, multilingual brand names powered by AI — fast, memorable, and globally ready.",
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
