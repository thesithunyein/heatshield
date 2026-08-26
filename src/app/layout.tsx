import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HeatShield — AI-Powered Urban Heat Defense",
  description: "See heat. Stop heat. Save cities. Real-time urban temperature intelligence powered by FortyGuard.",
  icons: { icon: "/heatshield-logo.png" },
  openGraph: {
    title: "HeatShield — AI-Powered Urban Heat Defense",
    description: "Real-time urban heat intelligence. Cool routes, risk scoring, and AI advisory for cities.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-[var(--hs-bg)] text-[var(--hs-text-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
