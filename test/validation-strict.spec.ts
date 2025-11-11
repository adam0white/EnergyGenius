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
			expect(() => parsePlanScoring(invalidResponse, validPlanIds, 'test-stage')).toThrow(/not found in catalog/);
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

		it('should REJECT if ANY plan ID is invalid (partial failure)', () => {
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

			expect(() => parsePlanScoring(mixedResponse, validPlanIds, 'test-stage')).toThrow(ValidationError);
			expect(() => parsePlanScoring(mixedResponse, validPlanIds, 'test-stage')).toThrow(/fictional-plan-002/);
		});
	});

	describe('Plan Name Validation', () => {
		it('should REJECT if AI modifies plan name', () => {
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
			const ecoMaxPlan = Array.from(supplierCatalog).find((p) => p.planName === 'Eco Max');
			if (!ecoMaxPlan) throw new Error('Test plan not found');

			const hallucination = JSON.stringify([
				{
					planId: ecoMaxPlan.id,
					supplier: ecoMaxPlan.supplier,
					planName: 'Eco Max Premium', // Hallucinated variation
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

		it('should validate all plans in large response', () => {
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

			// Add one invalid plan
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
			expect(() => parsePlanScoring(response, validPlanIds, 'test-stage')).toThrow(ValidationError);
		});
	});
});
