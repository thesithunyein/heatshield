import { NextRequest, NextResponse } from "next/server";
import { createHeatmap, cToF } from "@/lib/fortyguard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude, date } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "latitude and longitude are required" }, { status: 400 });
    }

    // Use mock heatmap if no API key
    if (!process.env.FORTYGUARD_API_KEY) {
      const features = [];
      for (let i = -3; i <= 3; i++) {
        for (let j = -3; j <= 3; j++) {
          const lat = latitude + i * 0.005;
          const lng = longitude + j * 0.005;
          const tempC = 35 + Math.random() * 10;
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [lng, lat] },
            properties: { average_temperature: tempC, min_temperature: tempC - 3, max_temperature: tempC + 3 },
          });
        }
      }
      return NextResponse.json({
        map_data: { type: "FeatureCollection", features },
      });
    }

    const result = await createHeatmap({
      latitude,
      longitude,
      date,
    }) as { map_data?: { type: string; features: unknown[] } };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Heatmap error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
