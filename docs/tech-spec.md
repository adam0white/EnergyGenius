# EnergyGenius - Technical Specification

**Author:** Adam  
**Date:** 2025-11-10  
**Project Level:** 1  
**Change Type:** Level 1 greenfield feature build: new demo application showcasing multi-step AI plan recommendations delivered through Cloudflare Workers and Workers AI.  
**Development Context:** Greenfield Workers project combining React SPA, shadcn UI components, and Workers AI orchestration with static mock datasets.

---

## Context

### Available Documents

- Documents located:
  - `PRD_Arbor_AI_Energy_Plan_Recommendation_Agent.md` – describes the AI agent that ingests 12 months of usage data, current plan, preferences, and supplier catalog to generate top 3 personalized energy plan recommendations with savings explanations and basic risk awareness.
- Additional context documents: none yet (no brief/research/doc-project outputs in `docs/`).
- Project type: Greenfield (no existing codebase detected).
- Tech stack: To be determined (no setup files present).
- Existing code patterns: None yet; we’ll establish them from scratch.

### Project Stack

- Cloudflare Worker project scaffolded via `npm create cloudflare@latest` (bundles Vite, TypeScript, and Wrangler).
- React SPA hosted directly from the Worker build.
- shadcn UI components layered on Tailwind for rapid, accessible UI composition.
- Workers AI for multi-stage reasoning and text generation.
- Wrangler CLI for local development and deployments.

### Existing Codebase Structure

Greenfield build — no existing repository structure yet. Frontend and Cloudflare Worker will be scaffolded together under a single Worker project (monorepo layout to be defined during implementation).

---

## The Change

### Problem Statement

Electricity subscribers in deregulated markets can choose among dozens of competing plans, but continually monitoring rate changes and contract nuances takes too much time. Without a smart assistant they miss savings opportunities and feel overwhelmed toggling between plan comparison sites and spreadsheets. We need a demo-ready product experience that proves Arbor can automate this decision-making journey end-to-end.

### Proposed Solution

Build a Cloudflare Workers + Workers AI powered demo application with a UI-first experience. The interface guides the user through a short intake form (or one-click randomized mock data), streams each AI reasoning step visibly, and surfaces a curated plan shortlist with savings and trade-off explanations. The backend logic runs entirely on Workers, calling Workers AI models multiple times (data interpretation, plan scoring, explanation synthesis) and merging the outputs into a single presentable view. Static JSON files provide the supplier catalog and sample usage data for the MVP; developers get freedom to extend or swap data sources later.

### Scope

**In Scope:**

- Responsive web UI with intake form, AI pipeline progress visualization, and results view.
- Mock data layer using bundled static JSON (usage samples + supplier catalog seeded from initial scrape).
- Cloudflare Workers orchestration that chains multiple Workers AI calls for data prep, recommendation scoring, and narrative generation.
- Observability hooks in UI for each AI step including timestamps, status, and partial outputs.
- Deployment-ready configuration for Workers environment (routes, bindings, secrets placeholders).
- Basic logging/metrics within Workers for demo introspection.

**Out of Scope:**

- Live integrations with utility APIs or real-time plan scraping.
- PDF ingestion, document uploads, or OCR.
- Production data persistence, authentication, or user accounts.
- Non-Workers clouds, multi-region failover, or advanced DevOps automation.
- Post-recommendation workflows (contract switching, billing, CRM sync).
- Automated supplier catalog refresh tooling (leave for growth goals).

---

## Implementation Details

### Source Tree Changes

