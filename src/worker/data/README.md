# Energy Genius Mock Data Module

This module provides structured TypeScript data for supplier plans and usage scenarios used throughout the Energy Genius recommendation pipeline.

## Overview

The data module contains:
- **12 supplier plans** with diverse pricing, renewable options, and contract terms
- **5 usage scenarios** representing different household and business patterns
- **TypeScript interfaces** for all data structures
- **Validation functions** for runtime type checking
- **Immutable data** to prevent accidental modifications

## Module Structure

```
src/worker/data/
├── types.ts              # TypeScript interfaces
├── supplier-catalog.ts   # 12 realistic supplier plans
├── usage-scenarios.ts    # 5 usage profile scenarios
├── validation.ts         # Type guards and validators
├── index.ts             # Barrel export
└── README.md            # This file
```

## Usage

### Importing Data

```typescript
// Import data catalogs
import { supplierCatalog, usageScenarios } from '@/worker/data';

// Import types
import type { SupplierPlan, UsageScenario } from '@/worker/data';

// Import validation functions
import { validateSupplierCatalog, validateUsageScenarios } from '@/worker/data';
```

### Using Supplier Catalog

The supplier catalog contains 12 diverse plans:

```typescript
import { supplierCatalog } from '@/worker/data';

// Get all plans
console.log(`Total plans: ${supplierCatalog.length}`);

// Filter by criteria
const greenPlans = supplierCatalog.filter(plan => plan.renewablePercent > 70);
const budgetPlans = supplierCatalog.filter(plan => plan.baseRate < 0.10);
const flexiblePlans = supplierCatalog.filter(plan => plan.contractTermMonths <= 6);

// Access plan details
const plan = supplierCatalog[0];
console.log(`${plan.supplier} - ${plan.planName}`);
console.log(`Rate: $${plan.baseRate}/kWh + $${plan.monthlyFee}/month`);
console.log(`Renewable: ${plan.renewablePercent}%`);
```

### Using Usage Scenarios

The module includes 5 realistic usage scenarios:

```typescript
import { usageScenarios } from '@/worker/data';

// Get all scenarios
console.log(`Total scenarios: ${usageScenarios.length}`);

// Find a specific scenario
const avgHousehold = usageScenarios.find(s => s.id === 'scenario-avg');

// Calculate costs for a scenario
function calculateAnnualCost(scenario: UsageScenario, rate: number, monthlyFee: number) {
  const energyCost = scenario.annualKWh * rate;
  const feeCost = monthlyFee * 12;
  return energyCost + feeCost;
}

const cost = calculateAnnualCost(avgHousehold, 0.12, 15);
console.log(`Annual cost: $${cost.toFixed(2)}`);
```

### Validation

Use validation functions to verify data integrity:

