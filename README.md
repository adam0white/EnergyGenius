# EnergyGenius

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Build](https://img.shields.io/badge/build-passing-success)
![License](https://img.shields.io/badge/license-MIT-blue)

**AI-powered energy plan recommendations for deregulated electricity markets**

---

## What Makes Us Different

**🎯 Comprehensive Cost Analysis** - We include Early Termination Fees (ETF) amortized over contract length. Most tools ignore switching costs.

**📊 Research-Based Scoring** - Algorithm backed by 8 academic sources & competitive analysis:

- Cost Efficiency: 44% • Flexibility: 22% • Renewable: 11% • Fees: 11%
- [Full methodology](./docs/research/energy-plan-scoring-weights.md)

**🏅 Smart Tier System** - 4 tiers with educational tooltips:

- Gold Value ($400+ savings) • Silver Value ($200-399) • Bronze Value (-$99 to $199) • ⚠️ No Value (≤-$100 loss)

**⚡ Edge AI** - Runs on Cloudflare Workers AI (Llama 3.3) at the edge, no servers to manage.

---

## The Problem

Texas electricity markets overwhelm consumers with **250+ providers and 1,000+ plans**. Complex pricing structures (base rates, TDU fees, ETFs) make comparison nearly impossible. Families overpay **$500-900/year**, businesses lose **$3,000-5,000/year** by choosing poorly.

## The Solution

**EnergyGenius automates intelligent plan selection.** Input your 12-month usage history → Get top 3 personalized recommendations with clear savings explanations. Our AI analyzes usage patterns, evaluates all plans, and calculates true costs including switching fees.

---

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers (Edge)                    │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  User Input → React SPA → /api/recommend Endpoint             │
│                              │                                │
│                              ▼                                │
│                        AI Pipeline (3 Stages)                 │
│                    1. Normalize  2. Score  3. Synthesize      │
│                              │                                │
│                              ▼                                │
│                    Workers AI (Llama 3.1 & 3.3)               │
│                              │                                │
│                              ▼                                │
│                   Top 3 Recommendations + Narratives          │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Tech Stack:** React 19 • Cloudflare Workers AI • Vite 7 • TypeScript 5.5 • shadcn/ui + Tailwind

---

## Quick Start

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server (localhost:8787)
# Click "Generate Mock Data" → "Get Recommendations"
```

**Deploy to production:**

```bash
npx wrangler login            # One-time Cloudflare auth
npm run deploy                # Deploy to edge
```

---

## Key Features

### 💰 True Cost Calculations

- ETF amortization over contract term
- Monthly service fee differences
- Complete switching cost transparency

### 🎨 8 Diverse Test Scenarios

- Large Family (19,200 kWh, $250 ETF) → Gold savings
- Apartment (4,600 kWh, $0 ETF) → Bronze savings
- Medium Business (50,000 kWh, $300 ETF) → Gold savings
- Plus 5 more covering all usage patterns

### 🤖 AI-Generated Narratives

- Explains savings in plain English
- Mentions ETF when significant
- Highlights contract flexibility
- Notes renewable energy benefits

### ⚠️ Loss Warning System

- "No Value" tier (red badge) warns about plans that cost MORE
- Prevents bad switches that damage trust

---

## Development

### Project Structure

```
src/
  worker/              # Cloudflare Worker backend
    index.ts           # API routing
    pipeline.ts        # AI orchestration
    lib/
      calculations.ts  # ETF-aware cost functions
    data/              # 152-plan catalog
  ui/                  # React application
    components/        # Intake form, results, etc.
    hooks/             # Data fetching logic
```

### Commands

```bash
npm run dev          # Dev server (UI + Worker)
npm run build        # Production bundle
npm run deploy       # Deploy to Cloudflare
npm run verify       # TypeScript + ESLint + Format check
```

### API Endpoints

- `POST /api/recommend` - Generate recommendations
- `GET /api/health` - Health check
- `GET /*` - Serve React SPA

---

## Scraper Utility

Extract fresh plan data from [Power to Choose](https://www.powertochoose.org):

```bash
npx tsx scripts/scrape/powertochoose.ts
# Output: scripts/scrape/output/raw-scrape-output.json

# Integrate into app
# 1. Validate data: cat output.json | jq length
# 2. Update src/worker/data/supplier-catalog.ts
# 3. Test: npm run build && npm run dev
```

**Refresh every 3-6 months** to keep plans current. See [SCRAPER-RUNBOOK.md](./docs/SCRAPER-RUNBOOK.md) for details.

---

## Documentation

- [Technical Specification](./docs/tech-spec.md) - Complete architecture
- [Deployment Guide](./docs/deployment-guide.md) - Production setup
- [Scoring Research](./docs/research/energy-plan-scoring-weights.md) - Algorithm methodology
- [Project Overview](./docs/project-overview.md) - High-level summary
- [Orchestration Flow](./docs/orchestration-flow.md) - Development history

---

## Production Stats

**Bundle Size:** 79KB gzipped
**AI Response Time:** 15-20 seconds
**Accessibility:** WCAG 2.1 AA compliant
**Browser Support:** Chrome 90+, Firefox 88+, Safari 14+

---

**Last Updated:** 2025-11-12
**Built With:** [BMAD Methodology](https://github.com/bmadcode/bmad)
**License:** MIT

For questions, open a GitHub issue.
