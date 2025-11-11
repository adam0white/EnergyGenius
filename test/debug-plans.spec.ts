/**
 * Tests for DebugPlans component logic
 * Story 7.9: Add Debug UI - View All Plans
 */

import { describe, it, expect } from 'vitest';
import { supplierCatalog } from '../src/worker/data/supplier-catalog';
import type { SupplierPlan } from '../src/worker/data/types';

/**
 * Helper functions from DebugPlans component
 */
function formatCurrency(value: number): string {
	return `$${value.toFixed(3)}`;
}

function formatPercent(value: number): string {
	return `${value}%`;
}

function getTier(plan: SupplierPlan): 'Gold' | 'Silver' | 'Bronze' {
	const avgRating = (plan.ratings.reliabilityScore + plan.ratings.customerServiceScore) / 2;

	if (plan.renewablePercent >= 80 && avgRating >= 4.5) return 'Gold';
	if (plan.renewablePercent >= 50 && avgRating >= 4.0) return 'Silver';
	return 'Bronze';
}

describe('DebugPlans Component Logic', () => {
	describe('Data Availability', () => {
		it('should have access to supplier catalog', () => {
			expect(supplierCatalog).toBeDefined();
			expect(supplierCatalog.length).toBeGreaterThan(0);
		});

		it('should have exactly 12 plans in catalog', () => {
			expect(supplierCatalog.length).toBe(12);
		});

		it('should have all required fields in each plan', () => {
			supplierCatalog.forEach((plan) => {
				expect(plan.id).toBeDefined();
				expect(plan.supplier).toBeDefined();
				expect(plan.planName).toBeDefined();
				expect(plan.baseRate).toBeTypeOf('number');
				expect(plan.monthlyFee).toBeTypeOf('number');
				expect(plan.contractTermMonths).toBeTypeOf('number');
				expect(plan.renewablePercent).toBeTypeOf('number');
				expect(plan.ratings).toBeDefined();
				expect(plan.ratings.reliabilityScore).toBeTypeOf('number');
				expect(plan.ratings.customerServiceScore).toBeTypeOf('number');
			});
		});
	});

	describe('Format Functions', () => {
		it('should format currency correctly', () => {
			expect(formatCurrency(0.12)).toBe('$0.120');
			expect(formatCurrency(0.089)).toBe('$0.089');
			expect(formatCurrency(0.135)).toBe('$0.135');
		});

		it('should format percentages correctly', () => {
			expect(formatPercent(100)).toBe('100%');
			expect(formatPercent(50)).toBe('50%');
			expect(formatPercent(0)).toBe('0%');
		});
	});

	describe('Tier Calculation', () => {
		it('should assign Gold tier to high renewable and high rating plans', () => {
			const goldPlan: SupplierPlan = {
				id: 'test-gold',
				supplier: 'Test Supplier',
				planName: 'Test Gold',
				baseRate: 0.12,
				monthlyFee: 15,
				contractTermMonths: 12,
				earlyTerminationFee: 0,
				renewablePercent: 100,
				ratings: {
					reliabilityScore: 4.8,
					customerServiceScore: 4.9,
				},
				features: [],
				availableInStates: ['TX'],
			};

			expect(getTier(goldPlan)).toBe('Gold');
		});

		it('should assign Silver tier to medium renewable and good rating plans', () => {
			const silverPlan: SupplierPlan = {
				id: 'test-silver',
				supplier: 'Test Supplier',
				planName: 'Test Silver',
				baseRate: 0.105,
				monthlyFee: 10,
				contractTermMonths: 6,
				earlyTerminationFee: 0,
				renewablePercent: 55,
				ratings: {
					reliabilityScore: 4.2,
					customerServiceScore: 4.0,
				},
				features: [],
				availableInStates: ['TX'],
			};

			expect(getTier(silverPlan)).toBe('Silver');
		});

		it('should assign Bronze tier to lower renewable or rating plans', () => {
			const bronzePlan: SupplierPlan = {
				id: 'test-bronze',
				supplier: 'Test Supplier',
				planName: 'Test Bronze',
				baseRate: 0.089,
				monthlyFee: 5,
				contractTermMonths: 24,
				earlyTerminationFee: 50,
				renewablePercent: 10,
				ratings: {
					reliabilityScore: 3.8,
					customerServiceScore: 3.5,
				},
				features: [],
				availableInStates: ['TX'],
			};

			expect(getTier(bronzePlan)).toBe('Bronze');
		});

		it('should categorize all catalog plans into tiers', () => {
			const tierCounts = supplierCatalog.reduce(
				(acc, plan) => {
					const tier = getTier(plan);
					acc[tier] = (acc[tier] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>
			);

			// Each plan should be assigned a tier
			const totalTiered = (tierCounts.Gold || 0) + (tierCounts.Silver || 0) + (tierCounts.Bronze || 0);
			expect(totalTiered).toBe(supplierCatalog.length);

			// Should have at least one of each tier (based on catalog data)
			expect(tierCounts.Gold).toBeGreaterThan(0);
			expect(tierCounts.Silver).toBeGreaterThan(0);
			expect(tierCounts.Bronze).toBeGreaterThan(0);
		});
	});

	describe('Statistics Calculations', () => {
		it('should calculate average renewable percentage correctly', () => {
			const total = supplierCatalog.reduce((sum, plan) => sum + plan.renewablePercent, 0);
			const avg = total / supplierCatalog.length;

			expect(avg).toBeGreaterThan(0);
			expect(avg).toBeLessThanOrEqual(100);
		});

		it('should calculate price range correctly', () => {
			const prices = supplierCatalog.map((p) => p.baseRate);
			const min = Math.min(...prices);
			const max = Math.max(...prices);

			expect(min).toBeLessThanOrEqual(max);
			expect(min).toBeGreaterThan(0);
			expect(max).toBeLessThan(1); // Reasonable upper bound for $/kWh
		});

		it('should count unique suppliers correctly', () => {
			const uniqueSuppliers = new Set(supplierCatalog.map((p) => p.supplier));

			expect(uniqueSuppliers.size).toBeGreaterThan(0);
			expect(uniqueSuppliers.size).toBeLessThanOrEqual(supplierCatalog.length);
		});
	});

	describe('Filtering Logic', () => {
		it('should filter by search term (case insensitive)', () => {
			const searchTerm = 'green';
			const filtered = supplierCatalog.filter((plan) => {
				const searchLower = searchTerm.toLowerCase();
				return (
					plan.supplier.toLowerCase().includes(searchLower) ||
					plan.planName.toLowerCase().includes(searchLower) ||
					plan.features.some((f) => f.toLowerCase().includes(searchLower))
				);
			});

			expect(filtered.length).toBeGreaterThan(0);
			expect(filtered.length).toBeLessThanOrEqual(supplierCatalog.length);
		});

		it('should filter by renewable percentage range', () => {
			const minRenewable = 80;
			const maxRenewable = 100;

			const filtered = supplierCatalog.filter(
				(plan) => plan.renewablePercent >= minRenewable && plan.renewablePercent <= maxRenewable
			);

			expect(filtered.length).toBeGreaterThan(0);
			filtered.forEach((plan) => {
				expect(plan.renewablePercent).toBeGreaterThanOrEqual(minRenewable);
				expect(plan.renewablePercent).toBeLessThanOrEqual(maxRenewable);
			});
		});

		it('should filter by tier', () => {
			const plansWithTiers = supplierCatalog.map((plan) => ({
				...plan,
				tier: getTier(plan),
			}));

			const goldPlans = plansWithTiers.filter((plan) => plan.tier === 'Gold');

			expect(goldPlans.length).toBeGreaterThan(0);
			goldPlans.forEach((plan) => {
				expect(plan.tier).toBe('Gold');
			});
		});

		it('should handle combined filters', () => {
			const plansWithTiers = supplierCatalog.map((plan) => ({
				...plan,
				tier: getTier(plan),
			}));

			// Filter: Gold tier AND renewable >= 80%
			const filtered = plansWithTiers.filter((plan) => plan.tier === 'Gold' && plan.renewablePercent >= 80);

			filtered.forEach((plan) => {
				expect(plan.tier).toBe('Gold');
				expect(plan.renewablePercent).toBeGreaterThanOrEqual(80);
			});
		});
	});

	describe('Export Data Format', () => {
		it('should format data for CSV export', () => {
			const plan = supplierCatalog[0];
			const row = [
				plan.supplier,
				plan.planName,
				plan.baseRate.toFixed(3),
				plan.monthlyFee.toFixed(2),
				plan.renewablePercent,
				getTier(plan),
				plan.contractTermMonths,
				plan.earlyTerminationFee,
				'Mock',
			];

			expect(row.length).toBe(9);
			expect(row[0]).toBe(plan.supplier);
			expect(row[1]).toBe(plan.planName);
			expect(row[8]).toBe('Mock');
		});

		it('should format data for JSON export', () => {
			const plansWithTiers = supplierCatalog.map((plan) => ({
				...plan,
				tier: getTier(plan),
			}));

			const json = JSON.stringify(plansWithTiers, null, 2);

			expect(json).toBeDefined();
			expect(json.length).toBeGreaterThan(0);
			expect(JSON.parse(json)).toEqual(plansWithTiers);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty search results', () => {
			const searchTerm = 'NonexistentPlan12345XYZ';
			const filtered = supplierCatalog.filter((plan) => {
				const searchLower = searchTerm.toLowerCase();
				return (
					plan.supplier.toLowerCase().includes(searchLower) ||
					plan.planName.toLowerCase().includes(searchLower) ||
					plan.features.some((f) => f.toLowerCase().includes(searchLower))
				);
			});

			expect(filtered.length).toBe(0);
		});

		it('should handle renewable range with no matches', () => {
			const minRenewable = 101; // Invalid range
			const maxRenewable = 200;

			const filtered = supplierCatalog.filter(
				(plan) => plan.renewablePercent >= minRenewable && plan.renewablePercent <= maxRenewable
			);

			expect(filtered.length).toBe(0);
		});

		it('should handle all tiers deselected (empty result)', () => {
			const selectedTiers = new Set<string>(); // No tiers selected

			const plansWithTiers = supplierCatalog.map((plan) => ({
				...plan,
				tier: getTier(plan),
			}));

			const filtered = plansWithTiers.filter((plan) => selectedTiers.has(plan.tier));

			expect(filtered.length).toBe(0);
		});
	});
});
