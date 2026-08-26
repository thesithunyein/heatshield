"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import CitySelector from "@/components/CitySelector";
import type { City } from "@/lib/types";
import { PRESET_CITIES } from "@/lib/types";

interface HourlyData {
  hour: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  uvIndex: number;
  riskScore: number;
  riskLevel: string;
}

function getBarColor(temp: number): string {
  if (temp >= 115) return "#FAFAFA";
  if (temp >= 110) return "#D4D4D8";
  if (temp >= 105) return "#A1A1AA";
  if (temp >= 100) return "#71717A";
  if (temp >= 95) return "#52525B";
  return "#3F3F46";
}

function getRiskColor(score: number): string {
  if (score >= 80) return "#FAFAFA";
  if (score >= 65) return "#D4D4D8";
  if (score >= 45) return "#A1A1AA";
  if (score >= 25) return "#71717A";
  return "#52525B";
}

export default function TwinPage() {
  const [selectedCity, setSelectedCity] = useState<City>(PRESET_CITIES[0]);
  const [simulating, setSimulating] = useState(false);
  const [data, setData] = useState<HourlyData[] | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  async function simulate() {
    setSimulating(true);
    setData(null);

    // Simulate 6 key hours (6AM to 9PM) using real API data pattern
    const hours = [6, 8, 10, 12, 14, 16, 18, 20, 21];
    const results: HourlyData[] = [];

    for (const hour of hours) {
      try {
        // Use env-params to get baseline, then apply hour-based temperature curve
        const eRes = await fetch("/api/env-params", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: selectedCity.latitude, longitude: selectedCity.longitude }),
        });
        const eData = await eRes.json();
        const env = eData.result;

        if (env) {
          // Temperature curve: peaks at 2PM, lowest at 6AM
          const baseTemp = env.heat_index ?? 95;
          const hourFactor = Math.sin(((hour - 6) / 15) * Math.PI); // 0 at 6AM, 1 at ~1:30PM, 0 at 9PM
          const temp = Math.round(baseTemp * (0.7 + hourFactor * 0.35));
          const humidity = Math.round((env.humidity ?? 40) * (1.1 - hourFactor * 0.2));
          const uv = hour >= 10 && hour <= 16 ? Math.round((env.uv_index ?? 5) * hourFactor) : Math.max(0, Math.round((env.uv_index ?? 5) * 0.2));

          // Risk score computation
          let riskScore = 0;
          if (temp >= 120) riskScore += 50;
          else if (temp >= 110) riskScore += 40;
          else if (temp >= 100) riskScore += 30;
          else if (temp >= 90) riskScore += 20;
          else riskScore += 10;

          if (humidity >= 70) riskScore += 20;
          else if (humidity >= 50) riskScore += 12;
          else riskScore += 5;

          if (uv >= 8) riskScore += 15;
          else if (uv >= 5) riskScore += 8;
          else riskScore += 3;

          riskScore = Math.min(100, riskScore);

          let riskLevel = "low";
          if (riskScore >= 80) riskLevel = "critical";
          else if (riskScore >= 65) riskLevel = "extreme";
          else if (riskScore >= 45) riskLevel = "high";
          else if (riskScore >= 25) riskLevel = "medium";

          results.push({
            hour,
            temperature: temp,
            feelsLike: Math.round(temp + (humidity > 50 ? 5 : -2)),
            humidity,
            uvIndex: uv,
            riskScore,
            riskLevel,
          });
        }
      } catch {
        // Skip failed hours
      }
    }

    setData(results);
    setSimulating(false);
  }

  const maxTemp = data ? Math.max(...data.map((d) => d.temperature)) : 120;
  const peakHour = data ? data.reduce((a, b) => (a.temperature > b.temperature ? a : b)) : null;
  const safestHour = data ? data.reduce((a, b) => (a.riskScore < b.riskScore ? a : b)) : null;

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-[80px] sm:pt-[88px] pb-12 sm:pb-16">
        <div className="mb-8 sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-white/30">Digital Twin Simulation</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1]">
            Heat <span className="text-white/30">Simulation</span>
          </h1>
          <p className="mt-2 text-white/35 text-xs sm:text-sm font-light max-w-lg">
            Simulate how heat evolves throughout the day. Find peak danger hours and safest windows for outdoor activity.
          </p>
        </div>

        <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-white/25">City</label>
              <CitySelector selectedCity={selectedCity} onSelect={setSelectedCity} />
            </div>
            <button onClick={simulate} disabled={simulating} className="w-full sm:w-auto shrink-0 rounded-lg bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-black hover:bg-white/90 disabled:opacity-30 transition-colors">
              {simulating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Simulating...
                </span>
              ) : (
                "Run Simulation"
              )}
            </button>
          </div>
        </div>

        {data && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="border border-white/[0.06] bg-white/[0.03] rounded-xl p-3 sm:p-4">
                <div className="text-[9px] text-white/25 uppercase tracking-wider mb-1">Peak Temperature</div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-white">{peakHour?.temperature}°F</div>
                <div className="text-[10px] text-white/30 mt-0.5">at {peakHour?.hour}:00</div>
              </div>
              <div className="border border-white/[0.06] bg-white/[0.03] rounded-xl p-3 sm:p-4">
                <div className="text-[9px] text-white/25 uppercase tracking-wider mb-1">Safest Hour</div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-white">{safestHour?.temperature}°F</div>
                <div className="text-[10px] text-white/30 mt-0.5">at {safestHour?.hour}:00 (risk: {safestHour?.riskScore})</div>
              </div>
              <div className="border border-white/[0.06] bg-white/[0.03] rounded-xl p-3 sm:p-4 col-span-2 sm:col-span-1">
                <div className="text-[9px] text-white/25 uppercase tracking-wider mb-1">Danger Window</div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-white">
                  {data.filter((d) => d.riskScore >= 65).length > 0
                    ? `${data.filter((d) => d.riskScore >= 65)[0]?.hour}:00 - ${data.filter((d) => d.riskScore >= 65).pop()?.hour}:00`
                    : "None"}
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">extreme+ risk hours</div>
              </div>
            </div>

            {/* Hourly Chart */}
            <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
              <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-4 sm:mb-6">Hourly Temperature Simulation</h3>
              <div className="flex items-end gap-1.5 sm:gap-2 h-48 sm:h-64">
                {data.map((d) => {
                  const height = (d.temperature / maxTemp) * 100;
                  const isSelected = selectedHour === d.hour;
                  return (
                    <div key={d.hour} className="flex-1 flex flex-col items-center gap-1" onClick={() => setSelectedHour(isSelected ? null : d.hour)}>
                      <span className={`text-[9px] sm:text-[10px] font-mono transition-colors ${isSelected ? "text-white" : "text-white/30"}`}>{d.temperature}°</span>
                      <div
                        className="w-full rounded-t-md transition-all duration-500 cursor-pointer hover:opacity-80"
                        style={{
                          height: `${height}%`,
                          background: getBarColor(d.temperature),
                          opacity: isSelected ? 1 : 0.7,
                        }}
                      />
                      <span className={`text-[8px] sm:text-[9px] font-mono transition-colors ${isSelected ? "text-white" : "text-white/20"}`}>{d.hour}h</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hour Detail */}
            {selectedHour !== null && (() => {
              const hour = data.find((d) => d.hour === selectedHour);
              if (!hour) return null;
              return (
                <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
                  <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-4">{hour.hour}:00 — Detailed View</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Temperature", value: `${hour.temperature}°F` },
                      { label: "Feels Like", value: `${hour.feelsLike}°F` },
                      { label: "Humidity", value: `${hour.humidity}%` },
                      { label: "UV Index", value: `${hour.uvIndex}` },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                        <div className="text-[8px] text-white/20 uppercase tracking-wider">{s.label}</div>
                        <div className="font-mono text-lg font-bold text-white mt-0.5">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="text-[9px] text-white/25 uppercase tracking-wider">Risk:</div>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: getRiskColor(hour.riskScore) }}>{hour.riskLevel}</span>
                    <span className="font-mono text-xs text-white/40">{hour.riskScore}/100</span>
                    <div className="flex-1 h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full" style={{ width: `${hour.riskScore}%`, background: `linear-gradient(90deg, #27272A, ${getRiskColor(hour.riskScore)})` }} />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-white/35">
                    {hour.riskScore >= 65
                      ? "Dangerous conditions. Avoid outdoor activity. Stay in air-conditioned spaces."
                      : hour.riskScore >= 40
                      ? "Use caution outdoors. Take frequent breaks in shade. Stay hydrated."
                      : "Relatively safe conditions. Standard heat precautions apply."}
                  </p>
                </div>
              );
            })()}

            {/* Risk Timeline */}
            <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6">
              <h3 className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-4">Risk Timeline</h3>
              <div className="flex gap-1">
                {data.map((d) => (
                  <div key={d.hour} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full h-3 rounded-sm"
                      style={{ background: getRiskColor(d.riskScore) }}
                    />
                    <span className="text-[8px] text-white/20">{d.hour}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[8px] text-white/15">
                <span>6:00 AM</span>
                <span>12:00 PM</span>
                <span>9:00 PM</span>
              </div>
            </div>
          </>
        )}

        {!data && !simulating && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="mb-3 text-3xl sm:text-4xl text-white/10">◎</div>
            <h3 className="text-white text-base sm:text-lg font-semibold mb-1.5">Simulate your city&apos;s heat</h3>
            <p className="text-[11px] sm:text-xs text-white/25 max-w-xs">
              We&apos;ll model temperature, humidity, UV, and risk across a full day using real FortyGuard environmental data.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
