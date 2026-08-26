import { type ClassValue, clsx } from "clsx";

// Simple cn utility (no tailwind-merge needed for now)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatTemperature(temp: number, unit: "C" | "F" = "F"): string {
  return `${Math.round(temp)}°${unit}`;
}

export function getRiskColor(level: string): string {
  switch (level) {
    case "low":
      return "var(--hs-heat-cool)";
    case "medium":
      return "var(--hs-heat-warm)";
    case "high":
      return "var(--hs-heat-hot)";
    case "extreme":
      return "var(--hs-heat-extreme)";
    case "critical":
      return "var(--hs-heat-critical)";
    default:
      return "var(--hs-text-muted)";
  }
}

export function getRiskBgColor(level: string): string {
  switch (level) {
    case "low":
      return "rgba(6, 182, 212, 0.1)";
    case "medium":
      return "rgba(234, 179, 8, 0.1)";
    case "high":
      return "rgba(249, 115, 22, 0.1)";
    case "extreme":
      return "rgba(239, 68, 68, 0.1)";
    case "critical":
      return "rgba(220, 38, 38, 0.15)";
    default:
      return "rgba(99, 99, 102, 0.1)";
  }
}

export function getRiskEmoji(level: string): string {
  switch (level) {
    case "low":
      return "🟢";
    case "medium":
      return "🟡";
    case "high":
      return "🟠";
    case "extreme":
      return "🔴";
    case "critical":
      return "🚨";
    default:
      return "⚪";
  }
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
