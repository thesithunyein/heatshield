"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4";

const TICKER_ITEMS = [
  "20m² HYPERLOCAL RESOLUTION",
  "LIVE TEMPERATURE INTELLIGENCE",
  "REAL-TIME HEAT RISK SCORING",
  "AI-POWERED COOL ROUTES",
  "FORTYGUARD TEMPERATURE API",
  "NVIDIA-RECOGNIZED TECHNOLOGY",
];

const FEATURES = [
  { num: "01", title: "Live Heat Maps", desc: "Interactive thermal visualization at 20m² resolution.", href: "/dashboard" },
  { num: "02", title: "Risk Scoring", desc: "AI-driven composite risk from temperature, humidity, UV, wind.", href: "/dashboard" },
  { num: "03", title: "Cool Routes", desc: "Navigate cities avoiding peak heat exposure.", href: "/routes" },
  { num: "04", title: "AI Advisor", desc: "Real-time heat safety guidance, powered by FortyGuard data.", href: "/advisor" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroTemp, setHeroTemp] = useState(0);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const target = 112;
    const dur = 2200;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setHeroTemp(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <div className="w-full overflow-hidden">

      {/* ═══════════════════════════════════════════════════
          HERO — Video bg + Eloqwnt-style centered layout
         ═══════════════════════════════════════════════════ */}
      <section className="relative w-full h-screen">
        {/* Video */}
        <video autoPlay loop muted playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover">
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 flex flex-col h-full">

          {/* ── Nav — Eloqwnt style ──────────────── */}
          <nav className="flex items-center justify-between px-6 md:px-10 lg:px-16 py-5 md:py-6 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-7 w-7 overflow-hidden rounded-md bg-white p-[3px]">
                <Image src="/heatshield-logo.png" alt="" fill className="object-contain" priority />
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">HeatShield</span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              <Link href="/dashboard" className="text-white/60 hover:text-white text-sm font-light transition-colors">Dashboard</Link>
              <Link href="/routes" className="text-white/60 hover:text-white text-sm font-light transition-colors">Cool Routes</Link>
              <Link href="/advisor" className="text-white/60 hover:text-white text-sm font-light transition-colors">AI Advisor</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="hidden md:inline-block text-white/60 hover:text-white text-sm font-light transition-colors">Go Live</Link>
              {/* Hamburger icon — Eloqwnt style circle with lines */}
              <button onClick={() => setMenuOpen(true)} className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border border-white/20" aria-label="Menu">
                <div className="flex flex-col gap-[4px]">
                  <span className="block h-[1.5px] w-4 rounded-full bg-white" />
                  <span className="block h-[1.5px] w-4 rounded-full bg-white" />
                </div>
              </button>
              <Link href="/dashboard" className="hidden md:inline-flex items-center gap-2 bg-white text-black rounded-full px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors">
                Let&apos;s Go
              </Link>
            </div>
          </nav>

          {/* ── Hero Content — Eloqwnt centered layout ── */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            {/* Subtitle — above heading */}
            <p className="text-white/60 text-sm md:text-base font-light max-w-lg mb-4 sm:mb-5">
              Urban heat defense platform. Real-time temperature intelligence for resilient cities.
            </p>

            {/* Big heading */}
            <h1 className="font-bold text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] leading-[1.08] max-w-4xl tracking-tight">
              See Heat. Stop Heat.<br />
              <span className="text-white/40">Save Cities.</span>
            </h1>

            {/* CTA button */}
            <div className="mt-6 sm:mt-8">
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white rounded-full px-7 py-3 text-sm font-light hover:bg-white/20 hover:border-white/30 transition-all">
                Launch Dashboard
              </Link>
            </div>

            {/* Live temp — small inline */}
            <div className="mt-6 flex items-center gap-3 text-xs text-white/40">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span>Phoenix, AZ</span>
              <span className="font-mono text-white/70 font-medium">{heroTemp}°F</span>
              <span className="text-white/20">|</span>
              <span>Risk: <span className="text-white/70 font-medium">EXTREME</span></span>
            </div>
          </div>

          {/* Scroll arrow — Eloqwnt style black circle */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TICKER — Eloqwnt-style scrolling metrics
         ═══════════════════════════════════════════════════ */}
      <div className="bg-white border-y border-[var(--hs-border-subtle)] overflow-hidden py-4">
        <div className="flex whitespace-nowrap animate-[scroll_30s_linear_infinite]">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mx-8 text-sm font-semibold tracking-wider text-[#111] uppercase">
              / {item}
            </span>
          ))}
        </div>
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ═══ FEATURES — Light bg ═══ */}
      <section className="bg-white px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <p className="text-[#9CA0A6] text-sm font-light mb-3">What we build</p>
          <h2 className="font-bold text-[#111] text-3xl sm:text-4xl md:text-5xl leading-[1.1] max-w-lg">
            Four tools to <span className="text-[#9CA0A6]">defend</span> against urban heat
          </h2>
          <div className="mt-14 md:mt-16 grid gap-px bg-[#E5E5EA] rounded-2xl overflow-hidden md:grid-cols-2">
            {FEATURES.map((f) => (
              <Link key={f.title} href={f.href} className="group bg-white p-7 md:p-10 transition-all duration-300 hover:bg-[#FAFAFA]">
                <span className="text-[10px] font-mono text-[#9CA0A6] mb-4 block">{f.num}</span>
                <h3 className="text-[#111] text-xl md:text-2xl font-semibold mb-2">{f.title}</h3>
                <p className="text-[#6B6B70] text-sm font-light leading-relaxed max-w-xs">{f.desc}</p>
                <div className="mt-5 text-xs text-transparent group-hover:text-[#9CA0A6] transition-all duration-300 flex items-center gap-1">
                  Explore <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHO WE ARE — Eloqwnt split layout ═══ */}
      <section className="bg-[#F5F5F7] px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16 lg:gap-20">
          {/* Left — Video */}
          <div className="w-full md:w-1/2 shrink-0">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#111]">
              <video autoPlay loop muted playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover">
                <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260624_210218_173f8eba-17ff-4e27-972b-d128af25bf49.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10" />
            </div>
          </div>

          {/* Right — Text */}
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#111]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#111]">Who we are</span>
            </div>
            <h2 className="font-bold text-[#111] text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-6">
              Building the future<br />of <span className="text-[#9CA0A6]">urban climate</span><br />resilience
            </h2>
            <p className="text-[#6B6B70] text-base md:text-lg font-light leading-relaxed mb-5">
              HeatShield was born from a simple question: why do cities still fly blind when it comes to the deadliest weather hazard?
            </p>
            <p className="text-[#6B6B70] text-base md:text-lg font-light leading-relaxed mb-8">
              We combine FortyGuard&apos;s hyperlocal temperature data with AI to give cities, planners, and everyday people the intelligence they need to act before heat becomes a crisis.
            </p>
            <div className="flex items-center gap-8">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#111]">3.5B</div>
                <div className="text-[10px] text-[#9CA0A6] uppercase tracking-[0.15em] mt-0.5">People at risk by 2050</div>
              </div>
              <div className="h-10 w-px bg-[#E5E5EA]" />
              <div>
                <div className="text-2xl md:text-3xl font-bold text-[#111]">#1</div>
                <div className="text-[10px] text-[#9CA0A6] uppercase tracking-[0.15em] mt-0.5">Deadliest weather hazard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS — Light bg ═══ */}
      <section className="bg-[#F5F5F7] px-6 md:px-10 lg:px-16 py-16 md:py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {[
            { val: "20m²", label: "Resolution" },
            { val: "2m", label: "Above Ground" },
            { val: "6", label: "API Endpoints" },
            { val: "24/7", label: "Live Feed" },
          ].map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <div className="font-mono text-3xl md:text-4xl font-bold text-[#111]">{s.val}</div>
              <div className="mt-1 text-[10px] text-[#9CA0A6] uppercase tracking-[0.15em]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FAQ — Eloqwnt style ═══ */}
      <section className="bg-white px-6 md:px-10 lg:px-16 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:gap-16 lg:gap-24">
            <div className="md:w-1/3 mb-10 md:mb-0 shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[#111]" />
                <span className="text-xs font-semibold tracking-wider uppercase text-[#111]">FAQ</span>
              </div>
              <h2 className="font-bold text-[#111] text-3xl sm:text-4xl md:text-5xl leading-[1.1]">Frequently<br />Asked Questions</h2>
            </div>
            <div className="flex-1">
              {[
                { q: "What does HeatShield do?", a: "HeatShield provides real-time urban temperature intelligence using FortyGuard's hyperlocal Temperature API. We deliver heat maps, risk scores, cool route planning, and AI-powered safety guidance for cities worldwide." },
                { q: "How accurate is the temperature data?", a: "FortyGuard's Temperature API measures at 2m above ground with 20m² resolution — the most granular urban temperature data available. It's NVIDIA-recognized and used by city planners and enterprises globally." },
                { q: "Is HeatShield free to use?", a: "HeatShield offers a free tier with basic heat maps and risk scores. Pro features like real-time alerts, historical data, and the AI advisor require a subscription. FortyGuard API trial credits are included for hackathon participants." },
                { q: "Which cities does HeatShield support?", a: "HeatShield works with any location worldwide that FortyGuard's API covers. We currently have optimized data for major cities including Phoenix, Dubai, New Delhi, Cairo, Tokyo, Lagos, San Francisco, Abu Dhabi, Riyadh, and Sydney." },
                { q: "Can I use HeatShield for city planning?", a: "Absolutely. HeatShield is built for Track 01 — Resilient Cities & Infrastructure. Our heat maps, environmental parameters, and satellite segmentation data are ideal for urban planners, architects, and climate resilience researchers." },
                { q: "How does the AI Heat Advisor work?", a: "Our AI advisor uses Featherless AI (Qwen2.5-7B) to answer questions about heat safety, provide cooling strategies, and give emergency guidance. It's trained on heat safety best practices and powered by real FortyGuard data." },
              ].map((faq, i) => {
                const num = String(i + 1).padStart(2, "0");
                return (
                  <details key={i} className="border-b border-[#E5E5EA] group">
                    <summary className="flex items-center gap-4 sm:gap-6 py-5 sm:py-6 cursor-pointer list-none">
                      <span className="text-xs font-mono text-[#9CA0A6] w-6 shrink-0">{num}</span>
                      <span className="flex-1 text-base sm:text-lg font-medium text-[#111]">{faq.q}</span>
                      <div className="w-9 h-9 rounded-full bg-[#F0F0F2] flex items-center justify-center shrink-0 group-open:rotate-45 transition-transform duration-300">
                        <svg className="w-4 h-4 text-[#111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      </div>
                    </summary>
                    <p className="text-sm text-[#6B6B70] font-light leading-relaxed ml-10 sm:ml-12 pr-12 pb-5 sm:pb-6">{faq.a}</p>
                  </details>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER — Dark ═══ */}
      <footer className="bg-[#111] px-6 md:px-10 lg:px-16">
        <div className="max-w-6xl mx-auto py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 lg:gap-10">
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Heat Maps</Link></li>
                <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Risk Scoring</Link></li>
                <li><Link href="/routes" className="text-sm text-white/50 hover:text-white transition-colors">Cool Routes</Link></li>
                <li><Link href="/advisor" className="text-sm text-white/50 hover:text-white transition-colors">AI Advisor</Link></li>
                <li><a href="https://docs-api.fortyguard.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Use Cases</h4>
              <ul className="space-y-2.5">
                <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Urban Planning</Link></li>
                <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Public Health</Link></li>
                <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Emergency Services</Link></li>
                <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Real Estate</Link></li>
                <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Energy Sector</Link></li>
                <li><Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">Climate Research</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><a href="https://github.com/thesithunyein/heatshield" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://docs-api.fortyguard.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://www.fortyguard.com/hackathon26" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">Hackathon&apos;26</a></li>
                <li><a href="https://www.fortyguard.com/pricing" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">API Pricing</a></li>
                <li><Link href="/#privacy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/#terms" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Stay updated:</h4>
              <p className="text-sm text-white/40 mb-4 leading-relaxed">Get the latest heat intelligence insights and product updates.</p>
              <div className="flex border-b border-white/20 pb-2">
                <input type="email" placeholder="Your email here" className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none" />
                <button className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
              <p className="text-[10px] text-white/25 mt-3 leading-relaxed">By signing up, you agree to our Privacy Policy. We respect your data.</p>
              <div className="mt-6">
                <p className="text-xs font-semibold text-white mb-3">Follow us on:</p>
                <div className="flex gap-2">
                  <a href="https://github.com/thesithunyein/heatshield" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-white/40 hover:text-white transition-all" aria-label="GitHub">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                  <a href="https://x.com/heatshield" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:border-white/40 hover:text-white transition-all" aria-label="X">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative h-5 w-5 overflow-hidden rounded bg-white p-[2px]">
                <Image src="/heatshield-logo.png" alt="" fill className="object-contain" />
              </div>
              <span className="text-xs font-semibold text-white">HeatShield</span>
            </div>
            <p className="text-[11px] text-white/30">© 2026 HeatShield. All rights reserved <span className="mx-1">●</span> <Link href="#privacy" className="text-white font-medium hover:underline">Privacy Policy</Link> <span className="mx-1">●</span> <Link href="#terms" className="text-white font-medium hover:underline">Terms</Link></p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] hover:bg-white/90 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════
          MOBILE MENU
         ═══════════════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-700 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)" }}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
        <div className={`relative z-10 flex flex-col h-full px-6 py-5 transition-all duration-700 ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)" }}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
              <div className="relative h-7 w-7 overflow-hidden rounded-md bg-white p-[3px]">
                <Image src="/heatshield-logo.png" alt="" fill className="object-contain" />
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">HeatShield</span>
            </Link>
            <button onClick={() => setMenuOpen(false)} className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20" aria-label="Close">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center w-full max-w-sm">
              {["Dashboard", "Cool Routes", "AI Advisor", "Live Demo"].map((label, i) => (
                <Link key={label} href={i < 3 ? ["/dashboard", "/routes", "/advisor"][i] : "/dashboard"} onClick={() => setMenuOpen(false)}
                  className={`w-full text-center text-4xl sm:text-5xl font-bold text-white border-b border-white/10 py-4 transition-all duration-300 hover:pl-4 ${menuOpen ? `animate-fade-in-up animate-delay-${(i + 1) * 100}` : "opacity-0"}`}
                >{label}</Link>
              ))}
            </div>
          </div>

          <div className="pb-6">
            <Link href="/dashboard" onClick={() => setMenuOpen(false)}
              className={`block w-full text-center bg-white text-black rounded-full py-4 text-sm font-medium ${menuOpen ? "animate-fade-in-up animate-delay-500" : "opacity-0"}`}
            >Launch HeatShield</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
