import { NextRequest, NextResponse } from "next/server";
import { createHeatmap, getMockHeatIntelligence } from "@/lib/fortyguard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude, date, hour } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "latitude and longitude are required" }, { status: 400 });
    }

    // Use mock heatmap if no API key
    if (!process.env.FORTYGUARD_API_KEY) {
      // Generate mock heatmap GeoJSON
      const features = [];
      for (let i = -3; i <= 3; i++) {
        for (let j = -3; j <= 3; j++) {
          const lat = latitude + i * 0.005;
          const lng = longitude + j * 0.005;
          const temp = 85 + Math.random() * 30;
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [lng, lat] },
            properties: { temperature: temp, unit: "F" },
          });
        }
      }
      return NextResponse.json({
        result: {
          geojson: { type: "FeatureCollection", features },
          metadata: { min_temp: 85, max_temp: 115, avg_temp: 100, unit: "F" },
        },
      });
    }

    // Build polygon AOI around the point (roughly 1km x 1km)
    const offset = 0.009; // ~1km
    const polygon = {
      type: "Polygon" as const,
      coordinates: [[
        [longitude - offset, latitude - offset],
        [longitude + offset, latitude - offset],
        [longitude + offset, latitude + offset],
        [longitude - offset, latitude + offset],
        [longitude - offset, latitude - offset],
      ]],
    };

    const result = await createHeatmap({
      polygon_aoi: polygon,
      date: date || new Date().toISOString().split("T")[0],
      ...(hour !== undefined && { hour }),
    });

    return NextResponse.json({ result: (result as Record<string, unknown>).result ?? result });
  } catch (error) {
    console.error("Heatmap error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
