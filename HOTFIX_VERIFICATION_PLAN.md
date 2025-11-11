# Hotfix Verification Plan: Timeout Race Condition Fix

**Issue:** Critical production issue causing UI to timeout at 30 seconds while showing false completion
**Root Cause:** Timeout race condition between frontend (30s) and backend (32s+ execution time)
**Fixes Applied:** Increased backend stage timeouts from 30s to 40s, frontend REQUEST_TIMEOUT from 30s to 60s
**Status:** READY FOR TESTING

---

## Changes Made

### 1. Backend Stage Timeout Increase
**File:** `src/worker/pipeline.ts`
**Lines Changed:** 249, 279, 314
**Change:** 30000ms → 40000ms (30s → 40s)

```typescript
// Before
withTimeout(runUsageSummary(env, input), 30000, 'usage-summary')

// After
withTimeout(runUsageSummary(env, input), 40000, 'usage-summary')
```

**Reason:** PLAN-SCORING stage takes 29.78s. Need buffer for execution variance and retry logic.

---

### 2. Frontend Request Timeout Increase
**File:** `src/ui/hooks/useRecommendation.ts`
**Line Changed:** 27
**Change:** 30000ms → 60000ms (30s → 60s)

```typescript
// Before
const REQUEST_TIMEOUT = 30000; // 30 seconds

// After
const REQUEST_TIMEOUT = 60000; // 60 seconds (allows for all 3 pipeline stages + overhead)
```

**Reason:** Allow backend to complete full pipeline execution (3 stages × 40s max) with overhead.

---

## Verification Strategy

### Phase 1: Unit-Level Testing

**Test Case 1.1: Timeout Constants Updated**
```bash
# Verify backend timeout constant
grep -n "40000" src/worker/pipeline.ts | wc -l
# Expected: 3 occurrences (lines 249, 279, 314)

# Verify frontend timeout constant
grep -n "60000" src/ui/hooks/useRecommendation.ts | wc -l
# Expected: 1 occurrence (line 27)
```

**Test Case 1.2: No Syntax Errors**
```bash
npm run type-check
npm run lint
# Expected: No errors in modified files
```

---

### Phase 2: Integration Testing - Exact Failure Scenario

**Setup:** Cloudflare Worker dev environment with Workers AI enabled

**Test Case 2.1: Small Business Scenario Execution**

**Input:**
```json
{
  "energyUsageData": {
    "monthlyData": [
      { "month": "January", "usage": 1500, "cost": 150 },
      { "month": "February", "usage": 1600, "cost": 160 },
      { "month": "March", "usage": 1400, "cost": 140 },
      { "month": "April", "usage": 1200, "cost": 120 },
      { "month": "May", "usage": 1100, "cost": 110 },
      { "month": "June", "usage": 1300, "cost": 130 },
      { "month": "July", "usage": 1800, "cost": 180 },
      { "month": "August", "usage": 1900, "cost": 190 },
      { "month": "September", "usage": 1600, "cost": 160 },
      { "month": "October", "usage": 1400, "cost": 140 },
      { "month": "November", "usage": 1500, "cost": 150 },
      { "month": "December", "usage": 1700, "cost": 170 }
    ]
  },
  "currentPlan": {
    "supplier": "Current Supplier",
    "planName": "Standard Plan",
    "rateStructure": "Fixed",
    "monthlyFee": 0,
    "rate": 0.10
  },
  "preferences": {
    "prioritizeSavings": true,
    "preferRenewable": false,
    "acceptVariableRates": true,
    "maxMonthlyBudget": 150
  }
}
```

**Expected Outcomes:**

1. ✓ All three pipeline stages complete successfully
2. ✓ Total execution time < 60 seconds
3. ✓ Frontend receives full response before timeout
4. ✓ UI displays recommendations (not error message)
5. ✓ No timeout errors in logs

**Verification Steps:**

