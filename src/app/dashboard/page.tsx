"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import CitySelector from "@/components/CitySelector";
import TemperatureGauge from "@/components/TemperatureGauge";
import RiskCard from "@/components/RiskCard";
import dynamic from "next/dynamic";
import type { City, HeatZone } from "@/lib/types";
import { PRESET_CITIES } from "@/lib/types";

const HeatMap = dynamic(() => import("@/components/HeatMap"), { ssr: false });

interface IntelData {
  temperature: { current: number; feels_like: number; unit: string };
  risk_level: string;
  risk_score: number;
  recommendations: string[];
  location?: { city?: string; country?: string };
}

interface EnvData {
  heat_index: number;
  apparent_temperature: number;
  wet_bulb_temperature: number;
  humidity: number;
  wind_speed: number;
  uv_index: number;
}

interface HourlyPoint {
  hour: number;
  temp: number;
}

function getBarColor(temp: number): string {
  if (temp >= 115) return "#FAFAFA";
  if (temp >= 110) return "#D4D4D8";
  if (temp >= 105) return "#A1A1AA";
  if (temp >= 100) return "#71717A";
  if (temp >= 95) return "#52525B";
  return "#3F3F46";
}

export default function DashboardPage() {
  const [selectedCity, setSelectedCity] = useState<City>(PRESET_CITIES[0]);
  const [intel, setIntel] = useState<IntelData | null>(null);
  const [env, setEnv] = useState<EnvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<HeatZone[]>([]);
  const [fetchingZones, setFetchingZones] = useState(false);
  const [hourlyData, setHourlyData] = useState<HourlyPoint[]>([]);
  const [loadingHourly, setLoadingHourly] = useState(false);

  const fetchData = useCallback(async (city: City) => {
    setLoading(true);
    try {
      const [iRes, eRes] = await Promise.all([
        fetch("/api/intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: city.latitude, longitude: city.longitude }),
        }),
        fetch("/api/env-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: city.latitude, longitude: city.longitude }),
        }),
      ]);
      const iData = await iRes.json();
      const eData = await eRes.json();
      if (iData.result) setIntel(iData.result);
      if (eData.result) setEnv(eData.result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch hourly data (simulated from current temp + time curve)
  const fetchHourly = useCallback(async (city: City) => {
    setLoadingHourly(true);
    try {
      const iRes = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: city.latitude, longitude: city.longitude }),
      });
      const iData = await iRes.json();
      const baseTemp = iData.result?.temperature?.current ?? 95;
      const hours = [6, 8, 10, 12, 14, 16, 18, 20];
      const data: HourlyPoint[] = hours.map((h) => {
        const factor = Math.sin(((h - 6) / 14) * Math.PI);
        return { hour: h, temp: Math.round(baseTemp * (0.7 + factor * 0.35)) };
      });
      setHourlyData(data);
    } catch {
      setHourlyData([]);
    } finally {
      setLoadingHourly(false);
    }
  }, []);

  const fetchZoneData = useCallback(async (cities: City[]) => {
    setFetchingZones(true);
    try {
      const results = await Promise.all(
        cities.map(async (c) => {
          try {
            const [iRes, eRes] = await Promise.all([
              fetch("/api/intelligence", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latitude: c.latitude, longitude: c.longitude }),
              }),
              fetch("/api/env-params", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latitude: c.latitude, longitude: c.longitude }),
              }),
            ]);
            const iData = await iRes.json();
            const eData = await eRes.json();
            const intelResult = iData.result;
            const envResult = eData.result;
            return {
              id: `z-${c.name}`,
              name: `${c.name} Center`,
              city: c.name,
              latitude: c.latitude,
              longitude: c.longitude,
              temperature: intelResult?.temperature?.current ?? 0,
              riskLevel: (intelResult?.risk_level ?? "low") as HeatZone["riskLevel"],
              riskScore: intelResult?.risk_score ?? 0,
              heatIndex: envResult?.heat_index ?? intelResult?.temperature?.feels_like ?? 0,
              lastUpdated: new Date().toISOString(),
            };
          } catch {
            return null;
          }
        })
      );
      setZones(results.filter((z): z is HeatZone => z !== null));
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingZones(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedCity);
    fetchHourly(selectedCity);
    const otherCities = PRESET_CITIES.filter((c) => c.name !== selectedCity.name).slice(0, 4);
    fetchZoneData(otherCities);
  }, [selectedCity, fetchData, fetchHourly, fetchZoneData]);

  const maxHourlyTemp = hourlyData.length > 0 ? Math.max(...hourlyData.map((d) => d.temp)) : 120;

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-[80px] sm:pt-[88px] pb-12 sm:pb-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1]">
            Heat <span className="text-white/30">Dashboard</span>
          </h1>
          <p className="mt-1.5 text-white/40 text-xs sm:text-sm font-light">Real-time urban temperature intelligence</p>
          <div className="mt-3"><CitySelector selectedCity={selectedCity} onSelect={setSelectedCity} /></div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              <div className="bg-white/[0.03] h-64 sm:h-72 animate-shimmer rounded-2xl" />
              <div className="bg-white/[0.03] h-40 animate-shimmer rounded-2xl" />
            </div>
            <div className="space-y-4 sm:space-y-5">{[1, 2, 3].map((i) => <div key={i} className="bg-white/[0.03] h-36 animate-shimmer rounded-2xl" />)}</div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5 overflow-hidden">
              <HeatMap city={selectedCity} temperature={intel?.temperature?.current} />

              <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-5 sm:p-6 md:p-8 overflow-hidden">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3 sm:mb-4">
                  {intel?.location?.city ?? selectedCity.name}, {selectedCity.state} — Current
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 sm:gap-6">
                  <div className="shrink-0"><TemperatureGauge temperature={intel?.temperature?.current ?? 0} size="md" /></div>
                  {intel && (
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg sm:text-xl font-bold text-white font-mono">{intel.risk_score}</div>
                      <span className="text-[9px] uppercase tracking-[0.12em] text-white/30">Risk Score</span>
                    </div>
                  )}
                </div>
                {intel?.temperature?.feels_like !== undefined && (
                  <p className="mt-3 text-xs text-white/35">Feels like <span className="text-white/60 font-medium">{Math.round(intel.temperature.feels_like)}°F</span></p>
                )}
              </div>

              {/* Hourly Temperature Chart */}
              <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30">Hourly Temperature</h3>
                  {loadingHourly && <span className="text-[9px] text-white/20">Loading...</span>}
                </div>
                {hourlyData.length > 0 ? (
                  <div className="flex items-end gap-1.5 sm:gap-2 h-32 sm:h-40">
                    {hourlyData.map((d) => {
                      const height = (d.temp / maxHourlyTemp) * 100;
                      return (
                        <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[8px] sm:text-[9px] font-mono text-white/30">{d.temp}°</span>
                          <div className="w-full rounded-t-sm" style={{ height: `${height}%`, background: getBarColor(d.temp), opacity: 0.7 }} />
                          <span className="text-[8px] font-mono text-white/20">{d.hour}h</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-[11px] text-white/20">No hourly data</div>
                )}
              </div>

              {env && (
                <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3 sm:mb-4">Environmental Parameters</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { l: "Heat Index", v: `${Math.round(env.heat_index)}°F` },
                      { l: "Apparent", v: `${Math.round(env.apparent_temperature)}°F` },
                      { l: "Wet Bulb", v: `${Math.round(env.wet_bulb_temperature)}°F` },
                      { l: "Humidity", v: `${Math.round(env.humidity)}%` },
                      { l: "Wind", v: `${Math.round(env.wind_speed)} mph` },
                      { l: "UV", v: `${Math.round(env.uv_index)}` },
                    ].map((s) => (
                      <div key={s.l} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5 sm:p-3">
                        <div className="text-[8px] sm:text-[9px] text-white/25 uppercase tracking-wider">{s.l}</div>
                        <div className="mt-0.5 font-mono text-xs sm:text-sm font-semibold text-white/80">{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {intel?.recommendations && intel.recommendations.length > 0 && (
                <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3 sm:mb-4">Safety Recommendations</h3>
                  <ul className="space-y-2">
                    {intel.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-white/45">
                        <span className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 rounded-full border border-white/10 bg-white/[0.02] text-center text-[9px] sm:text-[10px] leading-4 sm:leading-5 text-white/40 font-mono">{i + 1}</span>
                        <span className="min-w-0">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4 overflow-hidden">
              <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                {fetchingZones ? "Loading zones..." : "Monitored Zones"}
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                {zones.map((z) => (
                  <RiskCard key={z.id} name={z.name} city={z.city} temperature={z.temperature} riskLevel={z.riskLevel} riskScore={z.riskScore} heatIndex={z.heatIndex} lastUpdated={new Date(z.lastUpdated).toLocaleTimeString()} />
                ))}
              </div>
              <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-3.5 sm:p-4 space-y-1.5">
                <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-white/30 mb-1.5">Quick Actions</h4>
                <a href="/routes" className="block rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 text-[11px] sm:text-xs text-white/35 transition-all hover:text-white/70 hover:bg-white/[0.04]">▸ Plan Cool Route</a>
                <a href="/advisor" className="block rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 text-[11px] sm:text-xs text-white/35 transition-all hover:text-white/70 hover:bg-white/[0.04]">◈ Ask AI Advisor</a>
                <a href="/audit" className="block rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 text-[11px] sm:text-xs text-white/35 transition-all hover:text-white/70 hover:bg-white/[0.04]">◉ Asset Heat Audit</a>
                <a href="/twin" className="block rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 text-[11px] sm:text-xs text-white/35 transition-all hover:text-white/70 hover:bg-white/[0.04]">◎ Digital Twin</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
