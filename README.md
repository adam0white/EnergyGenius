# EnergyGenius

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Build](https://img.shields.io/badge/build-passing-success)
![Bundle Size](https://img.shields.io/badge/bundle%20size-79.5KB-success)
![License](https://img.shields.io/badge/license-MIT-blue)

**AI-powered energy plan recommendations for deregulated electricity markets**

---

## Quick Reference

| What | Details |
|------|---------|
| **Tech Stack** | React 19 + Cloudflare Workers AI (Llama 3.3) |
| **AI Pipeline** | 3-stage analysis, 15-20s total |
| **Bundle Size** | 79KB (gzipped) |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Status** | Production Ready (v1.0.0) |

---

## Problem & Solution

### The Problem

In deregulated energy markets like Texas, consumers face **hundreds of competing electricity plans** with complex pricing structures. Plan rates change constantly, making it nearly impossible to identify the optimal choice. Manually comparing plans requires hours of spreadsheet work.

The cost of choosing poorly: families can **overpay by $500-900 per year**, while small businesses may lose **$3,000-5,000 annually**. Most consumers stick with their current provider because comparison shopping feels too complicated.

### The Solution

**EnergyGenius automates intelligent plan selection using AI.** Users input their 12-month usage history and preferences. Our AI pipeline analyzes usage patterns, evaluates available plans, and delivers the **top 3 personalized recommendations** with clear explanations of savings and trade-offs.

Built on **Cloudflare Workers + Workers AI**, the entire recommendation engine runs at the edge with no server infrastructure to manage.

---

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers (Edge)                    │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  User Input                                                   │
│      │                                                        │
│      ▼                                                        │
│  ┌─────────────┐         HTTP POST                            │
│  │ React SPA   │──────────────────────┐                       │
│  │ (Static)    │                      │                       │
│  └─────────────┘                      │                       │
│                                       ▼                       │
│                            ┌──────────────────────┐           │
│                            │ /api/recommend       │           │
│                            │ Worker Endpoint      │           │
│                            └──────────┬───────────┘           │
│                                       │                       │
│                                       ▼                       │
│                            ┌──────────────────────┐           │
│                            │  AI Pipeline         │           │
│                            │  (3 Stages)          │           │
│                            │                      │           │
│                            │  1. Normalize Data   │           │
│                            │  2. Score Plans      │           │
│                            │  3. Synthesize Recs  │           │
│                            └──────────┬───────────┘           │
│                                       │                       │
│                                       ▼                       │
│                            ┌──────────────────────┐           │
│                            │  Workers AI          │           │
│                            │  (Llama 3.1 & 3.3)   │           │
│                            └──────────────────────┘           │
│                                       │                       │
│                                       ▼                       │
│                            Top 3 Recommendations              │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User submits usage data via React UI
2. `/api/recommend` endpoint receives request
3. 3-stage AI pipeline processes data (15-20s)
4. Workers AI models (Llama 3.3/3.1) analyze and score plans
5. Top 3 recommendations returned with explanations

---

## Prerequisites

- **Node.js**: v18.x or higher
- **npm**: v8.x or higher
- **Cloudflare Account**: Required for deployment (free tier works)
- **Wrangler CLI**: Auto-installed with `npm install`

---

## Quick Start

```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server
# Open http://localhost:8787
# Click "Generate Mock Data" → "Get Recommendations"
```

**For deployment:**
```bash
npx wrangler login            # One-time Cloudflare auth
npm run deploy                # Deploy to production
```

---

## Using the Scraper: Step-by-Step

The scraper extracts real energy plan data from [Power to Choose](https://www.powertochoose.org) (Texas marketplace). This is a **developer utility for periodic data refresh**, not a runtime dependency.

### Step 1: Run the Scraper

```bash
npx tsx scripts/scrape/powertochoose.ts
```

**Expected Output:** `scripts/scrape/output/raw-scrape-output.json` with 20-100 plans

### Step 2: Validate the Data

```bash
cat scripts/scrape/output/raw-scrape-output.json | jq length
# Should show 20-100 plans
```

Manually review a few plans:
- Check pricing looks realistic (8-15¢/kWh typical)
- Verify renewable percentages (0-100%)
- Confirm required fields present (name, supplier, rate)

### Step 3: Integrate Scraped Data

1. Open `src/worker/data/supplier-catalog.ts`
2. Replace existing plans array with validated scraped data
3. Ensure TypeScript types match

### Step 4: Test Integration

```bash
npm run build                  # Verify TypeScript compilation
npm run dev                    # Test locally
# Generate recommendations and verify new plans appear
```

### Step 5: Refresh Schedule

Re-run scraper every **3-6 months** to keep plan data current. Always manually review before integration.

**For detailed scraper documentation:** See [scripts/scrape/README.md](./scripts/scrape/README.md)

---

## Development

### Project Structure

```
src/
  worker/              # Cloudflare Worker backend
    index.ts           # API routing (/api/recommend)
    pipeline.ts        # AI pipeline orchestration
    data/              # Energy plan catalog
  ui/                  # React application
    main.tsx           # React entry point
    app/App.tsx        # Main app component
    components/        # UI components (intake, results, etc.)
```

### Key Commands

```bash
npm run dev          # Start dev server (UI + Worker)
npm run build        # Build production bundle
npm run deploy       # Deploy to Cloudflare Workers
npm test             # Run tests
npm run type-check   # TypeScript validation
npm run lint         # ESLint
```

### Technology Stack

- **React 19.2** - UI framework
- **Cloudflare Workers AI** - Edge AI (Llama 3.3/3.1)
- **Vite 7.2** - Build tool
- **shadcn/ui + Tailwind** - Component library
- **TypeScript 5.5** - Type safety

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/recommend` | POST | Generate plan recommendations |
| `/api/health` | GET | Health check |
| `/*` | GET | Serve React SPA |

---

## Documentation

**Core Docs:**
- [Technical Specification](./docs/tech-spec.md) - Complete architecture
- [Deployment Guide](./docs/deployment-guide.md) - Production setup

**Testing & Quality:**
- [E2E Testing Guide](./docs/e2e-testing-guide.md) - Manual test checklist
- [Accessibility Audit](./docs/accessibility-audit.md) - WCAG 2.1 AA compliance
- [Performance Report](./docs/performance-optimization-report.md) - Bundle analysis

**Data & Scraper:**
- [Scraper Documentation](./scripts/scrape/README.md) - Power to Choose scraper

---

## Additional Info

**Last Updated:** 2025-11-11
**Built With:** [BMAD Methodology](https://github.com/bmadcode/bmad)
**Developed By:** Claude Code (Anthropic AI)
**License:** MIT

For questions or issues, open a GitHub issue.
