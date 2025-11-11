# Epic 5: Intake & Results UI

**Status:** ACTIVE
**Priority:** P0 - Core Feature
**Owner:** Dev Team

## Overview

Implement user-facing components for data intake, AI progress visualization, and recommendation presentation. This epic delivers the primary user interaction loop.

## Scope

- Multi-section intake form with validation
- Mock data generation button
- Progress timeline showing AI pipeline stages
- Recommendation result cards with savings and plan details
- Form submission and response handling
- User feedback integration points
- Responsive design for mobile and desktop

## Stories

### 5.1 Intake Form Component
**Status:** Pending
**Acceptance Criteria:**
- [ ] `src/ui/components/intake/IntakeForm.tsx` created with sections:
  - [ ] Usage data section (12-month kWh input, file upload placeholder)
  - [ ] Current plan section (supplier, rate, contract end date)
  - [ ] Preferences section (cost priority, flexibility, renewable %)
- [ ] Form validation: required fields, number ranges, date formats
- [ ] "Generate Mock Data" button pre-fills form from scenarios
- [ ] Submit button triggers API call via useRecommendation hook
- [ ] Form disabled during submission (loading state)
- [ ] Error messages display inline near fields
- [ ] Reset button clears all fields

### 5.2 Progress Timeline Component
**Status:** Pending
**Acceptance Criteria:**
- [ ] `src/ui/components/pipeline/ProgressTimeline.tsx` created
- [ ] Vertical stepper showing 3 AI stages:
  - [ ] 1. Usage Summary
  - [ ] 2. Plan Scoring
  - [ ] 3. Narrative Generation
- [ ] Each stage shows status badge: Queued → Running → Complete
- [ ] Stage card shows partial output/placeholder during execution
- [ ] Expandable cards for detailed stage output (optional)
- [ ] Timestamps displayed for each stage start/end
- [ ] Phase 1: optimistic timing (auto-advance per typical durations)
- [ ] Smooth transitions and animations

### 5.3 Recommendation Cards Component
**Status:** Pending
**Acceptance Criteria:**
- [ ] `src/ui/components/results/RecommendationDeck.tsx` created
- [ ] Displays top 3 plan recommendations as cards
- [ ] Each card includes:
  - [ ] Supplier name and plan title
  - [ ] Projected annual savings (bold, prominent)
  - [ ] Contract length and early termination fee
  - [ ] Renewable energy percentage
  - [ ] AI-generated narrative explaining the recommendation
  - [ ] Badge for savings tier (gold/silver/bronze)
- [ ] Cards sorted by savings (highest first)
- [ ] Desktop: side-by-side layout (3 columns)
- [ ] Mobile: vertical stack
- [ ] Hover state shows additional details

### 5.4 API Integration Hook
**Status:** Pending
**Acceptance Criteria:**
- [ ] `src/ui/hooks/useRecommendation.ts` custom hook
- [ ] Exports: submit(intake), result, stages, loading, error
- [ ] POST request to /api/recommend with intake data
- [ ] Optimistic UI updates for Phase 1 (stages advance on schedule)
- [ ] Response handling: extract recommendations and metadata
- [ ] Error handling: catch network errors, API errors, display message
- [ ] Retry capability on failure
- [ ] Phase 2 ready: SSE feature detection (no implementation required)

### 5.5 Form Submission & Result Flow
**Status:** Pending
**Acceptance Criteria:**
- [ ] IntakeForm submits via useRecommendation hook
- [ ] App state transitions: intake → loading → results
- [ ] ProgressTimeline displays during loading
- [ ] RecommendationDeck renders once result received
- [ ] "Start Over" button resets form and returns to intake state
- [ ] Previous recommendations accessible (scroll/tab)
- [ ] Error state shows user-friendly message with retry button

## Testing Strategy

- Manual: fill intake form, submit, verify timeline and results display
- Test "Generate Mock Data" button autofill accuracy
- Validate form error messages for edge cases (empty, invalid formats)
- Test responsive layout on mobile devices
- Verify all three AI stages show in timeline

## Blockers / Risks

- AI response quality impacts narrative display
- Network latency affects perceived performance

## Notes

Reference: Tech Spec § "Technical Details" (intake workflow, submission flow, stage orchestration)
Reference: Tech Spec § "UX/UI Considerations" (timeline visualization, intake form, results display)
Reference: PRD § "User Experience & Design Considerations" (intuitive interface, mobile-friendly)
