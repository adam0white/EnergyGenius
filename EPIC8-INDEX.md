# Epic 8: Critical Bug Fixes - Quick Reference Index

**Epic:** Epic 8 - Critical Bug Fixes (Post-Deployment)
**Created:** 2025-11-11
**Status:** Ready for Development
**Project:** EnergyGenius

---

## Quick Navigation

### Start Here
1. **[EPIC8-BUGFIX-SUMMARY.md](./EPIC8-BUGFIX-SUMMARY.md)** ← Start with this for full context
2. Pick your story below
3. Execute and mark complete

---

## All Stories

### Priority P0 - CRITICAL (System Broken)

#### Story 8.1: Fix Validation - Relax Strict Plan Name Matching
- **File:** [stories/8.1-fix-validation-relax-plan-names.md](./stories/8.1-fix-validation-relax-plan-names.md)
- **Problem:** Validation too strict rejects valid plan variations
- **Solution:** Relax planName matching while keeping supplier/planId strict
- **Timeline:** 2 days
- **Owner:** Dev Team

#### Story 8.2: Fix $0 Cost Display - Improve Fallback Data
- **File:** [stories/8.2-fix-zero-cost-display.md](./stories/8.2-fix-zero-cost-display.md)
- **Problem:** Fallback shows $0 costs, users can't make decisions
- **Solution:** Ensure fallback includes real cost data from catalog
- **Timeline:** 1-2 days
- **Owner:** Dev Team

### Priority P1 - HIGH (Data Quality)

#### Story 8.4: Verify Scraper & Plan Data Availability
- **File:** [stories/8.4-verify-scraper-plan-data.md](./stories/8.4-verify-scraper-plan-data.md)
- **Problem:** Scraper may not be working, limited plan data
- **Solution:** Run scraper, verify 100+ plans in catalog, fix issues
- **Timeline:** 1 day
- **Owner:** Dev Team

### Priority P2 - LOW (UX Polish)

#### Story 8.3: Fix Progress Duration Display
- **File:** [stories/8.3-fix-progress-duration-display.md](./stories/8.3-fix-progress-duration-display.md)
- **Problem:** Progress shows "Duration 0s" instead of total elapsed time
- **Solution:** Fix duration calculation/state update on completion
- **Timeline:** 0.5-1 day
- **Owner:** Dev Team

---

## Recommended Execution Order

### Phase 1: Unblock Production (Days 1-5)
1. **Story 8.4** (Day 1): Verify scraper and plan data
2. **Story 8.1** (Days 2-3): Fix validation logic
3. **Story 8.2** (Days 3-4): Fix fallback costs

### Phase 2: Polish (Day 5)
4. **Story 8.3** (Day 5): Fix progress duration

---

## Documentation Files

| File | Purpose | Length |
|------|---------|--------|
| [EPIC8-INDEX.md](./EPIC8-INDEX.md) | This quick reference | ~200 lines |
| [EPIC8-BUGFIX-SUMMARY.md](./EPIC8-BUGFIX-SUMMARY.md) | Executive summary with full context | 260 lines |
| [EPIC8-ARTIFACTS.md](./EPIC8-ARTIFACTS.md) | Complete artifact inventory | 400 lines |
| [sprint-status-epic8.yaml](./sprint-status-epic8.yaml) | Status tracking | 66 lines |

---

## Key Information

### Production Impact
- **Severity:** Critical
- **Affected Users:** All users in production
- **Current State:** System showing $0 costs (unusable)
- **Fix Timeline:** 4-6 days total

### What's Broken
1. **Validation too strict** → AI recommendations rejected
2. **Fallback missing costs** → Users see $0
3. **Scraper may not work** → Limited plan data
4. **Duration shows 0s** → Confusing UX (minor)

### What Gets Fixed
1. **8.1:** AI can recommend variations, validation stays strict on keys
2. **8.2:** Fallback includes real costs
3. **8.4:** Scraper verified and working, 100+ plans available
4. **8.3:** Progress duration displays correctly

---

## For Different Roles

### Developers
1. Read [EPIC8-BUGFIX-SUMMARY.md](./EPIC8-BUGFIX-SUMMARY.md)
2. Pick a story from the list above
3. Follow the Acceptance Criteria
4. Execute the tasks
5. Run the tests
6. Mark story complete

