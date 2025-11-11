/**
 * Fallback Cost Calculation Tests
 * Tests that fallback data includes accurate cost estimates
 * Addresses Story 8.2: Fix $0 Cost Display
 */

import { describe, it, expect } from 'vitest';
import { generatePlanScoringFallback, generateUsageFallback } from '../src/worker/lib/retry';
import { supplierCatalog } from '../src/worker/data/supplier-catalog';

describe('Fallback Cost Calculations', () => {
	describe('generatePlanScoringFallback', () => {
		it('should calculate realistic costs when usage data is provided', () => {
			const totalAnnualUsage = 12000; // kWh
			const currentAnnualCost = 1500; // $

			const result = generatePlanScoringFallback(
				Array.from(supplierCatalog),
				totalAnnualUsage,
				currentAnnualCost
			);

			// Verify structure
			expect(result.scoredPlans).toBeDefined();
			expect(result.scoredPlans.length).toBeGreaterThan(0);
			expect(result.fallback).toBe(true);

			// Verify each plan has non-zero costs
			result.scoredPlans.forEach((plan: any) => {
				expect(plan.estimatedAnnualCost).toBeGreaterThan(0);
				expect(plan.estimatedAnnualCost).toBeLessThan(10000); // Sanity check
				expect(typeof plan.estimatedSavings).toBe('number');
				expect(plan.planId).toBeDefined();
				expect(plan.supplier).toBeDefined();
				expect(plan.planName).toBeDefined();
				expect(plan.score).toBe(50); // Neutral score for fallback
			});
		});

		it('should calculate costs using correct formula: (baseRate * usage) + (monthlyFee * 12)', () => {
			const totalAnnualUsage = 10000; // kWh
			const currentAnnualCost = 1400; // $

			const result = generatePlanScoringFallback(
				Array.from(supplierCatalog).slice(0, 1), // Test with first plan only
				totalAnnualUsage,
				currentAnnualCost
			);

			const plan = result.scoredPlans[0];
			const catalogPlan = supplierCatalog[0];

			// Calculate expected cost manually
			const expectedCost = (catalogPlan.baseRate * totalAnnualUsage) + (catalogPlan.monthlyFee * 12);
			const expectedSavings = currentAnnualCost - expectedCost;

			expect(plan.estimatedAnnualCost).toBeCloseTo(expectedCost, 2);
			expect(plan.estimatedSavings).toBeCloseTo(expectedSavings, 2);
		});

		it('should use default usage when no usage data provided', () => {
			const result = generatePlanScoringFallback(Array.from(supplierCatalog));

			// Should still calculate costs with default usage (10,000 kWh)
			result.scoredPlans.forEach((plan: any) => {
				expect(plan.estimatedAnnualCost).toBeGreaterThan(0);
			});
		});

		it('should set savings to 0 when no current cost provided', () => {
			const result = generatePlanScoringFallback(
				Array.from(supplierCatalog),
				10000 // usage provided but no current cost
			);

			result.scoredPlans.forEach((plan: any) => {
				expect(plan.estimatedSavings).toBe(0);
			});
		});

		it('should handle negative savings (plan costs more than current)', () => {
			const totalAnnualUsage = 10000;
			const currentAnnualCost = 1000; // Low current cost

			const result = generatePlanScoringFallback(
				Array.from(supplierCatalog),
				totalAnnualUsage,
				currentAnnualCost
			);

			// Some plans might cost more, resulting in negative savings
			const hasNegativeSavings = result.scoredPlans.some((plan: any) => plan.estimatedSavings < 0);
			expect(hasNegativeSavings).toBe(true);
		});

		it('should round costs to 2 decimal places', () => {
			const result = generatePlanScoringFallback(Array.from(supplierCatalog), 10000, 1500);

			result.scoredPlans.forEach((plan: any) => {
				// Check that costs don't have more than 2 decimal places
				expect(plan.estimatedAnnualCost).toBe(Math.round(plan.estimatedAnnualCost * 100) / 100);
				expect(plan.estimatedSavings).toBe(Math.round(plan.estimatedSavings * 100) / 100);
			});
		});

		it('should limit results to 10 plans maximum', () => {
			const result = generatePlanScoringFallback(Array.from(supplierCatalog), 10000, 1500);

			expect(result.scoredPlans.length).toBeLessThanOrEqual(10);
			expect(result.totalPlansScored).toBe(Math.min(supplierCatalog.length, 10));
		});

		it('should preserve all required plan fields', () => {
			const result = generatePlanScoringFallback(Array.from(supplierCatalog), 10000, 1500);

			result.scoredPlans.forEach((plan: any) => {
				expect(plan.planId).toBeDefined();
				expect(plan.supplier).toBeDefined();
				expect(plan.planName).toBeDefined();
				expect(plan.score).toBe(50);
				expect(typeof plan.estimatedAnnualCost).toBe('number');
				expect(typeof plan.estimatedSavings).toBe('number');
			});
		});
	});

	describe('Integration with Usage Fallback', () => {
		it('should work with usage summary fallback data', () => {
			const monthlyData = [
				{ month: '2024-01', usage: 800, cost: 120 },
				{ month: '2024-02', usage: 750, cost: 115 },
				{ month: '2024-03', usage: 900, cost: 130 },
				{ month: '2024-04', usage: 950, cost: 135 },
				{ month: '2024-05', usage: 1100, cost: 150 },
				{ month: '2024-06', usage: 1200, cost: 165 },
				{ month: '2024-07', usage: 1300, cost: 175 },
				{ month: '2024-08', usage: 1250, cost: 170 },
				{ month: '2024-09', usage: 1100, cost: 155 },
				{ month: '2024-10', usage: 950, cost: 140 },
				{ month: '2024-11', usage: 850, cost: 125 },
				{ month: '2024-12', usage: 800, cost: 120 },
			];

			// Generate usage fallback
			const usageFallback = generateUsageFallback(monthlyData);

			// Use usage fallback data for plan scoring fallback
			const planScoringFallback = generatePlanScoringFallback(
				Array.from(supplierCatalog),
				usageFallback.totalAnnualUsage,
				usageFallback.annualCost
			);

			// Verify costs are realistic
			planScoringFallback.scoredPlans.forEach((plan: any) => {
				expect(plan.estimatedAnnualCost).toBeGreaterThan(0);
				expect(plan.estimatedAnnualCost).toBeLessThan(10000);
			});

			// Verify savings calculations are reasonable
			const totalCost = monthlyData.reduce((sum, m) => sum + m.cost, 0);
			expect(usageFallback.annualCost).toBe(totalCost);
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero usage', () => {
			const result = generatePlanScoringFallback(Array.from(supplierCatalog), 0, 100);

			result.scoredPlans.forEach((plan: any) => {
				// With zero usage, cost should just be monthly fees
				const expectedCost = supplierCatalog[0].monthlyFee * 12;
				expect(plan.estimatedAnnualCost).toBeGreaterThanOrEqual(0);
			});
		});

		it('should handle very high usage', () => {
			const veryHighUsage = 50000; // Very high annual usage
			const result = generatePlanScoringFallback(Array.from(supplierCatalog), veryHighUsage, 5000);

			result.scoredPlans.forEach((plan: any) => {
				expect(plan.estimatedAnnualCost).toBeGreaterThan(0);
				expect(plan.estimatedAnnualCost).toBeLessThan(100000); // Sanity check
			});
		});

		it('should handle empty supplier catalog gracefully', () => {
			const result = generatePlanScoringFallback([], 10000, 1500);

			expect(result.scoredPlans).toEqual([]);
			expect(result.totalPlansScored).toBe(0);
		});
	});

	describe('Cost Validation Requirements', () => {
		it('should never return $0 costs unless plan is actually free', () => {
			const result = generatePlanScoringFallback(Array.from(supplierCatalog), 10000, 1500);

			result.scoredPlans.forEach((plan: any) => {
				// All plans in catalog have baseRate and monthlyFee, so none should be $0
				expect(plan.estimatedAnnualCost).toBeGreaterThan(0);
			});
		});

		it('should match cost calculation formula from prompt', () => {
			// This is the exact formula from src/worker/prompts/plan-scoring.ts lines 81-83
			const totalAnnualUsage = 12450; // From actual usage
			const currentAnnualCost = 1485; // From actual usage

			const result = generatePlanScoringFallback(
				Array.from(supplierCatalog).slice(0, 1),
				totalAnnualUsage,
				currentAnnualCost
			);

			const plan = result.scoredPlans[0];
			const catalogPlan = supplierCatalog[0];

			// Formula: (baseRate * totalAnnualUsage) + (monthlyFee * 12)
			const expectedAnnualCost = (catalogPlan.baseRate * totalAnnualUsage) + (catalogPlan.monthlyFee * 12);

			// Formula: currentAnnualCost - estimatedAnnualCost
			const expectedSavings = currentAnnualCost - expectedAnnualCost;

			expect(plan.estimatedAnnualCost).toBeCloseTo(expectedAnnualCost, 2);
			expect(plan.estimatedSavings).toBeCloseTo(expectedSavings, 2);
		});
	});
});
