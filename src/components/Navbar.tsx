"use client";

import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--hs-border-subtle)] bg-[rgba(9,9,11,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white p-1 transition-transform group-hover:scale-105">
            <Image src="/heatshield-logo.svg" alt="HeatShield" fill className="object-contain" priority />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">HeatShield</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/routes">Cool Routes</NavLink>
          <NavLink href="/advisor">AI Advisor</NavLink>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[var(--hs-border)] bg-[var(--hs-bg-card)] px-3 py-1.5 text-xs">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white" />
            <span className="text-[var(--hs-text-muted)]">LIVE</span>
            <span className="font-mono font-medium text-white">112°F</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm text-[var(--hs-text-secondary)] transition-colors hover:bg-[var(--hs-bg-card)] hover:text-white"
    >
      {children}
    </Link>
  );
}
