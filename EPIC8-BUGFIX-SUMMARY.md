# Epic 8: Critical Bug Fixes (Post-Deployment) - Story Summary

**Created:** 2025-11-11
**Status:** All 4 Stories Ready for Development
**Priority:** P0-P2 (All Critical or High)
**Total Complexity:** High (4 interdependent bug fixes)

---

## Executive Summary

Four critical production bugs have been identified post-deployment:

1. **Story 8.1 (P0)**: Validation Too Strict - AI recommendations rejected due to strict plan name matching
2. **Story 8.2 (P0)**: $0 Costs Showing - Fallback data missing cost information
3. **Story 8.3 (P2)**: Progress Duration Bug - Shows "0s" instead of actual elapsed time
4. **Story 8.4 (P1)**: Verify Scraper & Data - Confirm web scraper working and catalog has sufficient plans

**Impact**: Stories 8.1 and 8.2 together break the production system (users see $0 costs, can't make decisions). Stories 8.3 and 8.4 affect UX and data quality but are less critical.

---

## Story 8.1: Fix Validation - Relax Strict Plan Name Matching

**Priority:** P0 - Critical
**Complexity:** Medium
**File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/8.1-fix-validation-relax-plan-names.md`

### Problem

Story 7.8 implemented strict 3-stage validation to prevent LLM hallucinations (good decision). However, the validation is TOO strict for real-world variations:

```
ERROR: AI modified plan details. All plan names must exactly match catalog.
Mismatches:
  - "Pollution Free e-Plus 12 Choice" vs "Pollution Free e-Plus 36 Choice"
  - "Frontier Power Saver 6" vs "Frontier Power Saver 12"
```

The AI is not hallucinating—it's finding valid alternatives with different contract lengths. The validation rejects these, causing fallback to neutral scoring with $0 costs.

### Solution

**Keep supplier and planId validation strict (prevent hallucinations)**
**Relax planName validation with fuzzy/pattern matching (allow variations)**

Allow the AI flexibility in choosing contract length variations while maintaining strict validation on:
- planId (primary key - must match exactly)
- supplier (must match exactly - prevent wrong utility)
- planName (allow fuzzy matching for contract length variations)

### Key Tasks

1. Investigate current validation behavior
2. Define fuzzy/pattern matching strategy (recommend: pattern matching for contract lengths)
3. Update validation logic in parsers.ts
4. Update prompts to emphasize planId as primary key (not planName)
5. Test with real production error cases
6. Comprehensive test coverage including edge cases

### Expected Outcome

- AI can recommend "Pollution Free e-Plus 12 Choice" even if catalog has "36 Choice"
- System finds the 12-month version in catalog if it exists
- Cost data correctly populated
- No more fallback to $0 costs from validation failures

---

## Story 8.2: Fix $0 Cost Display - Improve Fallback Data

**Priority:** P0 - Critical
**Complexity:** Medium
**File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/8.2-fix-zero-cost-display.md`

### Problem

All recommended plans show $0/month and $0 annual savings when fallback is triggered:
- Users cannot compare plans
- Users cannot make purchase decisions
- System appears broken in production

Root cause: Fallback data doesn't populate estimatedAnnualCost and estimatedSavings fields.

### Solution

Ensure fallback always returns accurate cost data from catalog. Multiple possible approaches:
1. Update fallback to use same plan schema as AI recommendations
2. Apply cost calculation to fallback flow
3. Fix logic that's explicitly setting costs to $0
4. Fix frontend component to handle missing costs gracefully

### Key Tasks

1. Investigate fallback cost data issue
2. Identify root cause (wrong schema, not calculated, set to zero, etc.)
3. Fix based on root cause
4. Add cost validation to fallback
5. Handle edge cases (free plans, partial data, etc.)
6. Comprehensive testing

### Expected Outcome

- Fallback always shows real costs (not $0)
- Cost data complete and accurate
- Users can make informed decisions
- System shows "cost unavailable" rather than $0 when legitimate

---

## Story 8.3: Fix Progress Duration Display

**Priority:** P2 - Low (Cosmetic UX Issue)
**Complexity:** Low
**File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/8.3-fix-progress-duration-display.md`

### Problem

Progress timeline correctly shows elapsed time while request runs:
- "Duration 5s" ✓
- "Duration 45s" ✓

But on completion shows:
- "Duration 0s" ✗ (should show total elapsed time)

Minor UX issue but confusing to users.

### Solution

Fix duration calculation/display logic in ProgressTimeline component:
- Ensure duration state updates on completion
- Verify calculation happens after endTime is set
- Check for race conditions or stale closures
- Update display to show current duration value

### Key Tasks

1. Investigate progress duration issue
2. Identify root cause (state not updating, race condition, wrong calculation, etc.)
3. Fix based on root cause
4. Test with various request lengths
5. Verify no regressions

### Expected Outcome

- Progress shows correct elapsed time at all stages
- "Duration Xs" displays accurately including at completion
- No console errors
- User sees clear feedback on request time

---

## Story 8.4: Verify Scraper & Plan Data Availability

**Priority:** P1 - High
**Complexity:** Medium
**File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/8.4-verify-scraper-plan-data.md`

### Problem

Web scraper from Story 7.7 may not be running correctly or may not have scraped sufficient real plan data (~100 plans from powertochoose.org). Without enough plans in catalog, AI has limited options and recommendation quality suffers.

### Solution

1. Verify scraper works
2. Run scraper successfully
3. Verify 100+ plans in catalog
4. Check plan data quality
5. Verify data integrated in application
6. Document scraper runbook for maintenance
7. Fix any issues found

### Key Tasks

1. Verify scraper execution
2. Verify plan count and coverage
3. Verify plan data quality
4. Test plan data integration
5. Investigate data freshness
6. Document findings and create runbook
7. Fix any issues found

### Expected Outcome

- Scraper confirmed working
- Catalog has 100+ real plans from powertochoose.org
- Plan data quality verified and accurate
- Plans load in application correctly
- System has full recommendation capability
- Scraper maintenance documented

---

## Execution Recommendation

### Phase 1: Immediate (P0 Priority - Unblock System)

1. **Start 8.4 FIRST** (1 day)
   - Verify scraper working and plan data sufficient
   - Results inform whether 8.1/8.2 will help
   - If scraper broken, prioritize fixing it

2. **Execute 8.1** (2 days) - Parallel with investigation phase of 8.4
   - Fix validation to accept plan name variations
   - Keep supplier/planId strict
   - Test with production error cases

3. **Execute 8.2** (1-2 days) - Parallel with 8.1
   - Fix fallback to include real costs
   - Test fallback scenarios
   - Verify cost data flows correctly

### Phase 2: Follow-up (P2 Priority - UX Polish)

4. **Execute 8.3** (0.5-1 day)
   - Fix progress duration display
   - Minor issue but improves UX clarity

### Total Timeline

- Estimated: 4-6 days total
- Can be parallelized: 8.1, 8.2, and investigation phase of 8.4 can run simultaneously
- 8.3 is independent and can be done last

---

## Relationship to Previous Stories

### Story 7.8: Improve LLM Prompts & Data Constraints
- **Issue**: Implemented strict validation to prevent hallucinations
- **Story 8.1 relationship**: Story 8.1 keeps the good part (strict planId/supplier) but relaxes the bad part (strict planName)
- **Design philosophy**: Strictness on keys, flexibility on display names

### Story 7.7: Implement Web Scraper
- **Issue**: Scraper may not be working or complete
- **Story 8.4 relationship**: Story 8.4 verifies Story 7.7 was successful in production
- **Action**: If broken, Story 8.4 includes fixing it

---

## Testing Strategy for All Stories

### Unit Tests
- 8.1: Test fuzzy matching function in isolation
- 8.2: Test cost validation and calculation
- 8.3: Test duration calculation with various times
- 8.4: Test plan data verification functions

### Integration Tests
- 8.1: Test validation with real catalog data
- 8.2: Test cost flow end-to-end
- 8.3: Test progress with real recommendations
- 8.4: Test plan loading and validation

### Manual Testing
- 8.1: Generate recommendations, verify validation passes
- 8.2: Trigger fallback, verify costs display correctly
- 8.3: Generate recommendation, watch progress duration
- 8.4: Run scraper, verify data in application

### Regression Testing
- All: Verify existing tests still pass
- All: No breaking changes to existing functionality
- All: No new console errors or warnings

---

## QA Review Criteria

All stories must meet:
- ✅ Acceptance criteria fully satisfied
- ✅ All tests passing (existing + new)
- ✅ No regressions in existing functionality
- ✅ Edge cases handled appropriately
- ✅ Documentation updated
- ✅ Code reviewed for quality
- ✅ Performance impact acceptable
- ✅ No breaking changes to public APIs

Zero tolerance for quality issues—stories failing QA will be sent back for rework.

---

## Developer Notes

All developers have **full authority** to:
- Investigate any file or system component
- Modify code structure if needed
- Add or refactor tests
- Update documentation
- Make architectural decisions (with rationale)
- Debug with full logging and telemetry

Developers should NOT proceed if:
- Dependencies are unclear (ask for clarification)
- Acceptance criteria seem ambiguous (ask for clarification)
- Technical approach seems risky (discuss with team)

---

## Story Status Tracking

**All stories created and marked as: `ready-for-dev`**

Sprint status file: `/Users/abdul/Downloads/Projects/EnergyGenius/sprint-status-epic8.yaml`

### Story Files
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/8.1-fix-validation-relax-plan-names.md`
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/8.2-fix-zero-cost-display.md`
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/8.3-fix-progress-duration-display.md`
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/8.4-verify-scraper-plan-data.md`

---

## Timeline & Handoff

**Stories Ready:** 2025-11-11 (Today)
**Status:** All marked "ready-for-dev"
**Recommended Start:** ASAP (P0 stories block production)

QA will review each story as completed and provide feedback. Stories failing QA will be sent back to dev for rework.

---

## Key Contacts & Decision Authority

- **Scrum Master Role**: Story creation, planning, stakeholder communication
- **Dev Team**: Full technical authority on implementation
- **QA**: Final approval gate - zero tolerance standard
- **Product Owner**: Prioritization and scope decisions

---

End of Epic 8 Summary

Created by: Scrum Master (SM Agent)
Date: 2025-11-11
Project: EnergyGenius
