# EnergyGenius

AI-powered energy plan recommendation engine built on Cloudflare Workers and Workers AI.

## Overview

EnergyGenius helps electricity subscribers in deregulated markets find the best energy plans by analyzing usage patterns, preferences, and supplier catalogs using AI-powered recommendations.

## Documentation

- [Technical Specification](./docs/tech-spec.md)
- [Project Overview](./docs/project-overview.md)

## Development

### Prerequisites

- Node.js >= 18.x
- Cloudflare account (for deployment)

### Setup

```bash
npm install
```

### Scripts

- `npm run dev` - Start development server (both UI and Worker)
- `npm run dev:ui` - Start Vite build watch mode
- `npm run dev:worker` - Start Wrangler development server
- `npm run build` - Build production bundle
- `npm run deploy` - Build and deploy to Cloudflare Workers

### Local Development

1. Run `npm run dev` to start the development server
2. Visit `http://localhost:8787` to see the application
3. Make changes to files in `src/ui` or `src/worker` - they will automatically reload

## Project Structure

```
src/
  worker/          # Cloudflare Worker code
    index.ts       # Worker entry point
    pipeline.ts    # AI pipeline orchestration
    data/          # Mock data
  ui/              # React application
    main.tsx       # React entry point
    app/           # Application components
    components/    # UI components
```

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Frontend**: React + Vite
- **AI**: Cloudflare Workers AI
- **Language**: TypeScript
- **Build Tool**: Vite
