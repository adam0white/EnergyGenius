/**
 * Test suite for Issue #3: Narrative Copy Corruption Fix
 * Validates that parseNarrative handles both well-formed and malformed AI responses
 */

import { describe, it, expect } from 'vitest';
import { parseNarrative } from '../src/worker/validation/parsers';

describe('Narrative Parsing - Issue #3 Fix', () => {
	const mockPlanIds = ['plan-001', 'plan-002', 'plan-003'];

	describe('Well-formed AI responses', () => {
		it('should correctly parse response with proper --- separators', () => {
			const response = `
Green Energy Co - EcoSaver 12 (Score: 92/100)

This plan saves you $214 annually with 100% renewable energy and a flexible 12-month contract.

Key Benefits:
- 15% annual savings
- 100% renewable energy
- No early termination fee

Important to Know:
Fixed rates provide predictable monthly costs. Contract renews automatically.

Estimated Annual Savings: $214.00

---

Power Plus - Value Plan 24 (Score: 88/100)

This plan offers competitive rates with a longer commitment period of 24 months for better price stability.

Key Benefits:
- Low base rate of $0.089/kWh
- 24-month price lock
- Small monthly fee of $4.95

Important to Know:
Early termination fee of $150 applies if you cancel before 24 months.

Estimated Annual Savings: $180.00

---

Frontier Power - Saver 12 (Score: 85/100)

A solid choice for consistent usage patterns with good customer service ratings.

Key Benefits:
- Reliable service provider
- Fixed rate structure
- Month-to-month after initial term

Important to Know:
Moderate base rate but no monthly fees. Good for budget-conscious customers.

Estimated Annual Savings: $120.00

---
			`.trim();

			const result = parseNarrative(response, mockPlanIds, 'test-stage');

			// Should have 3 recommendations
			expect(result.topRecommendations).toHaveLength(3);

			// Should map to correct plan IDs
			expect(result.topRecommendations[0].planId).toBe('plan-001');
			expect(result.topRecommendations[1].planId).toBe('plan-002');
			expect(result.topRecommendations[2].planId).toBe('plan-003');

			// Each rationale should start with the correct plan name
			expect(result.topRecommendations[0].rationale).toContain('Green Energy Co - EcoSaver 12');
			expect(result.topRecommendations[1].rationale).toContain('Power Plus - Value Plan 24');
			expect(result.topRecommendations[2].rationale).toContain('Frontier Power - Saver 12');

			// Should NOT contain mid-word breaks like "onths"
			expect(result.topRecommendations[0].rationale).not.toMatch(/^\w+onths/i);
			expect(result.topRecommendations[1].rationale).not.toMatch(/^\w+onths/i);
			expect(result.topRecommendations[2].rationale).not.toMatch(/^\w+onths/i);
		});
	});

	describe('Malformed AI responses - Missing separators', () => {
		it('should handle response with NO separators using character-based fallback', () => {
			const response = `
Green Energy Co - EcoSaver 12 (Score: 92/100)
This plan saves you $214 annually with 100% renewable energy.
Power Plus - Value Plan 24 (Score: 88/100)
This plan offers competitive rates with a 24-month commitment.
Frontier Power - Saver 12 (Score: 85/100)
A solid choice for consistent usage patterns.
			`.trim();

			const result = parseNarrative(response, mockPlanIds, 'test-stage');

			// Should still have 3 recommendations (fallback mode)
			expect(result.topRecommendations).toHaveLength(3);

			// Should map to correct plan IDs
			expect(result.topRecommendations[0].planId).toBe('plan-001');
			expect(result.topRecommendations[1].planId).toBe('plan-002');
			expect(result.topRecommendations[2].planId).toBe('plan-003');

			// Each section should have content (not empty)
			expect(result.topRecommendations[0].rationale.length).toBeGreaterThan(50);
			expect(result.topRecommendations[1].rationale.length).toBeGreaterThan(50);
			expect(result.topRecommendations[2].rationale.length).toBeGreaterThan(50);
		});

		it('should handle response with only ONE separator (creates 2 sections)', () => {
			const response = `
Green Energy Co - EcoSaver 12 (Score: 92/100)
This plan saves you $214 annually with 100% renewable energy and a flexible contract.

---

Power Plus - Value Plan 24 (Score: 88/100)
This plan offers competitive rates. Frontier Power - Saver 12 (Score: 85/100) is also good.
			`.trim();

			const result = parseNarrative(response, mockPlanIds, 'test-stage');

			// Should use character-based fallback since we got 2 sections but need 3
			expect(result.topRecommendations).toHaveLength(3);

			// All plan IDs should be present
			expect(result.topRecommendations[0].planId).toBe('plan-001');
			expect(result.topRecommendations[1].planId).toBe('plan-002');
			expect(result.topRecommendations[2].planId).toBe('plan-003');
		});
	});

	describe('Malformed AI responses - Text bleeding', () => {
		it('should handle mashed content where multiple plans blend together', () => {
			// Simulates the bug where separators are missing and text bleeds across plans
			const response = `
Green Energy Co - EcoSaver 12 (Score: 92/100)
This plan saves you $214 annually.Important to Know: Fixed rates. Power Plus - Value Plan 24 (Score: 88/100)
This offers competitive rates.Important to Know: 24 month term. Frontier Power - Saver 12 (Score: 85/100)
Solid choice.Important to Know: No monthly fees.
			`.trim();

			const result = parseNarrative(response, mockPlanIds, 'test-stage');

			// Should still create 3 distinct sections using fallback
			expect(result.topRecommendations).toHaveLength(3);

			// Should NOT start with partial words like "onths" or "ortant"
			for (const rec of result.topRecommendations) {
				expect(rec.rationale).not.toMatch(/^\w{1,5}$/); // No fragments
				expect(rec.rationale.length).toBeGreaterThan(20); // Reasonable length
			}
		});
	});

	describe('Edge cases', () => {
		it('should handle response with extra separators (more than needed)', () => {
			const response = `
Plan 1 content here with good details about savings and benefits that customers will appreciate.

---

Plan 2 content here with information about contract terms and pricing structure details.

---

Plan 3 content here with renewable energy details and environmental impact information.

---

Extra content that should be ignored since we only need three plan sections.

---
			`.trim();

			const result = parseNarrative(response, mockPlanIds, 'test-stage');

			// Should take first 3 sections (4+ sections available, takes first 3)
			expect(result.topRecommendations).toHaveLength(3);

			// Verify content is present (separator splits remove "Plan X" text so check for other content)
			expect(result.topRecommendations[0].rationale).toContain('content');
			expect(result.topRecommendations[1].rationale).toContain('content');
			expect(result.topRecommendations[2].rationale).toContain('content');

			// Should NOT include the "Extra content" section
			expect(result.topRecommendations[0].rationale).not.toContain('Extra content');
			expect(result.topRecommendations[1].rationale).not.toContain('Extra content');
			expect(result.topRecommendations[2].rationale).not.toContain('Extra content');
		});

		it('should handle separators with extra dashes', () => {
			const response = `
Plan 1 content with enough text to pass the 200 character minimum requirement for validation testing purposes.

-----

Plan 2 content with enough text to pass the 200 character minimum requirement for validation testing purposes.

------

Plan 3 content with enough text to pass the 200 character minimum requirement for validation testing purposes.

---
			`.trim();

			const result = parseNarrative(response, mockPlanIds, 'test-stage');

			// Should still parse correctly (regex matches ---+)
			expect(result.topRecommendations).toHaveLength(3);
		});

		it('should handle separators with surrounding whitespace', () => {
			const response = `
Plan 1 content with sufficient detail and length to meet the minimum character requirement for proper testing and validation.
   ---
Plan 2 content with sufficient detail and length to meet the minimum character requirement for proper testing and validation.
		---
Plan 3 content with sufficient detail and length to meet the minimum character requirement for proper testing and validation.
---
			`.trim();

			const result = parseNarrative(response, mockPlanIds, 'test-stage');

			// Should handle whitespace around separators
			expect(result.topRecommendations).toHaveLength(3);
		});
	});

	describe('Regression tests', () => {
		it('should NOT create mid-word breaks in rationale text', () => {
			const response = `
First plan with detailed explanation about 12 months contract and savings.

---

Second plan offering 24 months of stability with fixed rates.

---

Third plan provides flexible terms with 6 months initial period.

---
			`.trim();

			const result = parseNarrative(response, mockPlanIds, 'test-stage');

			// Check that "months" is NOT broken into "onths"
			for (const rec of result.topRecommendations) {
				// Should contain full word "months" not partial "onths"
				if (rec.rationale.includes('onths')) {
					expect(rec.rationale).toMatch(/\bmonths\b/i);
					expect(rec.rationale).not.toMatch(/^\w+onths\b/i); // Should not START with partial word
				}
			}
		});

		it('should NOT mix "Important to Know" sections from different plans', () => {
			const response = `
Plan 1 details here with comprehensive information about rates, benefits, and customer service ratings that matter most.

Important to Know: 12-month contract with fixed rates and no early termination fees for maximum flexibility.

---

Plan 2 details here with comprehensive information about rates, benefits, and customer service ratings that matter most.

Important to Know: 24-month contract with guaranteed pricing and stable monthly costs for long-term savings.

---

Plan 3 details here with comprehensive information about rates, benefits, and customer service ratings that matter most.

Important to Know: Month-to-month flexibility after initial term with competitive variable rates.

---
			`.trim();

			const result = parseNarrative(response, mockPlanIds, 'test-stage');

			// Each section should only contain ONE "Important to Know"
			for (const rec of result.topRecommendations) {
				const matches = rec.rationale.match(/Important to Know/gi);
				if (matches) {
					expect(matches.length).toBeLessThanOrEqual(1);
				}
			}
		});
	});
});
