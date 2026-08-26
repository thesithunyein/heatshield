/**
 * FortyGuard Temperature API Client
 *
 * Handles the async submit → poll → retrieve pattern for all 6 endpoints.
 * API key is read server-side only (never exposed to client).
 */

const API_BASE = "https://api.fortyguard.com";
const API_KEY = process.env.FORTYGUARD_API_KEY ?? "";
const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 3000;

// ── Internal helpers ─────────────────────────────

async function submitRequest<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<{ activity_id: string }> {
  console.log(`[FortyGuard] Submitting to ${endpoint}`);

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[FortyGuard] Submit error ${res.status}: ${text}`);
    throw new Error(`FortyGuard API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log(`[FortyGuard] Got activity_id: ${data.activity_id}`);
  return data;
}

async function pollStatus<T>(
  activityId: string
): Promise<T> {
  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const res = await fetch(`${API_BASE}/v1/status/${activityId}`, {
      headers: { "api-key": API_KEY },
    });

    if (!res.ok) {
      console.error(`[FortyGuard] Poll error ${res.status}`);
      throw new Error(`Status poll error ${res.status}`);
    }

    const data = await res.json();

    if (data.status === "completed") {
      console.log(`[FortyGuard] Task ${activityId} completed`);
      return data as T;
    }

    if (data.status === "failed") {
      console.error(`[FortyGuard] Task ${activityId} failed: ${data.error}`);
      throw new Error(`Task failed: ${data.error ?? "unknown error"}`);
    }

    // Still processing — wait before next poll
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(`Polling timed out after ${MAX_POLL_ATTEMPTS} attempts`);
}

// ── Public API methods ───────────────────────────

export async function createHeatmap(params: {
  polygon_aoi: { type: "Polygon"; coordinates: number[][][] };
  date: string;
  hour?: number;
  end_hour?: number;
}) {
  const { activity_id } = await submitRequest("/v1/heatmap", {
    polygon_aoi: params.polygon_aoi,
    date: params.date,
    ...(params.hour !== undefined && { hour: params.hour }),
    ...(params.end_hour !== undefined && { end_hour: params.end_hour }),
  });
  return pollStatus(activity_id);
}

export async function getHeatIntelligence(params: {
  latitude: number;
  longitude: number;
  date?: string;
  categories?: string[];
}) {
  const { activity_id } = await submitRequest("/v1/heat-intelligence", {
    latitude: params.latitude,
    longitude: params.longitude,
    ...(params.date && { date: params.date }),
    ...(params.categories && { categories: params.categories }),
  });
  return pollStatus(activity_id);
}

export async function getEnvironmentalParams(params: {
  latitude: number;
  longitude: number;
  date?: string;
}) {
  const { activity_id } = await submitRequest("/v1/env_params", {
    latitude: params.latitude,
    longitude: params.longitude,
    ...(params.date && { date: params.date }),
  });
  return pollStatus(activity_id);
}

export async function getSatelliteSegmentation(params: {
  latitude: number;
  longitude: number;
  radius?: number;
}) {
  const { activity_id } = await submitRequest("/v1/satellite", {
    latitude: params.latitude,
    longitude: params.longitude,
    ...(params.radius && { radius: params.radius }),
  });
  return pollStatus(activity_id);
}

export async function getStreetViewSegmentation(params: {
  latitude: number;
  longitude: number;
  heading?: number;
  pitch?: number;
}) {
  const { activity_id } = await submitRequest("/v1/streetview", {
    latitude: params.latitude,
    longitude: params.longitude,
    ...(params.heading !== undefined && { heading: params.heading }),
    ...(params.pitch !== undefined && { pitch: params.pitch }),
  });
  return pollStatus(activity_id);
}

// ── Heat Risk Scoring Engine ─────────────────────

export function computeRiskScore(data: {
  temperature_f: number;
  humidity?: number;
  uv_index?: number;
  wind_speed?: number;
}): { score: number; level: string; color: string } {
  let score = 0;

  // Temperature component (0-50 points)
  const tempF = data.temperature_f;
  if (tempF >= 130) score += 50;
  else if (tempF >= 120) score += 45;
  else if (tempF >= 110) score += 38;
  else if (tempF >= 100) score += 30;
  else if (tempF >= 90) score += 20;
  else if (tempF >= 80) score += 10;
  else score += 5;

  // Humidity multiplier (0-25 points)
  if (data.humidity) {
    if (data.humidity >= 80) score += 25;
    else if (data.humidity >= 60) score += 18;
    else if (data.humidity >= 40) score += 10;
    else score += 3;
  }

  // UV index component (0-15 points)
  if (data.uv_index) {
    if (data.uv_index >= 11) score += 15;
    else if (data.uv_index >= 8) score += 12;
    else if (data.uv_index >= 6) score += 8;
    else score += 3;
  }

  // Wind relief (deduct 0-10 points)
  if (data.wind_speed && data.wind_speed > 10) {
    score -= Math.min(10, Math.floor(data.wind_speed / 3));
  }

  score = Math.max(0, Math.min(100, score));

  let level: string;
  let color: string;

  if (score >= 85) {
    level = "critical";
    color = "var(--hs-heat-critical)";
  } else if (score >= 70) {
    level = "extreme";
    color = "var(--hs-heat-extreme)";
  } else if (score >= 50) {
    level = "high";
    color = "var(--hs-heat-hot)";
  } else if (score >= 30) {
    level = "medium";
    color = "var(--hs-heat-warm)";
  } else {
    level = "low";
    color = "var(--hs-heat-cool)";
  }

  return { score, level, color };
}

// ── Mock data for demo / when API key not set ────

export function getMockHeatIntelligence(latitude: number, longitude: number) {
  console.log("[FortyGuard] Using mock data (no API key)");
  const tempF = 85 + Math.random() * 35;
  const humidity = 20 + Math.random() * 60;
  const uvIndex = 3 + Math.random() * 9;
  const risk = computeRiskScore({
    temperature_f: tempF,
    humidity,
    uv_index: uvIndex,
  });

  return {
    status: "completed" as const,
    result: {
      location: {
        latitude,
        longitude,
        city: "Demo City",
        country: "XX",
      },
      temperature: {
        current: tempF,
        feels_like: tempF + (humidity > 50 ? 5 : -2),
        unit: "F",
      },
      risk_level: risk.level,
      risk_score: risk.score,
      analysis: {
        environmental: { humidity, uv_index: uvIndex },
      },
      recommendations: [
        "Stay hydrated — drink water every 20 minutes",
        "Seek shade between 11 AM and 3 PM",
        "Wear light-colored, loose-fitting clothing",
        "Check on vulnerable neighbors and elderly",
      ],
    },
  };
}
