"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import CitySelector from "@/components/CitySelector";
import TemperatureGauge from "@/components/TemperatureGauge";
import RiskCard from "@/components/RiskCard";
import dynamic from "next/dynamic";
import type { City, HeatZone } from "@/lib/types";
import { PRESET_CITIES } from "@/lib/types";
import { cToF } from "@/lib/fortyguard";

const HeatMap = dynamic(() => import("@/components/HeatMap"), { ssr: false });

interface EnvData {
  heat_index_celsius: number[];
  apparent_temperature_celsius: number[];
  relative_humidity_percent: number[];
  wind_speed_kmh: number[];
  air_quality_aqi: number[];
  precipitation_mm: number[];
  wet_bulb_temperature_celsius?: number[];
}

interface HourlyPoint {
  hour: number;
  temp: number;
}

function getBarColor(tempF: number): string {
  if (tempF >= 115) return "#FAFAFA";
  if (tempF >= 110) return "#D4D4D8";
  if (tempF >= 105) return "#A1A1AA";
  if (tempF >= 100) return "#71717A";
  if (tempF >= 95) return "#52525B";
  return "#3F3F46";
}

/**
 * Fetch heatmap data to get REAL temperature from FortyGuard tiles
 */
async function fetchHeatmapTemp(city: City): Promise<{ tempC: number; tempF: number } | null> {
  try {
    const res = await fetch("/api/heatmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: city.latitude, longitude: city.longitude }),
    });
    const data = await res.json();
    const features = data.map_data?.features ?? [];
    if (features.length > 0) {
      // Find the tile closest to the center
      const center = features.reduce(
        (closest: { tile: typeof features[0]; dist: number }, tile: typeof features[0]) => {
          const c = tile.geometry?.coordinates?.[0];
          if (!c) return closest;
          const avgLng = c.reduce((s: number, p: number[]) => s + p[0], 0) / c.length;
          const avgLat = c.reduce((s: number, p: number[]) => s + p[1], 0) / c.length;
          const dist = Math.abs(avgLat - city.latitude) + Math.abs(avgLng - city.longitude);
          return dist < closest.dist ? { tile, dist } : closest;
        },
        { tile: features[0], dist: Infinity }
      );
      const avgTempC = center.tile.properties?.average_temperature ?? 38;
      return { tempC: avgTempC, tempF: cToF(avgTempC) };
    }
  } catch (e) {
    console.error("Heatmap fetch failed:", e);
  }
  return null;
}

/**
 * Fetch zone data using heatmap temperature as input
 */
async function fetchCityZone(city: City): Promise<HeatZone | null> {
  try {
    // Step 1: Get real temperature from heatmap
    const heatData = await fetchHeatmapTemp(city);
    const tempC = heatData?.tempC ?? 38;
    const tempF = heatData?.tempF ?? cToF(tempC);

    // Step 2: Get environmental params using that temperature
    let humidity = 20;
    let heatIndexC = tempC;
    try {
      const eRes = await fetch("/api/env-params", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: city.latitude,
          longitude: city.longitude,
          temperature: tempC,
        }),
      });
      const eData = await eRes.json();
      const params = eData.result?.locations?.[0]?.parameters;
      if (params) {
        humidity = params.relative_humidity_percent?.[12] ?? 20; // noon value
        heatIndexC = params.heat_index_celsius?.[12] ?? tempC;
      }
    } catch {
      // Continue with defaults
    }

    // Step 3: Compute risk score
    const riskScore = computeRisk(tempC, humidity);
    const riskLevel = riskScore >= 85 ? "critical" : riskScore >= 70 ? "extreme" : riskScore >= 50 ? "high" : riskScore >= 30 ? "medium" : "low";

    return {
      id: `z-${city.name}`,
      name: `${city.name} Center`,
      city: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      temperature: Math.round(tempF),
      riskLevel: riskLevel as HeatZone["riskLevel"],
      riskScore,
      heatIndex: Math.round(cToF(heatIndexC)),
      lastUpdated: new Date().toISOString(),
    };
  } catch (e) {
    console.error(`Failed to fetch zone for ${city.name}:`, e);
    return null;
  }
}

