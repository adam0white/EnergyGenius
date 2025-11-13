# Epic 7: Post-Launch Improvements & Bug Fixes

**Status:** Planning
**Priority:** P1 - Critical
**Target Duration:** TBD (depends on complexity)

---

## Epic Summary

Based on user feedback and QA findings after launch, this epic addresses three critical issues:

1. **Performance** - Recommendations take 45-60 seconds, with progress UI misleading users
2. **UX/Readability** - "Why" explanations need better formatting for comprehension
3. **QA/Testing** - Once fixes are done, comprehensive exploratory testing needed

---

## User Feedback Issues

### Issue 1: Performance - Slow Recommendation Time

**User Complaint:** "Recommendation takes almost a minute to complete. Progress UI shows success after ~10 seconds but then waits."

**Root Cause to Investigate:**

- Current model may not be optimal for speed
- Workers AI has multiple available models with different speed/quality trade-offs
- Need to research faster models via context7 MCP

**Related Stories:**

- Story 7.1: Workers AI Model Performance Investigation & Optimization
- Story 7.3: Fix Progress Timeline Timing Issue

### Issue 2: UX - "Why" Section Formatting

**User Complaint:** "The 'Why' explanation for recommendations is just a text block and hard to read."

**Solution Approach:**

- Parse the natural structure in Claude's explanations
- Format as lists, paragraphs, key metrics
- Maintain Tailwind design consistency
- Ensure mobile responsiveness

**Related Stories:**

- Story 7.2: Fix "Why" Section Formatting

### Issue 3: QA - Exploratory Testing (Post-Fixes)

**Not yet scheduled** - Will use Playwright MCP for browser-based testing once Issues 1 & 2 are fixed.

---

## Stories in This Epic

### Story 7.1: Workers AI Model Performance Investigation & Optimization

- **Status:** Ready for Development
- **Priority:** P1 - Critical
- **Complexity:** High
- **Goals:**
  - Research available Workers AI models using context7 MCP
  - Benchmark current and alternative models
  - Select faster model maintaining quality
  - Target: Reduce recommendation time from 60s to 20s
  - Document AI model selection rationale

### Story 7.2: Fix "Why" Section Formatting

- **Status:** Ready for Development
- **Priority:** P2 - UX Enhancement
- **Complexity:** Medium
- **Goals:**
  - Parse "Why" section structure from Claude responses
  - Implement improved visual formatting (lists, paragraphs, metrics)
  - Ensure responsive design on all devices
  - Test with real recommendations
  - Maintain accessibility standards

### Story 7.3: Fix Progress Timeline Timing Issue

- **Status:** Ready for Development
- **Priority:** P1 - Critical
- **Complexity:** Medium
- **Goals:**
  - Investigate why progress shows "Complete" at 10s but waits 50s more
  - Root cause analysis of timing mismatch
  - Fix progress state transitions
  - Add comprehensive timing instrumentation
  - Coordinate with Story 7.1 for combined impact

---

## Implementation Notes

### Dependency Relationships

**Story Execution Order Recommendation:**

1. **Start: Story 7.1** (longest/highest impact)
   - Uses context7 MCP for model research
   - Benchmarking will take time
   - Will naturally improve timing for all users

2. **Parallel: Story 7.2** (independent)
   - Can proceed in parallel
   - No dependencies on 7.1 or 7.3
   - Pure UI/UX improvement

3. **Parallel: Story 7.3** (somewhat dependent on 7.1)
   - Can start investigations immediately
   - May be partially blocked by 7.1 timing improvements
   - Best to wait for 7.1 results to verify proper timing

4. **Future: QA Testing** (after 7.1, 7.2, 7.3)
   - Use Playwright MCP for exploratory testing
   - Test all improvements together
   - Find remaining bugs/suggestions

### MCPs Involved

- **context7 MCP**: Story 7.1 - Research available Workers AI models
- **Playwright MCP**: Future QA story - Exploratory testing and bug finding

---

## Success Criteria for Epic

- [ ] All three stories (7.1, 7.2, 7.3) moved to "Ready for Development"
- [ ] Recommendation time reduced from 60s to <25s (via 7.1)
- [ ] Progress timeline accurately reflects actual progress (via 7.3)
- [ ] "Why" explanations properly formatted and readable (via 7.2)
- [ ] No regressions in quality or functionality
- [ ] All changes documented in `/docs/architecture.md`

---

## Testing Strategy

### For Story 7.1 (Model Performance)

- Benchmark test harness with 5+ sample inputs
- Compare speed and quality across models
- Final validation with staging deployment

### For Story 7.2 (Why Formatting)

- Visual testing on desktop/tablet/mobile
- Accessibility verification (color contrast, semantic HTML)
- Test with diverse recommendation types

### For Story 7.3 (Progress Timing)

- 5+ test submissions with full logging
- Verify timing matches actual worker progress
- Check no premature state transitions

### For Entire Epic

- Exploratory testing (Story 7.4 - future, using Playwright MCP)
- User acceptance testing with real workflows
- Performance monitoring in production

---

## Files & Documentation

### Created Documentation

- `/docs/ai-model-analysis.md` - Model research findings (Story 7.1)
- `/docs/ai-model-optimization.md` - Model selection rationale (Story 7.1)

### Modified Documentation

- `/docs/architecture.md` - All three stories update this file
- `wrangler.toml` - Model configuration changes (Story 7.1)

### Code Files

- `/src/worker/index.ts` - Add timing instrumentation (7.1, 7.3)
- `/src/worker/ai/orchestration.ts` - Timing investigation (7.3)
- `/src/worker/ai/response-parsing.ts` - Add "Why" parser (7.2)
- `/src/ui/components/RecommendationCard.tsx` - Format "Why" section (7.2)
- `/src/ui/components/ProgressTimeline.tsx` - Fix timing logic (7.3)
- `/src/ui/hooks/useRecommendation.ts` - Timing investigation (7.3)

---

## Notes for Development

- **Performance is critical**: Story 7.1 directly addresses the 60s wait time complaint
- **UX matters**: Story 7.2 improves user understanding of recommendations
- **Transparency important**: Story 7.3 ensures users understand what's happening
- **Combined impact**: These stories work together to significantly improve user experience
- **QA testing**: Planned for after these three stories complete, using Playwright MCP

---

## Retrospective Template (After Epic Complete)

- [ ] Did we achieve <25s recommendation time?
- [ ] Are users satisfied with "Why" formatting?
- [ ] Is progress timeline now accurate?
- [ ] Were there unexpected blockers?
- [ ] What did we learn about model selection/performance?
- [ ] What improvements should we consider for next phase?
