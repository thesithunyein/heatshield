/**
 * FortyGuard Temperature API Client
 *
 * Correct API format (discovered via testing):
 * - Heatmap: /v1/heatmap with polygon_aoi + date_time {start_date, end_date, filter_type: 3|4}
 * - Env Params: /v1/env_params with latitude, longitude, temperature, date_time
 * - Heat Intelligence: /v1/heat_intelligence with latitude, longitude, temperature, date, analysis[]
 * - Status: /v1/status/{activity_id}
 *
 * All endpoints are async: submit → poll → retrieve
 */

const API_BASE = "https://api.fortyguard.com";
const API_KEY = process.env.FORTYGUARD_API_KEY ?? "";
const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 2000;

// In-memory cache for completed results (keyed by activity_id)
const resultCache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCachedResult(key: string): unknown | null {
  const entry = resultCache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data;
  resultCache.delete(key);
  return null;
}

function setCachedResult(key: string, data: unknown): void {
  resultCache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Internal helpers ─────────────────────────────

async function submitRequest(
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

  const text = await res.text();
  console.log(`[FortyGuard] ${endpoint} status ${res.status}: ${text.slice(0, 200)}`);

  if (!res.ok) {
    throw new Error(`FortyGuard API error ${res.status}: ${text}`);
  }

  const data = JSON.parse(text);
  if (data.error) {
    throw new Error(`FortyGuard API error: ${data.message ?? JSON.stringify(data)}`);
  }

  return data.data;
}

async function pollStatus<T>(activityId: string): Promise<T> {
  // Check cache first
  const cached = getCachedResult(activityId);
  if (cached) {
    console.log(`[FortyGuard] Returning cached result for ${activityId}`);
    return cached as T;
  }

  for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
    const res = await fetch(`${API_BASE}/v1/status/${activityId}`, {
      headers: { "api-key": API_KEY },
    });

    if (!res.ok) {
      throw new Error(`Status poll error ${res.status}`);
    }

    const data = await res.json();
    const status = data.data?.status ?? data.status;

    if (status === "Completed" || status === "completed") {
      console.log(`[FortyGuard] Task ${activityId} completed`);
      const result = (data.data?.result ?? data.data ?? data) as T;
      setCachedResult(activityId, result);
      return result;
    }

    if (status === "Failed" || status === "failed") {
      throw new Error(`Task failed: ${data.data?.error ?? "unknown"}`);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(`Polling timed out after ${MAX_POLL_ATTEMPTS} attempts`);
}

// ── Public API methods ───────────────────────────

/**
 * Heatmap — returns GeoJSON FeatureCollection with temperature tiles
 * Each feature has: average_temperature, min_temperature, max_temperature (Celsius)
 */
export async function createHeatmap(params: {
  latitude: number;
  longitude: number;
  date?: string;
  filter_type?: number;
}) {
  const d = params.date ?? today();
  // Build polygon AOI (~2km around point)
  const offset = 0.018;
  const { latitude: lat, longitude: lng } = params;

  // Cache key: same city + same date = same result
  const cacheKey = `heatmap:${lat.toFixed(2)}:${lng.toFixed(2)}:${d}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    console.log(`[FortyGuard] Returning cached heatmap for ${cacheKey}`);
    return cached;
  }

  const { activity_id } = await submitRequest("/v1/heatmap", {
    polygon_aoi: {
      type: "Polygon",
      coordinates: [[
        [lng - offset, lat - offset],
        [lng + offset, lat - offset],
        [lng + offset, lat + offset],
        [lng - offset, lat + offset],
        [lng - offset, lat - offset],
      ]],
    },
    date_time: {
      start_date: d,
      end_date: d,
      filter_type: params.filter_type ?? 3,
    },
  });

  const result = await pollStatus(activity_id);
  setCachedResult(cacheKey, result);
  return result;
}

/**
 * Environmental Parameters — returns 24-hour arrays of env data
 * Requires a temperature input (Celsius)
 */
export async function getEnvironmentalParams(params: {
  latitude: number;
  longitude: number;
  temperature: number;
  date?: string;
}) {
  const d = params.date ?? today();

  const cacheKey = `env:${params.latitude.toFixed(2)}:${params.longitude.toFixed(2)}:${d}:${Math.round(params.temperature)}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    console.log(`[FortyGuard] Returning cached env_params for ${cacheKey}`);
    return cached;
  }

  const { activity_id } = await submitRequest("/v1/env_params", {
    latitude: params.latitude,
    longitude: params.longitude,
    temperature: params.temperature,
    date_time: {
      start_date: d,
      end_date: d,
      filter_type: 3,
    },
  });

  const result = await pollStatus(activity_id);
  setCachedResult(cacheKey, result);
  return result;
}

/**
 * Heat Intelligence — returns PDF download link
 * Requires temperature (Celsius), date, and analysis categories
 */
export async function getHeatIntelligence(params: {
  latitude: number;
  longitude: number;
  temperature: number;
  date?: string;
  analysis?: string[];
}) {
  const d = params.date ?? today();

  const { activity_id } = await submitRequest("/v1/heat_intelligence", {
    latitude: params.latitude,
    longitude: params.longitude,
    temperature: params.temperature,
    date: d,
    analysis: params.analysis ?? ["geographic", "environmental", "urban", "events", "anthropogenic"],
  });

  return pollStatus(activity_id);
}

// ── Risk Scoring Engine ──────────────────────────

export function computeRiskScore(data: {
  temperature_c: number;
  humidity?: number;
  uv_index?: number;
  wind_speed?: number;
}): { score: number; level: string; color: string } {
  let score = 0;
  const tempC = data.temperature_c;

  // Temperature component (0-50 points) — thresholds in Celsius
  if (tempC >= 54) score += 50;       // 130°F
  else if (tempC >= 49) score += 45;  // 120°F
  else if (tempC >= 43) score += 38;  // 110°F
  else if (tempC >= 38) score += 30;  // 100°F
  else if (tempC >= 32) score += 20;  // 90°F
  else if (tempC >= 27) score += 10;  // 80°F
  else score += 5;

  // Humidity multiplier (0-25 points)
  if (data.humidity) {
    if (data.humidity >= 80) score += 25;
    else if (data.humidity >= 60) score += 18;
    else if (data.humidity >= 40) score += 10;
    else score += 3;
  }

  // UV index (0-15 points)
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

  if (score >= 85) { level = "critical"; color = "#DC2626"; }
  else if (score >= 70) { level = "extreme"; color = "#EF4444"; }
  else if (score >= 50) { level = "high"; color = "#F59E0B"; }
  else if (score >= 30) { level = "medium"; color = "#84CC16"; }
  else { level = "low"; color = "#3B82F6"; }

  return { score, level, color };
}

/**
 * Celsius to Fahrenheit conversion
 */
export function cToF(celsius: number): number {
  return celsius * 9 / 5 + 32;
}

/**
 * Mock data for when API key is not set
 */
export function getMockHeatIntelligence(latitude: number, longitude: number) {
  const tempC = 35 + Math.random() * 10; // 35-45°C
  const tempF = cToF(tempC);
  const humidity = 20 + Math.random() * 60;
  const uvIndex = 3 + Math.random() * 9;
  const risk = computeRiskScore({ temperature_c: tempC, humidity, uv_index: uvIndex });

  return {
    temperature: { current: tempF, feels_like: tempF + 5, unit: "F" },
    risk_level: risk.level,
    risk_score: risk.score,
    recommendations: [
      "Stay hydrated — drink water every 20 minutes",
      "Seek shade between 11 AM and 3 PM",
      "Wear light-colored, loose-fitting clothing",
      "Check on vulnerable neighbors and elderly",
    ],
  };
}
