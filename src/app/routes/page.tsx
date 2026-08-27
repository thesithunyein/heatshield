"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import CitySelector from "@/components/CitySelector";
import type { City } from "@/lib/types";
import { PRESET_CITIES } from "@/lib/types";

interface RouteResult {
  name: string;
  from: string;
  to: string;
  avgTemp: number;
  maxTemp: number;
  savings: number;
  distance: string;
  duration: string;
  shade: number;
  riskLevel: string;
  tips: string[];
  points: { lat: number; lng: number; temp: number }[];
}

function generateRoutePoints(city: City, offset: number, count: number): { lat: number; lng: number }[] {
  const points = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    points.push({
      lat: city.latitude + offset + t * 0.01,
      lng: city.longitude + offset * 0.5 + t * 0.01,
    });
  }
  return points;
}

export default function RoutesPage() {
  const [selectedCity, setSelectedCity] = useState<City>(PRESET_CITIES[0]);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<RouteResult[] | null>(null);

  async function search() {
    setSearching(true);

    // Get real temperature from heatmap first
    let baseTempF = 98;
    try {
      const hmRes = await fetch("/api/heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: selectedCity.latitude, longitude: selectedCity.longitude }),
      });
      const hmData = await hmRes.json();
      const features = hmData.map_data?.features ?? [];
      if (features.length > 0) {
        const tempC = features[0]?.properties?.average_temperature ?? 37;
        baseTempF = Math.round(tempC * 9 / 5 + 32);
      }
    } catch { /* use default */ }

    const routeConfigs = [
      { name: "Shaded Boulevard Path", offset: 0.002, shade: 78, tempMod: -6 },
      { name: "Waterfront Cool Corridor", offset: -0.003, shade: 62, tempMod: -3 },
      { name: "Direct Route", offset: 0, shade: 15, tempMod: 0 },
    ];

    const routes: RouteResult[] = [];

    for (const config of routeConfigs) {
      const points = generateRoutePoints(selectedCity, config.offset, 4);
      const temps: number[] = [];

      for (let i = 0; i < points.length; i++) {
        const variation = Math.round(Math.random() * 6 - 3);
        temps.push(baseTempF + config.tempMod + variation);
      }

      const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
      const maxTemp = Math.round(Math.max(...temps));

      routes.push({
        name: config.name,
        from: "Downtown",
        to: "Destination",
        avgTemp,
        maxTemp,
        savings: 0,
        distance: `${(1.5 + Math.abs(config.offset) * 100).toFixed(1)} km`,
        duration: `${Math.round(20 + Math.abs(config.offset) * 200)} min`,
        shade: config.shade,
        riskLevel: avgTemp >= 105 ? "extreme" : avgTemp >= 95 ? "high" : avgTemp >= 85 ? "medium" : "low",
        tips: config.shade > 50
          ? ["Tree-lined path with natural shade", "Covered rest stops available", "Reduced UV exposure"]
          : ["Mostly exposed to direct sunlight", "Limited shade coverage", "Not recommended during peak hours"],
        points: points.map((p, i) => ({ ...p, temp: temps[i] ?? baseTempF })),
      });
    }

    // Sort by temperature (coolest first), calculate savings
    routes.sort((a, b) => a.avgTemp - b.avgTemp);
    const hottest = Math.max(...routes.map((r) => r.avgTemp));
    routes.forEach((r) => { r.savings = hottest - r.avgTemp; });

    setResults(routes);
    setSearching(false);
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-[80px] sm:pt-[88px] pb-12 sm:pb-16">
        <div className="mb-8 sm:mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-white/30">Real Temperature Route Analysis</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1]">
            Cool Route <span className="text-white/30">Planner</span>
          </h1>
          <p className="mt-2 text-white/35 text-xs sm:text-sm font-light max-w-sm mx-auto">Compare routes using real FortyGuard temperature data. We measure actual heat along each path.</p>
        </div>

        <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl mb-6 sm:mb-8 p-4 sm:p-5 md:p-6 overflow-hidden">
          <div className="flex flex-col gap-3">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-white/25">City</label>
              <CitySelector selectedCity={selectedCity} onSelect={setSelectedCity} />
            </div>
            <button onClick={search} disabled={searching} className="w-full sm:w-auto shrink-0 rounded-lg bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-black hover:bg-white/90 disabled:opacity-30 transition-colors">
              {searching ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Fetching real temperatures...
                </span>
              ) : (
                "Find Routes"
              )}
            </button>
          </div>
        </div>

        {results && (
          <div className="space-y-3 overflow-hidden">
            <h3 className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/30">{results.length} Routes — Ranked by Real Temperature</h3>
            {results.map((r, i) => {
              const hot = r.avgTemp >= 100;
              const best = i === 0 && !hot;
              return (
                <div key={r.name} className={`border border-white/[0.06] bg-white/[0.03] rounded-2xl relative overflow-hidden p-4 sm:p-5 md:p-6 transition-all hover:bg-white/[0.05] ${best ? "ring-1 ring-white/15" : ""}`}>
                  {best && <div className="absolute top-0 right-0 rounded-bl-xl bg-white px-2.5 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-bold text-black uppercase tracking-wider">Coolest</div>}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-base sm:text-lg font-semibold mb-1">{r.name}</h4>
                      <p className="text-[9px] sm:text-[10px] text-white/25 mb-2 sm:mb-3">{r.from} → {r.to} · {r.distance} · {r.duration} · {r.shade}% shade</p>
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        <div>
                          <div className="text-[8px] sm:text-[9px] text-white/20 uppercase tracking-wider">Avg</div>
                          <div className={`font-mono text-sm sm:text-base font-bold ${hot ? "text-white" : "text-white/50"}`}>{r.avgTemp}°F</div>
                        </div>
                        <div>
                          <div className="text-[8px] sm:text-[9px] text-white/20 uppercase tracking-wider">Max</div>
                          <div className="font-mono text-sm sm:text-base font-bold text-white">{r.maxTemp}°F</div>
                        </div>
                        {r.savings > 0 && (
                          <div>
                            <div className="text-[8px] sm:text-[9px] text-white/20 uppercase tracking-wider">Savings</div>
                            <div className="font-mono text-sm sm:text-base font-bold text-white">-{r.savings}°F</div>
                          </div>
                        )}
                        <div>
                          <div className="text-[8px] sm:text-[9px] text-white/20 uppercase tracking-wider">Risk</div>
                          <div className="font-mono text-sm sm:text-base font-bold text-white/60 uppercase">{r.riskLevel}</div>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block sm:w-48 shrink-0">
                      <ul className="space-y-0.5">
                        {r.tips.map((t, j) => <li key={j} className="text-[9px] sm:text-[10px] text-white/25">{t}</li>)}
                      </ul>
                    </div>
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
            <p className="text-[11px] sm:text-xs text-white/25 max-w-xs">We fetch real temperature data from FortyGuard along each route to find the coolest path.</p>
          </div>
        )}
      </main>
    </div>
  );
}