- `wrangler.toml` — CREATE — Configure Worker with modern `[assets]` binding for Vite build output, Workers AI binding, and environment variables for model selection. Use `compatibility_date = "2025-01-01"`.
- `package.json` — CREATE — Initialize project with scripts for concurrent dev (Vite watch + Wrangler dev), build, deploy, and shadcn component generation.
- `tsconfig.json` — CREATE — Root TypeScript config with project references: `tsconfig.worker.json` (Workers runtime with `@cloudflare/workers-types`) and `tsconfig.ui.json` (React with DOM libs).
- `src/worker/index.ts` — CREATE — Export `fetch` handler that routes `/api/recommend` (POST) to recommendation handler and serves static assets via `env.ASSETS.fetch(request)` for all other paths.
- `src/worker/pipeline.ts` — CREATE — Orchestrate sequential Workers AI invocations (usage summarization, plan scoring, narrative synthesis) with structured prompts and fallback logic.
- `src/worker/prompts/*.ts` — CREATE — TypeScript modules exporting prompt builder functions with type-safe interpolation for each AI stage (usage-summary, plan-scoring, narrative).
- `src/worker/data/supplier-catalog.ts` — CREATE — TypeScript module exporting validated mock supplier catalog (optionally use Zod for runtime validation).
- `src/worker/data/usage-scenarios.ts` — CREATE — TypeScript module exporting sample 12-month usage profiles for randomized intake autofill.
- `src/ui/main.tsx` — CREATE — React entry point mounting `App`, setting up app providers, and wiring the pipeline result context.
- `src/ui/app/App.tsx` — CREATE — High-level layout coordinating intake form, AI progress timeline, and results presentation.
- `src/ui/components/ui/**/*` — CREATE — shadcn component exports (button, card, sheet, progress, alert, badge, tabs) generated via CLI and customized for Workers-compatible styling.
- `src/ui/components/intake/IntakeForm.tsx` — CREATE — Multi-section form with manual input and “Generate Mock Data” action hooking into mock datasets.
- `src/ui/components/pipeline/ProgressTimeline.tsx` — CREATE — Visual timeline showing AI stage progression. Initially uses optimistic UI updates; SSE support added as enhancement.
- `src/ui/components/results/RecommendationDeck.tsx` — CREATE — Cards summarizing top plans, savings projections, and rationale text.
- `src/ui/hooks/useRecommendation.ts` — CREATE — Custom hook managing recommendation API calls. Phase 1: standard fetch with optimistic stage updates. Phase 2: SSE support for real-time progress.
- `src/ui/lib/prompt-previews.ts` — CREATE — Utilities for displaying prompt excerpts in developer mode.
- `scripts/scrape/powertochoose.ts` — CREATE — One-off Node script to pre-seed supplier catalog data, documented as optional developer utility.

### Technical Approach

- Bootstrap with `npm create cloudflare@latest` selecting base Worker template, then add React + Vite separately for explicit control over build configuration.
- Serve SPA using modern Static Assets: configure `[assets]` directory in `wrangler.toml` pointing to Vite build output. Worker `fetch` handler returns `env.ASSETS.fetch(request)` for non-API routes.
- Implement `/api/recommend` endpoint with **progressive enhancement strategy**:
  - **Phase 1 (MVP baseline):** Standard POST endpoint that runs full pipeline and returns complete results. UI shows optimistic progress indicators (staged animations).
  - **Phase 2 (SSE enhancement):** Add `Accept: text/event-stream` detection to stream real-time progress events during pipeline execution.
- Structure AI pipeline as composable async functions: three sequential stages (usage summary, plan scoring, narrative generation) with optional progress callbacks for SSE support.
- Use shadcn/ui with Tailwind: initialize with `npx shadcn@latest init`, add required components. CSS bundling works identically in Workers Static Assets—no special adaptation needed.
- Manage mock datasets as TypeScript modules under `src/worker/data/` with typed exports. Consider Zod validation if runtime type safety is desired.
- Implement recommendation hook with feature detection: uses standard fetch by default; can upgrade to EventSource if SSE endpoint is enabled.
- Use Wrangler environment variables for AI model selection (`AI_MODEL_FAST`, `AI_MODEL_ACCURATE`) and feature flags (`ENABLE_SSE`). Target 15-20s total pipeline time (note: PRD <2s target is infeasible with current Workers AI latency).

### Implementation Pattern: Progressive Enhancement

**Phase 1 Example (Standard POST):**

```typescript
// src/worker/handlers/recommend.ts
export async function handleRecommend(request: Request, env: Env) {
  const intake = await request.json();
  
  // Run complete pipeline
  const summary = await runUsageSummary(env, intake);
  const scores = await runPlanScoring(env, summary, intake);
  const narrative = await runNarrative(env, scores);
  
  return Response.json({
    recommendations: buildRecommendations(scores, narrative),
    metadata: { stages: ['complete', 'complete', 'complete'] }
  });
}
```

