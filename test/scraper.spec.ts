/**
 * Tests for Power to Choose web scraper
 *
 * NOTE: These tests validate the scraped data integration into the catalog.
 * File system tests are not possible in Cloudflare Workers environment.
 */

import { describe, it, expect } from 'vitest';

describe('Power to Choose Scraper', () => {
	describe('Supplier Catalog Integration', () => {
		it('catalog should be valid TypeScript', async () => {
			// Import the catalog to verify it compiles
			const catalog = await import('../src/worker/data/supplier-catalog');
			expect(catalog.supplierCatalog).toBeDefined();
			expect(Array.isArray(catalog.supplierCatalog)).toBe(true);
		});

		it('catalog should have real data from scraper', async () => {
			const catalog = await import('../src/worker/data/supplier-catalog');
			expect(catalog.supplierCatalog.length).toBeGreaterThanOrEqual(10);
		});

		it('each plan should have required fields', async () => {
			const catalog = await import('../src/worker/data/supplier-catalog');

			const requiredFields = [
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

			catalog.supplierCatalog.forEach((plan: any, index: number) => {
				requiredFields.forEach((field) => {
					expect(plan).toHaveProperty(field);
				});
			});
		});

		it('each plan should have valid data types', async () => {
			const catalog = await import('../src/worker/data/supplier-catalog');

			catalog.supplierCatalog.forEach((plan: any) => {
				expect(typeof plan.id).toBe('string');
				expect(typeof plan.supplier).toBe('string');
				expect(typeof plan.planName).toBe('string');
				expect(typeof plan.baseRate).toBe('number');
				expect(typeof plan.monthlyFee).toBe('number');
				expect(typeof plan.contractTermMonths).toBe('number');
				expect(typeof plan.earlyTerminationFee).toBe('number');
				expect(typeof plan.renewablePercent).toBe('number');
				expect(typeof plan.ratings).toBe('object');
				expect(Array.isArray(plan.features)).toBe(true);
				expect(Array.isArray(plan.availableInStates)).toBe(true);
			});
		});

		it('each plan should have valid numeric ranges', async () => {
			const catalog = await import('../src/worker/data/supplier-catalog');

			catalog.supplierCatalog.forEach((plan: any) => {
				// Base rate should be between $0.05 and $0.50 per kWh
				expect(plan.baseRate).toBeGreaterThanOrEqual(0.05);
				expect(plan.baseRate).toBeLessThanOrEqual(0.5);

				// Monthly fee should be reasonable
				expect(plan.monthlyFee).toBeGreaterThanOrEqual(0);
				expect(plan.monthlyFee).toBeLessThanOrEqual(100);

				// Contract term should be 0-60 months
				expect(plan.contractTermMonths).toBeGreaterThanOrEqual(0);
				expect(plan.contractTermMonths).toBeLessThanOrEqual(60);

				// Early termination fee should be reasonable
				expect(plan.earlyTerminationFee).toBeGreaterThanOrEqual(0);
				expect(plan.earlyTerminationFee).toBeLessThanOrEqual(1000);

				// Renewable percentage should be 0-100
				expect(plan.renewablePercent).toBeGreaterThanOrEqual(0);
				expect(plan.renewablePercent).toBeLessThanOrEqual(100);

				// Ratings should be 1-5
				expect(plan.ratings.reliabilityScore).toBeGreaterThanOrEqual(1);
				expect(plan.ratings.reliabilityScore).toBeLessThanOrEqual(5);
				expect(plan.ratings.customerServiceScore).toBeGreaterThanOrEqual(1);
				expect(plan.ratings.customerServiceScore).toBeLessThanOrEqual(5);
			});
		});

		it('plans should be from Texas', async () => {
			const catalog = await import('../src/worker/data/supplier-catalog');

			catalog.supplierCatalog.forEach((plan: any) => {
				expect(plan.availableInStates).toContain('TX');
			});
		});

		it('plans should have real supplier names', async () => {
			const catalog = await import('../src/worker/data/supplier-catalog');

			// Verify we have real suppliers from Power to Choose
			const suppliers = catalog.supplierCatalog.map((p: any) => p.supplier);
			const uniqueSuppliers = [...new Set(suppliers)];

			expect(uniqueSuppliers.length).toBeGreaterThanOrEqual(5);
		});
	});
});