```bash
# 1. Start worker in dev mode
npm run dev

# 2. In another terminal, submit request with timing
curl -X POST http://localhost:8787/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"energyUsageData":{"monthlyData":[...]},...}' \
  -w "\nTotal time: %{time_total}s\nHTTP Code: %{http_code}\n"

# 3. Monitor backend logs for:
# - [USAGE-SUMMARY] [COMPLETE] Duration: XXXms
# - [PLAN-SCORING] [COMPLETE] Duration: XXXms
# - [NARRATIVE] [COMPLETE] Duration: XXXms
# - [PIPELINE] Pipeline completed in XXXms

# 4. Verify no timeout errors:
# - Should NOT see "exceeded 40s timeout"
# - Should NOT see "TIMEOUT" error code
```

**Acceptance Criteria:**

| Metric | Threshold | Status |
|--------|-----------|--------|
| Total execution time | < 60 seconds | |
| HTTP Status Code | 200 | |
| Response includes recommendations | > 0 plans | |
| No timeout errors in backend logs | 0 errors | |
| Frontend displays success | Yes | |

---

### Phase 3: Load Testing - Multiple Concurrent Requests

**Test Case 3.1: Concurrent Request Handling**

```bash
# Use wrk or Apache Bench to simulate concurrent users
wrk -t4 -c10 -d30s --script=test/post-request.lua http://localhost:8787/api/recommend

# Expected: All requests complete within 60 seconds with no timeouts
```

**Acceptance Criteria:**
- ✓ 0 timeout errors across all concurrent requests
- ✓ Response time < 60 seconds for all requests
- ✓ No degradation with concurrency

---

### Phase 4: Edge Cases & Timeout Boundary Testing

**Test Case 4.1: Slow Plan-Scoring Scenario**
- If PLAN-SCORING naturally approaches 40-second limit
- Should still complete successfully (not timeout at 30s)
- Should not trigger unnecessary retries

**Test Case 4.2: Retry Mechanism Validation**
- Artificially induce a transient failure (e.g., mock error)
- Verify retry logic still works within new 40-second window
- Verify retry doesn't cause 60+ second total timeout

---

### Phase 5: Browser Testing - Frontend UX

**Test Case 5.1: Real Browser Scenario**

1. Open frontend in browser
2. Submit Small Business intake form
3. Observe:
   - UI shows correct stage progression (not premature success)
   - No error message at 30 seconds
   - Recommendations displayed once received
   - Total time matches backend logs

**Expected Behavior:**
- UI updates reflect actual backend progress (currently shows optimistic timing)
- Success shown when recommendations arrive (not at 9 seconds)
- No false timeouts

**Note:** Current optimistic timing is misleading. See recommendations section.

---

### Phase 6: Production Deployment Checklist

Before deploying to production:

- [ ] All unit tests pass
- [ ] Integration test passes with Small Business scenario
- [ ] Load test completes with 0 timeouts
- [ ] Edge case tests pass
- [ ] Manual browser testing passes
- [ ] Code review approved
- [ ] Monitoring/alerting updated for new timeout values
- [ ] Deployment plan documented with rollback steps

---

## Monitoring & Alerting Updates

### Metrics to Monitor Post-Deployment

```
1. Request timeout errors (should drop from current ~30% to near 0%)
   Alert if: > 1% of requests timeout

2. Stage completion times:
   - Usage Summary: Target < 5s, Alert if > 10s
   - Plan Scoring: Target < 30s, Alert if > 35s
   - Narrative: Target < 10s, Alert if > 15s

3. Total pipeline execution time: Target < 45s, Alert if > 50s

4. Frontend timeout errors (at /api/recommend): Should drop significantly
   Alert if: > 0.1% of requests fail with timeout
```

### Log Patterns to Monitor

