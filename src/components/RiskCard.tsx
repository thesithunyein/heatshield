"use client";

import { getRiskColor, getRiskBgColor, getRiskEmoji, formatTemperature } from "@/lib/utils";

interface RiskCardProps {
  name: string;
  city: string;
  temperature: number;
  riskLevel: string;
  riskScore: number;
  heatIndex?: number;
  lastUpdated?: string;
}

export default function RiskCard({
  name,
  city,
  temperature,
  riskLevel,
  riskScore,
  heatIndex,
  lastUpdated,
}: RiskCardProps) {
  const color = getRiskColor(riskLevel);
  const bgColor = getRiskBgColor(riskLevel);
  const emoji = getRiskEmoji(riskLevel);

  return (
    <div
      className="hs-glass-card group relative overflow-hidden p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{ borderColor: `${color}20` }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-[var(--hs-text-primary)]">{name}</h3>
          <p className="text-xs text-[var(--hs-text-muted)]">{city}</p>
        </div>
        <span className="text-lg">{emoji}</span>
      </div>

      {/* Temperature */}
      <div className="mb-3">
        <span
          className="font-mono text-3xl font-bold"
          style={{ color }}
        >
          {formatTemperature(temperature)}
        </span>
        {heatIndex !== undefined && (
          <span className="ml-2 text-xs text-[var(--hs-text-muted)]">
            feels like {formatTemperature(heatIndex)}
          </span>
        )}
      </div>

      {/* Risk Score Bar */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-[var(--hs-text-secondary)]">Risk Score</span>
          <span className="font-mono font-medium" style={{ color }}>
            {riskScore}/100
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--hs-bg)]">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${riskScore}%`,
              background: `linear-gradient(90deg, var(--hs-heat-cool), ${color})`,
            }}
          />
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{ background: bgColor, color }}
        >
          {riskLevel}
        </span>
        {lastUpdated && (
          <span className="text-[10px] text-[var(--hs-text-muted)]">
            {lastUpdated}
          </span>
        )}
      </div>
    </div>
  );
}
