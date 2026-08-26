<div align="center">
  <img src="public/heatshield-logo.svg" alt="HeatShield" width="120" />
  <h1>HeatShield</h1>
  <p><strong>AI-Powered Urban Heat Defense Platform</strong></p>
  <p><em>See heat. Stop heat. Save cities.</em></p>
  <br />
  <a href="https://www.fortyguard.com/hackathon26">🏆 FortyGuard Hackathon'26</a> · 
  <a href="https://heatshield.sithunyein.com">🌐 Live Demo</a> ·
  <a href="https://docs-api.fortyguard.com">📡 API Docs</a>
</div>

---

## What It Does

HeatShield is a real-time urban heat intelligence platform that helps cities, residents, and emergency services navigate extreme heat events. Built on FortyGuard's hyperlocal Temperature API, it provides:

- 🗺️ **Live Heat Maps** — Interactive thermal visualization at 20m² resolution
- 🛡️ **AI Risk Scoring** — Composite heat risk scores (0-100) combining temperature, humidity, UV, and wind data
- 🚶 **Cool Route Planner** — AI-optimized walking paths that minimize heat exposure
- 🤖 **AI Heat Advisor** — Chat-based assistant for heat safety guidance
- 📊 **Environmental Parameters** — Heat index, apparent temperature, wet bulb, dew point, and more
- 🏙️ **Multi-City Monitoring** — Track heat risk across multiple cities simultaneously

## How It Works

```
┌─────────────────────────────────────────────┐
│           HeatShield Dashboard              │
│  (Next.js 15 · TypeScript · Tailwind CSS)  │
├─────────────────────────────────────────────┤
│         API Proxy Routes (Server)           │
│  /api/intelligence · /api/env-params        │
│  /api/advisor · /api/heatmap                │
├─────────────────────────────────────────────┤
│      FortyGuard Temperature API Client      │
│  Async submit → poll → retrieve pattern     │
│  6 endpoints · Heat risk scoring engine     │
├─────────────────────────────────────────────┤
│    FortyGuard Temperature API® (External)   │
│  Hyperlocal data · 2m above ground         │
│  20m² resolution · Real-time feed           │
└─────────────────────────────────────────────┘
```

## API Endpoints Used

| Endpoint | Path | Description |
|----------|------|-------------|
| Create Heatmap | `POST /v1/heatmap` | GeoJSON thermal maps for polygon AOIs |
| Heat Intelligence | `POST /v1/heat-intelligence` | Multi-dimensional intelligence reports |
| Environmental Parameters | `POST /v1/env_params` | Heat index, wet bulb, UV, humidity |
| Satellite Segmentation | `POST /v1/satellite` | Satellite imagery analysis |
| Street View Segmentation | `POST /v1/streetview` | Street-level imagery analysis |
| Status Poll | `GET /v1/status/{id}` | Async task status checking |

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **AI:** [Groq](https://groq.com/) (LLaMA 3.1 for heat advisory)
- **API:** [FortyGuard Temperature API®](https://docs-api.fortyguard.com/)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

```bash
# Clone
git clone https://github.com/thesithunyein/heatshield.git
cd heatshield

# Install
npm install

# Set up environment
cp .env.example .env.local
# Add your FortyGuard API key to .env.local

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
FORTYGUARD_API_KEY=your_fortyguard_api_key
GROQ_API_KEY=your_groq_key            # Optional — enables AI advisor
```

> Without API keys, the app runs with realistic mock data for demos.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with animated heat display |
| `/dashboard` | Main heat intelligence dashboard |
| `/routes` | Cool Route Planner |
| `/advisor` | AI Heat Advisor chat |

## Design

Inspired by [Eloqwnt](https://www.eloqwnt.com/)'s dark, minimal B2B design language:
- Deep dark theme with heat-gradient accents
- Glassmorphism cards with subtle glow effects
- Animated temperature displays
- Smooth micro-interactions

## Challenge Track

**Track 01 — Resilient Cities & Infrastructure**
> "Design cooler, smarter cities using hyperlocal temperature intelligence."

Built for the [FortyGuard Hackathon'26](https://www.fortyguard.com/hackathon26).

---

<div align="center">
  <sub>Built with ❤️ for climate resilience · Powered by FortyGuard Temperature API®</sub>
</div>
