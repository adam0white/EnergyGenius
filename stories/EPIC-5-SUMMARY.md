# Epic 5: Intake & Results UI - All Stories Created

**Status:** READY FOR DEVELOPMENT
**Created:** 2025-11-10
**Target Completion:** 5 stories x 8 hours = 40 hours
**Final Push:** 5/6 epics complete (83% of project)

---

## Story Summary Table

| Story | Title | Lines | ACs | Status |
|-------|-------|-------|-----|--------|
| 5.1 | Enhanced Intake Form Components | 223 | 81 | Ready for Dev |
| 5.2 | Progress Timeline Visualization | 257 | 94 | Ready for Dev |
| 5.3 | Recommendation Display Cards | 292 | 118 | Ready for Dev |
| 5.4 | API Integration Hook | 319 | 107 | Ready for Dev |
| 5.5 | Complete User Flow Integration | 316 | 138 | Ready for Dev |
| **TOTAL** | **5 Stories** | **1,407** | **538** | **100% Ready** |

---

## Story Details

### 5.1: Enhanced Intake Form Components
**Complexity:** Medium | **Owner:** Dev Team

Multi-section intake form with 3 sections:
- Usage Data (kWh consumption, file upload placeholder)
- Current Plan (supplier, rate, contract date)
- Preferences (cost priority, renewable %, flexibility)

Features:
- Client-side validation with inline error messages
- "Generate Mock Data" button for quick testing
- Form submission via useRecommendation hook
- Responsive design (mobile-first)
- 81 acceptance criteria covering layout, validation, UX

**Key Files:**
- `src/ui/components/intake/IntakeForm.tsx` (~200 lines)

---

### 5.2: Progress Timeline Visualization
**Complexity:** Medium | **Owner:** Dev Team

Real-time progress visualization for AI pipeline:
- Vertical stepper showing 3 AI stages (Usage Summary, Plan Scoring, Narrative Generation)
- Status badges (Queued → Running → Complete)
- Stage-specific output/placeholders
- Timestamps for each stage
- Phase 1: Optimistic timing (auto-advance per typical durations)
- Phase 2 ready: SSE updates support

Features:
- Smooth animations and transitions
- Responsive layout (mobile to desktop)
- Accessible semantics and color-independent indicators
- 94 acceptance criteria covering visualization, animation, timing

**Key Files:**
- `src/ui/components/pipeline/ProgressTimeline.tsx` (~250 lines)

---

### 5.3: Recommendation Display Cards
**Complexity:** Medium | **Owner:** Dev Team

Results presentation: top 3 energy plan recommendations
- Supplier name, plan title, projected savings (bold/prominent)
- Contract terms and early termination fees
- Renewable energy percentage
- AI-generated narrative explaining recommendation
- Savings tier badges (Gold/Silver/Bronze)

Features:
- Responsive layout: vertical stack (mobile) to 3-column grid (desktop)
- Sorted by savings (highest first)
- Hover effects and interactive states
- Accessible color + icon + text indicators
- 118 acceptance criteria covering display, sorting, accessibility

**Key Files:**
- `src/ui/components/results/RecommendationDeck.tsx` (~250 lines)

---

### 5.4: API Integration Hook
**Complexity:** Medium | **Owner:** Dev Team

Custom React hook for recommendation engine API:
- `useRecommendation()` exports: submit, result, stages, loading, error
- Handles POST request to `/api/recommend` with intake data
- Request/response validation
- Optimistic UI updates (Phase 1)
- Error handling and retry capability
- Phase 2 ready: SSE feature detection

Features:
- Full TypeScript typing
- Cleanup on unmount (no memory leaks)
- Stages auto-advance on schedule
- Network error handling
- 107 acceptance criteria covering API, validation, error handling

**Key Files:**
- `src/ui/hooks/useRecommendation.ts` (~300 lines)

---

### 5.5: Complete User Flow Integration
**Complexity:** High | **Owner:** Dev Team

End-to-end user journey orchestration:
- State machine: intake → loading → results/error
- Wires up all 4 previous components (5.1, 5.2, 5.3, 5.4)
- Smooth state transitions with scroll management
- Error recovery with retry and "Start Over" button
- Persistent header/footer across states

