# Epic 7: Post-Launch Bug Fixes & Improvements

**Status:** 8 new bug fix stories created and "Ready for Development"  
**Created:** 2025-11-11  
**Total Stories in Epic:** 11 (3 original + 8 bug fixes)

---

## Quick Links to Stories

### P0 - Critical Priority (Fix First)

| Story | Issue | File |
|-------|-------|------|
| **7.4** | Test Suite Failures & Hanging Tests | [7.4-test-suite-failures-hanging.md](stories/7.4-test-suite-failures-hanging.md) |
| **7.5** | "Why" Section Markdown Rendering Regression | [7.5-why-section-markdown-regression.md](stories/7.5-why-section-markdown-regression.md) |
| **7.6** | Mock Data - Renewable % and Plan Tiers | [7.6-mock-data-renewable-and-tiers.md](stories/7.6-mock-data-renewable-and-tiers.md) |

### P1 - High Priority

| Story | Issue | File |
|-------|-------|------|
| **7.7** | Implement Web Scraper for Real Plans | [7.7-implement-web-scraper.md](stories/7.7-implement-web-scraper.md) |
| **7.8** | Improve LLM Prompts & Data Constraints | [7.8-improve-llm-prompts-constraints.md](stories/7.8-improve-llm-prompts-constraints.md) |
| **7.10** | Fix Contract Length Handling | [7.10-fix-contract-length-handling.md](stories/7.10-fix-contract-length-handling.md) |

### P2 - Medium Priority

| Story | Issue | File |
|-------|-------|------|
| **7.9** | Add Debug UI - View All Plans | [7.9-add-debug-ui-view-plans.md](stories/7.9-add-debug-ui-view-plans.md) |
| **7.11** | Fix Error Message Visibility | [7.11-fix-error-message-visibility.md](stories/7.11-fix-error-message-visibility.md) |

---

## Original Epic 7 Stories (Ongoing)

| Story | Description | Status |
|-------|-------------|--------|
| **7.1** | Workers AI Model Performance Optimization | Ready for Dev |
| **7.2** | "Why" Section Formatting | Done (Completed) |
| **7.3** | Progress Timeline Timing | Ready for Dev |

---

## Critical Issues Overview

### 1. Test Suite Failures (Story 7.4 - P0)
- Test suite has failures and hangs without completing
- Blocks all development until fixed
- **Impact:** Cannot validate code changes

### 2. Narrative Rendering Regression (Story 7.5 - P0)
- "Why" sections show raw markdown instead of formatted output
- Despite Story 7.2 completion, regression occurred
- **Impact:** Poor user experience, confusing explanations

### 3. Data Integrity Issues (Story 7.6 - P0)
- All plans incorrectly showing 0% renewable percentage
- All plans showing "Bronze" tier regardless of actual tier
- **Impact:** Users get misleading plan information

### 4. LLM Hallucination (Story 7.8 - P1)
- Claude generating non-existent plans
- Making up plan names and details
- **Impact:** Recommendations not based on real data

### 5. Web Scraper Not Working (Story 7.7 - P1)
- Scraper not retrieving real energy plans
- System relying entirely on mock data
- **Impact:** No real plan data in recommendations

### 6. Contract Length Not Used (Story 7.10 - P1)
- Arbitrary 24-month limit in system
- Not used in recommendation logic
- **Impact:** User preferences for contract length ignored

### 7. Missing Debug Tools (Story 7.9 - P2)
- No way to view all known plans
- Hard to validate data and debug issues
- **Impact:** Slower development and QA

### 8. Error Message UX (Story 7.11 - P2)
- Error appears at top when form is at bottom
- User doesn't see validation errors
- **Impact:** Frustrating user experience

---

## Developer Instructions

### Before Starting

1. **Review Your Story**: Read the complete story file for your assignment
2. **Understand Acceptance Criteria**: Review all AC sections (numbered 1-N)
3. **Check Dev Notes**: Investigation authority and common causes documented
4. **Ask Questions**: Use dev notes section if clarification needed

### Investigation Phase

Each story has a dedicated **Investigation Authority** section. You have:
- Full access to investigate all code and data
- Permission to modify any files necessary
- Authority to refactor, change, or redesign as needed
- No restrictions on what can be changed to fix the issue

### Implementation Phase

