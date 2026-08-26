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
  if (temp >= 110) return 0.85;
  if (temp >= 100) return 0.7;
  if (temp >= 90) return 0.55;
  if (temp >= 80) return 0.4;
  return 0.25;
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

  const sizes = { sm: "text-2xl", md: "text-4xl", lg: "text-6xl", xl: "text-8xl" };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`font-mono font-bold tracking-tighter ${sizes[size]} text-[#111]`}>
        {display}°<span className="text-[0.45em] text-[#9CA0A6]">{unit}</span>
      </span>
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-[#E5E5EA]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9CA0A6]">{getLabel(temperature)}</span>
          <span className="h-px w-6 bg-[#E5E5EA]" />
        </div>
      )}
    </div>
  );
}
