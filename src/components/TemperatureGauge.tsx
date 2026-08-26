"use client";

import { useEffect, useState } from "react";

interface Props {
  temperature: number;
  unit?: "F" | "C";
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  animated?: boolean;
}

function getIntensity(temp: number): number {
  if (temp >= 120) return 1;
  if (temp >= 110) return 0.9;
  if (temp >= 100) return 0.8;
  if (temp >= 90) return 0.65;
  if (temp >= 80) return 0.5;
  if (temp >= 70) return 0.35;
  return 0.2;
}

function getLabel(temp: number): string {
  if (temp >= 120) return "EXTREME HEAT";
  if (temp >= 110) return "DANGEROUS";
  if (temp >= 100) return "VERY HOT";
  if (temp >= 90) return "HOT";
  if (temp >= 80) return "WARM";
  if (temp >= 70) return "MILD";
  return "COOL";
}

function getColor(temp: number): string {
  const i = getIntensity(temp);
  return `hsl(0, 0%, ${Math.round(35 + i * 65)}%)`;
}

export default function TemperatureGauge({ temperature, unit = "F", size = "lg", showLabel = true, animated = true }: Props) {
  const [display, setDisplay] = useState(animated ? 0 : temperature);

  useEffect(() => {
    if (!animated) { setDisplay(temperature); return; }
    const dur = 1200; const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setDisplay(Math.round(temperature * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [temperature, animated]);

  const color = getColor(temperature);
  const sizes = { sm: "text-2xl", md: "text-4xl", lg: "text-6xl", xl: "text-8xl" };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`font-mono font-bold tracking-tighter ${sizes[size]}`} style={{ color }}>
        {display}°<span className="text-[0.45em] text-white/25">{unit}</span>
      </span>
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="h-px w-6" style={{ background: color }} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color }}>{getLabel(temperature)}</span>
          <span className="h-px w-6" style={{ background: color }} />
        </div>
      )}
    </div>
  );
}
