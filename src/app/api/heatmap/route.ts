import { NextRequest, NextResponse } from "next/server";

// Mock heatmap for when API times out or no key
function mockHeatmap(latitude: number, longitude: number) {
  const features = [];
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const lat = latitude + i * 0.005;
      const lng = longitude + j * 0.005;
      const tempC = 35 + Math.random() * 10;
      const offset = 0.0025;
      features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [lng - offset, lat - offset],
            [lng + offset, lat - offset],
            [lng + offset, lat + offset],
            [lng - offset, lat + offset],
            [lng - offset, lat - offset],
          ]],
        },
        properties: {
          tile_id: features.length,
          average_temperature: tempC,
          min_temperature: tempC - 3,
          max_temperature: tempC + 3,
        },
      });
    }
  }
  return { map_data: { type: "FeatureCollection", features } };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude, date } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "latitude and longitude are required" }, { status: 400 });
    }

    // Use mock heatmap if no API key
    if (!process.env.FORTYGUARD_API_KEY) {
      return NextResponse.json(mockHeatmap(latitude, longitude));
    }

    // Try the real API with a timeout
    try {
      const { createHeatmap } = await import("@/lib/fortyguard");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout

      const result = await Promise.race([
        createHeatmap({ latitude, longitude, date }),
        new Promise((_, reject) => {
          setTimeout(() => {
            controller.abort();
            reject(new Error("Timeout"));
          }, 45000);
        }),
      ]);

      clearTimeout(timeout);
      return NextResponse.json(result);
    } catch {
      // API timed out — return mock data so dashboard still works
      console.log("[Heatmap] API timeout, returning mock data");
      return NextResponse.json(mockHeatmap(latitude, longitude));
    }
  } catch (error) {
    console.error("Heatmap error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
