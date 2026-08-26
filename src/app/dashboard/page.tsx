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
}

interface EnvData {
  heat_index: number;
  apparent_temperature: number;
  wet_bulb_temperature: number;
  humidity: number;
  wind_speed: number;
  uv_index: number;
}

export default function DashboardPage() {
  const [selectedCity, setSelectedCity] = useState<City>(PRESET_CITIES[0]);
  const [intel, setIntel] = useState<IntelData | null>(null);
  const [env, setEnv] = useState<EnvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<HeatZone[]>([]);

  const fetchData = useCallback(async (city: City) => {
    setLoading(true);
    try {
      const [iRes, eRes] = await Promise.all([
        fetch("/api/intelligence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ latitude: city.latitude, longitude: city.longitude }) }),
        fetch("/api/env-params", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ latitude: city.latitude, longitude: city.longitude }) }),
      ]);
      const iData = await iRes.json();
      const eData = await eRes.json();
      if (iData.result) setIntel(iData.result);
      if (eData.result) setEnv(eData.result);
      setZones(PRESET_CITIES.filter((c) => c.name !== city.name).slice(0, 4).map((c, i) => ({
        id: `z-${i}`, name: `${c.name} Center`, city: c.name, latitude: c.latitude, longitude: c.longitude,
        temperature: 80 + Math.round(Math.random() * 35),
        riskLevel: (["low", "medium", "high", "extreme"] as const)[Math.floor(Math.random() * 4)],
        riskScore: Math.round(20 + Math.random() * 70), heatIndex: 85 + Math.round(Math.random() * 30),
        lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(selectedCity); }, [selectedCity, fetchData]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-[80px] sm:pt-[88px] pb-12 sm:pb-16">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#111] leading-[1.1]">
            Heat <span className="text-[#9CA0A6]">Dashboard</span>
          </h1>
          <p className="mt-1.5 text-[#6B6B70] text-xs sm:text-sm font-light">Real-time urban temperature intelligence</p>
          <div className="mt-3"><CitySelector selectedCity={selectedCity} onSelect={setSelectedCity} /></div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 sm:space-y-5">
              <div className="bg-[#F5F5F7] h-48 animate-shimmer rounded-2xl" />
              <div className="bg-[#F5F5F7] h-72 animate-shimmer rounded-2xl" />
            </div>
            <div className="space-y-4 sm:space-y-5">{[1, 2, 3].map((i) => <div key={i} className="bg-[#F5F5F7] h-36 animate-shimmer rounded-2xl" />)}</div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-5 overflow-hidden">
              {/* Map */}
              <HeatMap city={selectedCity} temperature={intel?.temperature?.current} />

              {/* Temperature */}
              <div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl p-5 sm:p-6 md:p-8 overflow-hidden">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#9CA0A6] mb-3 sm:mb-4">{selectedCity.name}, {selectedCity.country} — Current</div>
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 sm:gap-6">
                  <div className="shrink-0"><TemperatureGauge temperature={intel?.temperature?.current ?? 100} size="lg" /></div>
                  {intel && (
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-[#E5E5EA] bg-white text-lg sm:text-xl font-bold text-[#111] font-mono">{intel.risk_score}</div>
                      <span className="text-[9px] uppercase tracking-[0.12em] text-[#9CA0A6]">Risk Score</span>
                    </div>
                  )}
                </div>
                {intel?.temperature?.feels_like !== undefined && (
                  <p className="mt-3 text-xs text-[#6B6B70]">Feels like <span className="text-[#111] font-medium">{Math.round(intel.temperature.feels_like)}°F</span></p>
                )}
              </div>

              {/* Env Params */}
              {env && (
                <div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-[#9CA0A6] mb-3 sm:mb-4">Environmental Parameters</h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { l: "Heat Index", v: `${Math.round(env.heat_index)}°F` },
                      { l: "Apparent", v: `${Math.round(env.apparent_temperature)}°F` },
                      { l: "Wet Bulb", v: `${Math.round(env.wet_bulb_temperature)}°F` },
                      { l: "Humidity", v: `${Math.round(env.humidity)}%` },
                      { l: "Wind", v: `${Math.round(env.wind_speed)} mph` },
                      { l: "UV", v: `${Math.round(env.uv_index)}` },
                    ].map((s) => (
                      <div key={s.l} className="rounded-lg bg-white border border-[#E5E5EA] p-2.5 sm:p-3">
                        <div className="text-[8px] sm:text-[9px] text-[#9CA0A6] uppercase tracking-wider">{s.l}</div>
                        <div className="mt-0.5 font-mono text-xs sm:text-sm font-semibold text-[#111]">{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {intel?.recommendations && intel.recommendations.length > 0 && (
                <div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-[#9CA0A6] mb-3 sm:mb-4">Safety Recommendations</h3>
                  <ul className="space-y-2">
                    {intel.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#6B6B70]">
                        <span className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 rounded-full border border-[#E5E5EA] bg-white text-center text-[9px] sm:text-[10px] leading-4 sm:leading-5 text-[#9CA0A6] font-mono">{i + 1}</span>
                        <span className="min-w-0">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-3 sm:space-y-4 overflow-hidden">
              <h3 className="text-[10px] uppercase tracking-[0.18em] text-[#9CA0A6]">Monitored Zones</h3>
              <div className="space-y-2.5 sm:space-y-3">
                {zones.map((z) => (
                  <RiskCard key={z.id} name={z.name} city={z.city} temperature={z.temperature} riskLevel={z.riskLevel} riskScore={z.riskScore} heatIndex={z.heatIndex} lastUpdated={new Date(z.lastUpdated).toLocaleTimeString()} />
                ))}
              </div>
              <div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl p-3.5 sm:p-4 space-y-1.5">
                <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-[#9CA0A6] mb-1.5">Quick Actions</h4>
                <a href="/routes" className="block rounded-lg bg-white border border-[#E5E5EA] px-3 py-2.5 text-[11px] sm:text-xs text-[#6B6B70] transition-all hover:text-[#111] hover:bg-[#FAFAFA]">▸ Plan Cool Route</a>
                <a href="/advisor" className="block rounded-lg bg-white border border-[#E5E5EA] px-3 py-2.5 text-[11px] sm:text-xs text-[#6B6B70] transition-all hover:text-[#111] hover:bg-[#FAFAFA]">◈ Ask AI Advisor</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
