<div align="center">
  <img src="public/heatshield-logo.png" alt="HeatShield" width="120" />
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

HeatShield is a real-time urban heat intelligence platform built on FortyGuard's hyperlocal Temperature API:

- 🗺️ **Live Heat Maps** — Interactive thermal visualization at 20m² resolution
- 🛡️ **AI Risk Scoring** — Composite heat risk scores (0-100)
- 🚶 **Cool Route Planner** — AI-optimized walking paths that minimize heat exposure
- 🤖 **AI Heat Advisor** — Chat-based assistant for heat safety guidance
- 📊 **Environmental Parameters** — Heat index, apparent temperature, wet bulb, UV

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Featherless AI (Qwen2.5-7B)
- **API:** FortyGuard Temperature API®
- **Deployment:** Vercel

## Getting Started

```bash
git clone https://github.com/thesithunyein/heatshield.git
cd heatshield
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables

```env
FORTYGUARD_API_KEY=your_fortyguard_api_key
FEATHERLESS_API_KEY=your_featherless_api_key
```

---

<div align="center">
  <sub>Built for FortyGuard Hackathon'26 · Powered by FortyGuard Temperature API®</sub>
</div>
