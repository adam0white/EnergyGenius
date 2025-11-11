/**
 * Narrative Prompt Builder (Stage 3)
 * Generates prompts for creating customer-friendly explanations
 */

import type { PlanScoringOutput, UsageSummaryOutput } from '../pipeline';
import type { SupplierPlan } from '../data/types';
import { supplierCatalog } from '../data/supplier-catalog';

/**
 * Builds a prompt for generating narrative explanations of top 3 recommendations
 * @param planScoring - Output from Stage 2 (scored plans)
 * @param usageSummary - Output from Stage 1 (usage analysis)
 * @returns Formatted prompt string ready for AI model
 */
export function buildNarrativePrompt(planScoring: PlanScoringOutput, usageSummary: UsageSummaryOutput): string {
	// Validate inputs
	if (!planScoring?.scoredPlans || planScoring.scoredPlans.length === 0) {
		throw new Error('Plan scoring output required with at least one plan');
	}

	if (!usageSummary) {
		throw new Error('Usage summary is required for narrative generation');
	}

	// Get top 3 plans
	const topPlans = planScoring.scoredPlans.slice(0, 3);

	if (topPlans.length < 1) {
		throw new Error('At least 1 scored plan required for narrative');
	}

	// Enrich scored plans with FULL details from catalog to prevent hallucination
	const enrichedPlans = topPlans.map((scoredPlan) => {
		const catalogPlan = Array.from(supplierCatalog).find((p) => p.id === scoredPlan.planId);

		if (!catalogPlan) {
			// If plan not found in catalog, use scored plan data only (validation will catch this)
			return {
				planId: String(scoredPlan.planId),
				supplier: String(scoredPlan.supplier),
				planName: String(scoredPlan.planName),
				score: Number(scoredPlan.score),
				estimatedAnnualCost: Math.round(scoredPlan.estimatedAnnualCost * 100) / 100,
				estimatedSavings: Math.round(scoredPlan.estimatedSavings * 100) / 100,
				// No additional details available
				baseRate: null,
				monthlyFee: null,
				contractTermMonths: null,
				renewablePercent: null,
				features: [],
			};
		}

		// Return enriched plan with ALL catalog data
		return {
			planId: String(catalogPlan.id),
			supplier: String(catalogPlan.supplier),
			planName: String(catalogPlan.planName),
			score: Number(scoredPlan.score),
			estimatedAnnualCost: Math.round(scoredPlan.estimatedAnnualCost * 100) / 100,
			estimatedSavings: Math.round(scoredPlan.estimatedSavings * 100) / 100,
			// Full catalog details
			baseRate: catalogPlan.baseRate,
			monthlyFee: catalogPlan.monthlyFee,
			contractTermMonths: catalogPlan.contractTermMonths,
			renewablePercent: catalogPlan.renewablePercent,
			earlyTerminationFee: catalogPlan.earlyTerminationFee,
			features: catalogPlan.features.slice(0, 5),
			ratings: catalogPlan.ratings,
		};
	});

	// Build structured prompt
	const prompt = `You are a friendly energy advisor helping a customer understand their plan recommendations. Create clear, approachable explanations for why we're recommending specific energy plans.

CRITICAL CONSTRAINT - READ THIS FIRST:
You MUST describe ONLY the plans provided below with their EXACT details.
Do NOT modify plan names, suppliers, rates, or features.
Do NOT create hypothetical plans or add features not listed.
Use ONLY the information provided for each plan.

CUSTOMER CONTEXT:
- Current Annual Cost: $${usageSummary.annualCost.toFixed(2)}
- Average Monthly Usage: ${usageSummary.averageMonthlyUsage} kWh
- Usage Pattern: ${usageSummary.usagePattern}
- Peak Usage: ${usageSummary.peakUsageMonth}

TOP RECOMMENDED PLANS (REAL DATA - DO NOT MODIFY):
${JSON.stringify(enrichedPlans, null, 2)}

TASK:
Write a friendly, easy-to-understand explanation for each of the top ${enrichedPlans.length} recommended plans. For each plan, explain:

1. Why we're recommending it (focus on benefits and savings)
2. Key advantages specific to their usage pattern
3. Important considerations or things to note
4. Estimated savings vs. current plan

TONE & STYLE:
- Write in friendly, conversational tone
- Avoid technical jargon
- Use short paragraphs (2-4 sentences)
- Focus on benefits and practical implications
- Be positive but honest about trade-offs

OUTPUT FORMAT:
Write plain text organized by plan. Use this structure (NO markdown syntax - write in plain text only):

[Supplier] - [Plan Name] (Score: [score]/100)

[2-4 sentences explaining why this plan is recommended, highlighting key benefits and estimated savings]

Key Benefits:
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

Important to Know:
[1-2 sentences about contract terms, fees, or other considerations]

Estimated Annual Savings: $[amount]

---

EXAMPLE OUTPUT:

Green Energy Co - EcoSaver 12 (Score: 92/100)

This plan is our top recommendation because it could save you approximately $214 annually compared to your current plan. With 100% renewable energy and a flexible 12-month contract, it aligns perfectly with customers who value both savings and environmental responsibility. The competitive base rate of $0.095/kWh combined with a low monthly fee makes it ideal for your consistent usage pattern.

Key Benefits:
- 15% annual savings over your current plan
- 100% renewable energy from wind and solar
- Flexible 12-month contract with no early termination fee

Important to Know:
This plan offers fixed rates, so your monthly costs will be predictable. The 12-month contract renews automatically at market rates, but you can cancel anytime after the initial term.

Estimated Annual Savings: $214.00

---

VALIDATION REQUIREMENT:
Every plan name, supplier, rate, and feature you mention MUST exactly match the data above.
Do NOT add, remove, or modify any plan details.

Now provide explanations for the ${enrichedPlans.length} recommended plans:`;

	return prompt;
}