function computeRisk(tempC: number, humidity: number): number {
  let score = 0;
  if (tempC >= 54) score += 50;
  else if (tempC >= 49) score += 45;
  else if (tempC >= 43) score += 38;
  else if (tempC >= 38) score += 30;
  else if (tempC >= 32) score += 20;
  else if (tempC >= 27) score += 10;
  else score += 5;

  if (humidity >= 80) score += 25;
  else if (humidity >= 60) score += 18;
  else if (humidity >= 40) score += 10;
  else score += 3;

  return Math.max(0, Math.min(100, score));
}

export default function DashboardPage() {
  const [selectedCity, setSelectedCity] = useState<City>(PRESET_CITIES[0]);
  const [temperature, setTemperature] = useState<number>(0);
  const [env, setEnv] = useState<EnvData | null>(null);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<string>("low");
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<HeatZone[]>([]);
  const [fetchingZones, setFetchingZones] = useState(false);
  const [hourlyData, setHourlyData] = useState<HourlyPoint[]>([]);
  const [loadingHourly, setLoadingHourly] = useState(false);

  const fetchData = useCallback(async (city: City) => {
    setLoading(true);
    try {
      // Step 1: Get real temperature from heatmap
      const heatData = await fetchHeatmapTemp(city);
      const tempC = heatData?.tempC ?? 38;
      const tempF = heatData?.tempF ?? cToF(tempC);
      setTemperature(tempF);

      // Step 2: Get environmental params
      try {
        const eRes = await fetch("/api/env-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: city.latitude,
            longitude: city.longitude,
            temperature: tempC,
          }),
        });
        const eData = await eRes.json();
        const params = eData.result?.locations?.[0]?.parameters;
        if (params) {
          setEnv({
            heat_index_celsius: params.heat_index_celsius ?? [],
            apparent_temperature_celsius: params.apparent_temperature_celsius ?? [],
            relative_humidity_percent: params.relative_humidity_percent ?? [],
            wind_speed_kmh: params.wind_speed_kmh ?? [],
            air_quality_aqi: params.air_quality_aqi ?? [],
            precipitation_mm: params.precipitation_mm ?? [],
            wet_bulb_temperature_celsius: params.wet_bulb_temperature_celsius ?? [],
          });

          const humidity = params.relative_humidity_percent?.[12] ?? 20;
          const rs = computeRisk(tempC, humidity);
          setRiskScore(rs);
          setRiskLevel(rs >= 85 ? "critical" : rs >= 70 ? "extreme" : rs >= 50 ? "high" : rs >= 30 ? "medium" : "low");
        }
      } catch {
        // Continue without env data
      }

      // Step 3: Hourly data from env params
      setLoadingHourly(true);
      try {
        const eRes = await fetch("/api/env-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: city.latitude,
            longitude: city.longitude,
            temperature: tempC,
          }),
        });
        const eData = await eRes.json();
        const params = eData.result?.locations?.[0]?.parameters;
        const heatIndexArr = params?.heat_index_celsius ?? [];
        const hours = [6, 8, 10, 12, 14, 16, 18, 20];
        const data: HourlyPoint[] = hours.map((h) => ({
          hour: h,
          temp: Math.round(cToF(heatIndexArr[h] ?? tempC)),
        }));
        setHourlyData(data);
      } catch {
        setHourlyData([]);
      } finally {
        setLoadingHourly(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch zone data SEQUENTIALLY
  const fetchZoneData = useCallback(async (cities: City[]) => {
    setFetchingZones(true);
    setZones([]);
    const results: HeatZone[] = [];
    for (const city of cities) {
      const zone = await fetchCityZone(city);
      if (zone) {
        results.push(zone);
        setZones([...results]);
      }
    }
    setFetchingZones(false);
  }, []);

  useEffect(() => {
    fetchData(selectedCity);
    const otherCities = PRESET_CITIES.filter((c) => c.name !== selectedCity.name).slice(0, 4);
    fetchZoneData(otherCities);
  }, [selectedCity, fetchData, fetchZoneData]);

  const maxHourlyTemp = hourlyData.length > 0 ? Math.max(...hourlyData.map((d) => d.temp)) : 120;

  // Current hour's env data
  const currentHour = new Date().getHours();
  const humidity = env?.relative_humidity_percent?.[currentHour] ?? 0;
  const windSpeed = env?.wind_speed_kmh?.[currentHour] ?? 0;
  const aqi = env?.air_quality_aqi?.[currentHour] ?? 0;
  const heatIndexC = env?.heat_index_celsius?.[currentHour] ?? 0;
  const apparentC = env?.apparent_temperature_celsius?.[currentHour] ?? 0;
  const wetBulbC = env?.wet_bulb_temperature_celsius?.[currentHour] ?? 0;

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
              <HeatMap city={selectedCity} temperature={temperature} />

              <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-5 sm:p-6 md:p-8 overflow-hidden">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3 sm:mb-4">
                  {selectedCity.name}, {selectedCity.state} — Current
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-start sm:justify-between gap-4 sm:gap-6">
                  <div className="shrink-0"><TemperatureGauge temperature={temperature} size="md" /></div>
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg sm:text-xl font-bold text-white font-mono">{riskScore}</div>
                    <span className="text-[9px] uppercase tracking-[0.12em] text-white/30">Risk Score</span>
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${riskLevel === "critical" || riskLevel === "extreme" ? "text-red-400" : riskLevel === "high" ? "text-amber-400" : riskLevel === "medium" ? "text-lime-400" : "text-blue-400"}`}>{riskLevel}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-white/35">Feels like <span className="text-white/60 font-medium">{Math.round(cToF(heatIndexC))}°F</span></p>
              </div>

              {/* Hourly Temperature Chart — Real data from env_params */}
              <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30">Hourly Heat Index</h3>
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

              {/* Environmental Parameters — Real data */}
              {env && (
                <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3 sm:mb-4">Environmental Parameters</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { l: "Heat Index", v: `${Math.round(cToF(heatIndexC))}°F` },
                      { l: "Apparent Temp", v: `${Math.round(cToF(apparentC))}°F` },
                      { l: "Wet Bulb", v: `${Math.round(cToF(wetBulbC))}°F` },
                      { l: "Humidity", v: `${Math.round(humidity)}%` },
                      { l: "Wind", v: `${Math.round(windSpeed * 0.621)} mph` },
                      { l: "AQI", v: `${Math.round(aqi)}` },
                    ].map((s) => (
                      <div key={s.l} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2.5 sm:p-3">
                        <div className="text-[8px] sm:text-[9px] text-white/25 uppercase tracking-wider">{s.l}</div>
                        <div className="mt-0.5 font-mono text-xs sm:text-sm font-semibold text-white/80">{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Recommendations */}
              <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6 overflow-hidden">
                <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-3 sm:mb-4">Safety Recommendations</h3>
                <ul className="space-y-2">
                  {[
                    "Stay hydrated — drink water every 20 minutes",
                    "Seek shade between 11 AM and 3 PM",
                    "Wear light-colored, loose-fitting clothing",
                    "Check on vulnerable neighbors and elderly",
                    riskScore >= 70 ? "Avoid outdoor activities during peak hours" : "Limit prolonged outdoor exposure",
                  ].map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-white/45">
                      <span className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 rounded-full border border-white/10 bg-white/[0.02] text-center text-[9px] sm:text-[10px] leading-4 sm:leading-5 text-white/40 font-mono">{i + 1}</span>
                      <span className="min-w-0">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 overflow-hidden">
              <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                {fetchingZones ? `Loading zones... (${zones.length}/4)` : "Monitored Zones"}
              </h3>
              <div className="space-y-2.5 sm:space-y-3">
                {zones.map((z) => (
                  <RiskCard key={z.id} name={z.name} city={z.city} temperature={z.temperature} riskLevel={z.riskLevel} riskScore={z.riskScore} heatIndex={z.heatIndex} lastUpdated={new Date(z.lastUpdated).toLocaleTimeString()} />
                ))}
                {fetchingZones && zones.length < 4 && (
                  <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 text-center">
                    <div className="text-[10px] text-white/20">Loading next city...</div>
                  </div>
                )}
              </div>
              <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-3.5 sm:p-4 space-y-1.5">
                <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-white/30 mb-1.5">Quick Actions</h4>
                <a href="/routes" className="block rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 text-[11px] sm:text-xs text-white/35 transition-all hover:text-white/70 hover:bg-white/[0.04]">Plan Cool Route</a>
                <a href="/advisor" className="block rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 text-[11px] sm:text-xs text-white/35 transition-all hover:text-white/70 hover:bg-white/[0.04]">Ask AI Advisor</a>
                <a href="/audit" className="block rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 text-[11px] sm:text-xs text-white/35 transition-all hover:text-white/70 hover:bg-white/[0.04]">Asset Heat Audit</a>
                <a href="/twin" className="block rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 text-[11px] sm:text-xs text-white/35 transition-all hover:text-white/70 hover:bg-white/[0.04]">Digital Twin</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
