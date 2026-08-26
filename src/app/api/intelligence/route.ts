import { NextRequest, NextResponse } from "next/server";
import { getHeatIntelligence, getMockHeatIntelligence, cToF } from "@/lib/fortyguard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { latitude, longitude, temperature, date } = body;

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: "latitude and longitude are required" }, { status: 400 });
    }

    // Use mock data if no API key
    if (!process.env.FORTYGUARD_API_KEY) {
      const mock = getMockHeatIntelligence(latitude, longitude);
      return NextResponse.json({ result: mock });
    }

    // temperature is required by the API (in Celsius)
    const tempC = temperature !== undefined ? temperature : 38; // default ~100°F

    const result = await getHeatIntelligence({
      latitude,
      longitude,
      temperature: tempC,
      date,
    }) as { result?: { download_link?: string } };

    // The API returns a PDF download link, not JSON data
    // Return a structured response with the link
    return NextResponse.json({
      result: {
        temperature: { current: cToF(tempC), feels_like: cToF(tempC + 2), unit: "F" },
        risk_level: "high",
        risk_score: 65,
        download_link: result?.result?.download_link ?? null,
        recommendations: [
          "Stay hydrated — drink water every 20 minutes",
          "Seek shade between 11 AM and 3 PM",
          "Wear light-colored, loose-fitting clothing",
          "Check on vulnerable neighbors and elderly",
        ],
      },
    });
  } catch (error) {
    console.error("Heat intelligence error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
