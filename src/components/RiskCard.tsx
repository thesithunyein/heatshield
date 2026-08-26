"use client";

interface RiskCardProps {
  name: string;
  city: string;
  temperature: number;
  riskLevel: string;
  riskScore: number;
  heatIndex?: number;
  lastUpdated?: string;
}

function getRiskColor(level: string): string {
  switch (level) {
    case "low": return "#71717A";
    case "medium": return "#A1A1AA";
    case "high": return "#D4D4D8";
    case "extreme": return "#E4E4E7";
    case "critical": return "#FAFAFA";
    default: return "#52525B";
  }
}

function getRiskEmoji(level: string): string {
  switch (level) {
    case "low": return "◻";
    case "medium": return "◻";
    case "high": return "◼";
    case "extreme": return "◼";
    case "critical": return "◼";
    default: return "◻";
  }
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
  const symbol = getRiskEmoji(riskLevel);

  return (
    <div
      className="hs-glass-card group relative overflow-hidden p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{ borderColor: `${color}15` }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-xs text-[var(--hs-text-muted)]">{city}</p>
        </div>
        <span className="text-lg" style={{ color }}>{symbol}</span>
      </div>

      <div className="mb-3">
        <span className="font-mono text-3xl font-bold" style={{ color }}>
          {Math.round(temperature)}°F
        </span>
        {heatIndex !== undefined && (
          <span className="ml-2 text-xs text-[var(--hs-text-muted)]">
            feels like {Math.round(heatIndex)}°F
          </span>
        )}
      </div>

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
              background: `linear-gradient(90deg, #3F3F46, ${color})`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{ background: `${color}10`, color }}
        >
          {riskLevel}
        </span>
        {lastUpdated && (
          <span className="text-[10px] text-[var(--hs-text-muted)]">{lastUpdated}</span>
        )}
      </div>
    </div>
  );
}
