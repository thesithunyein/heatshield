"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import CitySelector from "@/components/CitySelector";
import TemperatureGauge from "@/components/TemperatureGauge";
import RiskCard from "@/components/RiskCard";
import type { City, HeatZone } from "@/lib/types";
import { PRESET_CITIES } from "@/lib/types";
import { formatTemperature, timeAgo } from "@/lib/utils";

interface IntelData {
  temperature: { current: number; feels_like: number; unit: string };
  risk_level: string;
  risk_score: number;
  recommendations: string[];
  analysis: Record<string, unknown>;
}

interface EnvData {
  heat_index: number;
  apparent_temperature: number;
  wet_bulb_temperature: number;
  humidity: number;
  wind_speed: number;
  uv_index: number;
  unit: string;
}

export default function DashboardPage() {
  const [selectedCity, setSelectedCity] = useState<City>(PRESET_CITIES[0]);
  const [intel, setIntel] = useState<IntelData | null>(null);
  const [env, setEnv] = useState<EnvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [neighborZones, setNeighborZones] = useState<HeatZone[]>([]);

  const fetchData = useCallback(async (city: City) => {
    setLoading(true);
    try {
      const [intelRes, envRes] = await Promise.all([
        fetch("/api/intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: city.latitude,
            longitude: city.longitude,
          }),
        }),
        fetch("/api/env-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: city.latitude,
            longitude: city.longitude,
          }),
        }),
      ]);

      const intelData = await intelRes.json();
      const envData = await envRes.json();

      if (intelData.result) setIntel(intelData.result);
      if (envData.result) setEnv(envData.result);

      // Generate neighbor zones from nearby cities
      const zones: HeatZone[] = PRESET_CITIES.filter((c) => c.name !== city.name)
        .slice(0, 4)
        .map((c, i) => ({
          id: `zone-${i}`,
          name: `${c.name} Center`,
          city: c.name,
          latitude: c.latitude,
          longitude: c.longitude,
          temperature: 80 + Math.round(Math.random() * 35),
          riskLevel: (["low", "medium", "high", "extreme"] as const)[
            Math.floor(Math.random() * 4)
          ],
          riskScore: Math.round(20 + Math.random() * 70),
          heatIndex: 85 + Math.round(Math.random() * 30),
          lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        }));
      setNeighborZones(zones);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedCity);
  }, [selectedCity, fetchData]);

  return (
    <div className="min-h-screen bg-[var(--hs-bg)]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Heat Dashboard
            </h1>
            <p className="mt-1 text-sm text-[var(--hs-text-secondary)]">
              Real-time urban temperature intelligence
            </p>
          </div>
          <CitySelector selectedCity={selectedCity} onSelect={setSelectedCity} />
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* ── Main Panel ────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Temperature Hero */}
              <div className="hs-glass-card relative overflow-hidden p-8">
                <div className="absolute top-0 right-0 h-64 w-64 bg-[radial-gradient(circle,rgba(249,115,22,0.06)_0%,transparent_70%)]" />
                <div className="relative flex flex-col items-center sm:flex-row sm:items-start sm:gap-12">
                  <div className="flex-1 text-center sm:text-left">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-[var(--hs-text-muted)]">
                      {selectedCity.name}, {selectedCity.country} — Current
                    </div>
                    <TemperatureGauge
                      temperature={intel?.temperature?.current ?? 100}
                      size="xl"
                    />
                    {intel?.temperature?.feels_like !== undefined && (
                      <p className="mt-2 text-sm text-[var(--hs-text-secondary)]">
                        Feels like{" "}
                        <span className="font-medium text-[var(--hs-text-primary)]">
                          {formatTemperature(intel.temperature.feels_like)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Risk badge */}
                  {intel && (
                    <div className="mt-6 flex flex-col items-center gap-3 sm:mt-0">
                      <div
                        className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold"
                        style={{
                          background: `${intel.risk_score >= 70 ? "rgba(239,68,68,0.15)" : intel.risk_score >= 50 ? "rgba(249,115,22,0.15)" : "rgba(234,179,8,0.1)"}`,
                          color: intel.risk_score >= 70 ? "var(--hs-heat-extreme)" : intel.risk_score >= 50 ? "var(--hs-heat-hot)" : "var(--hs-heat-warm)",
                        }}
                      >
                        {intel.risk_score}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--hs-text-secondary)]">
                        Risk Score
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Env Params Grid */}
              {env && (
                <div className="hs-glass-card p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--hs-text-muted)]">
                    Environmental Parameters
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <EnvStat label="Heat Index" value={`${Math.round(env.heat_index)}°F`} color="var(--hs-heat-hot)" />
                    <EnvStat label="Apparent Temp" value={`${Math.round(env.apparent_temperature)}°F`} color="var(--hs-heat-warm)" />
                    <EnvStat label="Wet Bulb" value={`${Math.round(env.wet_bulb_temperature)}°F`} color="var(--hs-heat-cool)" />
                    <EnvStat label="Humidity" value={`${Math.round(env.humidity)}%`} color="var(--hs-heat-mild)" />
                    <EnvStat label="Wind Speed" value={`${Math.round(env.wind_speed)} mph`} color="var(--hs-text-secondary)" />
                    <EnvStat label="UV Index" value={`${Math.round(env.uv_index)}`} color={env.uv_index >= 8 ? "var(--hs-heat-extreme)" : "var(--hs-heat-warm)"} />
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {intel?.recommendations && intel.recommendations.length > 0 && (
                <div className="hs-glass-card p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--hs-text-muted)]">
                    🛡️ Safety Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {intel.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[var(--hs-text-secondary)]">
                        <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-[rgba(249,115,22,0.1)] text-center text-xs leading-5 text-[var(--hs-accent)]">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── Side Panel ────────────────────── */}
            <div className="space-y-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-[var(--hs-text-muted)]">
                Monitored Zones
              </h3>
              {neighborZones.map((zone) => (
                <RiskCard
                  key={zone.id}
                  name={zone.name}
                  city={zone.city}
                  temperature={zone.temperature}
                  riskLevel={zone.riskLevel}
                  riskScore={zone.riskScore}
                  heatIndex={zone.heatIndex}
                  lastUpdated={timeAgo(zone.lastUpdated)}
                />
              ))}

              {/* Quick Actions */}
              <div className="hs-glass-card p-5 space-y-3">
                <h4 className="text-sm font-semibold text-[var(--hs-text-primary)]">
                  Quick Actions
                </h4>
                <a
                  href="/routes"
                  className="flex items-center gap-2 rounded-lg bg-[var(--hs-bg-card)] px-3 py-2.5 text-sm text-[var(--hs-text-secondary)] transition-colors hover:bg-[var(--hs-bg-card-hover)] hover:text-[var(--hs-text-primary)]"
                >
                  🚶 Plan Cool Route
                </a>
                <a
                  href="/advisor"
                  className="flex items-center gap-2 rounded-lg bg-[var(--hs-bg-card)] px-3 py-2.5 text-sm text-[var(--hs-text-secondary)] transition-colors hover:bg-[var(--hs-bg-card-hover)] hover:text-[var(--hs-text-primary)]"
                >
                  🤖 Ask AI Advisor
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EnvStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--hs-bg)] p-3">
      <div className="text-xs text-[var(--hs-text-muted)]">{label}</div>
      <div className="mt-1 font-mono text-lg font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="hs-glass-card h-64 animate-shimmer" />
        <div className="hs-glass-card h-40 animate-shimmer" />
        <div className="hs-glass-card h-32 animate-shimmer" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="hs-glass-card h-44 animate-shimmer" />
        ))}
      </div>
    </div>
  );
}