```typescript
// src/ui/hooks/useRecommendation.ts (Phase 1)
export function useRecommendation() {
  const [stages, setStages] = useState(['pending', 'pending', 'pending']);
  const [result, setResult] = useState(null);
  
  const submit = async (intake) => {
    // Optimistic UI: simulate progress
    setStages(['running', 'pending', 'pending']);
    setTimeout(() => setStages(['complete', 'running', 'pending']), 6000);
    setTimeout(() => setStages(['complete', 'complete', 'running']), 12000);
    
    // Actual API call
    const res = await fetch('/api/recommend', {
      method: 'POST',
      body: JSON.stringify(intake)
    });
    const data = await res.json();
    
    setStages(['complete', 'complete', 'complete']);
    setResult(data);
  };
  
  return { stages, result, submit };
}
```

**Phase 2 Example (SSE Enhancement):**

```typescript
// src/worker/handlers/recommend.ts (enhanced)
export async function handleRecommend(request: Request, env: Env) {
  const intake = await request.json();
  const acceptHeader = request.headers.get('Accept');
  const enableSSE = env.ENABLE_SSE === 'true' && acceptHeader?.includes('text/event-stream');
  
  if (!enableSSE) {
    // Fall back to Phase 1 behavior
    return handleStandardRequest(intake, env);
  }
  
  // SSE mode
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  
  const sendEvent = async (event: string, data: any) => {
    await writer.write(encoder.encode(
      `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    ));
  };
  
  // Run pipeline with progress callbacks
  (async () => {
    try {
      await sendEvent('stage', { name: 'usage_summary', status: 'running' });
      const summary = await runUsageSummary(env, intake);
      await sendEvent('stage', { name: 'usage_summary', status: 'complete' });
      
      await sendEvent('stage', { name: 'plan_scoring', status: 'running' });
      const scores = await runPlanScoring(env, summary, intake);
      await sendEvent('stage', { name: 'plan_scoring', status: 'complete' });
      
      await sendEvent('stage', { name: 'narrative', status: 'running' });
      const narrative = await runNarrative(env, scores);
      await sendEvent('stage', { name: 'narrative', status: 'complete' });
      
      await sendEvent('complete', buildRecommendations(scores, narrative));
      await writer.close();
    } catch (error) {
      await sendEvent('error', { message: error.message });
      await writer.close();
    }
  })();
  
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

```typescript
// src/ui/hooks/useRecommendation.ts (Phase 2)
export function useRecommendation() {
  const [stages, setStages] = useState([...]);
  const [result, setResult] = useState(null);
  
  const submit = async (intake) => {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'  // Signal we want streaming
      },
      body: JSON.stringify(intake)
    });
    
    // Check if server sent streaming response
    const contentType = response.headers.get('Content-Type');
    if (contentType?.includes('text/event-stream')) {
      // Parse SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const events = parseSSE(chunk);  // Parse "event: X\ndata: {...}\n\n"
        
        events.forEach(({ event, data }) => {
          if (event === 'stage') updateStageState(data);
          if (event === 'complete') setResult(data);
        });
      }
    } else {
      // Standard JSON response fallback
      const data = await response.json();
      setResult(data);
      setStages(['complete', 'complete', 'complete']);
    }
  };
  
  return { stages, result, submit };
}
```

### Existing Patterns to Follow

Greenfield build — establish conventions up front:
- Co-locate React components and styling using shadcn conventions under `src/ui/components`.
- Use functional React components with hooks; keep state localized per section and share through top-level context if needed.
- Leverage TypeScript throughout (Worker logic and UI) with explicit interfaces for AI stage payloads.
- Use Tailwind utility classes combined with shadcn slots for consistent styling.
- Build Phase 1 (standard fetch) first, validate it works end-to-end, then add Phase 2 (SSE) as enhancement.

### Integration Points

