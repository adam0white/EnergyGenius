# Epic 1: Project Setup & Infrastructure

**Status:** ACTIVE
**Priority:** P0 - Critical Path
**Owner:** Dev Team

## Overview

Establish the foundational Cloudflare Workers + React project scaffolding, TypeScript configuration, build tooling, and deployment infrastructure. This epic prepares the codebase for feature development.

## Scope

- Cloudflare Workers project initialization via `npm create cloudflare@latest`
- TypeScript configuration (dual configs for Worker runtime and React DOM)
- Vite bundler setup with React plugin
- Wrangler.toml configuration with Assets binding and Workers AI setup
- Package.json scripts for concurrent dev/build/deploy
- Project directory structure (src/worker, src/ui, dist, etc.)
- Basic error handling and logging scaffolds
- Development environment validation

## Stories

### 1.1 Project Scaffold & Toolchain Setup

**Status:** Ready for Development
**Acceptance Criteria:**

- [ ] `npm create cloudflare@latest energy-genius` with base Worker template
- [ ] React, TypeScript, and build tools installed
- [ ] wrangler.toml configured with `[assets]` binding and `[[ai]]` binding
- [ ] TypeScript configs split: tsconfig.worker.json, tsconfig.ui.json
- [ ] vite.config.ts created and validated
- [ ] package.json scripts working (dev, build, deploy)
- [ ] Local dev server starts: `npm run dev` → http://localhost:8787
- [ ] SPA serves static assets via Worker fetch handler
- [ ] Verify git status clean after initial setup

### 1.2 shadcn/ui Component Library Setup

**Status:** Pending
**Acceptance Criteria:**

- [ ] shadcn/ui initialized with Vite + Tailwind config
- [ ] Base components installed: button, card, input, textarea, progress, alert, badge, accordion, tabs
- [ ] Component exports available in `src/ui/components/ui/`
- [ ] Tailwind CSS bundled and working in dev/prod
- [ ] Sample component renders in test page to verify styling pipeline

### 1.3 Worker Mock Data Module Structure

**Status:** Pending
**Acceptance Criteria:**

- [ ] `src/worker/data/supplier-catalog.ts` created with mock supplier data structure
- [ ] `src/worker/data/usage-scenarios.ts` created with 3-5 sample usage profiles
- [ ] TypeScript interfaces defined for Supplier, UsageData, and Plan types
- [ ] Mock data imports and exports without runtime errors
- [ ] Data validation logic in place (types, required fields)

### 1.4 Worker Entry Point & Static Asset Serving

**Status:** Ready for Development
**Acceptance Criteria:**

- [ ] `src/worker/index.ts` created with fetch handler
- [ ] Routes established: `/api/recommend` POST, all others fallback to `env.ASSETS.fetch()`
- [ ] Error handling middleware in place
- [ ] Worker logs structured (timestamps, request IDs)
- [ ] Basic health check endpoint responds

### 1.5 Development & Deployment Scripts

**Status:** Ready for Development
**Acceptance Criteria:**

- [ ] `npm run dev` launches concurrent Vite + Wrangler
- [ ] `npm run build` produces optimized dist/ directory
- [ ] `npm run deploy` uses Wrangler to publish
- [ ] Environment variables (AI_MODEL_FAST, ENABLE_SSE) read correctly
- [ ] Deploy script verifies Worker URL is reachable post-deployment

## Testing Strategy

- Manual: verify `http://localhost:8787` loads and serves static assets
- Check browser DevTools for bundled JS/CSS
- Verify `wrangler dev` terminal shows request logs
- Test build output in dist/ directory

## Blockers / Risks

- Cloudflare account and Wrangler credentials required for deploy
- Node/npm version compatibility with latest Cloudflare scaffolder

## Notes

Reference: Tech Spec § "Development Setup" (steps 1-8) and § "Implementation Stack"
