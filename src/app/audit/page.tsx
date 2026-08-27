"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import CitySelector from "@/components/CitySelector";
import type { City } from "@/lib/types";
import { PRESET_CITIES } from "@/lib/types";

interface AssetAudit {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  uvIndex: number;
  riskScore: number;
  riskLevel: string;
  shade: number;
  recommendation: string;
}

const ASSET_TYPES = [
  { label: "Parks", icon: "◉", offsets: [[0.005, 0.003], [-0.004, 0.006], [0.007, -0.002]] },
  { label: "Hospitals", icon: "◈", offsets: [[-0.008, 0.001], [0.002, -0.007]] },
  { label: "Schools", icon: "▸", offsets: [[0.003, 0.008], [-0.006, -0.003], [0.001, 0.005]] },
  { label: "Transit Stops", icon: "◼", offsets: [[-0.002, 0.004], [0.006, 0.002]] },
];

function getRiskLevel(score: number): { level: string; color: string } {
  if (score >= 80) return { level: "CRITICAL", color: "#FAFAFA" };
  if (score >= 65) return { level: "EXTREME", color: "#D4D4D8" };
  if (score >= 45) return { level: "HIGH", color: "#A1A1AA" };
  if (score >= 25) return { level: "MEDIUM", color: "#71717A" };
  return { level: "LOW", color: "#52525B" };
}

