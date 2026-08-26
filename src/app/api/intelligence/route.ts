import { NextRequest, NextResponse } from "next/server";
import { getHeatIntelligence, getMockHeatIntelligence } from "@/lib/fortyguard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude, date, categories } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Use mock data if no API key
    if (!process.env.FORTYGUARD_API_KEY) {
      const mock = getMockHeatIntelligence(latitude, longitude);
      return NextResponse.json(mock);
    }

    const result = await getHeatIntelligence({
      latitude,
      longitude,
      date,
      categories,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Heat intelligence error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