```typescript
import { validateSupplierCatalog, validateUsageScenarios } from '@/worker/data';
import { supplierCatalog, usageScenarios } from '@/worker/data';

try {
  // Validate entire catalogs
  validateSupplierCatalog(supplierCatalog);
  validateUsageScenarios(usageScenarios);
  console.log('Data validation passed!');
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

## Supplier Catalog Details

### Diversity & Coverage

- **12 total plans** from 12 different suppliers
- **Base rates:** $0.085 - $0.135 per kWh
- **Monthly fees:** $0 - $25
- **Contract terms:** 3, 6, 12, and 24 months
- **Renewable energy:** 10% - 100%
- **States covered:** TX, CA, NY, PA, OH, IL, MA, and more

### Plan Categories

**High Renewable (>70%):**
- Eco Max (90%)
- Premium Stability (100%)
- Solar Strong (85%)
- Wind Powered Pro (95%)

**Budget-Friendly (<$0.10/kWh):**
- Budget Friendly ($0.089)
- Ultimate Value ($0.085)
- Economy Plus ($0.095)

**Flexible (≤6 months):**
- Balanced Green (6 months)
- Flex Saver (3 months)

### Sample Plan Structure

```typescript
{
  id: "plan-eco-001",
  supplier: "Green Energy Co",
  planName: "Eco Max",
  baseRate: 0.12,              // $/kWh
  monthlyFee: 15,              // $/month
  contractTermMonths: 12,
  earlyTerminationFee: 0,      // No penalty
  renewablePercent: 90,         // 90% renewable
  ratings: {
    reliabilityScore: 4.5,     // 1-5 scale
    customerServiceScore: 4.3
  },
  features: [
    "24/7 Customer Support",
    "Green Incentives",
    "Online Bill Pay",
    "Mobile App"
  ],
  availableInStates: ["TX", "CA", "NY", "IL", "PA"]
}
```

## Usage Scenarios Details

### Available Scenarios

1. **Average Household** (10,800 kWh/year)
   - Type: Residential
   - Pattern: Slight summer increase
   - Range: 780-1,100 kWh/month

2. **High Summer Usage** (14,400 kWh/year)
   - Type: Seasonal-High
   - Pattern: Heavy summer AC usage
   - Range: 700-1,650 kWh/month

3. **Low Usage (Efficient)** (6,000 kWh/year)
   - Type: Residential
   - Pattern: Consistent year-round
   - Range: 420-600 kWh/month

4. **Small Business** (26,000 kWh/year)
   - Type: Small-Business
   - Pattern: Consistent with slight summer increase
   - Range: 1,900-2,400 kWh/month

5. **Winter-Heavy Usage** (13,200 kWh/year)
   - Type: Seasonal-Low
   - Pattern: High winter heating needs
   - Range: 650-1,500 kWh/month

### Sample Scenario Structure

```typescript
{
  id: "scenario-avg",
  name: "Average Household",
  description: "Typical suburban home with electric heating and cooling",
  type: "residential",
  monthlyUsage: [
    { month: 1, kWh: 920 },
    { month: 2, kWh: 850 },
    // ... 10 more months
  ],
  annualKWh: 10800,
  averageMonthlyKWh: 900
}
```

## Adding New Data

### Adding a New Supplier Plan

Edit `src/worker/data/supplier-catalog.ts`:

```typescript
export const supplierCatalog: readonly SupplierPlan[] = [
  // ... existing plans
  {
    id: "plan-new-001",
    supplier: "New Supplier",
    planName: "New Plan",
    baseRate: 0.11,
    monthlyFee: 10,
    contractTermMonths: 12,
    earlyTerminationFee: 0,
    renewablePercent: 50,
    ratings: {
      reliabilityScore: 4.0,
      customerServiceScore: 4.0
    },
    features: [
      "Feature 1",
      "Feature 2",
      "Feature 3"
    ],
    availableInStates: ["TX", "CA"]
  }
] as const;
```

### Adding a New Usage Scenario

Edit `src/worker/data/usage-scenarios.ts`:

```typescript
export const usageScenarios: readonly UsageScenario[] = [
  // ... existing scenarios
  {
    id: "scenario-new",
    name: "New Usage Pattern",
    description: "Description of usage pattern",
    type: "residential",
    monthlyUsage: [
      { month: 1, kWh: 800 },
      { month: 2, kWh: 750 },
      // ... must include all 12 months
    ],
    annualKWh: 9600,  // Must equal sum of monthly kWh
    averageMonthlyKWh: 800  // Must equal annualKWh / 12
  }
] as const;
```

**Important:** Ensure annual and average calculations are correct!

## Data Immutability

All data is marked as immutable using `as const` to prevent accidental modifications:

```typescript
// This will cause a TypeScript error:
supplierCatalog[0].baseRate = 0.15;  // ❌ Error: Cannot assign to 'baseRate'

// Data should only be read, not modified:
const rate = supplierCatalog[0].baseRate;  // ✅ OK
```

## Type Definitions

### SupplierPlan Interface

```typescript
interface SupplierPlan {
  id: string;
  supplier: string;
  planName: string;
  baseRate: number;              // $/kWh
  monthlyFee: number;            // $/month
  contractTermMonths: number;    // 3, 6, 12, or 24
  earlyTerminationFee: number;   // $, 0 for no penalty
  renewablePercent: number;      // 0-100
  ratings: {
    reliabilityScore: number;    // 1-5
    customerServiceScore: number; // 1-5
  };
  features: string[];
  availableInStates: string[];
}
```

### UsageScenario Interface

```typescript
interface UsageScenario {
  id: string;
  name: string;
  description: string;
  type: "residential" | "small-business" | "seasonal-high" | "seasonal-low";
  monthlyUsage: UsageData[];     // Array of 12 entries
  annualKWh: number;             // Total annual consumption
  averageMonthlyKWh: number;     // Calculated average
}

interface UsageData {
  month: number;    // 1-12
  kWh: number;      // Consumption for that month
}
```

## Validation Functions

### Type Guards

```typescript
validateSupplierPlan(plan: any): plan is SupplierPlan
validateUsageScenario(scenario: any): scenario is UsageScenario
validateCurrentPlan(plan: any): plan is CurrentPlan
```

### Catalog Validators

```typescript
validateSupplierCatalog(catalog: unknown): void  // Throws on error
validateUsageScenarios(scenarios: unknown): void // Throws on error
```

## Notes

- Data is used by the recommendation pipeline for plan scoring
- All monetary values are in USD
- Usage data is in kilowatt-hours (kWh)
- State abbreviations use standard 2-letter codes
- Quality ratings use a 1-5 scale (5 = best)
- Data reflects realistic US electricity market conditions

## Future Enhancements

Potential additions:
- Time-of-use pricing plans
- Demand response programs
- Solar buyback rates
- Seasonal rate variations
- Regional pricing differences
- Additional usage scenario types (apartments, large businesses, etc.)

---

**Last Updated:** 2025-11-10
**Version:** 1.0
**Related Stories:** Epic 1, Story 1.3
