import { NextRequest, NextResponse } from "next/server";
import { getSatelliteSegmentation } from "@/lib/fortyguard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await getSatelliteSegmentation({
      latitude: body.latitude,
      longitude: body.longitude,
      radius: body.radius,
    });
    const data = result as Record<string, unknown>;
    return NextResponse.json({ result: data.result ?? data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