- Workers AI platform: sequential calls to text-generation models for usage summarization, plan scoring rationale, and final narrative synthesis via `env.AI.run()` within the Worker.
- Static mock datasets: `supplier-catalog.json` and `usage-scenarios.json` loaded at runtime for intake autofill and plan scoring inputs.
- Frontend SPA: React components invoke Worker pipeline functions through the same request lifecycle (form submission handled by Worker, response hydrates UI state).
- Optional developer utility (`scripts/scrape/powertochoose.ts`): generates updated supplier catalog snapshots for future iterations, excluded from runtime path.

---

## Development Context

### Relevant Existing Code

None yet — brand-new Cloudflare Worker project.

### Dependencies

**Framework/Libraries:**

- Cloudflare Workers runtime (fetch handler + platform bindings)
- Cloudflare Workers AI tooling for model invocation
- React (SPA rendered from the Worker)
- TypeScript (shared config for Worker and UI)
- Tailwind CSS + shadcn/ui component library
- Wrangler CLI for local development and deployment
- Vite bundler generated by the Cloudflare template

**Internal Modules:**

None initially; all modules will be introduced inside this repo.

### Configuration Changes

**wrangler.toml:**
```toml
name = "energy-genius"
main = "src/worker/index.ts"
compatibility_date = "2025-01-01"

[assets]
directory = "./dist"  # Vite build output

[[ai]]
binding = "AI"

[vars]
AI_MODEL_FAST = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
AI_MODEL_ACCURATE = "@cf/meta/llama-3.1-8b-instruct"
ENABLE_MOCK_DATA = "true"
ENABLE_SSE = "false"  # Set to "true" to enable streaming progress
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "npm run dev:ui & npm run dev:worker",
    "dev:ui": "vite build --watch",
    "dev:worker": "wrangler dev",
    "build": "vite build",
    "deploy": "npm run build && wrangler deploy"
  }
}
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
});
```

### Existing Conventions (Brownfield)

Greenfield project — establishing new conventions per modern best practices.

### Test Framework & Standards

- Manual QA only for MVP; no automated unit or integration tests.
- Document manual QA scenarios and expectations in `docs/testing-notes.md`.

---

## Implementation Stack

- Cloudflare Worker project scaffolded via `npm create cloudflare@latest`.
- React SPA hosted directly from the Worker build.
- shadcn UI components layered on Tailwind for component scaffolding.
- Workers AI for multi-stage reasoning and text generation.
- Wrangler CLI for local development and deployments.

---

## Technical Details

- Intake workflow: React form collects manual input; "Generate Mock Data" button pre-fills form from embedded mock data module.
- Submission flow: 
  - **Phase 1 (Default):** Form submits to `POST /api/recommend`, Worker runs complete pipeline (~15-20s), returns JSON with final recommendations. UI shows animated progress stages based on typical timing.
  - **Phase 2 (SSE):** If `ENABLE_SSE=true` and client sends `Accept: text/event-stream` header, Worker returns streaming response with progress events. Client uses `fetch` + ReadableStream to parse SSE events in real-time.
- Stage orchestration (both modes):
  1. **Usage Summary** (~5-7s): Analyzes 12-month data, identifies patterns and baseline costs
  2. **Plan Scoring** (~5-8s): Scores catalog plans against user priorities, ranks by fit
  3. **Narrative** (~5-7s): Generates plain-language explanations for top 3 plans
- API Response formats:
  - **Standard (Phase 1):** `{ recommendations: [...], metadata: { stages: [...], totalTime: 18500 } }`
  - **SSE (Phase 2):** Stream of events: `{ event: 'stage', data: {...} }` → `{ event: 'complete', data: {...} }`
- Error handling: Try/catch per stage with basic retry logic (1 attempt, 2s backoff). Standard mode returns 500 with error message. SSE mode sends error event. UI shows retry button in both cases.
- UI visualization: `ProgressTimeline` component maps pipeline stages to statuses; once pipeline resolves, `RecommendationDeck` renders top three plans with badges for savings, contract length, renewable mix, and narrative callouts.
- Data architecture: mock catalog and usage scenarios imported statically at Worker initialization, enabling deterministic demo behavior without network fetches.
- Styling/accessibility: shadcn components ensure WCAG-compliant patterns; focus states and keyboard interactivity validated during manual QA.
- Randomization: each mock intake run selects from curated scenario pool (household, small business, high summer usage) to demonstrate varied AI outputs.

