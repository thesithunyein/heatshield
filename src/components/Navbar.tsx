"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar({ dark = false }: { dark?: boolean }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-[rgba(9,9,11,0.85)] backdrop-blur-xl">
      <div className="flex items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white p-[3px] transition-transform duration-300 group-hover:scale-105">
            <Image src="/heatshield-logo.png" alt="HeatShield" fill className="object-contain" priority />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">HeatShield</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-white/60 hover:text-white text-sm font-light transition-colors">Dashboard</Link>
          <Link href="/routes" className="text-white/60 hover:text-white text-sm font-light transition-colors">Cool Routes</Link>
          <Link href="/advisor" className="text-white/60 hover:text-white text-sm font-light transition-colors">AI Advisor</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="hidden md:inline-block text-white/60 hover:text-white text-sm font-light transition-colors">Go Live</Link>
          <Link href="/dashboard" className="hidden md:inline-block rounded-full bg-white text-black px-5 py-2 text-sm font-medium hover:bg-white/90 transition-colors">
            Launch App
          </Link>
          <button className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-white/20" aria-label="Menu">
            <div className="flex flex-col gap-[4px]">
              <span className="block h-[1.5px] w-3.5 rounded-full bg-white" />
              <span className="block h-[1.5px] w-3.5 rounded-full bg-white" />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
