# Epic 7 Bug Fix Stories - Creation Summary

**Created:** 2025-11-11
**Status:** All 8 stories created and marked "Ready for Development"
**Total Stories in Epic 7:** 11 (3 original + 8 bug fixes)

---

## Critical Issues Addressed

Based on detailed user feedback, 8 critical bug fix stories have been created to address production issues:

### P0 - Critical Priority (3 stories)

#### Story 7.4: Fix Test Suite Failures & Hanging Tests
- **Issue:** Test suite has failures and hangs without completing
- **File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.4-test-suite-failures-hanging.md`
- **Developer Authority:** Full investigation authority, no restrictions
- **Key Tasks:**
  - Investigate all test failures thoroughly
  - Fix hanging tests
  - Validate 100% pass rate
  - Document testing approach

#### Story 7.5: Fix "Why" Section Markdown Rendering Regression
- **Issue:** Despite Story 7.2 completion, "Why" section still shows markdown instead of formatted output
- **File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.5-why-section-markdown-regression.md`
- **Developer Authority:** Full investigation of narrative parser and component
- **Key Tasks:**
  - Investigate regression thoroughly
  - Trace data flow from Claude to rendering
  - Fix narrative rendering
  - Add regression tests

#### Story 7.6: Fix Mock Data - Renewable % and Plan Tiers
- **Issue:** All plans incorrectly showing 0% renewable and "Bronze" tier
- **File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.6-mock-data-renewable-and-tiers.md`
- **Developer Authority:** Full data audit and modification authority
- **Key Tasks:**
  - Audit mock supplier data
  - Fix renewable percentages
  - Correct tier assignments
  - Validate data integrity

### P1 - High Priority (3 stories)

#### Story 7.7: Implement Web Scraper for Real Plans
- **Issue:** Web scraper not working, need to scrape real energy plans
- **File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.7-implement-web-scraper.md`
- **Developer Authority:** Full scraper design and implementation
- **Key Tasks:**
  - Investigate current scraper issues
  - Fix or rebuild scraper
  - Extract real plan data
  - Integrate with recommendation system

#### Story 7.8: Improve LLM Prompts & Data Constraints
- **Issue:** AI generating non-existent plans instead of using actual data
- **File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.8-improve-llm-prompts-constraints.md`
- **Developer Authority:** Full prompt design and validation logic authority
- **Key Tasks:**
  - Investigate why Claude creates fictional plans
  - Rewrite prompts with strict constraints
  - Add validation of recommendations
  - Ensure only real plans are recommended

#### Story 7.10: Fix Contract Length Handling
- **Issue:** Arbitrary 24-month limit not used in recommendations
- **File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.10-fix-contract-length-handling.md`
- **Developer Authority:** Full authority to remove/change contract length limits
- **Key Tasks:**
  - Find and document 24-month limit locations
  - Remove or document the constraint
  - Ensure contract length used in recommendations
  - Update UI and validation

### P2 - Medium Priority (2 stories)

