"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const STATS = [
  { value: "20m²", label: "Hyperlocal Resolution" },
  { value: "2m", label: "Above Ground" },
  { value: "6", label: "API Endpoints" },
  { value: "Real-time", label: "Live Data Feed" },
];

const FEATURES = [
  {
    icon: "◼",
    title: "Live Heat Maps",
    desc: "Interactive thermal visualization of urban temperatures at 20m² resolution.",
    href: "/dashboard",
  },
  {
    icon: "◻",
    title: "Risk Scoring",
    desc: "AI-driven composite risk scores combining temperature, humidity, UV, and wind.",
    href: "/dashboard",
  },
  {
    icon: "▸",
    title: "Cool Route Planner",
    desc: "Navigate cities avoiding peak heat — find the coolest path between any two points.",
    href: "/routes",
  },
  {
    icon: "◈",
    title: "AI Heat Advisor",
    desc: "Ask questions about heat safety, get real-time recommendations powered by FortyGuard data.",
    href: "/advisor",
  },
];

export default function Home() {
  const [heroTemp, setHeroTemp] = useState(0);
  const targetTemp = 112;

  useEffect(() => {
    const duration = 2000;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setHeroTemp(Math.round(targetTemp * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Nav ─────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--hs-border-subtle)] bg-[rgba(9,9,11,0.85)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white p-1">
              <Image src="/heatshield-logo.svg" alt="" fill className="object-contain" priority />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">HeatShield</span>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/routes">Cool Routes</NavLink>
            <NavLink href="/advisor">AI Advisor</NavLink>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-all hover:bg-[#E4E4E7]"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16">
        {/* Subtle white radial glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_70%)]" />
        </div>

        {/* Badge */}
        <div className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--hs-border)] bg-[var(--hs-bg-card)] px-4 py-1.5 text-xs text-[var(--hs-text-secondary)]">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-white" />
          FortyGuard Hackathon&apos;26 · Track 01 — Resilient Cities
        </div>

        {/* Headline */}
        <h1 className="relative mb-4 text-center text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
          <span className="block text-white">See Heat.</span>
          <span className="block text-white">Stop Heat.</span>
          <span className="block text-[var(--hs-text-muted)]">Save Cities.</span>
        </h1>

        {/* Sub */}
        <p className="relative mb-10 max-w-xl text-center text-lg text-[var(--hs-text-secondary)]">
          AI-powered urban heat defense platform. Real-time temperature
          intelligence, risk scoring, and cool route planning — powered by
          FortyGuard&apos;s hyperlocal Temperature API.
        </p>

        {/* Live Temp Display */}
        <div className="relative mb-12 hs-glass-card flex items-center gap-6 px-8 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--hs-text-muted)]">
              Phoenix, AZ — Live
            </div>
            <div className="font-mono text-5xl font-bold text-white">
              {heroTemp}°
              <span className="text-lg text-[var(--hs-text-muted)]">F</span>
            </div>
          </div>
          <div className="h-16 w-px bg-[var(--hs-border)]" />
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white" />
              <span className="text-[var(--hs-text-secondary)]">Risk Level:</span>
              <span className="font-semibold text-white">EXTREME</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--hs-text-secondary)]" />
              <span className="text-[var(--hs-text-secondary)]">Heat Index:</span>
              <span className="font-semibold text-[var(--hs-text-primary)]">118°F</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--hs-text-muted)]" />
              <span className="text-[var(--hs-text-secondary)]">UV Index:</span>
              <span className="font-semibold text-[var(--hs-text-primary)]">11</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="relative flex flex-col gap-4 sm:flex-row">
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-[#E4E4E7]"
          >
            Launch Dashboard →
          </Link>
          <Link
            href="/advisor"
            className="rounded-full border border-[var(--hs-border)] bg-[var(--hs-bg-card)] px-8 py-3 text-sm font-semibold text-[var(--hs-text-secondary)] transition-all hover:border-[var(--hs-text-muted)] hover:text-white"
          >
            Ask AI Advisor
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-5 w-5 text-[var(--hs-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────── */}
      <section className="border-y border-[var(--hs-border-subtle)] bg-[var(--hs-bg-elevated)]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-6 py-8">
              <span className="font-mono text-2xl font-bold text-white">
                {stat.value}
              </span>
              <span className="text-xs text-[var(--hs-text-muted)]">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for Climate Resilience
          </h2>
          <p className="text-[var(--hs-text-secondary)]">
            Four powerful tools to see, understand, and defend against urban heat.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Link
              key={f.title}
              href={f.href}
              className={`hs-glass-card group p-8 transition-all duration-300 hover:scale-[1.02] animate-fade-in-up animate-delay-${(i + 1) * 100}`}
            >
              <div className="mb-4 text-3xl text-white">{f.icon}</div>
              <h3 className="mb-2 text-xl font-semibold text-white">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--hs-text-secondary)]">
                {f.desc}
              </p>
              <div className="mt-4 text-sm font-medium text-[var(--hs-text-muted)] opacity-0 transition-opacity group-hover:opacity-100">
                Explore →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ──────────────────────────── */}
      <section className="border-t border-[var(--hs-border-subtle)] bg-[var(--hs-bg-elevated)] px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight">
            Powered by Real Data
          </h2>
          <p className="mb-12 text-[var(--hs-text-secondary)]">
            Built on FortyGuard&apos;s NVIDIA-recognized Temperature API — the same
            production infrastructure used by cities and enterprises worldwide.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["FortyGuard API", "Next.js 15", "TypeScript", "Tailwind CSS", "Vercel"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-[var(--hs-border)] bg-[var(--hs-bg-card)] px-4 py-2 text-xs font-medium text-[var(--hs-text-secondary)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="border-t border-[var(--hs-border-subtle)] px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded bg-white p-0.5">
              <Image src="/heatshield-logo.svg" alt="" fill className="object-contain" />
            </div>
            <span className="text-sm font-semibold text-white">HeatShield</span>
          </div>
          <p className="text-xs text-[var(--hs-text-muted)]">
            Built for FortyGuard Hackathon&apos;26 · Powered by FortyGuard Temperature API
          </p>
          <p className="text-xs text-[var(--hs-text-muted)]">
            © 2026 HeatShield.
          </p>
        </div>
      </footer>
    </div>
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