Features:
- 4-state App component (intake, loading, results, error)
- Scroll position management on transitions
- Full error recovery paths
- Responsive across all devices
- 138 acceptance criteria covering flow, states, UX, accessibility

**Key Files:**
- `src/ui/app/App.tsx` (enhanced with state orchestration)

---

## Development Workflow

### Phase 1: Component Development (Stories 5.1-5.4)

Each story can be developed in parallel or sequence:

1. **5.1 IntakeForm** → Mock data scenarios
   - Define IntakeFormData type
   - Build 3-section form structure
   - Integrate validation and mock data

2. **5.2 ProgressTimeline** → Visual feedback
   - Define Stage type
   - Build vertical stepper with animations
   - Implement optimistic timing

3. **5.3 RecommendationDeck** → Results display
   - Define Recommendation type
   - Build 3-card layout
   - Implement sorting and tier badges

4. **5.4 useRecommendation** → API integration
   - Define hook types
   - Implement submit/request logic
   - Wire up optimistic timing

### Phase 2: Integration (Story 5.5)

5. **5.5 Complete User Flow** → System integration
   - Build state machine in App.tsx
   - Import and wire up components
   - Test full flow end-to-end

---

## Acceptance Criteria Breakdown

**Total: 538 acceptance criteria across 5 stories**

Category distribution:
- **Component Structure & Rendering:** 120 ACs
- **Form Validation & UX:** 95 ACs
- **API Integration & Error Handling:** 85 ACs
- **Responsive Design & Layout:** 95 ACs
- **Accessibility & Code Quality:** 108 ACs

---

## Testing Strategy

### Unit Testing (Per Story)
- Component renders without errors
- Props validation works
- State updates correctly
- Event handlers trigger correctly

### Integration Testing (Story 5.5)
- Form submission triggers API call
- Timeline shows during loading
- Results display after completion
- Error state shows on API failure
- Retry works correctly
- "Start Over" resets entire flow

### Manual Testing
- Fill intake form → submit
- Watch timeline progress through 3 stages
- View recommendation cards
- Click "Start Over" → form resets
- Test responsive layout (mobile, tablet, desktop)
- Verify keyboard navigation
- Test with screen reader

---

## Dependencies & Prerequisites

### Required From Previous Epics
- Epic 1: React/TypeScript setup complete
- Epic 2: Mock data modules available
- Epic 3: API endpoint `/api/recommend` working
- Epic 4: Layout component and Context providers ready

### Technology Stack
- React 19+ (hooks, conditional rendering)
- TypeScript (strict mode)
- Tailwind CSS (styling)
- React Router v6 (for routing if needed)
- Fetch API (native, no axios)

### External Libraries
- shadcn/ui (if using, from Epic 4)
- Icons library (e.g., heroicons, lucide)
- None required for basic implementation

---

## Success Criteria

All 5 stories are "Ready for Development" when:
- ✓ All acceptance criteria clearly written (538 total)
- ✓ Implementation details documented
- ✓ Component file paths specified
- ✓ Integration points mapped
- ✓ Dev can implement without ambiguity

**Gate Decision:** PASS - All stories ready for parallel development

---

## Next Steps

1. Assign dev agents to stories (can work in parallel):
   - Story 5.1: IntakeForm dev
   - Story 5.2: ProgressTimeline dev
   - Story 5.3: RecommendationDeck dev
   - Story 5.4: useRecommendation dev (independent)
   - Story 5.5: Integration lead (wait for 5.1-5.4)

2. Estimated timeline:
   - Stories 5.1-5.4: 6-8 hours each (parallel = 8 hours)
   - Story 5.5: 4-6 hours (serial)
   - Total: ~12-14 hours for Epic 5

3. After Epic 5 complete:
   - 5/6 epics done (83%)
   - Epic 6 (Polish & Deployment) is final push
   - Production ready within reach!

---

**Created by:** Bob (Scrum Master)
**Execution Date:** 2025-11-10
**Project Status:** FINAL SPRINT - Epic 5 ready, Epic 6 incoming!