#### Story 7.9: Add Debug UI - View All Plans
- **Issue:** Need a debug button to view all known plans for validation
- **File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.9-add-debug-ui-view-plans.md`
- **Developer Authority:** Full UI design and implementation authority
- **Key Tasks:**
  - Create debug component with plan table
  - Add filtering and search
  - Display plan statistics
  - Add to main app UI

#### Story 7.11: Fix Error Message Visibility
- **Issue:** Error messages appear at top, not visible when form at bottom
- **File:** `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.11-fix-error-message-visibility.md`
- **Developer Authority:** Full error handling and UI feedback authority
- **Key Tasks:**
  - Investigate current error display
  - Implement auto-scroll or toast notification
  - Add inline field validation
  - Test on all viewports

---

## Story Status & Locations

All stories are marked **"Ready for Development"** in the sprint status file.

```
sprint-status-epic7.yaml location:
/Users/abdul/Downloads/Projects/EnergyGenius/sprint-status-epic7.yaml
```

Story files location:
```
/Users/abdul/Downloads/Projects/EnergyGenius/stories/
├── 7.4-test-suite-failures-hanging.md
├── 7.5-why-section-markdown-regression.md
├── 7.6-mock-data-renewable-and-tiers.md
├── 7.7-implement-web-scraper.md
├── 7.8-improve-llm-prompts-constraints.md
├── 7.9-add-debug-ui-view-plans.md
├── 7.10-fix-contract-length-handling.md
└── 7.11-fix-error-message-visibility.md
```

---

## Developer Instructions

### Full Authority Given

Developers have **unrestricted authority** to:
- Investigate issues thoroughly without constraints
- Modify any files necessary to fix problems
- Refactor code for clarity and correctness
- Add or remove features as needed for fixes
- Change data structures and validation
- Modify prompts and recommendation logic
- Create new utilities and components

### QA Gate Process

- QA review will be **unbiased** and thorough
- Stories sent back if quality standards not met
- **Zero tolerance** for incomplete fixes
- All acceptance criteria must be met
- Tests must be comprehensive
- Documentation must be clear

### Recommended Execution Order

**Phase 1 (P0 Critical - 2-3 days):**
1. Story 7.4: Fix test suite (unblock development)
2. Story 7.5: Fix narrative rendering (QA blocker)
3. Story 7.6: Fix mock data (data integrity)

**Phase 2 (P1 High - 2-3 days):**
1. Story 7.8: Improve LLM constraints (prevent hallucinations)
2. Story 7.10: Fix contract length (data model)
3. Story 7.7: Implement scraper (real data)

**Phase 3 (P2 Medium - 1-2 days):**
1. Story 7.9: Debug UI (developer tools)
2. Story 7.11: Fix error messages (UX polish)

**Phase 4 (Performance - 2-3 days):**
1. Story 7.1: Optimize Workers AI model
2. Story 7.3: Fix progress timeline

---

## Key Context for Developers

### Each Story Includes:

1. **Full Authority Section**: Explicit permission to investigate and modify
2. **Thorough Investigation Guidance**: Key files and investigation approaches
3. **Root Cause Analysis**: Questions to answer before implementing fixes
4. **Implementation Options**: Multiple approaches with trade-offs
5. **Testing & Validation**: Comprehensive test scenarios
6. **Documentation Requirements**: Code and user documentation needed

### Critical Principles:

- **Investigate First**: Understand root causes before implementing
- **No Assumptions**: Don't assume - verify with code inspection
- **Document Findings**: Each story has dev notes section for recording investigation
- **Thorough Testing**: Test all scenarios, not just happy path
- **Quality First**: These are critical P0/P1 issues affecting production

---

## Files Created

**8 Story Files:**
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.4-test-suite-failures-hanging.md` (4.2 KB)
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.5-why-section-markdown-regression.md` (5.8 KB)
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.6-mock-data-renewable-and-tiers.md` (5.2 KB)
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.7-implement-web-scraper.md` (6.8 KB)
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.8-improve-llm-prompts-constraints.md` (8.2 KB)
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.9-add-debug-ui-view-plans.md` (6.4 KB)
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.10-fix-contract-length-handling.md` (6.6 KB)
- `/Users/abdul/Downloads/Projects/EnergyGenius/stories/7.11-fix-error-message-visibility.md` (5.8 KB)

**Updated Files:**
- `/Users/abdul/Downloads/Projects/EnergyGenius/sprint-status-epic7.yaml` (status updated)

---

## Next Steps

1. **Review Stories**: Developers review their assigned stories
2. **Ask Questions**: Use dev notes section if clarification needed
3. **Investigate**: Start with investigation tasks in each story
4. **Implement**: Once root causes understood, implement fixes
5. **Test**: Comprehensive testing before QA submission
6. **Document**: Update docs as part of each story
7. **Submit**: Ready for QA review once acceptance criteria met

---

## Contact & Questions

For questions about:
- **Story Details**: Review the specific story file
- **Acceptance Criteria**: Check the AC sections (numbered 1-N)
- **Dev Authority**: All stories grant full investigation authority
- **Timeline/Priority**: Check priority tag (P0/P1/P2) and phase
- **QA Standards**: All acceptance criteria must be met, tests comprehensive

**All stories are actionable and ready for immediate development.**

---

*Created by Scrum Master (Bob) - 2025-11-11*
