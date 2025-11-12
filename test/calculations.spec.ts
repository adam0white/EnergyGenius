/**
 * Unit Tests for Cost Calculation Utilities
 *
 * Story 10.4: Move Cost Calculations from LLM to TypeScript
 * Tests verify that TypeScript calculations produce correct, reliable results
 */

import { describe, it, expect } from 'vitest';
import {
	calculatePlanCosts,
	calculateMultiplePlanCosts,
	calculateAnnualCost,
	calculateSavings,
} from '../src/worker/lib/calculations';

describe('Cost Calculation Utilities', () => {
	describe('calculateAnnualCost', () => {
		it('should calculate annual cost for typical residential plan', () => {
			// Example: $0.108/kWh, $9.95/month, 11,000 kWh/year
			const result = calculateAnnualCost(0.108, 9.95, 11000);

			// Expected: (0.108 × 11,000) + (9.95 × 12) = 1,188 + 119.40 = 1,307.40
			expect(result).toBe(1307.40);
		});

		it('should calculate annual cost for expensive plan', () => {
			// Example: $0.19/kWh, $9.95/month, 11,000 kWh/year
			const result = calculateAnnualCost(0.19, 9.95, 11000);

			// Expected: (0.19 × 11,000) + (9.95 × 12) = 2,090 + 119.40 = 2,209.40
			expect(result).toBe(2209.40);
		});

		it('should handle zero monthly fee', () => {
			const result = calculateAnnualCost(0.10, 0, 10000);
			expect(result).toBe(1000.00);
		});

		it('should handle high usage customer', () => {
			// 20,000 kWh/year (double typical usage)
			const result = calculateAnnualCost(0.10, 5.00, 20000);

			// Expected: (0.10 × 20,000) + (5.00 × 12) = 2,000 + 60 = 2,060
			expect(result).toBe(2060.00);
		});

		it('should round to 2 decimal places', () => {
			const result = calculateAnnualCost(0.108333, 9.95, 11000);
			// Should round to cents
			expect(result.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
		});

		it('should throw error for negative baseRate', () => {
			expect(() => calculateAnnualCost(-0.10, 9.95, 11000)).toThrow('Invalid inputs');
		});

		it('should throw error for negative monthlyFee', () => {
			expect(() => calculateAnnualCost(0.10, -9.95, 11000)).toThrow('Invalid inputs');
		});

		it('should throw error for zero or negative usage', () => {
			expect(() => calculateAnnualCost(0.10, 9.95, 0)).toThrow('Invalid inputs');
			expect(() => calculateAnnualCost(0.10, 9.95, -1000)).toThrow('Invalid inputs');
		});
	});

	describe('calculateSavings', () => {
		it('should calculate savings correctly', () => {
			// Current: $1,549/year, New: $1,307.40/year
			const result = calculateSavings(1549, 1307.40);

			expect(result.amount).toBe(241.60);
			// 241.60 / 1549 = 15.60%
			expect(result.percent).toBeCloseTo(15.60, 1);
		});

		it('should handle negative savings (more expensive plan)', () => {
			const result = calculateSavings(1000, 1200);

			expect(result.amount).toBe(-200);
			expect(result.percent).toBe(-20);
		});

		it('should handle zero current cost', () => {
			const result = calculateSavings(0, 1000);

			expect(result.amount).toBe(-1000);
			expect(result.percent).toBe(0); // Avoid division by zero
		});

		it('should round to 2 decimal places', () => {
			const result = calculateSavings(1549.99, 1307.43);

			expect(result.amount.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
			expect(result.percent.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
		});

		it('should throw error for negative costs', () => {
			expect(() => calculateSavings(-1000, 500)).toThrow('Invalid costs');
			expect(() => calculateSavings(1000, -500)).toThrow('Invalid costs');
		});
	});

	describe('calculatePlanCosts', () => {
		it('should calculate all cost metrics for typical plan', () => {
			const plan = { baseRate: 0.108, monthlyFee: 9.95 };
			const currentAnnualCost = 1549;
			const totalAnnualUsage = 11000;

			const result = calculatePlanCosts(plan, currentAnnualCost, totalAnnualUsage);

			// Expected annual cost: (0.108 × 11,000) + (9.95 × 12) = 1,307.40
			expect(result.estimatedAnnualCost).toBe(1307.40);

			// Expected savings: 1,549 - 1,307.40 = 241.60
			expect(result.estimatedSavings).toBe(241.60);

			// Expected savings percent: (241.60 / 1,549) × 100 = 15.60%
			expect(result.savingsPercent).toBeCloseTo(15.60, 1);
		});

		it('should calculate for plan with no savings', () => {
			const plan = { baseRate: 0.14, monthlyFee: 9.95 };
			const currentAnnualCost = 1549;
			const totalAnnualUsage = 11000;

			const result = calculatePlanCosts(plan, currentAnnualCost, totalAnnualUsage);

			// Expected annual cost: (0.14 × 11,000) + (9.95 × 12) = 1,659.40
			expect(result.estimatedAnnualCost).toBe(1659.40);

			// Expected savings: 1,549 - 1,659.40 = -110.40 (negative = more expensive)
			expect(result.estimatedSavings).toBe(-110.40);

			// Expected savings percent: negative
			expect(result.savingsPercent).toBeLessThan(0);
		});

		it('should handle very cheap plan with high savings', () => {
			const plan = { baseRate: 0.08, monthlyFee: 0 };
			const currentAnnualCost = 1549;
			const totalAnnualUsage = 11000;

			const result = calculatePlanCosts(plan, currentAnnualCost, totalAnnualUsage);

			// Expected annual cost: (0.08 × 11,000) + (0 × 12) = 880.00
			expect(result.estimatedAnnualCost).toBe(880.00);

			// Expected savings: 1,549 - 880 = 669
			expect(result.estimatedSavings).toBe(669.00);

			// Expected savings percent: (669 / 1,549) × 100 ≈ 43.19%
			expect(result.savingsPercent).toBeGreaterThan(43);
		});

		it('should throw error for invalid plan baseRate', () => {
			const plan = { baseRate: -0.10, monthlyFee: 9.95 };
			expect(() => calculatePlanCosts(plan, 1549, 11000)).toThrow('Invalid baseRate');
		});

		it('should throw error for invalid plan monthlyFee', () => {
			const plan = { baseRate: 0.10, monthlyFee: -9.95 };
			expect(() => calculatePlanCosts(plan, 1549, 11000)).toThrow('Invalid monthlyFee');
		});

		it('should throw error for invalid currentAnnualCost', () => {
			const plan = { baseRate: 0.10, monthlyFee: 9.95 };
			expect(() => calculatePlanCosts(plan, -1000, 11000)).toThrow('Invalid currentAnnualCost');
		});

		it('should throw error for invalid totalAnnualUsage', () => {
			const plan = { baseRate: 0.10, monthlyFee: 9.95 };
			expect(() => calculatePlanCosts(plan, 1549, 0)).toThrow('Invalid totalAnnualUsage');
			expect(() => calculatePlanCosts(plan, 1549, -1000)).toThrow('Invalid totalAnnualUsage');
		});
	});

	describe('calculateMultiplePlanCosts', () => {
		it('should calculate costs for multiple plans', () => {
			const plans = [
				{ id: 'plan-1', baseRate: 0.108, monthlyFee: 9.95 },
				{ id: 'plan-2', baseRate: 0.12, monthlyFee: 5.00 },
				{ id: 'plan-3', baseRate: 0.10, monthlyFee: 15.00 },
			];

			const costMap = calculateMultiplePlanCosts(plans, 1549, 11000);

			expect(costMap.size).toBe(3);

			// Verify plan-1
			const plan1Cost = costMap.get('plan-1');
			expect(plan1Cost).toBeDefined();
			expect(plan1Cost?.estimatedAnnualCost).toBe(1307.40);
			expect(plan1Cost?.estimatedSavings).toBe(241.60);

			// Verify plan-2
			const plan2Cost = costMap.get('plan-2');
			expect(plan2Cost).toBeDefined();
			expect(plan2Cost?.estimatedAnnualCost).toBe(1380.00); // (0.12 × 11,000) + (5 × 12)

			// Verify plan-3
			const plan3Cost = costMap.get('plan-3');
			expect(plan3Cost).toBeDefined();
			expect(plan3Cost?.estimatedAnnualCost).toBe(1280.00); // (0.10 × 11,000) + (15 × 12)
		});

		it('should handle empty plan array', () => {
			const costMap = calculateMultiplePlanCosts([], 1549, 11000);
			expect(costMap.size).toBe(0);
		});

		it('should handle plan with invalid data gracefully', () => {
			const plans = [
				{ id: 'plan-1', baseRate: 0.108, monthlyFee: 9.95 },
				{ id: 'plan-2', baseRate: -0.10, monthlyFee: 5.00 }, // Invalid baseRate
				{ id: 'plan-3', baseRate: 0.10, monthlyFee: 15.00 },
			];

			const costMap = calculateMultiplePlanCosts(plans, 1549, 11000);

			// Should calculate 3 plans (invalid plan gets fallback)
			expect(costMap.size).toBe(3);

			// plan-2 should have fallback values (zero savings)
			const plan2Cost = costMap.get('plan-2');
			expect(plan2Cost).toBeDefined();
			expect(plan2Cost?.estimatedSavings).toBe(0);
		});

		it('should use O(1) lookup with Map', () => {
			const plans = Array.from({ length: 100 }, (_, i) => ({
				id: `plan-${i}`,
				baseRate: 0.10 + i * 0.001,
				monthlyFee: 5.00 + i * 0.5,
			}));

			const costMap = calculateMultiplePlanCosts(plans, 1549, 11000);

			expect(costMap.size).toBe(100);

			// Verify O(1) lookup works
			const plan50Cost = costMap.get('plan-50');
			expect(plan50Cost).toBeDefined();
		});
	});

	describe('Integration: Real-world scenarios from story', () => {
		it('should match story example: cheap plan', () => {
			// From story testing section:
			// Cheap plan: $0.108/kWh, $9.95/month, 11,000 kWh/year
			// Expected: ~$1,307/year
			const result = calculateAnnualCost(0.108, 9.95, 11000);

			expect(result).toBe(1307.40);
		});

		it('should match story example: expensive plan', () => {
			// From story testing section:
			// Expensive plan: $0.19/kWh, $9.95/month, 11,000 kWh/year
			// Expected: ~$2,209/year
			const result = calculateAnnualCost(0.19, 9.95, 11000);

			expect(result).toBe(2209.40);
		});

		it('should match story example: savings calculation', () => {
			// From story testing section:
			// Current: $1,549/year (11,000 × $0.13/kWh + $9.95 × 12)
			// New plan: $1,307/year
			// Expected savings: $242/year

			// First, verify current cost calculation
			const currentCost = calculateAnnualCost(0.13, 9.95, 11000);
			expect(currentCost).toBeCloseTo(1549.40, 0); // Story says 1549

			// Then verify new plan and savings
			const newPlanCost = calculateAnnualCost(0.108, 9.95, 11000);
			expect(newPlanCost).toBe(1307.40);

			const savings = calculateSavings(1549, 1307.40);
			expect(savings.amount).toBeCloseTo(241.60, 0); // Story says ~242
		});

		it('should produce consistent results across multiple calculations', () => {
			const plan = { baseRate: 0.108, monthlyFee: 9.95 };
			const currentCost = 1549;
			const usage = 11000;

			// Calculate 100 times
			const results = Array.from({ length: 100 }, () =>
				calculatePlanCosts(plan, currentCost, usage)
			);

			// All results should be identical (deterministic)
			const firstResult = results[0];
			for (const result of results) {
				expect(result.estimatedAnnualCost).toBe(firstResult.estimatedAnnualCost);
				expect(result.estimatedSavings).toBe(firstResult.estimatedSavings);
				expect(result.savingsPercent).toBe(firstResult.savingsPercent);
			}
		});

		it('should handle edge case: zero current cost', () => {
			const plan = { baseRate: 0.108, monthlyFee: 9.95 };

			const result = calculatePlanCosts(plan, 0, 11000);

			expect(result.estimatedAnnualCost).toBe(1307.40);
			expect(result.estimatedSavings).toBe(-1307.40); // Negative (new cost is higher than 0)
			expect(result.savingsPercent).toBe(0); // Avoid division by zero
		});
	});

	describe('Performance: TypeScript vs LLM arithmetic', () => {
		it('should calculate 100 plans in less than 10ms', () => {
			const plans = Array.from({ length: 100 }, (_, i) => ({
				id: `plan-${i}`,
				baseRate: 0.10 + Math.random() * 0.05,
				monthlyFee: 5 + Math.random() * 10,
			}));

			const startTime = Date.now();
			const costMap = calculateMultiplePlanCosts(plans, 1549, 11000);
			const duration = Date.now() - startTime;

			expect(costMap.size).toBe(100);
			expect(duration).toBeLessThan(10); // TypeScript is FAST
		});

		it('should be deterministic (no random variation like LLM)', () => {
			const plan = { baseRate: 0.108, monthlyFee: 9.95 };

			// Calculate 1000 times
			const results = new Set(
				Array.from({ length: 1000 }, () =>
					calculatePlanCosts(plan, 1549, 11000).estimatedAnnualCost
				)
			);

			// Should have exactly 1 unique result (always the same)
			expect(results.size).toBe(1);
		});
	});
});
