"use client";

import { useEffect, useState } from "react";

interface TemperatureGaugeProps {
  temperature: number;
  unit?: "F" | "C";
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  animated?: boolean;
}

function getHeatIntensity(temp: number): number {
  // 0 = dim, 1 = full white brightness
  if (temp >= 120) return 1;
  if (temp >= 110) return 0.9;
  if (temp >= 100) return 0.8;
  if (temp >= 90) return 0.65;
  if (temp >= 80) return 0.5;
  if (temp >= 70) return 0.35;
  return 0.2;
}

function getHeatLabel(temp: number): string {
  if (temp >= 120) return "EXTREME HEAT";
  if (temp >= 110) return "DANGEROUS";
  if (temp >= 100) return "VERY HOT";
  if (temp >= 90) return "HOT";
  if (temp >= 80) return "WARM";
  if (temp >= 70) return "MILD";
  return "COOL";
}

function getColor(temp: number): string {
  const intensity = getHeatIntensity(temp);
  const lightness = Math.round(40 + intensity * 60); // 40-100 lightness
  return `hsl(0, 0%, ${lightness}%)`;
}

export default function TemperatureGauge({
  temperature,
  unit = "F",
  size = "lg",
  showLabel = true,
  animated = true,
}: TemperatureGaugeProps) {
  const [displayTemp, setDisplayTemp] = useState(animated ? 0 : temperature);

  useEffect(() => {
    if (!animated) {
      setDisplayTemp(temperature);
      return;
    }
    const duration = 1200;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayTemp(Math.round(temperature * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [temperature, animated]);

  const color = getColor(temperature);
  const label = getHeatLabel(temperature);
  const intensity = getHeatIntensity(temperature);

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
    xl: "text-8xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* Glow effect — white for hot, dim for cool */}
        <div
          className="absolute inset-0 blur-3xl"
          style={{
            background: `rgba(255, 255, 255, ${intensity * 0.15})`,
          }}
        />
        <span
          className={`relative font-mono font-bold tracking-tighter ${sizeClasses[size]}`}
          style={{ color }}
        >
          {displayTemp}°
          <span className="text-[0.5em] text-[var(--hs-text-muted)]">{unit}</span>
        </span>
      </div>

      {showLabel && (
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-px w-8"
            style={{ background: color }}
          />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color }}
          >
            {label}
          </span>
          <span
            className="inline-block h-px w-8"
            style={{ background: color }}
          />
        </div>
      )}
    </div>
  );
}
