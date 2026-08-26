"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import CitySelector from "@/components/CitySelector";
import type { City } from "@/lib/types";
import { PRESET_CITIES } from "@/lib/types";

interface RouteResult { name: string; from: string; to: string; avgTemp: number; maxTemp: number; savings: number; distance: string; duration: string; shade: number; tips: string[]; }

const MOCK: RouteResult[] = [
  { name: "Shaded Boulevard Path", from: "Downtown", to: "Riverside Park", avgTemp: 89, maxTemp: 94, savings: 12, distance: "2.3 km", duration: "28 min", shade: 78, tips: ["Tree-lined boulevard 60%", "Shaded park bridge", "Avoids asphalt lots"] },
  { name: "Waterfront Cool Corridor", from: "Downtown", to: "Riverside Park", avgTemp: 84, maxTemp: 91, savings: 18, distance: "3.1 km", duration: "38 min", shade: 62, tips: ["Riverbank breeze cooling", "Water drops temp 5-8°F", "Mist fountain zone"] },
  { name: "Direct Route (Hot)", from: "Downtown", to: "Riverside Park", avgTemp: 102, maxTemp: 108, savings: 0, distance: "1.8 km", duration: "22 min", shade: 15, tips: ["Exposed asphalt", "No shade 85%", "Not recommended >100°F"] },
];

export default function RoutesPage() {
  const [selectedCity, setSelectedCity] = useState<City>(PRESET_CITIES[0]);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<RouteResult[] | null>(null);

  async function search() { setSearching(true); await new Promise((r) => setTimeout(r, 1500)); setResults(MOCK); setSearching(false); }

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-[80px] sm:pt-[88px] pb-12 sm:pb-16">
        <div className="mb-8 sm:mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-white/30">AI-Powered Route Optimization</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1]">
            Cool Route <span className="text-white/30">Planner</span>
          </h1>
          <p className="mt-2 text-white/35 text-xs sm:text-sm font-light max-w-sm mx-auto">Find the coolest path. We optimize for shade, breeze, and minimal heat exposure.</p>
        </div>

        <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl mb-6 sm:mb-8 p-4 sm:p-5 md:p-6 overflow-hidden">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-white/25">City</label>
              <CitySelector selectedCity={selectedCity} onSelect={setSelectedCity} />
            </div>
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-white/25">From</label>
              <input type="text" defaultValue="Downtown" className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-white/15 outline-none focus:border-white/20 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-white/25">To</label>
              <input type="text" defaultValue="Riverside Park" className="w-full rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-white/15 outline-none focus:border-white/20 transition-colors" />
            </div>
            <button onClick={search} disabled={searching} className="shrink-0 rounded-lg bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-black hover:bg-white/90 disabled:opacity-30 transition-colors">
              {searching ? <span className="flex items-center gap-2"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />Scanning...</span> : "Find Routes"}
            </button>
          </div>
        </div>

        {results && (
          <div className="space-y-3 overflow-hidden">
            <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/30">{results.length} Routes — Ranked by Temperature</h3>
            {results.map((r, i) => {
              const hot = r.avgTemp >= 100;
              const best = i === 0 && !hot;
              return (
                <div key={r.name} className={`border border-white/[0.06] bg-white/[0.03] rounded-2xl relative overflow-hidden p-4 sm:p-5 md:p-6 transition-all hover:bg-white/[0.05] ${best ? "ring-1 ring-white/15" : ""}`}>
                  {best && <div className="absolute top-0 right-0 rounded-bl-xl bg-white px-2.5 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-bold text-black uppercase tracking-wider">Coolest</div>}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-base sm:text-lg font-semibold mb-1">{r.name}</h4>
                      <p className="text-[9px] sm:text-[10px] text-white/25 mb-2 sm:mb-3">{r.from} → {r.to} · {r.distance} · {r.duration}</p>
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        <div><div className="text-[8px] sm:text-[9px] text-white/20 uppercase tracking-wider">Avg</div><div className={`font-mono text-sm sm:text-base font-bold ${hot ? "text-white" : "text-white/50"}`}>{r.avgTemp}°F</div></div>
                        <div><div className="text-[8px] sm:text-[9px] text-white/20 uppercase tracking-wider">Max</div><div className="font-mono text-sm sm:text-base font-bold text-white">{r.maxTemp}°F</div></div>
                        {r.savings > 0 && <div><div className="text-[8px] sm:text-[9px] text-white/20 uppercase tracking-wider">Savings</div><div className="font-mono text-sm sm:text-base font-bold text-white">-{r.savings}°F</div></div>}
                        <div><div className="text-[8px] sm:text-[9px] text-white/20 uppercase tracking-wider">Shade</div><div className="font-mono text-sm sm:text-base font-bold text-white">{r.shade}%</div></div>
                      </div>
                    </div>
                    <div className="sm:w-48 shrink-0"><ul className="space-y-0.5">{r.tips.map((t, j) => <li key={j} className="text-[9px] sm:text-[10px] text-white/25">{t}</li>)}</ul></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!results && !searching && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="mb-3 text-3xl sm:text-4xl text-white/10">▸</div>
            <h3 className="text-white text-base sm:text-lg font-semibold mb-1.5">Enter your route</h3>
            <p className="text-[11px] sm:text-xs text-white/25 max-w-xs">We analyze temperature, shade, and wind to find the coolest path.</p>
          </div>
        )}
      </main>
    </div>
  );
}
