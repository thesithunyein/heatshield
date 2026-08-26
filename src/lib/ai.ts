/**
 * AI Heat Advisor — answers questions about urban heat using FortyGuard data.
 * Uses Featherless AI (OpenAI-compatible) for inference.
 */

const FEATHERLESS_API_KEY = process.env.FEATHERLESS_API_KEY ?? "";
const FEATHERLESS_BASE = "https://api.featherless.ai/v1";
const MODEL = "Qwen/Qwen2.5-7B-Instruct";

const SYSTEM_PROMPT = `You are HeatShield Advisor, an AI expert on urban heat, climate resilience, and public health.
You answer questions about temperature data, heat risks, cooling strategies, and urban planning.
Always reference the FortyGuard Temperature API data when available.
Keep answers concise, actionable, and focused on saving lives.
Use imperial (°F) and metric (°C) when giving temperatures.
Format responses with markdown for readability.
Never make up data — if you don't know, say so.`;

export async function getAdvisorResponse(
  userMessage: string,
  context?: {
    city?: string;
    temperature?: number;
    riskLevel?: string;
    humidity?: number;
  }
): Promise<string> {
  if (!FEATHERLESS_API_KEY) {
    return getLocalResponse(userMessage, context);
  }

  try {
    const contextMsg = context
      ? `\n\nCurrent context — City: ${context.city ?? "Unknown"}, Temp: ${context.temperature ?? "N/A"}°F, Risk: ${context.riskLevel ?? "N/A"}, Humidity: ${context.humidity ?? "N/A"}%`
      : "";

    const res = await fetch(`${FEATHERLESS_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FEATHERLESS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextMsg },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Featherless API error:", res.status, errText);
      return getLocalResponse(userMessage, context);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "No response generated.";
  } catch (error) {
    console.error("Featherless API error:", error);
    return getLocalResponse(userMessage, context);
  }
}

function getLocalResponse(
  message: string,
  context?: { city?: string; temperature?: number; riskLevel?: string }
): string {
  const lower = message.toLowerCase();
  const city = context?.city ?? "your area";
  const temp = context?.temperature;

  if (lower.includes("safe") || lower.includes("walk") || lower.includes("go outside")) {
    return `## Safety Assessment for ${city}\n\n` +
      (temp ? `Current temperature is **${Math.round(temp)}°F** (${Math.round(((temp - 32) * 5) / 9)}°C).\n\n` : "") +
      `### Recommendations:\n` +
      `- **Best hours:** Before 10 AM or after 6 PM\n` +
      `- **Hydration:** Drink 8oz water every 20 minutes outdoors\n` +
      `- **Duration limit:** Stay outside max 30 min in current conditions\n` +
      `- **Watch for:** Dizziness, nausea, excessive sweating → seek shade immediately\n\n` +
      `*Data powered by FortyGuard Temperature API*`;
  }

  if (lower.includes("route") || lower.includes("cool") || lower.includes("path")) {
    return `## Cool Route Tips for ${city}\n\n` +
      `To find the coolest walking path:\n\n` +
      `1. **Stick to shaded streets** — tree canopy reduces surface temp by 10-15°F\n` +
      `2. **Avoid asphalt** — it absorbs 95% of solar radiation\n` +
      `3. **Walk near water** — rivers, lakes, fountains provide cooling\n` +
      `4. **Use building shadows** — east-side of streets in morning, west-side in afternoon\n` +
      `5. **Check our Cool Route Planner** for AI-optimized cool paths\n`;
  }

  if (lower.includes("heat stroke") || lower.includes("emergency") || lower.includes("help")) {
    return `## HEAT EMERGENCY — ACT NOW\n\n` +
      `### Heat Stroke Signs:\n` +
      `- Body temp >103°F (39.4°C)\n` +
      `- Hot, red, dry skin (no sweating)\n` +
      `- Rapid pulse, confusion, unconsciousness\n\n` +
      `### Immediate Actions:\n` +
      `1. **Call emergency services** immediately\n` +
      `2. Move person to cool/shaded area\n` +
      `3. Cool with wet towels, ice packs on neck/armpits\n` +
      `4. Do NOT give fluids if unconscious\n` +
      `5. Fan continuously while cooling\n\n` +
      `Heat stroke is life-threatening — every minute counts.`;
  }

  return `## HeatShield Advisor\n\n` +
    `I can help with:\n\n` +
    `- **"Is it safe to walk outside right now?"** — safety assessment\n` +
    `- **"Find me a cool route"** — optimal walking paths\n` +
    `- **"What's the heat risk?"** — risk analysis\n` +
    `- **"Heat stroke first aid"** — emergency guidance\n` +
    `- **"How to protect my home?"** — cooling strategies\n` +
    (temp ? `\nCurrent reading for ${city}: **${Math.round(temp)}°F**` : "") +
    `\n\nAsk me anything about urban heat and staying safe.`;
}
