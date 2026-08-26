<div align="center">
  <img src="public/heatshield-logo.png" alt="HeatShield" width="120" />
  <h1>HeatShield</h1>
  <p><strong>AI-Powered Urban Heat Defense Platform</strong></p>
  <p><em>See heat. Stop heat. Save cities.</em></p>
  <br />
  <a href="https://github.com/thesithunyein/heatshield/actions">
    <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Passing" />
  </a>
  <a href="https://github.com/thesithunyein/heatshield/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  </a>
  <a href="https://github.com/thesithunyein/heatshield">
    <img src="https://img.shields.io/badge/typescript-5.x-3178c6" alt="TypeScript 5.x" />
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/next.js-15-black" alt="Next.js 15" />
  </a>
  <a href="https://heatshield.sithunyein.com">
    <img src="https://img.shields.io/badge/status-live-brightgreen" alt="Live" />
  </a>
  <a href="https://www.fortyguard.com/hackathon26">
    <img src="https://img.shields.io/badge/hackathon-2026-orange" alt="Hackathon 2026" />
  </a>
  <br />
  <a href="https://heatshield.sithunyein.com">Live Demo</a> ·
  <a href="https://www.fortyguard.com/hackathon26">FortyGuard Hackathon'26</a> ·
  <a href="https://docs-api.fortyguard.com">API Docs</a> ·
  <a href="#getting-started">Getting Started</a>
</div>

---

## The Problem

Urban heat is the **deadliest weather hazard** in the United States, killing more people than hurricanes, tornadoes, and floods combined. By 2050, **3.5 billion people** will live in extreme heat zones. Yet cities have no real-time, hyperlocal temperature intelligence to act on.

**Current tools fail because:**

- Weather stations are too sparse — one sensor per 10+ km² misses street-level heat islands
- Urban planners fly blind — no 20m² resolution data to identify hotspots before people die
- Pedestrians have no guidance — no route optimization to avoid peak heat exposure
- Emergency response is reactive — no predictive risk scoring to pre-deploy resources

**HeatShield solves this.** We provide real-time, hyperlocal temperature intelligence at 20m² resolution — the most granular urban heat data available — powered by FortyGuard's NVIDIA-recognized Temperature API.

---

## Architecture

```mermaid
flowchart TB
    User["User"] --> App["HeatShield App"]
    App --> Dashboard["Heat Dashboard"]
    App --> Routes["Cool Route Planner"]
    App --> Advisor["AI Heat Advisor"]

    Dashboard --> API["API Routes"]
    Routes --> API
    Advisor --> AI_Route["AI API Route"]

    API --> FG_Intel["FortyGuard Heat Intelligence"]
    API --> FG_Env["FortyGuard Env Parameters"]
    AI_Route --> Featherless["Featherless AI"]

    FG_Intel --> FortyGuard["FortyGuard Temperature API"]
    FG_Env --> FortyGuard

    subgraph "Data Flow"
        FortyGuard -->|"20m² resolution 2m above ground"| FG_Intel
        FortyGuard -->|"Heat index, UV, humidity, wind"| FG_Env
        Featherless -->|"Qwen2.5-7B heat safety guidance"| AI_Route
    end

    style App fill:#111,stroke:#333,color:#fff
    style FortyGuard fill:#1a1a1a,stroke:#444,color:#fff
    style Featherless fill:#1a1a1a,stroke:#444,color:#fff
```

### How It Works

```mermaid
sequenceDiagram
    participant U as User
    participant H as HeatShield
    participant F as FortyGuard API
    participant AI as Featherless AI

    U->>H: Select city / Ask question
    H->>F: POST /v1/heat-intelligence
    F-->>H: Temperature, risk level, recommendations
    H->>F: POST /v1/env-params
    F-->>H: Heat index, UV, humidity, wind
    H->>AI: User question + context
    AI-->>H: Heat safety guidance
    H-->>U: Real-time dashboard / Chat response
```

---

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| Live Heat Maps | Interactive Leaflet map with thermal visualization at 20m² resolution | Live |
| Risk Scoring | AI-driven composite risk score (0-100) from temperature, humidity, UV, wind | Live |
| Cool Routes | Route planner with shade analysis and heat savings calculations | Live |
| AI Heat Advisor | Chat-based assistant powered by Featherless AI (Qwen2.5-7B) | Live |
| Environmental Parameters | Heat index, apparent temperature, wet bulb temperature, UV index | Live |
| Real-time Data | Live FortyGuard API integration with async polling | Live |

---

## Project Structure

