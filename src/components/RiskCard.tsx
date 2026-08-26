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
  const m: Record<string, string> = { low: "#9CA0A6", medium: "#6B6B70", high: "#111", extreme: "#111", critical: "#111" };
  return m[level] ?? "#9CA0A6";
}

export default function RiskCard({ name, city, temperature, riskLevel, riskScore, heatIndex, lastUpdated }: Props) {
  const color = getRiskColor(riskLevel);
  return (
    <div className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-2xl relative overflow-hidden p-4 transition-all duration-300 hover:bg-[#FAFAFA]">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}20, transparent)` }} />
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <h3 className="text-[#111] text-sm font-semibold truncate">{name}</h3>
          <p className="text-[9px] text-[#9CA0A6] mt-0.5">{city}</p>
        </div>
        <div className="h-1.5 w-1.5 rounded-full shrink-0 mt-1.5" style={{ background: color }} />
      </div>
      <div className="flex items-baseline gap-2 mb-2.5">
        <span className="font-mono text-xl font-bold shrink-0 text-[#111]">{Math.round(temperature)}°F</span>
        {heatIndex !== undefined && <span className="text-[9px] text-[#9CA0A6] truncate">feels {Math.round(heatIndex)}°F</span>}
      </div>
      <div className="mb-2.5">
        <div className="mb-1 flex justify-between text-[9px]">
          <span className="text-[#9CA0A6] uppercase tracking-wider">Risk</span>
          <span className="font-mono text-[#6B6B70]">{riskScore}/100</span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-full bg-[#E5E5EA]">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${riskScore}%`, background: `linear-gradient(90deg, #E5E5EA, ${color})` }} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.12em] font-medium" style={{ color }}>{riskLevel}</span>
        {lastUpdated && <span className="text-[9px] text-[#9CA0A6] truncate">{lastUpdated}</span>}
      </div>
    </div>
  );
}
