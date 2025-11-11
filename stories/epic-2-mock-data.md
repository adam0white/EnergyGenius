# Epic 2: Mock Data Layer

**Status:** ACTIVE
**Priority:** P0 - Critical Path
**Owner:** Dev Team

## Overview

Implement comprehensive mock data structures representing supplier catalog, usage scenarios, and plan details. This provides deterministic test data for demos without requiring live APIs.

## Scope

- Supplier catalog with realistic energy plan attributes
- 12-month usage scenario profiles (residential, business, seasonal variants)
- Type-safe data structures with validation
- Deterministic randomization for intake autofill
- Optional data scraping utility documentation

## Stories

### 2.1 Supplier Catalog Data Structure & Seeding

**Status:** Pending
**Acceptance Criteria:**

- [ ] `src/worker/data/supplier-catalog.ts` defines full supplier schema
- [ ] 8-12 realistic suppliers with varied plan types (fixed rate, variable, renewable)
- [ ] Plan attributes: name, rate, contract_length, renewable_percentage, early_termination_fee
- [ ] TypeScript interfaces for Supplier, Plan, PlanRate with strict typing
- [ ] Data validation (Zod or similar) ensures runtime integrity
- [ ] Catalog exports as const array and validates on module load

### 2.2 Usage Scenario Profiles

**Status:** Pending
**Acceptance Criteria:**

- [ ] `src/worker/data/usage-scenarios.ts` contains 5-6 distinct usage profiles
- [ ] Profiles represent: residential_average, residential_high_summer, residential_high_winter, small_business, etc.
- [ ] Each profile includes 12 months of hourly/daily usage data (kWh)
- [ ] Current plan data included (rate, contract date, early termination fee)
- [ ] User preference hints for each scenario
- [ ] TypeScript interfaces for UsageData, MonthlyUsage, UserPreferences

### 2.3 Mock Data Integration & Autofill

**Status:** Pending
**Acceptance Criteria:**

- [ ] Intake form can select and auto-populate from scenarios
- [ ] "Generate Mock Data" button randomly selects scenario
- [ ] Form fields pre-filled with realistic values
- [ ] Preferences section populated with scenario hints
- [ ] No validation errors when submitting mock data

### 2.4 Mock Data Scraping Utility (Optional Documentation)

**Status:** Pending
**Acceptance Criteria:**

- [ ] `scripts/scrape/powertochoose.ts` documented (no implementation required for MVP)
- [ ] Instructions in `docs/mock-data-playbook.md` for future scraping
- [ ] Example JSON structure for supplier import
- [ ] Script excluded from runtime bundling via .gitignore

## Testing Strategy

- Manual: verify intake form autofills with realistic data
- Check TypeScript compilation for type safety
- Validate schema with sample submissions through pipeline

## Blockers / Risks

- Data accuracy for demo scenarios; may need domain expert review

## Notes

Reference: Tech Spec § "Source Tree Changes" (supplier-catalog.ts, usage-scenarios.ts)
Reference: PRD § "Data Processing" (usage data, plan details, preferences)
