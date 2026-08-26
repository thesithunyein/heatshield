// ── FortyGuard Temperature API Types ──────────────

export interface Polygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface HeatmapRequest {
  polygon_aoi: Polygon;
  date: string; // YYYY-MM-DD
  hour?: number; // 0-23, optional for range
  end_hour?: number; // for range queries
}

export interface HeatmapResponse {
  activity_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: {
    geojson: {
      type: "FeatureCollection";
      features: unknown[];
    };
    metadata: {
      min_temp: number;
      max_temp: number;
      avg_temp: number;
      unit: string;
    };
  };
}

export interface HeatIntelligenceRequest {
  latitude: number;
  longitude: number;
  date?: string;
  categories?: Array<
    "geographic" | "environmental" | "urban" | "events" | "temporal"
  >;
}

export interface HeatIntelligenceResponse {
  activity_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: {
    location: {
      latitude: number;
      longitude: number;
      city?: string;
      country?: string;
    };
    temperature: {
      current: number;
      feels_like: number;
      unit: string;
    };
    risk_level: "low" | "medium" | "high" | "extreme" | "critical";
    risk_score: number; // 0-100
    analysis: {
      geographic?: Record<string, unknown>;
      environmental?: Record<string, unknown>;
      urban?: Record<string, unknown>;
      events?: Record<string, unknown>;
      temporal?: Record<string, unknown>;
    };
    recommendations: string[];
  };
}

export interface EnvParamsRequest {
  latitude: number;
  longitude: number;
  date?: string;
}

export interface EnvParamsResponse {
  activity_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: {
    heat_index: number;
    apparent_temperature: number;
    wet_bulb_temperature: number;
    dew_point: number;
    humidity: number;
    wind_speed: number;
    uv_index: number;
    unit: string;
  };
}

export type ApiTaskStatus = "pending" | "processing" | "completed" | "failed";

export interface StatusResponse {
  activity_id: string;
  status: ApiTaskStatus;
  result?: unknown;
  error?: string;
}

// ── App Types ────────────────────────────────────

export interface City {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface HeatZone {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  riskLevel: "low" | "medium" | "high" | "extreme" | "critical";
  riskScore: number;
  heatIndex: number;
  lastUpdated: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  temperature: number;
  riskLevel: string;
}

export interface CoolRoute {
  points: RoutePoint[];
  avgTemperature: number;
  maxTemperature: number;
  savingsVsDirect: number;
  distance: number;
  duration: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

// ── Preset US Cities (FortyGuard covers US only) ──

export const PRESET_CITIES: City[] = [
  { name: "Phoenix", state: "AZ", latitude: 33.4484, longitude: -112.074, timezone: "America/Phoenix" },
  { name: "Las Vegas", state: "NV", latitude: 36.1699, longitude: -115.1398, timezone: "America/Los_Angeles" },
  { name: "Houston", state: "TX", latitude: 29.7604, longitude: -95.3698, timezone: "America/Chicago" },
  { name: "Miami", state: "FL", latitude: 25.7617, longitude: -80.1918, timezone: "America/New_York" },
  { name: "Los Angeles", state: "CA", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles" },
  { name: "Dallas", state: "TX", latitude: 32.7767, longitude: -96.797, timezone: "America/Chicago" },
  { name: "San Antonio", state: "TX", latitude: 29.4241, longitude: -98.4936, timezone: "America/Chicago" },
  { name: "Sacramento", state: "CA", latitude: 38.5816, longitude: -121.4944, timezone: "America/Los_Angeles" },
  { name: "Atlanta", state: "GA", latitude: 33.749, longitude: -84.388, timezone: "America/New_York" },
  { name: "Phoenix East", state: "AZ", latitude: 33.4942, longitude: -111.9261, timezone: "America/Phoenix" },
];
