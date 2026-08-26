import { NextRequest, NextResponse } from "next/server";
import { getAdvisorResponse } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const response = await getAdvisorResponse(message, context);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Advisor error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