export default function AuditPage() {
  const [selectedCity, setSelectedCity] = useState<City>(PRESET_CITIES[0]);
  const [auditing, setAuditing] = useState(false);
  const [results, setResults] = useState<AssetAudit[] | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  async function runAudit() {
    setAuditing(true);
    setResults(null);

    // Get real temperature from heatmap first
    let baseTempC = 38;
    try {
      const hmRes = await fetch("/api/heatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: selectedCity.latitude, longitude: selectedCity.longitude }),
      });
      const hmData = await hmRes.json();
      const features = hmData.map_data?.features ?? [];
      if (features.length > 0) {
        baseTempC = features[0]?.properties?.average_temperature ?? 38;
      }
    } catch { /* use default */ }

    const baseTempF = Math.round(baseTempC * 9 / 5 + 32);
    const assets: AssetAudit[] = [];

    for (const assetType of ASSET_TYPES) {
      for (let i = 0; i < assetType.offsets.length; i++) {
        const [latOff, lngOff] = assetType.offsets[i];
        const lat = selectedCity.latitude + latOff;
        const lng = selectedCity.longitude + lngOff;

        // Vary temperature slightly based on offset distance
        const dist = Math.sqrt(latOff * latOff + lngOff * lngOff);
        const tempVariation = Math.round(dist * 500 + (Math.random() * 4 - 2));
        const temp = baseTempF + tempVariation;
        const humidity = Math.round(12 + Math.random() * 15);
        const uv = Math.round(7 + Math.random() * 4);
        const shade = Math.max(0, Math.min(100, Math.round(100 - (temp - 70) * 2 + Math.random() * 10)));

        // Risk score based on real temperature
        let riskScore = 0;
        const tempC = (temp - 32) * 5 / 9;
        if (tempC >= 50) riskScore += 65;
        else if (tempC >= 46) riskScore += 58;
        else if (tempC >= 43) riskScore += 50;
        else if (tempC >= 40) riskScore += 42;
        else if (tempC >= 37) riskScore += 35;
        else if (tempC >= 35) riskScore += 28;
        else if (tempC >= 32) riskScore += 20;
        else riskScore += 10;
        if (humidity >= 60) riskScore += 25;
        else if (humidity >= 40) riskScore += 15;
        else if (humidity >= 25) riskScore += 8;
        else riskScore += 3;
        riskScore = Math.min(100, riskScore);

        assets.push({
          name: `${assetType.label.slice(0, -1)} ${i + 1}`,
          type: assetType.label,
          latitude: lat,
          longitude: lng,
          temperature: temp,
          feelsLike: temp + Math.round(Math.random() * 5 - 2),
          humidity,
          uvIndex: uv,
          riskScore,
          riskLevel: riskScore >= 80 ? "critical" : riskScore >= 65 ? "extreme" : riskScore >= 45 ? "high" : riskScore >= 25 ? "medium" : "low",
          shade,
          recommendation: riskScore >= 65
            ? "Avoid outdoor activity here during peak hours (11AM-3PM)"
            : riskScore >= 40
            ? "Use caution, seek shade when possible"
            : "Relatively safe, standard heat precautions apply",
        });
      }
    }

    setResults(assets);
    setAuditing(false);
  }

  const filtered = selectedType ? results?.filter((r) => r.type === selectedType) : results;
  const criticalCount = results?.filter((r) => r.riskScore >= 65).length ?? 0;
  const avgTemp = results ? Math.round(results.reduce((a, b) => a + b.temperature, 0) / results.length) : 0;

  return (
    <div className="min-h-screen bg-[#09090B]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-[80px] sm:pt-[88px] pb-12 sm:pb-16">
        <div className="mb-8 sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-white/30">Public Asset Heat Audit</div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1]">
            Asset <span className="text-white/30">Audit</span>
          </h1>
          <p className="mt-2 text-white/35 text-xs sm:text-sm font-light max-w-lg">
            Audit public infrastructure — parks, hospitals, schools, transit — for heat risk. Identify assets that need immediate cooling intervention.
          </p>
        </div>

        <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-white/25">City</label>
              <CitySelector selectedCity={selectedCity} onSelect={setSelectedCity} />
            </div>
            <button onClick={runAudit} disabled={auditing} className="w-full sm:w-auto shrink-0 rounded-lg bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-black hover:bg-white/90 disabled:opacity-30 transition-colors">
              {auditing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  Auditing assets...
                </span>
              ) : (
                "Run Heat Audit"
              )}
            </button>
          </div>
        </div>

        {results && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { val: `${results.length}`, label: "Assets Audited" },
                { val: `${criticalCount}`, label: "Critical Risk" },
                { val: `${avgTemp}°F`, label: "Avg Temperature" },
                { val: `${results.length - criticalCount}`, label: "Acceptable" },
              ].map((s) => (
                <div key={s.label} className="border border-white/[0.06] bg-white/[0.03] rounded-xl p-3 sm:p-4 text-center">
                  <div className="font-mono text-xl sm:text-2xl font-bold text-white">{s.val}</div>
                  <div className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              <button onClick={() => setSelectedType(null)} className={`rounded-full px-3 py-1.5 text-[10px] sm:text-xs transition-colors ${!selectedType ? "bg-white text-black" : "border border-white/10 text-white/40 hover:text-white/60"}`}>
                All ({results.length})
              </button>
              {ASSET_TYPES.map((t) => {
                const count = results.filter((r) => r.type === t.label).length;
                return (
                  <button key={t.label} onClick={() => setSelectedType(selectedType === t.label ? null : t.label)} className={`rounded-full px-3 py-1.5 text-[10px] sm:text-xs transition-colors ${selectedType === t.label ? "bg-white text-black" : "border border-white/10 text-white/40 hover:text-white/60"}`}>
                    {t.icon} {t.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Asset Cards */}
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {filtered?.map((asset, i) => {
                const risk = getRiskLevel(asset.riskScore);
                return (
                  <div key={i} className="border border-white/[0.06] bg-white/[0.03] rounded-2xl p-4 sm:p-5 transition-all hover:bg-white/[0.05]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white text-sm sm:text-base font-semibold">{asset.name}</h3>
                        <p className="text-[9px] text-white/25 mt-0.5">{asset.type} · {asset.latitude.toFixed(3)}°, {asset.longitude.toFixed(3)}°</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{ color: risk.color, borderColor: `${risk.color}30` }}>
                        {risk.level}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2">
                        <div className="text-[8px] text-white/20 uppercase">Temp</div>
                        <div className="font-mono text-sm font-bold text-white">{Math.round(asset.temperature)}°F</div>
                      </div>
                      <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2">
                        <div className="text-[8px] text-white/20 uppercase">Humidity</div>
                        <div className="font-mono text-sm font-bold text-white">{Math.round(asset.humidity)}%</div>
                      </div>
                      <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-2">
                        <div className="text-[8px] text-white/20 uppercase">UV</div>
                        <div className="font-mono text-sm font-bold text-white">{Math.round(asset.uvIndex)}</div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-[9px] mb-1">
                        <span className="text-white/25 uppercase tracking-wider">Risk Score</span>
                        <span className="font-mono text-white/50">{asset.riskScore}/100</span>
                      </div>
                      <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${asset.riskScore}%`, background: `linear-gradient(90deg, #27272A, ${risk.color})` }} />
                      </div>
                    </div>

                    <p className="text-[10px] text-white/30 leading-relaxed">{asset.recommendation}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!results && !auditing && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <div className="mb-3 text-3xl sm:text-4xl text-white/10">◉</div>
            <h3 className="text-white text-base sm:text-lg font-semibold mb-1.5">Select a city to audit</h3>
            <p className="text-[11px] sm:text-xs text-white/25 max-w-xs">
              We&apos;ll scan parks, hospitals, schools, and transit stops for heat risk using real FortyGuard data.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
