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
  tips: string[];
}

const MOCK_ROUTES: RouteResult[] = [
  {
    name: "Shaded Boulevard Path",
    from: "Downtown",
    to: "Riverside Park",
    avgTemp: 89,
    maxTemp: 94,
    savings: 12,
    distance: "2.3 km",
    duration: "28 min",
    shade: 78,
    tips: [
      "Uses tree-lined boulevard for 60% of route",
      "Crosses shaded park bridge",
      "Avoids asphalt parking lots",
    ],
  },
  {
    name: "Waterfront Cool Corridor",
    from: "Downtown",
    to: "Riverside Park",
    avgTemp: 84,
    maxTemp: 91,
    savings: 18,
    distance: "3.1 km",
    duration: "38 min",
    shade: 62,
    tips: [
      "Follows riverbank with natural breeze cooling",
      "Water proximity drops temp by 5-8°F",
      "Passes through mist fountain zone",
    ],
  },
  {
    name: "Direct Route (Hot)",
    from: "Downtown",
    to: "Riverside Park",
    avgTemp: 102,
    maxTemp: 108,
    savings: 0,
    distance: "1.8 km",
    duration: "22 min",
    shade: 15,
    tips: [
      "⚠️ Mostly exposed asphalt",
      "⚠️ No shade for 85% of route",
      "⚠️ Not recommended above 100°F",
    ],
  },
];

export default function RoutesPage() {
  const [selectedCity, setSelectedCity] = useState<City>(PRESET_CITIES[0]);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<RouteResult[] | null>(null);

  async function handleSearch() {
    setSearching(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setResults(MOCK_ROUTES);
    setSearching(false);
  }

  return (
    <div className="min-h-screen bg-[var(--hs-bg)]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--hs-border)] bg-[var(--hs-bg-card)] px-3 py-1 text-xs text-[var(--hs-text-secondary)]">
            🚶 AI-Powered Route Optimization
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            Cool Route Planner
          </h1>
          <p className="text-[var(--hs-text-secondary)]">
            Find the coolest path between any two points. We optimize for shade,
            breeze, and minimal heat exposure.
          </p>
        </div>

        {/* Search bar */}
        <div className="hs-glass-card mb-10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--hs-text-muted)]">
                City
              </label>
              <CitySelector selectedCity={selectedCity} onSelect={setSelectedCity} />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--hs-text-muted)]">
                From
              </label>
              <input
                type="text"
                defaultValue="Downtown"
                className="w-full rounded-xl border border-[var(--hs-border)] bg-[var(--hs-bg-card)] px-4 py-3 text-sm text-[var(--hs-text-primary)] placeholder-[var(--hs-text-muted)] outline-none focus:border-[var(--hs-accent)]"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--hs-text-muted)]">
                To
              </label>
              <input
                type="text"
                defaultValue="Riverside Park"
                className="w-full rounded-xl border border-[var(--hs-border)] bg-[var(--hs-bg-card)] px-4 py-3 text-sm text-[var(--hs-text-primary)] placeholder-[var(--hs-text-muted)] outline-none focus:border-[var(--hs-accent)]"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="rounded-xl bg-[var(--hs-accent)] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            >
              {searching ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Scanning...
                </span>
              ) : (
                "Find Cool Routes"
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--hs-text-muted)]">
              {results.length} Routes Found — Ranked by Temperature
            </h3>

            {results.map((route, i) => {
              const isHot = route.avgTemp >= 100;
              const isCoolest = i === 0 && !isHot;

              return (
                <div
                  key={route.name}
                  className={`hs-glass-card relative overflow-hidden p-6 transition-all hover:scale-[1.01] ${
                    isCoolest ? "ring-1 ring-[var(--hs-heat-cool)]" : ""
                  }`}
                >
                  {isCoolest && (
                    <div className="absolute top-0 right-0 rounded-bl-xl bg-[var(--hs-heat-cool)] px-3 py-1 text-xs font-bold text-white">
                      🏆 COOLEST
                    </div>
                  )}

                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                    {/* Route info */}
                    <div className="flex-1">
                      <h4 className="mb-1 text-lg font-semibold text-[var(--hs-text-primary)]">
                        {route.name}
                      </h4>
                      <p className="mb-3 text-sm text-[var(--hs-text-secondary)]">
                        {route.from} → {route.to} · {route.distance} · {route.duration}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <div>
                          <div className="text-xs text-[var(--hs-text-muted)]">Avg Temp</div>
                          <div
                            className="font-mono text-lg font-bold"
                            style={{
                              color: isHot ? "var(--hs-heat-extreme)" : "var(--hs-heat-warm)",
                            }}
                          >
                            {route.avgTemp}°F
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[var(--hs-text-muted)]">Max Temp</div>
                          <div className="font-mono text-lg font-bold text-[var(--hs-text-primary)]">
                            {route.maxTemp}°F
                          </div>
                        </div>
                        {route.savings > 0 && (
                          <div>
                            <div className="text-xs text-[var(--hs-text-muted)]">Cool Savings</div>
                            <div className="font-mono text-lg font-bold text-[var(--hs-heat-cool)]">
                              -{route.savings}°F
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-[var(--hs-text-muted)]">Shade Cover</div>
                          <div className="font-mono text-lg font-bold text-[var(--hs-text-primary)]">
                            {route.shade}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="lg:w-72">
                      <ul className="space-y-1">
                        {route.tips.map((tip, j) => (
                          <li
                            key={j}
                            className="text-xs text-[var(--hs-text-secondary)]"
                          >
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Placeholder when no results */}
        {!results && !searching && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 text-6xl">🚶‍♂️</div>
            <h3 className="mb-2 text-xl font-semibold text-[var(--hs-text-primary)]">
              Enter your route to get started
            </h3>
            <p className="max-w-md text-sm text-[var(--hs-text-secondary)]">
              We&apos;ll analyze temperature data, shade coverage, and wind patterns
              to find the coolest path for you.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
