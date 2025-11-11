/**
 * Data Validation Module
 *
 * Provides type guard functions and validation utilities for runtime
 * verification of supplier plans and usage scenarios.
 */

import type { SupplierPlan, UsageScenario, CurrentPlan } from './types';

/**
 * Type guard to validate a SupplierPlan object
 *
 * @param plan - Object to validate
 * @returns True if the object matches SupplierPlan interface
 */
export function validateSupplierPlan(plan: any): plan is SupplierPlan {
	return (
		typeof plan === 'object' &&
		plan !== null &&
		typeof plan.id === 'string' &&
		typeof plan.supplier === 'string' &&
		typeof plan.planName === 'string' &&
		typeof plan.baseRate === 'number' &&
		plan.baseRate > 0 &&
		typeof plan.monthlyFee === 'number' &&
		plan.monthlyFee >= 0 &&
		typeof plan.contractTermMonths === 'number' &&
		plan.contractTermMonths >= 1 &&
		plan.contractTermMonths <= 60 &&
		typeof plan.earlyTerminationFee === 'number' &&
		plan.earlyTerminationFee >= 0 &&
		typeof plan.renewablePercent === 'number' &&
		plan.renewablePercent >= 0 &&
		plan.renewablePercent <= 100 &&
		typeof plan.ratings === 'object' &&
		typeof plan.ratings.reliabilityScore === 'number' &&
		plan.ratings.reliabilityScore >= 1 &&
		plan.ratings.reliabilityScore <= 5 &&
		typeof plan.ratings.customerServiceScore === 'number' &&
		plan.ratings.customerServiceScore >= 1 &&
		plan.ratings.customerServiceScore <= 5 &&
		Array.isArray(plan.features) &&
		plan.features.every((f: any) => typeof f === 'string') &&
		Array.isArray(plan.availableInStates) &&
		plan.availableInStates.every((s: any) => typeof s === 'string')
	);
}

/**
 * Type guard to validate a UsageScenario object
 *
 * @param scenario - Object to validate
 * @returns True if the object matches UsageScenario interface
 */
export function validateUsageScenario(scenario: any): scenario is UsageScenario {
	if (
		typeof scenario !== 'object' ||
		scenario === null ||
		typeof scenario.id !== 'string' ||
		typeof scenario.name !== 'string' ||
		typeof scenario.description !== 'string' ||
		!['residential', 'small-business', 'seasonal-high', 'seasonal-low'].includes(scenario.type) ||
		!Array.isArray(scenario.monthlyUsage) ||
		scenario.monthlyUsage.length !== 12 ||
		typeof scenario.annualKWh !== 'number' ||
		typeof scenario.averageMonthlyKWh !== 'number'
	) {
		return false;
	}

	// Validate each month entry
	for (const entry of scenario.monthlyUsage) {
		if (
			typeof entry !== 'object' ||
			typeof entry.month !== 'number' ||
			entry.month < 1 ||
			entry.month > 12 ||
			typeof entry.kWh !== 'number' ||
			entry.kWh <= 0
		) {
			return false;
		}
	}

	// Verify annual calculation matches sum of monthly values
	const calculatedAnnual = scenario.monthlyUsage.reduce((sum: number, m: any) => sum + m.kWh, 0);
	if (Math.abs(calculatedAnnual - scenario.annualKWh) > 1) {
		return false;
	}

	return true;
}

/**
 * Type guard to validate a CurrentPlan object
 *
 * @param plan - Object to validate
 * @returns True if the object matches CurrentPlan interface
 */
export function validateCurrentPlan(plan: any): plan is CurrentPlan {
	return (
		typeof plan === 'object' &&
		plan !== null &&
		typeof plan.supplier === 'string' &&
		typeof plan.planName === 'string' &&
		typeof plan.currentRate === 'number' &&
		plan.currentRate > 0 &&
		typeof plan.monthlyFee === 'number' &&
		plan.monthlyFee >= 0 &&
		(plan.contractEndDate === undefined || typeof plan.contractEndDate === 'string') &&
		typeof plan.monthsRemaining === 'number' &&
		plan.monthsRemaining >= 0 &&
		typeof plan.earlyTerminationFee === 'number' &&
		plan.earlyTerminationFee >= 0
	);
}

