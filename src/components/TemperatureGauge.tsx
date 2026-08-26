"use client";

import { useEffect, useState } from "react";

interface TemperatureGaugeProps {
  temperature: number;
  unit?: "F" | "C";
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  animated?: boolean;
}

function getHeatColor(temp: number): string {
  if (temp >= 120) return "var(--hs-heat-critical)";
  if (temp >= 110) return "var(--hs-heat-extreme)";
  if (temp >= 100) return "var(--hs-heat-hot)";
  if (temp >= 90) return "var(--hs-heat-warm)";
  if (temp >= 80) return "var(--hs-heat-mild)";
  if (temp >= 70) return "var(--hs-heat-cool)";
  return "var(--hs-heat-cold)";
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

    let start = 0;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayTemp(Math.round(start + (temperature - start) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [temperature, animated]);

  const color = getHeatColor(temperature);
  const label = getHeatLabel(temperature);

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
    xl: "text-8xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* Glow effect */}
        <div
          className="absolute inset-0 blur-3xl opacity-20"
          style={{ background: color }}
        />

        {/* Temperature number */}
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
            className="inline-block h-1 w-8 rounded-full"
            style={{ background: color }}
          />
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color }}
          >
            {label}
          </span>
          <span
            className="inline-block h-1 w-8 rounded-full"
            style={{ background: color }}
          />
        </div>
      )}
    </div>
  );
}