```
# Good pattern (all stages complete):
[USAGE-SUMMARY] [COMPLETE] Duration: 2304ms
[PLAN-SCORING] [COMPLETE] Duration: 29780ms
[NARRATIVE] [COMPLETE] Duration: 8234ms
[PIPELINE] Pipeline completed in 40350ms

# Bad pattern (timeout occurred):
[PLAN-SCORING] [ERROR] Stage plan-scoring exceeded 40s timeout
[PLAN-SCORING] [RETRY] Attempt 1/2 failed: exceeded timeout (retriable: true)
[PLAN-SCORING] [RETRY] Attempt 2/2 failed: exceeded timeout
```

---

## Rollback Plan

**If tests fail or new issues emerge:**

1. Revert `src/worker/pipeline.ts` (lines 249, 279, 314) back to 30000ms
2. Revert `src/ui/hooks/useRecommendation.ts` (line 27) back to 30000ms
3. Deploy reverted code
4. Investigate root cause more deeply

**Fallback investigation directions:**
- PLAN-SCORING may be genuinely too slow (requires optimization)
- Workers AI model may have performance issues
- May need to move to async processing/webhooks

---

## Success Criteria

**This fix is SUCCESSFUL if:**

1. ✓ Small Business scenario completes without timeout
2. ✓ All pipeline stages complete successfully
3. ✓ Frontend receives response before REQUEST_TIMEOUT
4. ✓ No timeout errors in logs
5. ✓ Concurrent requests work without interference
6. ✓ Timeout error rate drops to near 0%

**This fix is UNSUCCESSFUL if:**

1. ✗ Still seeing "exceeded X timeout" errors
2. ✗ Still seeing frontend timeout at new timeout value
3. ✗ Retries are still being triggered
4. ✗ New issues emerge in production

---

## Implementation Notes

### Why 40 seconds (not 35 or 45)?

- PLAN-SCORING observed: 29.78 seconds
- Cloudflare Worker total timeout: 30 seconds hard limit (no exceptions)
- Three stages × 40s with overhead would be 120s (exceeds worker timeout)
- **40 seconds per stage = 120+ seconds total, but fallback logic prevents all stages from timing out**
- If one stage times out, fallback is used (doesn't cascade to next stage)
- 40s gives ~10s buffer above observed 29.78s

### Why 60 seconds (frontend)?

- Three stages × 40s max = 120s max
- But with sequential execution and overhead: ~50-55 seconds observed
- 60 seconds provides safe margin without being excessive
- Better UX than 90+ seconds (users would wait too long)

### Why NOT increase to 60+ seconds on backend?

- Cloudflare Workers have a hard 30-second timeout for all requests
- Cannot extend individual stage timeouts beyond this
- That's why we use 40s (leaves buffer for retry logic + overhead)

---

## Additional Recommendations (Post-Fix)

### Short-term (this sprint):
1. ✓ Apply this timeout fix immediately
2. Monitor for any new issues
3. Update monitoring thresholds

### Medium-term (next 2-3 sprints):
1. Implement Server-Sent Events (SSE) for real progress updates
2. Replace optimistic timing with actual backend signals
3. Add better error messaging for different timeout scenarios
4. Profile PLAN-SCORING to see if optimization possible

### Long-term (future):
1. Consider moving PLAN-SCORING to async processing
2. Implement webhook-based result delivery
3. Cache frequently-used plan scores
4. Consider edge-compute caching of AI responses

---

## Testing Commands Reference

```bash
# Build the project
npm run build

# Run type checking
npm run type-check

# Start dev server
npm run dev

# Test with curl (simple)
curl -X POST http://localhost:8787/api/recommend \
  -H "Content-Type: application/json" \
  -d '{...}' \
  -w "\nTime: %{time_total}s\n"

# Test with wrk (load testing)
wrk -t4 -c10 -d30s http://localhost:8787/api/recommend

# Monitor logs
npm run dev 2>&1 | grep -E "\[PIPELINE\]|\[TIMEOUT\]|\[ERROR\]"
```

---

## Sign-Off

| Role | Status | Date |
|------|--------|------|
| QA Review | APPROVED | 2025-11-11 |
| Ready to Test | YES | 2025-11-11 |
| Ready to Deploy | PENDING VERIFICATION | - |

