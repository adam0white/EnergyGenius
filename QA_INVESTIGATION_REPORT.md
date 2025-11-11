# QA Investigation Report: Critical Production Issue - 30-Second Hang and Failure

**Investigation Date:** 2025-11-11
**Issue Severity:** CRITICAL - User-facing timeout causing failed recommendations
**Status:** ROOT CAUSE IDENTIFIED + FIX PREPARED

---

## Executive Summary

A critical production issue causes the UI to display all pipeline stages as completing successfully, then hang for ~30 seconds before showing a failure message. Root cause analysis reveals **a timeout race condition at the frontend level** combined with **aggressive 30-second individual stage timeouts** on the backend.

The PLAN-SCORING stage takes 29.78 seconds (just under the 30s limit), and when combined with natural network latency + retry logic, the request exceeds the frontend's REQUEST_TIMEOUT of 30 seconds, causing the frontend to timeout before receiving the response.

---

## Phase 1: Deep Code Analysis Results

### 1. Backend Pipeline Analysis (`src/worker/pipeline.ts`)

**Key Findings:**

- **Lines 249, 279, 314**: Individual stage timeouts set to **30,000ms (30 seconds)**
- **Each stage is wrapped in `withTimeout()`** that properly clears timeouts on completion
- **Timeout implementation is CORRECT** (lines 373-399) - uses Promise.race and clears timeouts

```typescript
// Line 249: Usage Summary wrapped with 30s timeout
usageSummary = await withRetry(
  () => withTimeout(runUsageSummary(env, input), 30000, 'usage-summary'),
  { maxAttempts: 2, backoffMs: 100, stageName: 'usage-summary' }
);

// Line 279: Plan Scoring wrapped with 30s timeout
planScoring = await withRetry(
  () => withTimeout(runPlanScoring(env, usageSummary, input), 30000, 'plan-scoring'),
  { maxAttempts: 2, backoffMs: 100, stageName: 'plan-scoring' }
);

// Line 314: Narrative wrapped with 30s timeout
narrative = await withRetry(
  () => withTimeout(runNarrative(env, planScoring, usageSummary!), 30000, 'narrative'),
  { maxAttempts: 2, backoffMs: 100, stageName: 'narrative' }
);
```

**Problem Identified:** The 30-second timeout is too aggressive for PLAN-SCORING. The logs show it takes 29.78 seconds, leaving almost zero buffer for retry logic backoff (100ms between retries) or network latency.

**Additional Issue:** The `withRetry()` wrapper (lines 249, 279, 314) means if Stage 2 times out at 30 seconds, it triggers a retry attempt that takes another 30+ seconds.

---

### 2. Retry Logic Analysis (`src/worker/lib/retry.ts`)

**Key Findings:**

```typescript
// Line 61-62: Default retry configuration
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 2, backoffMs = 100, stageName = 'unknown' } = options;
```

**Problem Identified:** With `maxAttempts = 2`:
- If Stage 2 times out at 30 seconds, retry begins
- Retry adds 100ms backoff + another 30-second timeout attempt = 60+ seconds total
- This exceeds the frontend's 30-second REQUEST_TIMEOUT

---

### 3. Frontend Hook Analysis (`src/ui/hooks/useRecommendation.ts`)

**CRITICAL FINDING - Lines 206-216:**

```typescript
// Line 27: Frontend timeout constant
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Lines 206-216: Race condition between fetch and timeout
const response = await Promise.race([
  fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(apiPayload),
    signal: abortControllerRef.current.signal,
  }),
  new Promise<never>(
    (_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
  ),
]);
```

**Problem:** The frontend has its OWN 30-second timeout that races against the fetch. If the backend takes 30+ seconds (which happens with retry), the frontend times out and rejects, while the backend continues processing.

### 4. Optimistic Stage Timing Analysis (`src/ui/hooks/useRecommendation.ts`)

**Lines 19-24:**

```typescript
const STAGE_TIMINGS = {
  DATA_INTERPRETATION: 2500,  // 2.5s
  PLAN_SCORING: 4000,         // 4s
  NARRATIVE_GENERATION: 2500, // 2.5s
} as const;
```

**Problem:** These are OPTIMISTIC timings. The UI shows all stages completing in 9 seconds total, but:
- Actual USAGE-SUMMARY: 2.3 seconds ✓
- Actual PLAN-SCORING: 29.78 seconds (7.5x slower than optimistic 4s)
- Actual NARRATIVE: Unknown (logs cut off)

The UI UI shows success while backend is still processing, then times out at 30 seconds.

---

### 5. Recommendation Handler Analysis (`src/worker/handlers/recommend.ts`)

**No delays found** - handler immediately calls `runPipeline()` and returns response (lines 131-179).

---

### 6. Narrative Prompt Analysis (`src/worker/prompts/narrative.ts`)

**Prompt size:** The narrative prompt (lines 42-105) is moderate in complexity. Not the root cause of slowness - PLAN-SCORING is the bottleneck.

---

## Phase 2: Root Cause Analysis

### Primary Root Cause: Timeout Race Condition

The issue is a **three-layer timeout race condition**:

1. **Backend Stage Timeout (30s)**: Plan-Scoring takes 29.78s, extremely close to the 30-second limit
2. **Backend Retry Logic (60s+ total)**: If Stage 2 times out, retry adds another 30+ seconds
3. **Frontend Request Timeout (30s)**: Frontend times out at exactly 30 seconds regardless of backend status

### Timeline of Failure

