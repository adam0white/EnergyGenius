# Epic 6: Integration & Polish

**Status:** ACTIVE
**Priority:** P1 - Completion & Quality
**Owner:** Dev Team

## Overview

Complete end-to-end integration testing, responsive design validation, accessibility compliance, and deployment readiness. Prepare the application for demo and production deployment.

## Scope

- Manual QA across all user flows
- Responsive design testing (mobile, tablet, desktop)
- Accessibility validation (WCAG 2.1 basics)
- Error scenario testing
- Performance optimization and monitoring
- Deployment verification
- Documentation and deployment guides
- Demo scenario validation

## Stories

### 6.1 End-to-End Integration Testing
**Status:** Pending
**Acceptance Criteria:**
- [ ] Complete flow testing: intake → pipeline → results (all mock scenarios)
- [ ] Test 3 scenario types: residential, business, seasonal
- [ ] Verify all UI components render correctly
- [ ] Validate API request/response payloads with browser DevTools
- [ ] Test form validation (empty, invalid, edge cases)
- [ ] Test error scenarios (API failure, timeout, network error)
- [ ] Retry button functionality verified
- [ ] "Start Over" resets state cleanly
- [ ] Results persist until new submission

### 6.2 Responsive Design & Mobile Optimization
**Status:** Pending
**Acceptance Criteria:**
- [ ] Mobile layout validated on 375px (iPhone SE)
- [ ] Tablet layout validated on 768px (iPad)
- [ ] Desktop layout validated on 1920px
- [ ] Touch targets minimum 44px (mobile accessibility)
- [ ] Forms usable on mobile (no horizontal scroll)
- [ ] ProgressTimeline stacks vertically on mobile
- [ ] RecommendationDeck single-column on mobile
- [ ] Viewport meta tag and responsive CSS applied
- [ ] No layout shift during loading states

### 6.3 Accessibility Compliance & Testing
**Status:** Pending
**Acceptance Criteria:**
- [ ] Keyboard navigation: Tab through all interactive elements
- [ ] Focus indicators visible on all buttons/inputs
- [ ] Form labels linked to inputs (ARIA labels, htmlFor)
- [ ] ProgressTimeline announces stage updates (ARIA live regions)
- [ ] Color contrast: text passes WCAG AA (4.5:1)
- [ ] Error messages announced to screen readers
- [ ] No keyboard traps
- [ ] Semantic HTML (button, input, form elements)
- [ ] Screen reader tested (VoiceOver on macOS)

### 6.4 Performance Optimization
**Status:** Pending
**Acceptance Criteria:**
- [ ] Bundle size < 100KB (gzipped JS)
- [ ] CSS bundled efficiently via Tailwind
- [ ] Images optimized (if any added)
- [ ] API response time logged and tracked (<20s target)
- [ ] Initial page load < 2s (local dev benchmark)
- [ ] No console errors or warnings
- [ ] Lighthouse score reviewed (mobile/desktop)

### 6.5 Deployment & Monitoring Setup
**Status:** Pending
**Acceptance Criteria:**
- [ ] Wrangler deployment succeeds without errors
- [ ] Worker URL responds to GET (SPA loads)
- [ ] POST /api/recommend works from deployed URL
- [ ] Mock data button functions in deployed version
- [ ] Cloudflare Worker logs accessible via `wrangler tail`
- [ ] Error logging captures stage failures
- [ ] Performance metrics logged (timing per stage)
- [ ] Deployment documented in README

### 6.6 Documentation & Deployment Guide
**Status:** Pending
**Acceptance Criteria:**
- [ ] `README.md` updated with project overview
- [ ] Setup instructions: clone, npm install, wrangler auth
- [ ] Local dev instructions: `npm run dev`
- [ ] Build & deploy: `npm run build && npm run deploy`
- [ ] Environment variables documented (.env.example)
- [ ] Troubleshooting section for common issues
- [ ] `docs/pipeline-overview.md` summarizes AI stages for future devs
- [ ] `docs/testing-notes.md` records QA scenarios and results

### 6.7 Demo Scenario Validation & Polishing
**Status:** Pending
**Acceptance Criteria:**
- [ ] 3 polished demo scenarios created:
  - [ ] Residential (average usage, cost-focused)
  - [ ] Small business (high usage, sustainability)
  - [ ] Seasonal (summer peak, winter baseline)
- [ ] Each scenario produces meaningful recommendations
- [ ] Narrative text is clear and compelling
- [ ] Savings projections are realistic
- [ ] No AI errors or hallucinations in outputs
- [ ] Demo walkthrough documented with talking points

## Testing Strategy

- Manual QA across all browsers (Chrome, Safari, Firefox)
- Real device testing on iPhone and Android
- Accessibility testing with keyboard and screen reader
- Performance profiling via browser DevTools
- Load testing via wrangler dev multiple submissions
- Deployment verification on staging Workers environment

## Blockers / Risks

- AI output quality variability (may require prompt tuning)
- Performance may not meet <2s target (15-20s more realistic)
- Accessibility testing requires manual effort

## Notes

Reference: Tech Spec § "Testing Strategy" (manual QA focus)
Reference: Tech Spec § "Deployment Strategy" (steps, rollback, monitoring)
Reference: PRD § "Non-Functional Requirements" (performance, security, accessibility)
