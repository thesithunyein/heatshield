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
  country: string;
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

// ── Preset Cities ────────────────────────────────

export const PRESET_CITIES: City[] = [
  { name: "Phoenix", country: "US", latitude: 33.4484, longitude: -112.074, timezone: "America/Phoenix" },
  { name: "Dubai", country: "AE", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai" },
  { name: "New Delhi", country: "IN", latitude: 28.6139, longitude: 77.209, timezone: "Asia/Kolkata" },
  { name: "Cairo", country: "EG", latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo" },
  { name: "Tokyo", country: "JP", latitude: 35.6762, longitude: 139.6503, timezone: "Asia/Tokyo" },
  { name: "Lagos", country: "NG", latitude: 6.5244, longitude: 3.3792, timezone: "Africa/Lagos" },
  { name: "San Francisco", country: "US", latitude: 37.7749, longitude: -122.4194, timezone: "America/Los_Angeles" },
  { name: "Abu Dhabi", country: "AE", latitude: 24.4539, longitude: 54.3773, timezone: "Asia/Dubai" },
  { name: "Riyadh", country: "SA", latitude: 24.7136, longitude: 46.6753, timezone: "Asia/Riyadh" },
  { name: "Sydney", country: "AU", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney" },
];