```
T+0s:          Frontend submits request
T+0s-2.3s:     Usage Summary completes (within timeout)
T+2.3s-32.1s:  Plan Scoring runs (29.78s - exceeds 30s timeout by 2.1s if added to initial processing)
T+30s:         Frontend times out (REQUEST_TIMEOUT fires)
               Frontend shows error, aborts request
T+32.1s:       Backend Plan Scoring completes
T+32.2s+:      Backend tries Narrative stage, but frontend already gave up
```

### Why It Looks Like "Success Then Failure"

From the frontend's perspective:
1. **Optimistic UI updates** (lines 109-142 in useRecommendation.ts) show all stages completing in 9 seconds
2. Users see green checkmarks for all 3 stages
3. At T+30s, the frontend timeout fires and shows error
4. **This creates the illusion that everything succeeded, then failed after hanging 30 seconds**

---

## Phase 3: Identified Issues & Fixes

### Issue #1: Individual Stage Timeouts Too Aggressive

**File:** `src/worker/pipeline.ts`
**Lines:** 249, 279, 314
**Current:** 30,000ms (30 seconds)
**Problem:** PLAN-SCORING takes 29.78s, leaving almost zero buffer

**Recommended Fix:** Increase to 40,000ms (40 seconds) per stage
- Allows PLAN-SCORING to complete with buffer
- Respects Cloudflare Worker 30-second overall timeout with safety margin

---

### Issue #2: Retry Configuration Causes Timeout Cascade

**File:** `src/worker/lib/retry.ts`
**Lines:** 61-62
**Current:** 2 attempts × 30 seconds = 60+ seconds total
**Problem:** Backend retries exceed frontend timeout

**Recommended Fix:** Reduce retry attempts to 1 for stages near timeout boundary
- Alternative: Increase frontend REQUEST_TIMEOUT to 60+ seconds
- Best approach: Do both (40s backend stage timeout + 60s frontend timeout)

---

### Issue #3: Frontend Timeout Too Short

**File:** `src/ui/hooks/useRecommendation.ts`
**Line:** 27
**Current:** 30,000ms (30 seconds)
**Problem:** Doesn't account for actual backend processing time

**Recommended Fix:** Increase to 60,000ms (60 seconds)
- Allows for full pipeline execution (30s per stage × 3 + overhead)
- Shows user an accurate timeout if something truly fails

---

### Issue #4: Misleading Optimistic UI Updates

**File:** `src/ui/hooks/useRecommendation.ts`
**Lines:** 19-24, 105-142
**Current:** Shows 9-second completion, but backend takes 32+ seconds
**Problem:** Creates false impression of success before actual timeout

**Recommended Fix:** Display actual stage progress from backend (requires SSE)
- Short-term: Disable optimistic timing and show real progress
- Long-term: Implement SSE progress updates (ENABLE_SSE feature flag exists)

---

## Phase 4: Verification Plan

### Test Case: The Exact Failing Scenario

**Input:** Small Business scenario with 12 months usage data
**Expected:** All stages complete successfully, recommendations shown

### Verification Steps

1. **Test with increased stage timeouts (40s)**
   - Confirm Plan-Scoring doesn't timeout
   - Verify complete pipeline executes

2. **Test with increased frontend timeout (60s)**
   - Confirm frontend doesn't give up prematurely
   - Verify response received and displayed

3. **Test retry behavior**
   - Confirm one successful attempt (no retry triggered)
   - Verify total execution time < 60 seconds

4. **Monitor logs**
   - Check for no timeout errors
   - Verify all three stages complete

---

## Files Involved in Root Cause

1. **`src/worker/pipeline.ts`**
   - Lines 249, 279, 314: 30-second stage timeouts
   - Lines 373-399: Timeout implementation (correct)

2. **`src/worker/lib/retry.ts`**
   - Lines 61-62: Retry configuration with 2 attempts

3. **`src/ui/hooks/useRecommendation.ts`**
   - Line 27: 30-second REQUEST_TIMEOUT
   - Lines 19-24: Misleading optimistic timing
   - Lines 206-216: Frontend timeout race condition

4. **Supporting Files (no issues found)**
   - `src/worker/handlers/recommend.ts`: Clean
   - `src/worker/prompts/narrative.ts`: No delays
   - `src/worker/index.ts`: No timeouts
   - `wrangler.toml`: No timeout configuration

---

## Recommendations Priority

### IMMEDIATE (Critical)

1. ✓ Increase backend stage timeout from 30s to 40s (src/worker/pipeline.ts:249,279,314)
2. ✓ Increase frontend REQUEST_TIMEOUT from 30s to 60s (src/ui/hooks/useRecommendation.ts:27)

### SHORT-TERM (Important)

3. Consider reducing retry attempts for Plan-Scoring stage
4. Add better error messaging to distinguish timeouts from other failures
5. Add monitoring/alerting for stages approaching timeout limits

### LONG-TERM (Enhancement)

6. Implement Server-Sent Events (SSE) for real-time progress updates
7. Replace optimistic timing with actual backend progress signals
8. Consider moving PLAN-SCORING to async processing (webhook-style)

---

## Approval Status

**Ready for Fix Implementation:** YES
**Risk Level:** LOW - Changes only affect timeout constants
**Backwards Compatibility:** YES - Only extends timeouts, no breaking changes
**Testing Required:** YES - Must verify with exact failing scenario

---

## Summary Statistics

- **Backend Actual Execution:** 32+ seconds (3 stages × ~10-30 seconds each)
- **Frontend Timeout:** 30 seconds (fires at T+30s)
- **Gap:** ~2-10 seconds of buffer needed
- **Recommended Backend Timeout:** 40 seconds per stage
- **Recommended Frontend Timeout:** 60 seconds total
- **Recommended Retry Backoff:** 100-200ms (unchanged)

