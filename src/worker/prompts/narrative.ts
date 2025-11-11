/**
 * Narrative Prompt Builder (Stage 3)
 * Generates prompts for creating customer-friendly explanations
 */

import type { PlanScoringOutput, UsageSummaryOutput } from '../pipeline';

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

	// Sanitize plan data
	const sanitizedPlans = topPlans.map((plan) => ({
		planId: String(plan.planId),
		supplier: String(plan.supplier),
		planName: String(plan.planName),
		score: Number(plan.score),
		estimatedAnnualCost: Math.round(plan.estimatedAnnualCost * 100) / 100,
		estimatedSavings: Math.round(plan.estimatedSavings * 100) / 100,
	}));

	// Build structured prompt
	const prompt = `You are a friendly energy advisor helping a customer understand their plan recommendations. Create clear, approachable explanations for why we're recommending specific energy plans.

CUSTOMER CONTEXT:
- Current Annual Cost: $${usageSummary.annualCost.toFixed(2)}
- Average Monthly Usage: ${usageSummary.averageMonthlyUsage} kWh
- Usage Pattern: ${usageSummary.usagePattern}
- Peak Usage: ${usageSummary.peakUsageMonth}

TOP RECOMMENDED PLANS:
${JSON.stringify(sanitizedPlans, null, 2)}

TASK:
Write a friendly, easy-to-understand explanation for each of the top ${sanitizedPlans.length} recommended plans. For each plan, explain:

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
Write plain text organized by plan. Use this structure:

**[Supplier] - [Plan Name]** (Score: [score]/100)

[2-4 sentences explaining why this plan is recommended, highlighting key benefits and estimated savings]

**Key Benefits:**
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

**Important to Know:**
[1-2 sentences about contract terms, fees, or other considerations]

**Estimated Annual Savings: $[amount]**

---

EXAMPLE OUTPUT:

**Green Energy Co - EcoSaver 12** (Score: 92/100)

This plan is our top recommendation because it could save you approximately $214 annually compared to your current plan. With 100% renewable energy and a flexible 12-month contract, it aligns perfectly with customers who value both savings and environmental responsibility. The competitive base rate of $0.095/kWh combined with a low monthly fee makes it ideal for your consistent usage pattern.

**Key Benefits:**
- 15% annual savings over your current plan
- 100% renewable energy from wind and solar
- Flexible 12-month contract with no early termination fee

**Important to Know:**
This plan offers fixed rates, so your monthly costs will be predictable. The 12-month contract renews automatically at market rates, but you can cancel anytime after the initial term.

**Estimated Annual Savings: $214.00**

---

Now provide explanations for the ${sanitizedPlans.length} recommended plans:`;

	return prompt;
}
