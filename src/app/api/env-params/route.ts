import { NextRequest, NextResponse } from "next/server";
import { getEnvironmentalParams } from "@/lib/fortyguard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude, date } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "latitude and longitude are required" },
        { status: 400 }
      );
    }

    if (!process.env.FORTYGUARD_API_KEY) {
      // Return mock environmental params
      return NextResponse.json({
        status: "completed",
        result: {
          heat_index: 95 + Math.random() * 20,
          apparent_temperature: 90 + Math.random() * 25,
          wet_bulb_temperature: 70 + Math.random() * 15,
          dew_point: 55 + Math.random() * 20,
          humidity: 20 + Math.random() * 60,
          wind_speed: Math.random() * 20,
          uv_index: 3 + Math.random() * 9,
          unit: "F",
        },
      });
    }

    const result = await getEnvironmentalParams({ latitude, longitude, date });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Env params error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
