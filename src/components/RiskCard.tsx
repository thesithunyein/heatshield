"use client";

interface Props {
  name: string;
  city: string;
  temperature: number;
  riskLevel: string;
  riskScore: number;
  heatIndex?: number;
  lastUpdated?: string;
}

function getRiskColor(level: string): string {
  const m: Record<string, string> = { low: "#71717A", medium: "#A1A1AA", high: "#D4D4D8", extreme: "#E4E4E7", critical: "#FAFAFA" };
  return m[level] ?? "#52525B";
}

export default function RiskCard({ name, city, temperature, riskLevel, riskScore, heatIndex, lastUpdated }: Props) {
  const color = getRiskColor(riskLevel);
  return (
    <div className="border border-white/[0.06] bg-white/[0.03] rounded-2xl relative overflow-hidden p-4 transition-all duration-300 hover:bg-white/[0.05]">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <h3 className="text-white text-sm font-semibold truncate">{name}</h3>
          <p className="text-[9px] text-white/30 mt-0.5">{city}</p>
        </div>
        <div className="h-1.5 w-1.5 rounded-full shrink-0 mt-1.5" style={{ background: color }} />
      </div>
      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="font-mono text-xl font-bold shrink-0 text-white">{Math.round(temperature)}°F</span>
        {heatIndex !== undefined && <span className="text-[9px] text-white/30 truncate">feels {Math.round(heatIndex)}°F</span>}
      </div>
      <div className="mb-2.5">
        <div className="mb-1 flex justify-between text-[9px]">
          <span className="text-white/30 uppercase tracking-wider">Risk</span>
          <span className="font-mono text-white/50">{riskScore}/100</span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${riskScore}%`, background: `linear-gradient(90deg, #27272A, ${color})` }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.12em] font-medium" style={{ color }}>{riskLevel}</span>
        {lastUpdated && <span className="text-[9px] text-white/20 truncate">{lastUpdated}</span>}
      </div>
    </div>
  );
}
