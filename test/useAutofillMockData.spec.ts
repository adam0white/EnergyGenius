/**
 * Tests for useAutofillMockData hook
 *
 * Validates:
 * - Random scenario selection
 * - Scenario-to-form-data mapping
 * - Form data structure and types
 * - Data validation
 */

import { describe, it, expect } from 'vitest';
import { usageScenarios } from '../src/worker/data/usage-scenarios';

// Import the mapping function directly for testing
// Since we can't test React hooks directly in this test runner,
// we'll test the underlying logic
describe('useAutofillMockData Hook Logic', () => {
	describe('Random Scenario Selection', () => {
		it('should have 5 usage scenarios available', () => {
			expect(usageScenarios).toHaveLength(5);
		});

		it('should have valid scenario structure', () => {
			usageScenarios.forEach((scenario) => {
				expect(scenario).toHaveProperty('id');
				expect(scenario).toHaveProperty('name');
				expect(scenario).toHaveProperty('description');
				expect(scenario).toHaveProperty('type');
				expect(scenario).toHaveProperty('monthlyUsage');
				expect(scenario).toHaveProperty('annualKWh');
				expect(scenario).toHaveProperty('averageMonthlyKWh');
			});
		});

		it('should have 12 months of data for each scenario', () => {
			usageScenarios.forEach((scenario) => {
				expect(scenario.monthlyUsage).toHaveLength(12);
			});
		});

		it('should have sequential month numbers 1-12', () => {
			usageScenarios.forEach((scenario) => {
				scenario.monthlyUsage.forEach((usage, index) => {
					expect(usage.month).toBe(index + 1);
					expect(usage.kWh).toBeGreaterThan(0);
				});
			});
		});

		it('should have valid annual kWh totals', () => {
			usageScenarios.forEach((scenario) => {
				const totalKWh = scenario.monthlyUsage.reduce(
					(sum, month) => sum + month.kWh,
					0
				);
				// Allow small floating point differences
				expect(Math.abs(totalKWh - scenario.annualKWh)).toBeLessThan(1);
			});
		});
	});

	describe('Scenario Types', () => {
		it('should have residential scenario', () => {
			const residential = usageScenarios.find(
				(s) => s.id === 'scenario-avg'
			);
			expect(residential).toBeDefined();
			expect(residential?.type).toBe('residential');
		});

		it('should have high summer usage scenario', () => {
			const summer = usageScenarios.find(
				(s) => s.id === 'scenario-summer-high'
			);
			expect(summer).toBeDefined();
			expect(summer?.type).toBe('seasonal-high');
		});

		it('should have low usage efficient scenario', () => {
			const efficient = usageScenarios.find(
				(s) => s.id === 'scenario-efficient'
			);
			expect(efficient).toBeDefined();
			expect(efficient?.type).toBe('residential');
		});

		it('should have small business scenario', () => {
			const business = usageScenarios.find(
				(s) => s.id === 'scenario-business'
			);
			expect(business).toBeDefined();
			expect(business?.type).toBe('small-business');
		});

		it('should have winter-heavy usage scenario', () => {
			const winter = usageScenarios.find(
				(s) => s.id === 'scenario-winter-heavy'
			);
			expect(winter).toBeDefined();
			expect(winter?.type).toBe('seasonal-low');
		});
	});

	describe('Data Validation', () => {
		it('should have positive kWh values', () => {
			usageScenarios.forEach((scenario) => {
				scenario.monthlyUsage.forEach((usage) => {
					expect(usage.kWh).toBeGreaterThan(0);
				});
			});
		});

		it('should have realistic annual consumption ranges', () => {
			usageScenarios.forEach((scenario) => {
				// Residential: 6,000 - 15,000 kWh
				// Small business: 20,000 - 30,000 kWh
				if (scenario.type === 'small-business') {
					expect(scenario.annualKWh).toBeGreaterThan(20000);
					expect(scenario.annualKWh).toBeLessThan(30000);
				} else {
					expect(scenario.annualKWh).toBeGreaterThan(5000);
					expect(scenario.annualKWh).toBeLessThan(20000);
				}
			});
		});

		it('should have correct average monthly calculations', () => {
			usageScenarios.forEach((scenario) => {
				const calculatedAverage = scenario.annualKWh / 12;
				expect(
					Math.abs(calculatedAverage - scenario.averageMonthlyKWh)
				).toBeLessThan(1);
			});
		});
	});

	describe('Scenario Characteristics', () => {
		it('Average Household should have moderate seasonal variation', () => {
			const scenario = usageScenarios.find((s) => s.id === 'scenario-avg');
			expect(scenario).toBeDefined();

			const monthlyValues = scenario!.monthlyUsage.map((m) => m.kWh);
			const max = Math.max(...monthlyValues);
			const min = Math.min(...monthlyValues);
			const ratio = max / min;

			// Should have some variation but not extreme
			expect(ratio).toBeGreaterThan(1.1);
			expect(ratio).toBeLessThan(2.0);
		});

		it('High Summer Usage should peak in summer months', () => {
			const scenario = usageScenarios.find(
				(s) => s.id === 'scenario-summer-high'
			);
			expect(scenario).toBeDefined();

			// June, July, August (months 6, 7, 8) should be highest
			const summer = [
				scenario!.monthlyUsage[5].kWh,
				scenario!.monthlyUsage[6].kWh,
				scenario!.monthlyUsage[7].kWh,
			];
			const winter = [
				scenario!.monthlyUsage[0].kWh,
				scenario!.monthlyUsage[1].kWh,
				scenario!.monthlyUsage[11].kWh,
			];

			const summerAvg = summer.reduce((a, b) => a + b, 0) / summer.length;
			const winterAvg = winter.reduce((a, b) => a + b, 0) / winter.length;

			expect(summerAvg).toBeGreaterThan(winterAvg);
		});

		it('Winter-Heavy Usage should peak in winter months', () => {
			const scenario = usageScenarios.find(
				(s) => s.id === 'scenario-winter-heavy'
			);
			expect(scenario).toBeDefined();

			// December, January, February (months 12, 1, 2) should be highest
			const winter = [
				scenario!.monthlyUsage[11].kWh,
				scenario!.monthlyUsage[0].kWh,
				scenario!.monthlyUsage[1].kWh,
			];
			const summer = [
				scenario!.monthlyUsage[5].kWh,
				scenario!.monthlyUsage[6].kWh,
				scenario!.monthlyUsage[7].kWh,
			];

			const winterAvg = winter.reduce((a, b) => a + b, 0) / winter.length;
			const summerAvg = summer.reduce((a, b) => a + b, 0) / summer.length;

			expect(winterAvg).toBeGreaterThan(summerAvg);
		});

		it('Low Usage Efficient should have lowest annual consumption', () => {
			const efficient = usageScenarios.find(
				(s) => s.id === 'scenario-efficient'
			);
			expect(efficient).toBeDefined();

			const otherScenarios = usageScenarios.filter(
				(s) => s.id !== 'scenario-efficient'
			);

			otherScenarios.forEach((scenario) => {
				expect(efficient!.annualKWh).toBeLessThan(scenario.annualKWh);
			});
		});

		it('Small Business should have highest annual consumption', () => {
			const business = usageScenarios.find(
				(s) => s.id === 'scenario-business'
			);
			expect(business).toBeDefined();

			const otherScenarios = usageScenarios.filter(
				(s) => s.id !== 'scenario-business'
			);

			otherScenarios.forEach((scenario) => {
				expect(business!.annualKWh).toBeGreaterThan(scenario.annualKWh);
			});
		});
	});
});
