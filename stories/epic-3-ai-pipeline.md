# Epic 3: AI Pipeline & Worker Backend

**Status:** ACTIVE
**Priority:** P0 - Critical Path
**Owner:** Dev Team

## Overview

Implement the core AI recommendation engine orchestrated through Cloudflare Workers AI. Three sequential stages (usage summary, plan scoring, narrative) execute independently, enabling future SSE enhancement.

## Scope

- Workers AI pipeline module with three composable stages
- Type-safe prompt builder functions for each AI stage
- Recommendation handler (`/api/recommend` POST endpoint)
- Error handling with fallback logic
- Phase 1 baseline (standard fetch, complete pipeline response)
- Observability hooks for future SSE enhancement
- Basic logging and timing instrumentation

## Stories

### 3.1 AI Pipeline Module & Orchestration
**Status:** Pending
**Acceptance Criteria:**
- [ ] `src/worker/pipeline.ts` exports orchestration function
- [ ] Three async functions: `runUsageSummary()`, `runPlanScoring()`, `runNarrative()`
- [ ] Sequential execution with typed payloads between stages
- [ ] Optional progress callback parameter for SSE support
- [ ] Error handling with try/catch per stage, structured error format
- [ ] Timeout handling (30s max per stage)
- [ ] Logging with timestamps for each stage start/end
- [ ] TypeScript interfaces for StageInput, StageOutput, PipelineResult

### 3.2 Prompt Builder Functions
**Status:** Pending
**Acceptance Criteria:**
- [ ] `src/worker/prompts/usage-summary.ts` exports prompt builder function
- [ ] `src/worker/prompts/plan-scoring.ts` exports prompt builder function
- [ ] `src/worker/prompts/narrative.ts` exports prompt builder function
- [ ] Prompts interpolate user data safely (no injection risks)
- [ ] Prompt structures optimized for Llama model reasoning
- [ ] Each prompt under 2000 tokens (respects API limits)
- [ ] Prompts include clear output format expectations (JSON, structured text)

### 3.3 Recommendation Handler & POST Endpoint
**Status:** Pending
**Acceptance Criteria:**
- [ ] `src/worker/handlers/recommend.ts` exports handler function
- [ ] Validates incoming JSON (usage data, current plan, preferences)
- [ ] Calls pipeline orchestration
- [ ] Returns JSON response with recommendations array
- [ ] Response includes metadata (stage statuses, timing, total duration)
- [ ] 400 on invalid input, 500 on pipeline failure
- [ ] Handler integrated into `src/worker/index.ts` route

### 3.4 Integration into Worker Entry Point
**Status:** Pending
**Acceptance Criteria:**
- [ ] `src/worker/index.ts` routes POST /api/recommend to handler
- [ ] All other routes fallback to static asset serving
- [ ] Error middleware wraps handler
- [ ] CORS headers set for local dev
- [ ] Request logging per API call
- [ ] Graceful 404 for undefined routes

### 3.5 Error Handling & Fallback Logic
**Status:** Pending
**Acceptance Criteria:**
- [ ] Try/catch blocks per pipeline stage
- [ ] Structured error responses with user-friendly messages
- [ ] Fallback plan recommendations if AI fails
- [ ] Retry logic (1 attempt, optional exponential backoff)
- [ ] Error logging includes context (stage, input hash, duration)
- [ ] User sees retry button in UI on error state

## Testing Strategy

- Manual: submit intake form, verify pipeline executes sequentially
- Monitor Wrangler logs for stage progression and timings
- Test with invalid inputs (missing fields, malformed JSON)
- Verify error response format and status codes

## Blockers / Risks

- Workers AI model availability and rate limits
- Prompt quality impacts recommendation output; may need iteration
- Latency target (15-20s) depends on model response times

## Notes

Reference: Tech Spec § "Implementation Details" (pipeline.ts, prompts/*, handlers/recommend.ts)
Reference: Tech Spec § "Implementation Pattern: Progressive Enhancement" (Phase 1 architecture)
Reference: PRD § "Recommendation Logic" (top 3 plans, savings calculation, explanations)
