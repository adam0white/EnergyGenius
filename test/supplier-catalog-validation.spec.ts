/**
 * Supplier Catalog Data Validation Tests
 *
 * Validates that all supplier plans have:
 * - Required fields present
 * - Renewable percentage in valid range (0-100)
 * - Valid contract terms
 * - Proper data types
 */

import { describe, it, expect } from 'vitest';
import { supplierCatalog } from '../src/worker/data/supplier-catalog';
import type { SupplierPlan } from '../src/worker/data/types';

describe('Supplier Catalog Data Validation', () => {
	it('should have at least 10 plans', () => {
		expect(supplierCatalog.length).toBeGreaterThanOrEqual(10);
	});

	it('should have all required fields for every plan', () => {
		const requiredFields: (keyof SupplierPlan)[] = [
			'id',
			'supplier',
			'planName',
			'baseRate',
			'monthlyFee',
			'contractTermMonths',
			'earlyTerminationFee',
			'renewablePercent',
			'ratings',
			'features',
			'availableInStates',
		];

		supplierCatalog.forEach((plan, index) => {
			requiredFields.forEach((field) => {
				expect(plan[field], `Plan ${index} (${plan.planName}) missing field: ${field}`).toBeDefined();
			});
		});
	});

	it('should have renewable percentage in valid range (0-100)', () => {
		supplierCatalog.forEach((plan) => {
			expect(plan.renewablePercent).toBeGreaterThanOrEqual(0);
			expect(plan.renewablePercent).toBeLessThanOrEqual(100);
		});
	});

	it('should have at least one plan with 100% renewable energy', () => {
		const fullyRenewablePlans = supplierCatalog.filter((plan) => plan.renewablePercent === 100);
		expect(fullyRenewablePlans.length).toBeGreaterThan(0);
		console.log(
			`Found ${fullyRenewablePlans.length} plans with 100% renewable:`,
			fullyRenewablePlans.map((p) => p.planName),
		);
	});

	it('should have plans with varied renewable percentages', () => {
		const renewablePercentages = new Set(supplierCatalog.map((plan) => plan.renewablePercent));
		// Should have at least 5 different renewable percentage values
		expect(renewablePercentages.size).toBeGreaterThanOrEqual(5);
	});

	it('should have valid contract terms', () => {
		const validTerms = [3, 6, 12, 24];
		supplierCatalog.forEach((plan) => {
			expect(validTerms).toContain(plan.contractTermMonths);
		});
	});

	it('should have non-negative early termination fees', () => {
		supplierCatalog.forEach((plan) => {
			expect(plan.earlyTerminationFee).toBeGreaterThanOrEqual(0);
		});
	});

	it('should have positive base rates', () => {
		supplierCatalog.forEach((plan) => {
			expect(plan.baseRate).toBeGreaterThan(0);
			expect(plan.baseRate).toBeLessThan(1.0); // Realistic rate in $/kWh
		});
	});

	it('should have non-negative monthly fees', () => {
		supplierCatalog.forEach((plan) => {
			expect(plan.monthlyFee).toBeGreaterThanOrEqual(0);
		});
	});

	it('should have valid reliability scores (1-5)', () => {
		supplierCatalog.forEach((plan) => {
			expect(plan.ratings.reliabilityScore).toBeGreaterThanOrEqual(1);
			expect(plan.ratings.reliabilityScore).toBeLessThanOrEqual(5);
		});
	});

	it('should have valid customer service scores (1-5)', () => {
		supplierCatalog.forEach((plan) => {
			expect(plan.ratings.customerServiceScore).toBeGreaterThanOrEqual(1);
			expect(plan.ratings.customerServiceScore).toBeLessThanOrEqual(5);
		});
	});

	it('should have at least one feature per plan', () => {
		supplierCatalog.forEach((plan) => {
			expect(plan.features.length).toBeGreaterThan(0);
		});
	});

	it('should have at least one available state per plan', () => {
		supplierCatalog.forEach((plan) => {
			expect(plan.availableInStates.length).toBeGreaterThan(0);
		});
	});

	it('should have unique plan IDs', () => {
		const planIds = supplierCatalog.map((plan) => plan.id);
		const uniqueIds = new Set(planIds);
		expect(uniqueIds.size).toBe(planIds.length);
	});

	it('should log renewable percentage distribution', () => {
		const distribution: Record<string, number> = {
			'0-20%': 0,
			'21-40%': 0,
			'41-60%': 0,
			'61-80%': 0,
			'81-99%': 0,
			'100%': 0,
		};

		supplierCatalog.forEach((plan) => {
			const pct = plan.renewablePercent;
			if (pct === 0) distribution['0-20%']++;
			else if (pct <= 20) distribution['0-20%']++;
			else if (pct <= 40) distribution['21-40%']++;
			else if (pct <= 60) distribution['41-60%']++;
			else if (pct <= 80) distribution['61-80%']++;
			else if (pct < 100) distribution['81-99%']++;
			else distribution['100%']++;
		});

		console.log('Renewable Percentage Distribution:', distribution);
		expect(true).toBe(true); // This is just for logging
	});
});