---

## Development Setup

1. `npm create cloudflare@latest energy-genius` → select base Worker template.
2. `cd energy-genius && npm install react react-dom vite @vitejs/plugin-react -D`
3. `npm install -D @cloudflare/workers-types`
4. Create `vite.config.ts` and `tsconfig.json` files per configuration above.
5. Initialize shadcn: `npx shadcn@latest init` (Vite + Tailwind).
6. Add components: `npx shadcn@latest add button card input textarea progress alert badge accordion tabs`.
7. Create `src/worker/data/` TypeScript modules with mock catalog and scenarios.
8. Update `wrangler.toml` with `[assets]` and `[[ai]]` bindings (see Configuration section).
9. Run `npm run dev` → visit `http://localhost:8787` to verify SPA loads.

---

## Implementation Guide

### Setup Steps

**Phase 1: MVP with Optimistic UI**
1. Initialize project with modern Workers + Vite setup per Development Setup steps.
2. Implement AI pipeline module: 3 sequential async functions (summary, scoring, narrative).
3. Build `/api/recommend` POST endpoint: runs full pipeline, returns complete recommendations.
4. Create React intake form with manual input and embedded mock data.
5. Build `useRecommendation` hook using standard fetch with loading state.
6. Create ProgressTimeline component with optimistic staged animations (auto-advances based on typical timing).
7. Build RecommendationDeck to display final results.
8. Add basic error handling (try/catch per stage, return error response, show retry button).
9. Manual QA with multiple scenarios; verify end-to-end flow works.

**Phase 2: Add SSE Enhancement (Optional)**
10. Add SSE support to `/api/recommend`: detect `Accept: text/event-stream`, stream progress if enabled.
11. Update AI pipeline to accept optional progress callback, emit events during execution.
12. Enhance `useRecommendation` hook: feature-detect SSE support, use EventSource if available.
13. Update ProgressTimeline to consume real SSE events when available, fall back to optimistic UI.
14. Add `ENABLE_SSE` environment variable for gradual rollout.
15. QA both modes (standard + SSE) to ensure fallback works seamlessly.

### Implementation Steps

Outlined above in setup steps.

### Testing Strategy

- Rely on manual exploratory testing in development and staging environments.
- Validate each mock scenario (residential, business, seasonal) through the full intake → AI pipeline → results flow.
- During development, use console logging in Worker and browser DevTools to trace pipeline outputs.
- Confirm accessibility basics manually: keyboard navigation, focus states, screen-reader labels on key components.
- No automated unit or integration tests planned for MVP; document this expectation for future iterations.

### Acceptance Criteria

**Phase 1 (MVP Baseline):**
1. Intake form supports manual entry and one-click mock data (embedded in bundle).
2. AI pipeline completes in ~15-20s and returns three recommended plans with explanations.
3. UI shows staged progress animation (optimistic updates) and displays final recommendations without page reload.
4. App is responsive across desktop and mobile, with accessible controls (keyboard navigation, ARIA labels).
5. Error states show user-friendly messages with retry button.
6. Deployment via `npm run deploy` succeeds; app loads and functions from Cloudflare Workers URL.

**Phase 2 (SSE Enhancement):**
7. When `ENABLE_SSE=true`, UI connects via EventSource and receives real-time progress events.
8. ProgressTimeline updates immediately as each stage completes (no simulated timing).
9. Graceful degradation: if SSE fails or is disabled, falls back to Phase 1 behavior automatically.
10. Performance: Total pipeline <20s in both modes (note: PRD <2s target is infeasible; progress feedback improves perceived performance).

---

## Developer Resources

### File Paths Reference

