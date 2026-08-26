"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar({ dark = false }: { dark?: boolean }) {
  const bg = dark ? "bg-black/70 border-white/10" : "bg-white/80 border-[#E5E5EA]";
  const textPrimary = dark ? "text-white" : "text-[#111]";
  const textSecondary = dark ? "text-white/60" : "text-[#6B6B70]";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 border-b ${bg} backdrop-blur-xl`}>
      <div className="flex items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative h-7 w-7 overflow-hidden rounded-md bg-white border border-[#E5E5EA] p-[3px] transition-transform duration-300 group-hover:scale-105">
            <Image src="/heatshield-logo.svg" alt="HeatShield" fill className="object-contain" priority />
          </div>
          <span className={`font-semibold text-lg tracking-tight ${textPrimary}`}>HeatShield</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className={`text-sm font-light transition-colors ${textSecondary} ${dark ? "hover:text-white" : "hover:text-[#111]"}`}>Dashboard</Link>
          <Link href="/routes" className={`text-sm font-light transition-colors ${textSecondary} ${dark ? "hover:text-white" : "hover:text-[#111]"}`}>Cool Routes</Link>
          <Link href="/advisor" className={`text-sm font-light transition-colors ${textSecondary} ${dark ? "hover:text-white" : "hover:text-[#111]"}`}>AI Advisor</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className={`hidden md:inline-block text-sm font-light transition-colors ${textSecondary} ${dark ? "hover:text-white" : "hover:text-[#111]"}`}>Go Live</Link>
          <Link href="/dashboard" className={`hidden md:inline-block rounded-full px-5 py-2 text-sm font-medium transition-colors ${dark ? "bg-white text-black hover:bg-white/90" : "bg-[#111] text-white hover:bg-[#333]"}`}>
            Launch App
          </Link>
          <button className={`md:hidden flex items-center justify-center w-9 h-9 rounded-full border ${dark ? "border-white/20" : "border-[#E5E5EA]"}`} aria-label="Menu">
            <div className="flex flex-col gap-[4px]">
              <span className={`block h-[1.5px] w-3.5 rounded-full ${dark ? "bg-white" : "bg-[#111]"}`} />
              <span className={`block h-[1.5px] w-3.5 rounded-full ${dark ? "bg-white" : "bg-[#111]"}`} />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