```
heatshield/
├── public/
│   ├── heatshield-logo.png          # App logo
│   └── heatshield-logo.svg          # SVG version
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout (dark mode, favicon)
│   │   ├── page.tsx                 # Landing page (video hero, FAQ, footer)
│   │   ├── globals.css              # Design system (heat gradients, glass effects)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Main heat dashboard + Leaflet map
│   │   ├── advisor/
│   │   │   └── page.tsx            # AI Heat Advisor chat interface
│   │   ├── routes/
│   │   │   └── page.tsx            # Cool Route Planner
│   │   └── api/
│   │       ├── intelligence/
│   │       │   └── route.ts        # FortyGuard /v1/heat-intelligence proxy
│   │       ├── env-params/
│   │       │   └── route.ts        # FortyGuard /v1/env-params proxy
│   │       └── advisor/
│   │           └── route.ts        # Featherless AI chat proxy
│   ├── components/
│   │   ├── Navbar.tsx               # Responsive nav with mobile hamburger menu
│   │   ├── HeatMap.tsx              # Leaflet map with thermal markers
│   │   ├── TemperatureGauge.tsx     # Animated temperature display
│   │   ├── RiskCard.tsx             # City risk score card
│   │   └── CitySelector.tsx         # City search dropdown
│   └── lib/
│       ├── fortyguard.ts            # FortyGuard API client (async submit/poll)
│       ├── ai.ts                    # Featherless AI client + local fallback
│       ├── types.ts                 # TypeScript types + preset cities
│       └── utils.ts                 # Formatting, colors, helpers
├── .env.example                     # Environment variable template
├── .gitignore                       # Git ignore rules
├── LICENSE                          # MIT License
├── SECURITY.md                      # Security policy
├── CONTRIBUTING.md                  # Contribution guidelines
├── README.md                        # This file
├── package.json                     # Dependencies
└── tsconfig.json                    # TypeScript config
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | Server-side rendering, API routes |
| Language | TypeScript | Type safety, developer experience |
| Styling | Tailwind CSS | Utility-first design system |
| Map | Leaflet + OpenStreetMap | Interactive heat map visualization |
| AI | Featherless AI (Qwen2.5-7B) | Heat safety chat advisor |
| API | FortyGuard Temperature API | Real-time urban temperature data |
| Deployment | Vercel | Edge functions, global CDN |
| Icons | Lucide React | Minimal geometric icons |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/intelligence` | POST | Get heat intelligence for coordinates |
| `/api/env-params` | POST | Get environmental parameters |
| `/api/advisor` | POST | Chat with AI heat advisor |

### Example Request

```bash
curl -X POST https://heatshield.sithunyein.com/api/intelligence \
  -H "Content-Type: application/json" \
  -d '{"latitude": 33.45, "longitude": -112.07}'
```

### Example Response

```json
{
  "result": {
    "temperature": {
      "current": 112,
      "feels_like": 118,
      "unit": "°F"
    },
    "risk_level": "EXTREME",
    "risk_score": 92,
    "recommendations": [
      "Avoid outdoor activities between 10 AM - 4 PM",
      "Stay hydrated — drink water every 15 minutes",
      "Seek air-conditioned environments"
    ]
  }
}
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** or **yarn**
- **FortyGuard API Key** — [Get one here](https://www.fortyguard.com/hackathon26)
- **Featherless AI Key** — [Get one here](https://featherless.ai)

### Installation

```bash
# Clone the repository
git clone https://github.com/thesithunyein/heatshield.git
cd heatshield

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Required — FortyGuard Temperature API
FORTYGUARD_API_KEY=your_fortyguard_api_key

# Required — Featherless AI for Heat Advisor
FEATHERLESS_API_KEY=your_featherless_api_key
```

### Development

```bash
npm run dev
# → http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Deployment

```bash
# Deploy to Vercel
vercel --prod
```

---

## Hackathon'26

HeatShield was built for **FortyGuard Hackathon 2026** — Track 01: Resilient Cities & Infrastructure.

| Judging Criterion | How HeatShield Addresses It |
|-------------------|----------------------------|
| Impact (40%) | Saves lives through real-time heat risk intelligence |
| Technical Execution (35%) | Full-stack TypeScript, async API polling, Leaflet maps, AI integration |
| Innovation (15%) | Hyperlocal 20m² resolution + AI-powered route optimization |
| Communication (10%) | Clean UI, clear data visualization, intuitive UX |

---

## Security

### API Key Protection

- All FortyGuard API calls are made server-side through Next.js API routes
- API keys are stored in environment variables, never exposed to the client
- Rate limiting is applied to prevent abuse

### Reporting Vulnerabilities

If you discover a security vulnerability, please **do not** open a public GitHub issue. Instead, email:

**sithunyein.mailto@gmail.com**

We will respond within 48 hours and work with you to address the issue.

See [SECURITY.md](SECURITY.md) for full details.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Code of Conduct

We are committed to making participation in HeatShield a harassment-free experience for everyone. See [CONTRIBUTING.md](CONTRIBUTING.md) for our standards and guidelines.

---

## Acknowledgments

- [FortyGuard](https://www.fortyguard.com) — Temperature API and Hackathon'26
- [Featherless AI](https://featherless.ai) — AI inference for Heat Advisor
- [Leaflet](https://leafletjs.com) — Interactive map visualization
- [Next.js](https://nextjs.org) — React framework
- [Vercel](https://vercel.com) — Deployment platform

---

<div align="center">
  <img src="public/heatshield-logo.png" alt="HeatShield" width="48" />
  <p><strong>Built for FortyGuard Hackathon'26</strong></p>
  <p><em>See heat. Stop heat. Save cities.</em></p>
  <br />
  <a href="https://heatshield.sithunyein.com">Live Demo</a> ·
  <a href="https://github.com/thesithunyein/heatshield">GitHub</a> ·
  <a href="https://docs-api.fortyguard.com">API Docs</a>
</div>