Once root causes are understood:
1. Implement the fix based on findings
2. Write comprehensive tests
3. Update documentation
4. Verify all acceptance criteria met

### QA Gate Process

- QA review is **unbiased** and thorough
- **Zero tolerance** for incomplete fixes
- All acceptance criteria must be met
- Tests must be comprehensive
- Stories sent back if quality standards not met

---

## Execution Timeline

### Phase 1: Critical Fixes (2-3 days)
Priority: P0 - Must fix first
- Story 7.4: Test suite (unblocks dev)
- Story 7.5: Narrative regression (QA blocker)
- Story 7.6: Data integrity (foundation)

### Phase 2: Core Issues (2-3 days)
Priority: P1 - Production impact
- Story 7.8: LLM constraints (prevent hallucinations)
- Story 7.10: Contract length (data model)
- Story 7.7: Web scraper (real data)

### Phase 3: UX Polish (1-2 days)
Priority: P2 - User experience
- Story 7.9: Debug UI (developer tools)
- Story 7.11: Error messages (UX)

### Phase 4: Performance (2-3 days)
Priority: Enhancement
- Story 7.1: Workers AI optimization
- Story 7.3: Progress timeline

**Total Duration:** 7-11 days for complete epic

---

## Story Structure

Each story includes:

### 1. User Story Section
Clear user-centric perspective of the problem

### 2. Acceptance Criteria (5-8 per story)
Detailed, testable criteria with sub-tasks
- Each criterion numbered (1, 2, 3, etc.)
- Each has specific tasks to complete
- Checklist format for tracking

### 3. Tasks / Subtasks
Organized checklist matching acceptance criteria
- Maps directly to acceptance criteria
- Clear task descriptions
- Checkbox format for progress tracking

### 4. Dev Notes
Crucial information for implementation:
- **Investigation Authority**: What you can modify
- **Key Files to Investigate**: Where to look
- **Common Causes**: Patterns to check for
- **Debug Approach**: How to investigate
- **Examples**: Code snippets and patterns

### 5. QA Checklist
Comprehensive quality gates:
- What QA will verify
- Must all pass before acceptance
- Tests, documentation, code quality

### 6. Dev Agent Record
Space for tracking:
- Implementation progress
- Debug log references
- Completion notes
- Final results

---

## Key Files & Directories

```
/Users/abdul/Downloads/Projects/EnergyGenius/

stories/
├── 7.1-workers-ai-model-performance.md
├── 7.2-why-section-formatting.md (DONE)
├── 7.3-progress-timeline-timing.md
├── 7.4-test-suite-failures-hanging.md (NEW)
├── 7.5-why-section-markdown-regression.md (NEW)
├── 7.6-mock-data-renewable-and-tiers.md (NEW)
├── 7.7-implement-web-scraper.md (NEW)
├── 7.8-improve-llm-prompts-constraints.md (NEW)
├── 7.9-add-debug-ui-view-plans.md (NEW)
├── 7.10-fix-contract-length-handling.md (NEW)
└── 7.11-fix-error-message-visibility.md (NEW)

sprint-status-epic7.yaml (Updated with all stories)
EPIC7-BUGFIX-SUMMARY.md (Comprehensive summary)
README-EPIC7-BUGFIX.md (This file)
```

---

## Support & Questions

### Finding Information

- **Story Details**: Read the specific story file
- **Acceptance Criteria**: AC sections (numbered 1-N) in each story
- **Dev Authority**: Explicit in "Investigation Authority" section
- **Key Files**: Listed in "Key Files to Investigate" section
- **Debug Approach**: Documented in "Dev Notes" section

### Getting Help

1. Review the story's Dev Notes section
2. Check if similar issues are addressed
3. Ask questions in the story file dev notes section
4. Escalate to Scrum Master if blocked

### QA Review

Once story is complete:
1. Ensure all AC criteria met
2. Comprehensive tests written
3. Documentation updated
4. Code reviewed and clean
5. Submit for QA review

---

## Success Criteria for Epic Completion

- All 11 stories complete
- 100% of acceptance criteria met for each story
- Comprehensive test coverage
- Documentation updated
- Code quality verified
- QA sign-off received

---

## Contact

**Scrum Master:** Bob  
**Role:** Story Preparation Specialist  
**Created:** 2025-11-11

For questions, refer to the comprehensive information in each story file.

**All 8 bug fix stories are actionable and ready for development.**