- `wrangler.toml`
- `package.json`
- `tsconfig.json`
- `src/worker/index.ts`
- `src/worker/pipeline.ts`
- `src/worker/prompts/index.ts`
- `src/worker/prompts/usage-summary.ts`
- `src/worker/prompts/plan-scoring.ts`
- `src/worker/prompts/narrative.ts`
- `src/worker/data/supplier-catalog.ts`
- `src/worker/data/usage-scenarios.ts`
- `src/worker/handlers/recommend.ts` (recommendation logic)
- `src/worker/handlers/mock-data.ts` (optional mock endpoints)
- `vite.config.ts`
- `tsconfig.worker.json`
- `tsconfig.ui.json`
- `src/ui/main.tsx`
- `src/ui/app/App.tsx`
- `src/ui/components/intake/IntakeForm.tsx`
- `src/ui/components/pipeline/ProgressTimeline.tsx`
- `src/ui/components/results/RecommendationDeck.tsx`
- `src/ui/components/ui/*`
- `src/ui/hooks/useRecommendation.ts`
- `src/ui/lib/prompt-previews.ts`
- `scripts/scrape/powertochoose.ts`

### Key Code Locations

- Worker entry & routing: `src/worker/index.ts`
- Recommendation handler: `src/worker/handlers/recommend.ts` (standard + optional SSE)
- AI pipeline orchestration: `src/worker/pipeline.ts` (core logic, callback support)
- Prompt builders: `src/worker/prompts/*.ts`
- Mock datasets: `src/worker/data/*.ts`
- Intake form and mock data button: `src/ui/components/intake/IntakeForm.tsx`
- Pipeline visualization: `src/ui/components/pipeline/ProgressTimeline.tsx`
- Recommendation rendering: `src/ui/components/results/RecommendationDeck.tsx`
- Client hook binding results to UI: `src/ui/hooks/useRecommendation.ts`

### Testing Locations

- Manual QA instructions (no automated test directories planned).
- Developer scratchpad area: `docs/testing-notes.md` (optional log for manual test scenarios).
- Console logs within Worker and browser DevTools act as primary debugging touchpoints.

### Documentation to Update

- Update `README.md` with setup steps, deployment flow, and manual QA checklist.
- Add `docs/pipeline-overview.md` summarizing AI stages for future collaborators.
- Optionally maintain `docs/mock-data-playbook.md` to record how supplier catalog snapshots were prepared.

---

## UX/UI Considerations

- Emphasize timeline visualization: display each AI stage in a vertical stepper with badges (Queued → Running → Complete), showing partial outputs in expandable cards.
- Ensure intake form is approachable: group fields into sections with contextual helper text; include a prominent “Generate Mock Data” button.
- Highlight savings insight: use cards with bold typography for projected savings, include contract term, renewable %, and switching notes.
- Provide clear feedback: loading states integrate subtle shimmers; success states animate recommendation cards; errors show inline alerts with retry action.
- Responsive layout: stack timeline and results vertically on mobile; maintain side-by-side view on desktop.
- Maintain accessibility: ensure keyboard navigation through stepper, form inputs, and cards; provide ARIA labels for timeline updates.

---

## Testing Approach

- Manual QA focus: run through each mock scenario, verifying timeline stages update sequentially and recommendation cards populate.
- Monitor Worker logs during QA sessions to inspect AI outputs and adjust prompts.
- Check responsive behavior manually across browser dev tools breakpoints.
- Perform accessibility spot checks (keyboard-only navigation, screen reader verification of timeline and form labels).
- No automated tests; document gaps for future test coverage.

---

## Deployment Strategy

### Deployment Steps

1. Complete manual QA in local `wrangler dev` environment with multiple mock scenarios.
2. Run `npm run build` to produce optimized SPA assets.
3. Deploy using Wrangler: `npm run deploy`.
4. Verify live Worker URL loads UI, mock data button functions, and AI pipeline returns results.
5. Share deployment link with stakeholders for demo.

### Rollback Plan

- If deployment misbehaves, redeploy prior stable version using Wrangler (specify previous build via git checkout and redeploy).
- Alternatively, revert commit locally (`git revert <hash>`) and redeploy.
- If urgent, disable Worker route via Cloudflare dashboard while preparing fix.

### Monitoring

- Use Worker logs (`wrangler tail`) during demos to watch AI pipeline outputs and latency.
- Integrate lightweight logging within pipeline (stage start/end timestamps) to diagnose issues quickly.
- Track Workers AI usage via Cloudflare dashboard metrics.
- Note recurring errors and adjust prompts or mock data accordingly.

---

