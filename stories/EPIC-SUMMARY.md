# EnergyGenius - Epic Breakdown & Story Roadmap

**Project:** EnergyGenius – Cloudflare Workers + React AI-powered energy plan recommendation demo
**Created:** 2025-11-10
**Status:** Planning Phase Complete – Ready for Development

---

## Overview

The EnergyGenius project is structured into **6 implementation epics** spanning project setup, mock data layer, AI backend, React UI, user-facing features, and deployment/polish. This document provides the roadmap and first story ready for immediate development.

---

## Epic Structure

### Epic 1: Project Setup & Infrastructure ✓
**Status:** Active | **Priority:** P0 - Critical Path

Establish the foundational Cloudflare Workers + React project scaffolding, TypeScript configuration, build tooling, and deployment infrastructure.

**Stories:**
- 1.1: Project Scaffold & Toolchain Setup → **READY FOR DEVELOPMENT**
- 1.2: shadcn/ui Component Library Setup
- 1.3: Worker Mock Data Module Structure
- 1.4: Worker Entry Point & Static Asset Serving
- 1.5: Development & Deployment Scripts

**Deliverables:** Working development environment, type-safe TypeScript setup, Vite + Wrangler integration

---

### Epic 2: Mock Data Layer ✓
**Status:** Active | **Priority:** P0 - Critical Path

Implement comprehensive mock data structures representing supplier catalog, usage scenarios, and plan details for deterministic demos without live APIs.

**Stories:**
- 2.1: Supplier Catalog Data Structure & Seeding
- 2.2: Usage Scenario Profiles
- 2.3: Mock Data Integration & Autofill
- 2.4: Mock Data Scraping Utility (Optional Documentation)

**Deliverables:** Supplier catalog JSON, usage profiles, intake autofill functionality

---

### Epic 3: AI Pipeline & Worker Backend ✓
**Status:** Active | **Priority:** P0 - Critical Path

Implement the core AI recommendation engine orchestrated through Cloudflare Workers AI. Three sequential stages (usage summary, plan scoring, narrative) execute independently, enabling future SSE enhancement.

**Stories:**
- 3.1: AI Pipeline Module & Orchestration
- 3.2: Prompt Builder Functions
- 3.3: Recommendation Handler & POST Endpoint
- 3.4: Integration into Worker Entry Point
- 3.5: Error Handling & Fallback Logic

**Deliverables:** `/api/recommend` endpoint, AI pipeline orchestration, structured error responses

---

### Epic 4: React UI Foundation ✓
**Status:** Active | **Priority:** P0 - Critical Path

Establish React application structure, component hierarchy, and styling foundation using shadcn/ui and Tailwind CSS.

**Stories:**
- 4.1: React App Structure & Entry Point
- 4.2: Tailwind CSS & Component Styling Setup
- 4.3: Layout Component & Page Structure
- 4.4: Global State Management Setup
- 4.5: Loading & Error Utilities

**Deliverables:** App layout, context providers, styling pipeline, responsive foundation

---

### Epic 5: Intake & Results UI ✓
**Status:** Active | **Priority:** P0 - Core Feature

Implement user-facing components for data intake, AI progress visualization, and recommendation presentation.

**Stories:**
- 5.1: Intake Form Component
- 5.2: Progress Timeline Component
- 5.3: Recommendation Cards Component
- 5.4: API Integration Hook
- 5.5: Form Submission & Result Flow

**Deliverables:** Intake form, progress timeline, recommendation display, end-to-end user flow

---

### Epic 6: Integration & Polish ✓
**Status:** Active | **Priority:** P1 - Completion & Quality

Complete end-to-end integration testing, responsive design validation, accessibility compliance, and deployment readiness.

**Stories:**
- 6.1: End-to-End Integration Testing
- 6.2: Responsive Design & Mobile Optimization
- 6.3: Accessibility Compliance & Testing
- 6.4: Performance Optimization
- 6.5: Deployment & Monitoring Setup
- 6.6: Documentation & Deployment Guide
- 6.7: Demo Scenario Validation & Polishing

**Deliverables:** QA-tested application, deployed to Cloudflare Workers, documentation

---

## First Story Ready for Development

### Story 1.1: Project Scaffold & Toolchain Setup

**File:** `stories/1.1-project-scaffold.md`

**Status:** Ready for Development ✓

**Scope:**
- Initialize Cloudflare Workers + React project via npm scaffolder
- Configure TypeScript with dual configs (Worker + React)
- Set up Vite bundler with React plugin
- Configure wrangler.toml with Assets and AI bindings
- Create npm scripts for dev/build/deploy
- Establish project directory structure
- Create Worker entry point and React app skeleton
- Verify local development environment works at http://localhost:8787

**Acceptance Criteria:** 18 major checkpoints including:
- Project initialization without errors
- React + TypeScript dependencies installed
- Build scripts functional (dev, build, deploy)
- Local dev server launches and serves React app
- Worker fetch handler routes `/api/recommend` placeholder
- All TypeScript configs compile without errors

**Estimated Effort:** Medium (~4-6 hours)

**Key Files Created:**
- `wrangler.toml` – Wrangler configuration
- `vite.config.ts` – Vite bundler config
- `tsconfig.json`, `tsconfig.worker.json`, `tsconfig.ui.json` – TypeScript configs
- `src/worker/index.ts` – Worker entry point
- `src/ui/main.tsx`, `src/ui/app/App.tsx`, `src/ui/index.html` – React scaffold
- `package.json` – Dependencies and scripts
- `README.md` – Project documentation

**Technical Approach:**
1. Use `npm create cloudflare@latest` official scaffolder
2. Add React and Vite separately for explicit control
3. Configure dual TypeScript configs (no DOM libs in Worker, DOM in UI)
4. Set environment variables in wrangler.toml for AI models and feature flags
5. Verify end-to-end: npm run dev → http://localhost:8787 loads React app

**Handoff Notes:**
- All scaffolding is type-safe with TypeScript strict mode
- Development environment validated and ready for next features
- Wrangler credentials required for deploy testing
- Next story (1.2) builds shadcn/ui on this foundation

---

## Development Sequence Recommendation

**Phase 1: Foundation (Epics 1-2)**
1. Story 1.1: Project Scaffold → **START HERE**
2. Story 1.2-1.5: Complete infrastructure
3. Story 2.1-2.4: Mock data layer

**Phase 2: Backend (Epic 3)**
4. Story 3.1-3.5: AI pipeline and recommendation handler

**Phase 3: Frontend (Epics 4-5)**
5. Story 4.1-4.5: UI foundation and layout
6. Story 5.1-5.5: Intake form, timeline, results

**Phase 4: Testing & Deployment (Epic 6)**
7. Story 6.1-6.7: QA, performance, deployment

---

## Success Metrics

- All stories completed with acceptance criteria checked
- Application deployed to Cloudflare Workers
- End-to-end flow validated: intake → AI pipeline → recommendations
- Responsive design tested on mobile/tablet/desktop
- Accessibility baseline (WCAG 2.1) validated
- Demo scenarios execute successfully

---

## Quick Links

- **Tech Spec:** `docs/tech-spec.md`
- **PRD:** `PRD_Arbor_AI_Energy_Plan_Recommendation_Agent.md`
- **First Story:** `stories/1.1-project-scaffold.md`

---

**Scrum Master:** Bob (sm)
**Created:** 2025-11-10
**Next Review:** After Story 1.1 completion