### QA/Test
1. Read [EPIC8-BUGFIX-SUMMARY.md](./EPIC8-BUGFIX-SUMMARY.md)
2. Review each completed story
3. Use the QA Checklist in the story
4. Verify all acceptance criteria met
5. Approve or send back for rework

### Product/Scrum Master
1. Check [EPIC8-BUGFIX-SUMMARY.md](./EPIC8-BUGFIX-SUMMARY.md) for business impact
2. Monitor [sprint-status-epic8.yaml](./sprint-status-epic8.yaml) for status
3. Track timeline against 4-6 day estimate
4. Unblock any dependencies
5. Communicate status to stakeholders

---

## File Status

### Stories (All Ready for Development)
- [x] Story 8.1 - Created and ready
- [x] Story 8.2 - Created and ready
- [x] Story 8.3 - Created and ready
- [x] Story 8.4 - Created and ready

### Documentation (All Complete)
- [x] Executive summary
- [x] Sprint status file
- [x] Artifacts list
- [x] Quick reference index (this file)

### Total Content
- 4 detailed stories (1,407 lines)
- 3 documentation files (860 lines)
- 1 status tracking file (66 lines)
- **Total: 2,333 lines of comprehensive content**

---

## Quick Reference: Key Contacts

| Role | Authority | Contact |
|------|-----------|---------|
| **Developer** | Full technical authority | See acceptance criteria |
| **QA** | Approval gate (zero tolerance) | Use QA checklist |
| **Scrum Master** | Planning and stakeholder comms | Monitor status |
| **Product** | Prioritization and scope | Reference summary |

---

## How to Use This Epic

### If You're Starting Now
1. Read this file (2 min)
2. Read [EPIC8-BUGFIX-SUMMARY.md](./EPIC8-BUGFIX-SUMMARY.md) (10 min)
3. Pick a story from "Recommended Execution Order"
4. Read the full story file
5. Start implementing

### If You're Reviewing
1. Read this file (2 min)
2. Read [EPIC8-BUGFIX-SUMMARY.md](./EPIC8-BUGFIX-SUMMARY.md) (10 min)
3. Read the specific story being reviewed
4. Use the QA Checklist
5. Provide feedback or approval

### If You're Tracking
1. Check [sprint-status-epic8.yaml](./sprint-status-epic8.yaml) for status
2. Track completion against timeline
3. Escalate blockers
4. Report status to stakeholders

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total Stories | 4 |
| P0 Stories | 2 |
| P1 Stories | 1 |
| P2 Stories | 1 |
| Total Lines | 2,333 |
| Acceptance Criteria | 24+ total |
| Expected Timeline | 4-6 days |
| Dev Authority | FULL |

---

## Common Questions

**Q: Where do I start?**
A: Read EPIC8-BUGFIX-SUMMARY.md, then pick Story 8.4 to start.

**Q: What if I get stuck?**
A: Check the Dev Notes in your story - they have full investigation authority.

**Q: When is this due?**
A: ASAP - it's P0 blocking production. Target 4-6 days.

**Q: Can I skip a story?**
A: Execute in recommended order for maximum parallelization.

**Q: What's the QA standard?**
A: Zero tolerance - stories must meet all acceptance criteria and pass all tests.

---

## Links to All Stories

1. [Story 8.1 - Fix Validation](./stories/8.1-fix-validation-relax-plan-names.md)
2. [Story 8.2 - Fix $0 Costs](./stories/8.2-fix-zero-cost-display.md)
3. [Story 8.3 - Fix Progress Duration](./stories/8.3-fix-progress-duration-display.md)
4. [Story 8.4 - Verify Scraper](./stories/8.4-verify-scraper-plan-data.md)

---

## Related Documents

- Previous Epic: [EPIC-7-POST-LAUNCH-SUMMARY.md](./EPIC-7-POST-LAUNCH-SUMMARY.md)
- Status Tracking: [sprint-status-epic8.yaml](./sprint-status-epic8.yaml)
- Full Summary: [EPIC8-BUGFIX-SUMMARY.md](./EPIC8-BUGFIX-SUMMARY.md)
- Artifacts: [EPIC8-ARTIFACTS.md](./EPIC8-ARTIFACTS.md)

---

## Sign-Off

**Created:** 2025-11-11
**Scrum Master:** Complete
**Status:** Ready for Development
**Project:** EnergyGenius

Ready to be handed off to the development team.

---

**Last Updated:** 2025-11-11
