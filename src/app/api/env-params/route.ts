import { NextRequest, NextResponse } from "next/server";
import { getEnvironmentalParams, cToF } from "@/lib/fortyguard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude, temperature, date } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "latitude and longitude are required" }, { status: 400 });
    }

    if (!process.env.FORTYGUARD_API_KEY) {
      // Return mock environmental params
      return NextResponse.json({
        result: {
          metadata: { timezone: "GMT-7" },
          locations: [{
            parameters: {
              heat_index_celsius: [40, 39, 41, 40, 40, 41, 41, 40, 40, 39, 38, 38, 37, 37, 37, 37, 37, 37, 38, 39, 38, 39, 39, 39],
              apparent_temperature_celsius: [36, 34, 35, 33, 32, 31, 32, 31, 33, 35, 38, 41, 43, 45, 45, 45, 43, 42, 42, 43, 40, 40, 39, 38],
              relative_humidity_percent: [22, 20, 25, 24, 23, 25, 26, 23, 22, 20, 16, 14, 12, 11, 11, 11, 12, 13, 13, 18, 14, 19, 19, 18],
              wind_speed_kmh: [5, 4, 6, 5, 5, 4, 3, 5, 6, 7, 8, 9, 10, 10, 9, 8, 7, 6, 5, 4, 5, 6, 5, 5],
              air_quality_aqi: [55, 54, 54, 54, 54, 54, 54, 54, 54, 55, 55, 56, 56, 56, 74, 95, 116, 133, 141, 140, 130, 117, 102, 86],
              precipitation_mm: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            },
            solar_irradiance: { clear_sky: { ghi: 515, dni: 629, dhi: 82 } },
          }],
        },
      });
    }

    // temperature is required (Celsius)
    const tempC = temperature ?? 38;

    const result = await getEnvironmentalParams({
      latitude,
      longitude,
      temperature: tempC,
      date,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Env params error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
