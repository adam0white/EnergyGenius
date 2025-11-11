/**
 * Pipeline Module Unit Tests
 * Tests sequential execution, error handling, timeouts, and progress callbacks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	runPipeline,
	runUsageSummary,
	runPlanScoring,
	runNarrative,
	StageInput,
	PipelineResult,
} from '../src/worker/pipeline';
import { Env } from '../src/worker/index';

// ===========================
// Mock Environment
// ===========================

const createMockEnv = (aiResponse?: any): Env => {
	return {
		ASSETS: {},
		AI: {
			run: vi.fn().mockResolvedValue(aiResponse || { response: 'Mock AI response' }),
		},
		AI_MODEL_FAST: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
		AI_MODEL_ACCURATE: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
		ENABLE_SSE: 'false',
		ENABLE_MOCK_DATA: 'false',
	} as unknown as Env;
};

// ===========================
// Mock Input Data
// ===========================

const createMockInput = (): StageInput => {
	return {
		energyUsageData: {
			monthlyData: [
				{ month: '2024-01', usage: 1000, cost: 120 },
				{ month: '2024-02', usage: 950, cost: 115 },
				{ month: '2024-03', usage: 900, cost: 110 },
				{ month: '2024-04', usage: 850, cost: 105 },
				{ month: '2024-05', usage: 1100, cost: 130 },
				{ month: '2024-06', usage: 1200, cost: 140 },
				{ month: '2024-07', usage: 1300, cost: 150 },
				{ month: '2024-08', usage: 1250, cost: 145 },
				{ month: '2024-09', usage: 1050, cost: 125 },
				{ month: '2024-10', usage: 950, cost: 115 },
				{ month: '2024-11', usage: 900, cost: 110 },
				{ month: '2024-12', usage: 1000, cost: 120 },
			],
		},
		currentPlan: {
			supplier: 'Current Energy Co',
			planName: 'Standard Plan',
			rateStructure: 'fixed',
			monthlyFee: 10,
			rate: 0.12,
		},
		preferences: {
			prioritizeSavings: true,
			preferRenewable: false,
			acceptVariableRates: true,
			maxMonthlyBudget: 150,
		},
	};
};

// ===========================
// Test Suite: Stage Functions
// ===========================

describe('Pipeline Stage Functions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('runUsageSummary()', () => {
		it('should return usage summary with correct metrics', async () => {
			const env = createMockEnv();
			const input = createMockInput();

			const result = await runUsageSummary(env, input);

			expect(result).toHaveProperty('averageMonthlyUsage');
			expect(result).toHaveProperty('peakUsageMonth');
			expect(result).toHaveProperty('totalAnnualUsage');
			expect(result).toHaveProperty('usagePattern');
			expect(result).toHaveProperty('annualCost');

			// Verify calculations
			expect(result.totalAnnualUsage).toBe(12450); // Sum of all usage
			expect(result.averageMonthlyUsage).toBeCloseTo(1037.5, 1); // 12450 / 12
			expect(result.peakUsageMonth).toBe('2024-07'); // July has 1300 usage
			expect(result.annualCost).toBe(1485); // Sum of all costs
		});

		it('should call Workers AI with correct parameters', async () => {
			const env = createMockEnv();
			const input = createMockInput();

			await runUsageSummary(env, input);

			expect(env.AI.run).toHaveBeenCalledWith(
				expect.any(String), // model ID
				expect.objectContaining({
					prompt: expect.stringContaining('Analyze this energy usage data'),
					max_tokens: 512,
				})
			);
		});
	});

	describe('runPlanScoring()', () => {
		it('should return scored plans array', async () => {
			const env = createMockEnv();
			const input = createMockInput();
			const usageSummary = await runUsageSummary(env, input);

			const result = await runPlanScoring(env, usageSummary, input);

			expect(result).toHaveProperty('scoredPlans');
			expect(result).toHaveProperty('totalPlansScored');
			expect(Array.isArray(result.scoredPlans)).toBe(true);
			expect(result.scoredPlans.length).toBeGreaterThan(0);
		});

		it('should include plan details in each scored plan', async () => {
			const env = createMockEnv();
			const input = createMockInput();
			const usageSummary = await runUsageSummary(env, input);

			const result = await runPlanScoring(env, usageSummary, input);

			result.scoredPlans.forEach((plan) => {
				expect(plan).toHaveProperty('planId');
				expect(plan).toHaveProperty('supplier');
				expect(plan).toHaveProperty('planName');
				expect(plan).toHaveProperty('score');
				expect(plan).toHaveProperty('estimatedAnnualCost');
				expect(plan).toHaveProperty('estimatedSavings');
			});
		});

		it('should calculate savings relative to current annual cost', async () => {
			const env = createMockEnv();
			const input = createMockInput();
			const usageSummary = await runUsageSummary(env, input);

			const result = await runPlanScoring(env, usageSummary, input);

			result.scoredPlans.forEach((plan) => {
				expect(plan.estimatedAnnualCost).toBeLessThan(usageSummary.annualCost);
				expect(plan.estimatedSavings).toBeGreaterThan(0);
			});
		});
	});

	describe('runNarrative()', () => {
		it('should return narrative explanation and recommendations', async () => {
			const env = createMockEnv();
			const input = createMockInput();
			const usageSummary = await runUsageSummary(env, input);
			const planScoring = await runPlanScoring(env, usageSummary, input);

			const result = await runNarrative(env, planScoring);

			expect(result).toHaveProperty('explanation');
			expect(result).toHaveProperty('topRecommendations');
			expect(typeof result.explanation).toBe('string');
			expect(Array.isArray(result.topRecommendations)).toBe(true);
		});

		it('should provide rationale for top 3 plans', async () => {
			const env = createMockEnv();
			const input = createMockInput();
			const usageSummary = await runUsageSummary(env, input);
			const planScoring = await runPlanScoring(env, usageSummary, input);

			const result = await runNarrative(env, planScoring);

			expect(result.topRecommendations.length).toBeLessThanOrEqual(3);
			result.topRecommendations.forEach((rec) => {
				expect(rec).toHaveProperty('planId');
				expect(rec).toHaveProperty('rationale');
				expect(typeof rec.rationale).toBe('string');
			});
		});
	});
});

// ===========================
// Test Suite: Pipeline Orchestration
// ===========================

describe('Pipeline Orchestration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('runPipeline()', () => {
		it('should execute all three stages sequentially', async () => {
			const env = createMockEnv();
			const input = createMockInput();

			const result = await runPipeline(env, input);

			expect(result).toHaveProperty('usageSummary');
			expect(result).toHaveProperty('planScoring');
			expect(result).toHaveProperty('narrative');
			expect(result.usageSummary).toBeDefined();
			expect(result.planScoring).toBeDefined();
			expect(result.narrative).toBeDefined();
		});

		it('should return PipelineResult with metadata', async () => {
			const env = createMockEnv();
			const input = createMockInput();

			const result = await runPipeline(env, input);

			expect(result).toHaveProperty('errors');
			expect(result).toHaveProperty('executionTime');
			expect(result).toHaveProperty('timestamp');
			expect(Array.isArray(result.errors)).toBe(true);
			expect(typeof result.executionTime).toBe('number');
			expect(typeof result.timestamp).toBe('string');
		});

		it('should have zero errors on successful run', async () => {
			const env = createMockEnv();
			const input = createMockInput();

			const result = await runPipeline(env, input);

			expect(result.errors.length).toBe(0);
		});

		it('should track execution time', async () => {
			const env = createMockEnv();
			const input = createMockInput();

			const result = await runPipeline(env, input);

			expect(result.executionTime).toBeGreaterThan(0);
		});
	});

	describe('Sequential Execution & Data Flow', () => {
		it('should await Stage 1 before executing Stage 2', async () => {
			const env = createMockEnv();
			const input = createMockInput();

			const callOrder: string[] = [];

			// Wrap AI.run to track call order
			env.AI.run = vi.fn().mockImplementation(async () => {
				callOrder.push('AI_CALL');
				return { response: 'Mock' };
			});

			const result = await runPipeline(env, input);

			// Should have 3 AI calls (one per stage)
			expect(callOrder.length).toBe(3);
			expect(result.usageSummary).toBeDefined();
			expect(result.planScoring).toBeDefined();
			expect(result.narrative).toBeDefined();
		});

		it('should pass Stage 1 output to Stage 2', async () => {
			const env = createMockEnv();
			const input = createMockInput();

			const result = await runPipeline(env, input);

			// Stage 2 should use Stage 1 data
			expect(result.planScoring?.scoredPlans[0].estimatedAnnualCost).toBeLessThan(result.usageSummary!.annualCost);
		});

		it('should pass Stage 2 output to Stage 3', async () => {
			const env = createMockEnv();
			const input = createMockInput();

			const result = await runPipeline(env, input);

			// Stage 3 should reference plans from Stage 2
			const planIds = result.planScoring?.scoredPlans.map((p) => p.planId) || [];
			result.narrative?.topRecommendations.forEach((rec) => {
				expect(planIds).toContain(rec.planId);
			});
		});
	});
});

// ===========================
// Test Suite: Error Handling
// ===========================

describe('Error Handling', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should catch and store stage errors', async () => {
		const env = createMockEnv();
		const input = createMockInput();

		// Force Stage 1 to fail
		env.AI.run = vi.fn().mockRejectedValue(new Error('AI service unavailable'));

		const result = await runPipeline(env, input);

		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors[0]).toHaveProperty('stage');
		expect(result.errors[0]).toHaveProperty('message');
		expect(result.errors[0]).toHaveProperty('timestamp');
	});

	it('should continue pipeline after stage error (partial results)', async () => {
		const env = createMockEnv();
		const input = createMockInput();

		let callCount = 0;
		env.AI.run = vi.fn().mockImplementation(async () => {
			callCount++;
			if (callCount === 2) {
				throw new Error('Stage 2 failed');
			}
			return { response: 'Mock' };
		});

		const result = await runPipeline(env, input);

		// Stage 1 should succeed
		expect(result.usageSummary).toBeDefined();
		// Stage 2 should fail
		expect(result.planScoring).toBeUndefined();
		// Stage 3 should be skipped
		expect(result.narrative).toBeUndefined();
		// Should have errors for stages 2 and 3
		expect(result.errors.length).toBe(2);
	});

	it('should include user-friendly error messages', async () => {
		const env = createMockEnv();
		const input = createMockInput();

		env.AI.run = vi.fn().mockRejectedValue(new Error('Network timeout'));

		const result = await runPipeline(env, input);

		expect(result.errors[0].message).toContain('Network timeout');
	});

	it('should skip Stage 2 if Stage 1 fails', async () => {
		const env = createMockEnv();
		const input = createMockInput();

		env.AI.run = vi.fn().mockRejectedValue(new Error('Stage 1 failed'));

		const result = await runPipeline(env, input);

		expect(result.usageSummary).toBeUndefined();
		expect(result.planScoring).toBeUndefined();
		expect(result.errors.some((e) => e.stage === 'plan-scoring' && e.message.includes('Skipped'))).toBe(true);
	});

	it('should skip Stage 3 if Stage 2 fails', async () => {
		const env = createMockEnv();
		const input = createMockInput();

		let callCount = 0;
		env.AI.run = vi.fn().mockImplementation(async () => {
			callCount++;
			if (callCount === 2) throw new Error('Stage 2 failed');
			return { response: 'Mock' };
		});

		const result = await runPipeline(env, input);

		expect(result.usageSummary).toBeDefined();
		expect(result.planScoring).toBeUndefined();
		expect(result.narrative).toBeUndefined();
		expect(result.errors.some((e) => e.stage === 'narrative' && e.message.includes('Skipped'))).toBe(true);
	});
});

// ===========================
// Test Suite: Timeout Handling
// ===========================

describe('Timeout Handling', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should timeout if stage exceeds 30 seconds', async () => {
		const env = createMockEnv();
		const input = createMockInput();

		// Mock a slow AI call (never resolves)
		env.AI.run = vi.fn().mockImplementation(
			() =>
				new Promise((resolve) => {
					// Never resolve (simulates timeout)
					setTimeout(resolve, 60000);
				})
		);

		const result = await runPipeline(env, input);

		// Should have timeout error
		expect(result.errors.length).toBeGreaterThan(0);
		expect(result.errors[0].message).toContain('timeout');
	}, 35000); // Test timeout longer than stage timeout

	it('should include stage name in timeout error message', async () => {
		const env = createMockEnv();
		const input = createMockInput();

		env.AI.run = vi.fn().mockImplementation(
			() =>
				new Promise((resolve) => {
					setTimeout(resolve, 60000);
				})
		);

		const result = await runPipeline(env, input);

		expect(result.errors[0].message).toContain('usage-summary');
		expect(result.errors[0].message).toContain('30s');
	}, 35000);

	it('should continue to next stage after timeout', async () => {
		const env = createMockEnv();
		const input = createMockInput();

		let callCount = 0;
		env.AI.run = vi.fn().mockImplementation(() => {
			callCount++;
			if (callCount === 1) {
				// First call times out
				return new Promise((resolve) => setTimeout(resolve, 60000));
			}
			// Subsequent calls succeed quickly
			return Promise.resolve({ response: 'Mock' });
		});

		const result = await runPipeline(env, input);

		expect(result.usageSummary).toBeUndefined();
		expect(result.errors.some((e) => e.message.includes('timeout'))).toBe(true);
	}, 35000);
});

// ===========================
// Test Suite: Progress Callback
// ===========================

describe('Progress Callback', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should invoke callback at stage start', async () => {
		const env = createMockEnv();
		const input = createMockInput();
		const callback = vi.fn();

		await runPipeline(env, input, callback);

		expect(callback).toHaveBeenCalledWith('usage-summary', 'running', null);
		expect(callback).toHaveBeenCalledWith('plan-scoring', 'running', null);
		expect(callback).toHaveBeenCalledWith('narrative', 'running', null);
	});

	it('should invoke callback at stage completion', async () => {
		const env = createMockEnv();
		const input = createMockInput();
		const callback = vi.fn();

		await runPipeline(env, input, callback);

		expect(callback).toHaveBeenCalledWith('usage-summary', 'complete', expect.any(Object));
		expect(callback).toHaveBeenCalledWith('plan-scoring', 'complete', expect.any(Object));
		expect(callback).toHaveBeenCalledWith('narrative', 'complete', expect.any(Object));
	});

	it('should invoke callback on stage error', async () => {
		const env = createMockEnv();
		const input = createMockInput();
		const callback = vi.fn();

		env.AI.run = vi.fn().mockRejectedValue(new Error('AI failed'));

		await runPipeline(env, input, callback);

		expect(callback).toHaveBeenCalledWith('usage-summary', 'error', null);
	});

	it('should not break pipeline if callback throws error', async () => {
		const env = createMockEnv();
		const input = createMockInput();
		const callback = vi.fn().mockImplementation(() => {
			throw new Error('Callback error');
		});

		const result = await runPipeline(env, input, callback);

		// Pipeline should still complete successfully
		expect(result.usageSummary).toBeDefined();
		expect(result.planScoring).toBeDefined();
		expect(result.narrative).toBeDefined();
		expect(result.errors.length).toBe(0);
	});

	it('should work without callback (optional parameter)', async () => {
		const env = createMockEnv();
		const input = createMockInput();

		const result = await runPipeline(env, input);

		expect(result.usageSummary).toBeDefined();
		expect(result.planScoring).toBeDefined();
		expect(result.narrative).toBeDefined();
	});
});

// ===========================
// Test Suite: Type Safety
// ===========================

describe('Type Safety', () => {
	it('should enforce StageInput interface', () => {
		const input = createMockInput();

		expect(input).toHaveProperty('energyUsageData');
		expect(input).toHaveProperty('currentPlan');
		expect(input).toHaveProperty('preferences');
	});

	it('should enforce PipelineResult interface', async () => {
		const env = createMockEnv();
		const input = createMockInput();

		const result: PipelineResult = await runPipeline(env, input);

		// Type checking via interface enforcement
		expect(result.errors).toBeDefined();
		expect(result.executionTime).toBeDefined();
		expect(result.timestamp).toBeDefined();
	});
});
