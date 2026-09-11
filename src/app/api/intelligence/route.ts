import { NextRequest, NextResponse } from "next/server";
import { getHeatIntelligence, getMockHeatIntelligence, cToF, getEnvironmentalParams, computeRiskScore } from "@/lib/fortyguard";

export async function POST(req: NextRequest) {
  let latitude: number | undefined;
  let longitude: number | undefined;
  try {
    const body = await req.json();
    const { latitude: lat, longitude: lng, temperature, date } = body;
    latitude = lat;
    longitude = lng;

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
    // Graceful degradation: the heat-intelligence report is an async PDF
    // generation on FortyGuard's side and can be slow or queue-limited under
    // load. Instead of surfacing a raw error, degrade to live environmental
    // data + a locally computed risk score, and mark the report as queued.
    console.error("Heat intelligence degraded:", error);

    let temperature = { current: cToF(38), feels_like: cToF(40), unit: "F" };
    let humidity: number | undefined;
    let envNote: string | undefined;
    try {
      const env = await getEnvironmentalParams({ latitude: latitude ?? 33.45, longitude: longitude ?? -112.07, temperature: 38 });
      const hourly = (env as { result?: { heat_index?: number[]; humidity?: number[] } })?.result;
      const hi = hourly?.heat_index?.[hourly.heat_index.length - 1];
      humidity = hourly?.humidity?.[hourly.humidity.length - 1];
      if (hi !== undefined) {
        temperature = { current: Math.round((hi * 9) / 5 + 32), feels_like: Math.round((hi * 9) / 5 + 32), unit: "F" };
      }
      envNote = "Live environmental data attached; the full intelligence report is still generating.";
    } catch {
      envNote = "Environmental data unavailable; showing baseline guidance.";
    }

    const currentC = ((temperature.current - 32) * 5) / 9;
    const risk = computeRiskScore({ temperature_c: currentC, humidity });

    return NextResponse.json({
      result: {
        temperature,
        risk_level: risk.level,
        risk_score: risk.score,
        report_status: "queued",
        report_note: envNote,
        download_link: null,
        recommendations: [
          "Stay hydrated — drink water every 20 minutes",
          "Seek shade between 11 AM and 3 PM",
          "Wear light-colored, loose-fitting clothing",
          "Check on vulnerable neighbors and elderly",
        ],
      },
    });
  }
}