/**
 * Validates an entire supplier catalog array
 *
 * @param catalog - The catalog to validate
 * @throws Error if validation fails with descriptive message
 */
export function validateSupplierCatalog(catalog: unknown): void {
	if (!Array.isArray(catalog)) {
		throw new Error('Supplier catalog must be an array');
	}

	if (catalog.length === 0) {
		throw new Error('Supplier catalog cannot be empty');
	}

	const ids = new Set<string>();

	catalog.forEach((plan, index) => {
		if (!validateSupplierPlan(plan)) {
			throw new Error(`Invalid supplier plan at index ${index}: missing or invalid fields`);
		}

		// Check for duplicate IDs
		if (ids.has(plan.id)) {
			throw new Error(`Duplicate plan ID found: ${plan.id}`);
		}
		ids.add(plan.id);

		// Additional validation for numeric ranges
		if (plan.baseRate < 0.05 || plan.baseRate > 0.2) {
			throw new Error(`Plan ${plan.id}: baseRate ${plan.baseRate} is outside realistic range (0.05-0.20)`);
		}

		if (plan.monthlyFee < 0 || plan.monthlyFee > 50) {
			throw new Error(`Plan ${plan.id}: monthlyFee ${plan.monthlyFee} is outside realistic range (0-50)`);
		}
	});
}

/**
 * Validates an entire usage scenarios array
 *
 * @param scenarios - The scenarios to validate
 * @throws Error if validation fails with descriptive message
 */
export function validateUsageScenarios(scenarios: unknown): void {
	if (!Array.isArray(scenarios)) {
		throw new Error('Usage scenarios must be an array');
	}

	if (scenarios.length === 0) {
		throw new Error('Usage scenarios cannot be empty');
	}

	const ids = new Set<string>();

	scenarios.forEach((scenario, index) => {
		if (!validateUsageScenario(scenario)) {
			throw new Error(`Invalid usage scenario at index ${index}: missing or invalid fields`);
		}

		// Check for duplicate IDs
		if (ids.has(scenario.id)) {
			throw new Error(`Duplicate scenario ID found: ${scenario.id}`);
		}
		ids.add(scenario.id);

		// Verify months are sequential 1-12
		const months = scenario.monthlyUsage.map((m) => m.month).sort((a, b) => a - b);
		for (let i = 0; i < 12; i++) {
			if (months[i] !== i + 1) {
				throw new Error(`Scenario ${scenario.id}: missing or duplicate month ${i + 1}`);
			}
		}

		// Verify annual calculation
		const calculatedAnnual = scenario.monthlyUsage.reduce((sum, m) => sum + m.kWh, 0);
		if (Math.abs(calculatedAnnual - scenario.annualKWh) > 1) {
			throw new Error(
				`Scenario ${scenario.id}: annualKWh (${scenario.annualKWh}) doesn't match sum of monthly values (${calculatedAnnual})`,
			);
		}

		// Verify average calculation
		const expectedAverage = Math.round(scenario.annualKWh / 12);
		if (Math.abs(expectedAverage - scenario.averageMonthlyKWh) > 10) {
			throw new Error(
				`Scenario ${scenario.id}: averageMonthlyKWh (${scenario.averageMonthlyKWh}) doesn't match calculated average (${expectedAverage})`,
			);
		}

		// Verify kWh values are realistic
		scenario.monthlyUsage.forEach((month) => {
			if (month.kWh < 100 || month.kWh > 10000) {
				throw new Error(`Scenario ${scenario.id}, month ${month.month}: kWh value ${month.kWh} is outside realistic range (100-10000)`);
			}
		});
	});
}
