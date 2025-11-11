/**
 * Unit tests for Usage Summary Prompt Builder
 */

import { describe, it, expect } from 'vitest';
import { buildUsageSummaryPrompt } from '../../src/worker/prompts/usage-summary';
import type { StageInput } from '../../src/worker/pipeline';

describe('buildUsageSummaryPrompt', () => {
	const validInput: StageInput = {
		energyUsageData: {
			monthlyData: [
				{ month: 'Jan', usage: 800, cost: 120 },
				{ month: 'Feb', usage: 750, cost: 110 },
				{ month: 'Mar', usage: 700, cost: 105 },
				{ month: 'Apr', usage: 650, cost: 98 },
				{ month: 'May', usage: 900, cost: 135 },
				{ month: 'Jun', usage: 1200, cost: 180 },
				{ month: 'Jul', usage: 1400, cost: 210 },
				{ month: 'Aug', usage: 1350, cost: 205 },
				{ month: 'Sep', usage: 1000, cost: 150 },
				{ month: 'Oct', usage: 800, cost: 120 },
				{ month: 'Nov', usage: 750, cost: 110 },
				{ month: 'Dec', usage: 850, cost: 128 },
			],
		},
		currentPlan: {
			supplier: 'Current Energy Co',
			planName: 'Basic Plan',
			rateStructure: 'Fixed Rate',
		},
		preferences: {},
	};

	it('should build valid prompt with 12 months of data', () => {
		const prompt = buildUsageSummaryPrompt(validInput);

		expect(prompt).toBeDefined();
		expect(typeof prompt).toBe('string');
		expect(prompt.length).toBeGreaterThan(100);
	});

	it('should include usage data in prompt', () => {
		const prompt = buildUsageSummaryPrompt(validInput);

		expect(prompt).toContain('USAGE DATA');
		expect(prompt).toContain('Jan');
		expect(prompt).toContain('800');
	});

	it('should include current plan info', () => {
		const prompt = buildUsageSummaryPrompt(validInput);

		expect(prompt).toContain('CURRENT PLAN');
		expect(prompt).toContain('Current Energy Co');
		expect(prompt).toContain('Basic Plan');
		expect(prompt).toContain('Fixed Rate');
	});

	it('should include JSON output format example', () => {
		const prompt = buildUsageSummaryPrompt(validInput);

		expect(prompt).toContain('OUTPUT FORMAT');
		expect(prompt).toContain('averageMonthlyUsage');
		expect(prompt).toContain('peakUsageMonth');
		expect(prompt).toContain('totalAnnualUsage');
		expect(prompt).toContain('usagePattern');
		expect(prompt).toContain('annualCost');
	});

	it('should include pattern definitions', () => {
		const prompt = buildUsageSummaryPrompt(validInput);

		expect(prompt).toContain('consistent');
		expect(prompt).toContain('seasonal');
		expect(prompt).toContain('high-variance');
	});

	it('should throw error if monthlyData is missing', () => {
		const invalidInput = {
			...validInput,
			energyUsageData: {} as any,
		};

		expect(() => buildUsageSummaryPrompt(invalidInput)).toThrow('Invalid usage data');
	});

	it('should throw error if monthlyData is not array', () => {
		const invalidInput = {
			...validInput,
			energyUsageData: { monthlyData: 'not-an-array' } as any,
		};

		expect(() => buildUsageSummaryPrompt(invalidInput)).toThrow('Invalid usage data');
	});

	it('should throw error if monthlyData does not have 12 months', () => {
		const invalidInput = {
			...validInput,
			energyUsageData: {
				monthlyData: validInput.energyUsageData.monthlyData.slice(0, 6),
			},
		};

		expect(() => buildUsageSummaryPrompt(invalidInput)).toThrow('must contain exactly 12 months');
	});

	it('should handle missing cost values gracefully', () => {
		const inputWithoutCost = {
			...validInput,
			energyUsageData: {
				monthlyData: validInput.energyUsageData.monthlyData.map((m) => ({
					month: m.month,
					usage: m.usage,
					cost: undefined as any,
				})),
			},
		};

		const prompt = buildUsageSummaryPrompt(inputWithoutCost);
		expect(prompt).toBeDefined();
		expect(prompt).toContain('cost');
	});

	it('should sanitize numeric values', () => {
		const inputWithPrecision = {
			...validInput,
			energyUsageData: {
				monthlyData: [
					...validInput.energyUsageData.monthlyData.slice(0, 11),
					{ month: 'Dec', usage: 850.123456789, cost: 128.987654321 },
				],
			},
		};

		const prompt = buildUsageSummaryPrompt(inputWithPrecision);
		// Values should be rounded to 2 decimal places
		expect(prompt).toContain('850.12');
		expect(prompt).toContain('128.99');
	});
});
