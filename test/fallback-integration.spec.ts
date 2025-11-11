/**
 * Fallback Integration Tests
 * Tests that the pipeline properly passes usage data to fallback functions
 * Addresses Story 8.2: Fix $0 Cost Display
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runPipeline, StageInput } from '../src/worker/pipeline';
import { Env } from '../src/worker/index';
import * as retry from '../src/worker/lib/retry';

describe('Pipeline Fallback Integration', () => {
	let mockEnv: Env;

	beforeEach(() => {
		// Create minimal mock environment
		mockEnv = {
			AI: {
				run: vi.fn().mockRejectedValue(new Error('AI model unavailable')),
			},
			AI_MODEL_FAST: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
		} as any;
	});

	it('should pass usage data to plan scoring fallback when AI fails', async () => {
		const generatePlanScoringFallbackSpy = vi.spyOn(retry, 'generatePlanScoringFallback');

		const input: StageInput = {
			energyUsageData: {
				monthlyData: [
					{ month: '2024-01', usage: 1000, cost: 125 },
					{ month: '2024-02', usage: 950, cost: 120 },
					{ month: '2024-03', usage: 900, cost: 115 },
					{ month: '2024-04', usage: 850, cost: 110 },
					{ month: '2024-05', usage: 1100, cost: 135 },
					{ month: '2024-06', usage: 1200, cost: 145 },
					{ month: '2024-07', usage: 1300, cost: 155 },
					{ month: '2024-08', usage: 1250, cost: 150 },
					{ month: '2024-09', usage: 1100, cost: 135 },
					{ month: '2024-10', usage: 950, cost: 120 },
					{ month: '2024-11', usage: 900, cost: 115 },
					{ month: '2024-12', usage: 850, cost: 110 },
				],
			},
			currentPlan: {
				supplier: 'Test Supplier',
				planName: 'Test Plan',
				rateStructure: 'Fixed',
			},
			preferences: {
				prioritizeSavings: true,
			},
		};

		// Run pipeline - it will fail AI calls and use fallback
		const result = await runPipeline(mockEnv, input);

		// Verify fallback was called
		expect(generatePlanScoringFallbackSpy).toHaveBeenCalled();

		// Get the call arguments
		const calls = generatePlanScoringFallbackSpy.mock.calls;
		expect(calls.length).toBeGreaterThan(0);

		// Verify usage data was passed to fallback
		const lastCall = calls[calls.length - 1];
		const [supplierPlans, totalAnnualUsage, currentAnnualCost] = lastCall;

		expect(supplierPlans).toBeDefined();
		expect(totalAnnualUsage).toBeDefined();
		expect(totalAnnualUsage).toBeGreaterThan(0);
		expect(currentAnnualCost).toBeDefined();
		expect(currentAnnualCost).toBeGreaterThan(0);

		// Verify result has costs
		expect(result.planScoring).toBeDefined();
		expect(result.planScoring?.scoredPlans).toBeDefined();
		expect(result.planScoring?.scoredPlans.length).toBeGreaterThan(0);

		// Verify all plans have non-zero costs
		result.planScoring?.scoredPlans.forEach((plan) => {
			expect(plan.estimatedAnnualCost).toBeGreaterThan(0);
			expect(typeof plan.estimatedSavings).toBe('number');
		});

		generatePlanScoringFallbackSpy.mockRestore();
	});

	it('should calculate costs even when Stage 1 fails completely', async () => {
		const input: StageInput = {
			energyUsageData: {
				monthlyData: [
					{ month: '2024-01', usage: 1000, cost: 125 },
					{ month: '2024-02', usage: 950, cost: 120 },
					{ month: '2024-03', usage: 900, cost: 115 },
					{ month: '2024-04', usage: 850, cost: 110 },
					{ month: '2024-05', usage: 1100, cost: 135 },
					{ month: '2024-06', usage: 1200, cost: 145 },
					{ month: '2024-07', usage: 1300, cost: 155 },
					{ month: '2024-08', usage: 1250, cost: 150 },
					{ month: '2024-09', usage: 1100, cost: 135 },
					{ month: '2024-10', usage: 950, cost: 120 },
					{ month: '2024-11', usage: 900, cost: 115 },
					{ month: '2024-12', usage: 850, cost: 110 },
				],
			},
			currentPlan: {
				supplier: 'Test Supplier',
				planName: 'Test Plan',
				rateStructure: 'Fixed',
			},
			preferences: {},
		};

		const result = await runPipeline(mockEnv, input);

		// Even with full pipeline failure, fallback should provide costs
		expect(result.planScoring).toBeDefined();
		expect(result.planScoring?.scoredPlans).toBeDefined();

		if (result.planScoring?.scoredPlans) {
			result.planScoring.scoredPlans.forEach((plan) => {
				// Should have costs calculated
				expect(plan.estimatedAnnualCost).toBeGreaterThan(0);
				expect(plan.estimatedAnnualCost).toBeLessThan(10000); // Sanity check
			});
		}
	});

	it('should have realistic cost values in fallback', async () => {
		const input: StageInput = {
			energyUsageData: {
				monthlyData: Array.from({ length: 12 }, (_, i) => ({
					month: `2024-${String(i + 1).padStart(2, '0')}`,
					usage: 1000,
					cost: 125,
				})),
			},
			currentPlan: {
				supplier: 'Test Supplier',
				planName: 'Test Plan',
				rateStructure: 'Fixed',
			},
			preferences: {},
		};

		const result = await runPipeline(mockEnv, input);

		expect(result.planScoring).toBeDefined();
		expect(result.planScoring?.scoredPlans).toBeDefined();

		if (result.planScoring?.scoredPlans) {
			result.planScoring.scoredPlans.forEach((plan) => {
				// Costs should be in realistic range for 12,000 kWh annual usage
				// Typical range: $1,000 - $3,000/year
				expect(plan.estimatedAnnualCost).toBeGreaterThan(500);
				expect(plan.estimatedAnnualCost).toBeLessThan(5000);

				// Savings can be positive or negative
				expect(typeof plan.estimatedSavings).toBe('number');
			});
		}
	});
});
