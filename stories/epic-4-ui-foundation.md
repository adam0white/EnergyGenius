# Epic 4: React UI Foundation

**Status:** ACTIVE
**Priority:** P0 - Critical Path
**Owner:** Dev Team

## Overview

Establish React application structure, component hierarchy, and styling foundation using shadcn/ui and Tailwind CSS. This epic builds the container and shared infrastructure for intake, pipeline, and results UI.

## Scope

- React entry point and App wrapper component
- Component hierarchy and file organization
- Context providers for state management
- Tailwind CSS configuration and utility setup
- Accessibility baseline (ARIA labels, keyboard navigation)
- Responsive layout framework
- Loading and error state utilities

## Stories

### 4.1 React App Structure & Entry Point

**Status:** Pending
**Acceptance Criteria:**

- [ ] `src/ui/main.tsx` mounts React app into DOM
- [ ] `src/ui/app/App.tsx` defines top-level layout and routing
- [ ] App context provider wraps children (RecommendationContext or similar)
- [ ] TypeScript strict mode enabled
- [ ] React development mode warnings resolved
- [ ] App loads without console errors in `npm run dev`

### 4.2 Tailwind CSS & Component Styling Setup

**Status:** Pending
**Acceptance Criteria:**

- [ ] Tailwind CSS configured in vite.config.ts
- [ ] tailwind.config.ts defines color palette, spacing, typography
- [ ] shadcn/ui components generate with Tailwind utilities
- [ ] Custom CSS module loaded globally
- [ ] Responsive classes (sm, md, lg, xl) functional
- [ ] Dark mode setup available (optional for MVP)

### 4.3 Layout Component & Page Structure

**Status:** Pending
**Acceptance Criteria:**

- [ ] `src/ui/components/layout/Layout.tsx` provides header/footer/main sections
- [ ] Header displays app title and basic navigation
- [ ] Footer includes deployment info and links
- [ ] Main content area responsive (mobile-first, desktop-optimized)
- [ ] Grid/flex layout supports multi-column desktop view
- [ ] Vertical stacking on mobile (< 768px)

### 4.4 Global State Management Setup

**Status:** Pending
**Acceptance Criteria:**

- [ ] RecommendationContext created for shared pipeline state
- [ ] Context provider wraps App
- [ ] State includes: recommendations, pipeline stages, user intake data, errors
- [ ] useRecommendation custom hook exports context
- [ ] TypeScript types defined for context shape
- [ ] No external state management library required (Context API sufficient)

### 4.5 Loading & Error Utilities

**Status:** Pending
**Acceptance Criteria:**

- [ ] Loading spinner component using shadcn
- [ ] Error alert component with retry capability
- [ ] Empty state component for initial load
- [ ] Skeleton/shimmer component for progressive loading
- [ ] Utility functions for error formatting
- [ ] TypeScript error type definitions

## Testing Strategy

- Manual: verify app structure and component mounting
- Check TypeScript compilation for type safety
- Test responsive layout manually across breakpoints
- Verify accessibility: keyboard Tab navigation, ARIA labels

## Blockers / Risks

- Tailwind compatibility with Cloudflare Workers assets binding
- Component library CSS bundling in static assets

## Notes

Reference: Tech Spec § "UX/UI Considerations" (timeline, intake form, results display)
Reference: Tech Spec § "Source Tree Changes" (src/ui/main.tsx, src/ui/app/App.tsx)
