/**
 * Strict Validation Tests for LLM Prompt Constraints (Story 7.8)
 * Tests that validation properly rejects AI hallucinations
 */

import { describe, it, expect } from 'vitest';
import { parsePlanScoring } from '../src/worker/validation/parsers';
import { supplierCatalog } from '../src/worker/data/supplier-catalog';
import { ValidationError } from '../src/worker/validation/errors';

describe('Strict Plan Validation (Story 7.8)', () => {
	const validPlanIds = Array.from(supplierCatalog).map((p) => p.id);

	describe('Plan ID Validation', () => {
		it('should REJECT recommendations with non-existent plan IDs', () => {
			const invalidResponse = JSON.stringify([
				{
					planId: 'fictional-plan-001',
					supplier: 'Fake Energy Co',
					planName: 'Imaginary Plan',
					score: 95,
					estimatedAnnualCost: 1200,
					estimatedSavings: 200,
					reasoning: 'Great savings',
				},
			]);

			expect(() => parsePlanScoring(invalidResponse, validPlanIds, 'test-stage')).toThrow(ValidationError);
			expect(() => parsePlanScoring(invalidResponse, validPlanIds, 'test-stage')).toThrow(/Too many invalid plan IDs/);
		});

		it('should ACCEPT recommendations with valid plan IDs', () => {
			const validPlan = Array.from(supplierCatalog)[0];
			const validResponse = JSON.stringify([
				{
					planId: validPlan.id,
					supplier: validPlan.supplier,
					planName: validPlan.planName,
					score: 85,
					estimatedAnnualCost: 1300,
					estimatedSavings: 150,
					reasoning: 'Good match',
				},
			]);

			expect(() => parsePlanScoring(validResponse, validPlanIds, 'test-stage')).not.toThrow();
		});

		it('should FILTER OUT invalid plan IDs (resilient behavior)', () => {
			const validPlan = Array.from(supplierCatalog)[0];
			const mixedResponse = JSON.stringify([
				{
					planId: validPlan.id,
					supplier: validPlan.supplier,
					planName: validPlan.planName,
					score: 85,
					estimatedAnnualCost: 1300,
					estimatedSavings: 150,
					reasoning: 'Good match',
				},
				{
					planId: 'fictional-plan-002',
					supplier: 'Made Up Inc',
					planName: 'Fake Plan',
					score: 90,
					estimatedAnnualCost: 1100,
					estimatedSavings: 250,
					reasoning: 'Even better!',
				},
			]);

			// NEW BEHAVIOR: Filter out invalid plans instead of throwing (more resilient)
			const result = parsePlanScoring(mixedResponse, validPlanIds, 'test-stage');
			expect(result.scoredPlans).toHaveLength(1); // Only valid plan should remain
			expect(result.scoredPlans[0].planId).toBe(validPlan.id);
		});

		it('should REJECT if MAJORITY of plan IDs are invalid (>50% error rate)', () => {
			const validPlan = Array.from(supplierCatalog)[0];
			const mostlyInvalidResponse = JSON.stringify([
				{
					planId: validPlan.id,
					supplier: validPlan.supplier,
					planName: validPlan.planName,
					score: 85,
					estimatedAnnualCost: 1300,
					estimatedSavings: 150,
					reasoning: 'Good match',
				},
				{
					planId: 'fictional-plan-001',
					supplier: 'Made Up Inc',
					planName: 'Fake Plan 1',
					score: 90,
					estimatedAnnualCost: 1100,
					estimatedSavings: 250,
					reasoning: 'Fake 1',
				},
				{
					planId: 'fictional-plan-002',
					supplier: 'Made Up Inc',
					planName: 'Fake Plan 2',
					score: 88,
					estimatedAnnualCost: 1150,
					estimatedSavings: 200,
					reasoning: 'Fake 2',
				},
			]);

			// Should throw when >50% of plans are invalid (2 out of 3)
			expect(() => parsePlanScoring(mostlyInvalidResponse, validPlanIds, 'test-stage')).toThrow(ValidationError);
			expect(() => parsePlanScoring(mostlyInvalidResponse, validPlanIds, 'test-stage')).toThrow(/Too many invalid plan IDs/);
		});
	});

	describe('Plan Name Validation', () => {
		it('should REJECT if AI modifies plan name (non-contract-length changes)', () => {
			const validPlan = Array.from(supplierCatalog)[0];
			const modifiedNameResponse = JSON.stringify([
				{
					planId: validPlan.id,
					supplier: validPlan.supplier,
					planName: validPlan.planName + ' Plus', // Modified name
					score: 85,
					estimatedAnnualCost: 1300,
					estimatedSavings: 150,
					reasoning: 'Good match',
				},
			]);

			expect(() => parsePlanScoring(modifiedNameResponse, validPlanIds, 'test-stage')).toThrow(ValidationError);
			expect(() => parsePlanScoring(modifiedNameResponse, validPlanIds, 'test-stage')).toThrow(/planName mismatch/);
		});

		it('should ACCEPT exact plan name match', () => {
			const validPlan = Array.from(supplierCatalog)[0];
			const exactNameResponse = JSON.stringify([
				{
					planId: validPlan.id,
					supplier: validPlan.supplier,
					planName: validPlan.planName, // Exact match
					score: 85,
					estimatedAnnualCost: 1300,
					estimatedSavings: 150,
					reasoning: 'Good match',
				},
			]);

			expect(() => parsePlanScoring(exactNameResponse, validPlanIds, 'test-stage')).not.toThrow();
		});

		it('should ACCEPT plan name with different contract length (fuzzy match)', () => {
			// Find plans with contract length variations
			const greenMountain12 = Array.from(supplierCatalog).find(
				(p) => p.planName === 'Pollution Free e-Plus 12 Choice' && p.supplier === 'GREEN MOUNTAIN ENERGY COMPANY',
			);
			if (!greenMountain12) throw new Error('Test plan not found');

			// AI returns 12-month plan name but with 24-month plan's ID (common variation)
			const fuzzyMatchResponse = JSON.stringify([
				{
					planId: greenMountain12.id,
					supplier: greenMountain12.supplier,
					planName: 'Pollution Free e-Plus 24 Choice', // Different contract length
					score: 85,
					estimatedAnnualCost: 1300,
					estimatedSavings: 150,
					reasoning: 'Good renewable option',
				},
			]);

			// Should NOT throw - fuzzy matching allows contract length variations
			expect(() => parsePlanScoring(fuzzyMatchResponse, validPlanIds, 'test-stage')).not.toThrow();
		});

		it('should ACCEPT contract length variations for Frontier Power Saver plans', () => {
			// Frontier Power Saver 6 and Frontier Power Saver 12 should match
			const frontierPlan = Array.from(supplierCatalog).find((p) => p.planName === 'Frontier Power Saver 6');
			if (!frontierPlan) throw new Error('Test plan not found');

			const fuzzyMatchResponse = JSON.stringify([
				{
					planId: frontierPlan.id,
					supplier: frontierPlan.supplier,
					planName: 'Frontier Power Saver 12', // Different contract length
					score: 85,
					estimatedAnnualCost: 1300,
					estimatedSavings: 150,
					reasoning: 'Good rate',
				},
			]);

			// Should NOT throw - fuzzy matching allows contract length variations
			expect(() => parsePlanScoring(fuzzyMatchResponse, validPlanIds, 'test-stage')).not.toThrow();
		});
	});

	describe('Supplier Name Validation', () => {
		it('should REJECT if AI modifies supplier name', () => {
			const validPlan = Array.from(supplierCatalog)[0];
			const modifiedSupplierResponse = JSON.stringify([
				{
					planId: validPlan.id,
					supplier: 'Different ' + validPlan.supplier, // Modified supplier
					planName: validPlan.planName,
					score: 85,
					estimatedAnnualCost: 1300,
					estimatedSavings: 150,
					reasoning: 'Good match',
				},
			]);

			expect(() => parsePlanScoring(modifiedSupplierResponse, validPlanIds, 'test-stage')).toThrow(ValidationError);
			expect(() => parsePlanScoring(modifiedSupplierResponse, validPlanIds, 'test-stage')).toThrow(/supplier mismatch/);
		});

		it('should ACCEPT exact supplier name match', () => {
			const validPlan = Array.from(supplierCatalog)[0];
			const exactSupplierResponse = JSON.stringify([
				{
					planId: validPlan.id,
					supplier: validPlan.supplier, // Exact match
					planName: validPlan.planName,
					score: 85,
					estimatedAnnualCost: 1300,
					estimatedSavings: 150,
					reasoning: 'Good match',
				},
			]);

			expect(() => parsePlanScoring(exactSupplierResponse, validPlanIds, 'test-stage')).not.toThrow();
		});
	});

	describe('Multiple Validation Failures', () => {
		it('should report both plan name AND supplier mismatches', () => {
			const validPlan = Array.from(supplierCatalog)[0];
			const multipleIssuesResponse = JSON.stringify([
				{
					planId: validPlan.id,
					supplier: 'Wrong Supplier', // Mismatch
					planName: 'Wrong Plan Name', // Mismatch
					score: 85,
					estimatedAnnualCost: 1300,
					estimatedSavings: 150,
					reasoning: 'Good match',
				},
			]);

			expect(() => parsePlanScoring(multipleIssuesResponse, validPlanIds, 'test-stage')).toThrow(ValidationError);
			expect(() => parsePlanScoring(multipleIssuesResponse, validPlanIds, 'test-stage')).toThrow(/supplier mismatch/);
			expect(() => parsePlanScoring(multipleIssuesResponse, validPlanIds, 'test-stage')).toThrow(/planName mismatch/);
		});
	});

	describe('Real-world Hallucination Scenarios', () => {
		it('should REJECT common hallucination: plan name variation', () => {
			// AI adds "Premium" to existing plan name
			const plan = Array.from(supplierCatalog).find((p) => p.planName === 'Gexa Eco Choice 12');
			if (!plan) throw new Error('Test plan not found');

			const hallucination = JSON.stringify([
				{
					planId: plan.id,
					supplier: plan.supplier,
					planName: 'Gexa Eco Choice 12 Premium', // Hallucinated variation
					score: 92,
					estimatedAnnualCost: 1250,
					estimatedSavings: 180,
					reasoning: 'Enhanced version with more features',
				},
			]);

			expect(() => parsePlanScoring(hallucination, validPlanIds, 'test-stage')).toThrow(ValidationError);
		});

		it('should REJECT common hallucination: new supplier for existing plan', () => {
			const plan = Array.from(supplierCatalog)[0];
			const hallucination = JSON.stringify([
				{
					planId: plan.id,
					supplier: 'SuperGreen Energy Solutions', // Different supplier
					planName: plan.planName,
					score: 94,
					estimatedAnnualCost: 1150,
					estimatedSavings: 280,
					reasoning: 'Best new supplier in the market',
				},
			]);

			expect(() => parsePlanScoring(hallucination, validPlanIds, 'test-stage')).toThrow(ValidationError);
		});

		it('should REJECT completely fictional plan', () => {
			const hallucination = JSON.stringify([
				{
					planId: 'ultra-green-2025',
					supplier: 'NextGen Renewable Power',
					planName: 'Ultra Green 2025',
					score: 98,
					estimatedAnnualCost: 950,
					estimatedSavings: 450,
					reasoning: 'Revolutionary new plan with AI optimization',
				},
			]);

			expect(() => parsePlanScoring(hallucination, validPlanIds, 'test-stage')).toThrow(ValidationError);
			expect(() => parsePlanScoring(hallucination, validPlanIds, 'test-stage')).toThrow(/ultra-green-2025/);
		});
	});

	describe('Edge Cases', () => {
		it('should reject empty plan array (schema requires min 1 plan)', () => {
			const emptyResponse = JSON.stringify({ scoredPlans: [], totalPlansScored: 0 });

			// Schema validation should fail - requires at least 1 plan
			expect(() => parsePlanScoring(emptyResponse, validPlanIds, 'test-stage')).toThrow();
		});

		it('should filter out invalid plans in large response (resilient)', () => {
			// Create response with 10 plans - one invalid
			const validPlans = Array.from(supplierCatalog).slice(0, 9);
			const plans = validPlans.map((p) => ({
				planId: p.id,
				supplier: p.supplier,
				planName: p.planName,
				score: 80,
				estimatedAnnualCost: 1300,
				estimatedSavings: 150,
				reasoning: 'Good match',
			}));

			// Add one invalid plan (10% error rate - should be filtered, not throw)
			plans.push({
				planId: 'invalid-plan-id',
				supplier: 'Invalid Supplier',
				planName: 'Invalid Plan',
				score: 95,
				estimatedAnnualCost: 1100,
				estimatedSavings: 300,
				reasoning: 'Too good to be true',
			});

			const response = JSON.stringify(plans);
			// Should NOT throw - only 10% error rate, should filter out invalid plan
			const result = parsePlanScoring(response, validPlanIds, 'test-stage');
			expect(result.scoredPlans).toHaveLength(9); // 9 valid plans remain
		});
	});
});
