/**
 * Plan Scoring Prompt Builder (Stage 2)
 * Generates prompts for scoring supplier plans against usage patterns
 */

import type { StageInput, UsageSummaryOutput } from '../pipeline';
import type { SupplierPlan } from '../data/types';

/**
 * Builds a prompt for scoring energy plans based on usage summary
 * @param usageSummary - Output from Stage 1 (usage analysis)
 * @param supplierPlans - Array of available supplier plans
 * @param input - Original stage input with preferences
 * @returns Formatted prompt string ready for AI model
 */
export function buildPlanScoringPrompt(usageSummary: UsageSummaryOutput, supplierPlans: SupplierPlan[], input: StageInput): string {
	// Validate inputs
	if (!usageSummary) {
		throw new Error('Usage summary is required for plan scoring');
	}

	if (!supplierPlans || supplierPlans.length === 0) {
		throw new Error('At least one supplier plan required for scoring');
	}

	// Sanitize preferences
	const preferences = {
		prioritizeSavings: Boolean(input.preferences?.prioritizeSavings),
		preferRenewable: Boolean(input.preferences?.preferRenewable),
		acceptVariableRates: Boolean(input.preferences?.acceptVariableRates),
		maxMonthlyBudget: input.preferences?.maxMonthlyBudget || null,
	};

	// Prepare sanitized plan catalog (limit to first 20 plans)
	const plansToScore = supplierPlans.slice(0, 20).map((plan) => ({
		planId: String(plan.id),
		supplier: String(plan.supplier),
		planName: String(plan.planName),
		baseRate: Math.round(plan.baseRate * 10000) / 10000,
		monthlyFee: Math.round(plan.monthlyFee * 100) / 100,
		contractTermMonths: Number(plan.contractTermMonths),
		renewablePercent: Number(plan.renewablePercent),
		features: plan.features?.slice(0, 5) || [],
	}));

	// Build structured prompt
	const prompt = `You are an energy plan comparison expert. Score the following supplier plans based on the user's usage pattern and preferences.

USAGE SUMMARY:
- Average Monthly Usage: ${usageSummary.averageMonthlyUsage} kWh
- Peak Usage Month: ${usageSummary.peakUsageMonth}
- Total Annual Usage: ${usageSummary.totalAnnualUsage} kWh
- Usage Pattern: ${usageSummary.usagePattern}
- Current Annual Cost: $${usageSummary.annualCost.toFixed(2)}

USER PREFERENCES:
- Prioritize Savings: ${preferences.prioritizeSavings ? 'Yes' : 'No'}
- Prefer Renewable: ${preferences.preferRenewable ? 'Yes' : 'No'}
- Accept Variable Rates: ${preferences.acceptVariableRates ? 'Yes' : 'No'}
${preferences.maxMonthlyBudget ? `- Max Monthly Budget: $${preferences.maxMonthlyBudget}` : ''}

AVAILABLE PLANS:
${JSON.stringify(plansToScore, null, 2)}

TASK:
Score each plan on a 0-100 scale based on:
1. Cost savings potential vs. current annual cost
2. Contract flexibility (shorter = better unless user accepts long terms)
3. Renewable energy percentage (if user prefers renewable)
4. Match with usage pattern

For each plan, calculate:
- Estimated annual cost = (baseRate * totalAnnualUsage) + (monthlyFee * 12)
- Estimated savings = currentAnnualCost - estimatedAnnualCost

OUTPUT FORMAT - CRITICAL:
Return ONLY valid JSON. No markdown code blocks, no comments, no extra text before or after.
Do NOT wrap in \`\`\`json or \`\`\` markers.
Do NOT add any text before or after the JSON.
Start your response with [ and end with ]

Required JSON array format (top 10 maximum), sorted by score descending:
[
  {
    "planId": "<plan ID>",
    "supplier": "<supplier name>",
    "planName": "<plan name>",
    "score": <0-100>,
    "estimatedAnnualCost": <number>,
    "estimatedSavings": <number>,
    "reasoning": "<brief 1-2 sentence explanation>"
  }
]

SCORING CRITERIA:
- Base score: 50 points
- Add up to +30 for significant savings (>15% savings = +30, 10-15% = +20, 5-10% = +10)
- Add up to +20 for renewable percentage if user prefers (100% = +20, 50% = +10)
- Subtract up to -20 for long contracts if user wants flexibility (24mo = -20, 12mo = -10)
- Add up to +10 for low monthly fees
- Minimum 5 plans, maximum 10 plans

EXAMPLE OUTPUT (copy this structure exactly):
[
  {
    "planId": "plan-001",
    "supplier": "Green Energy Co",
    "planName": "EcoSaver 12",
    "score": 92,
    "estimatedAnnualCost": 1214.50,
    "estimatedSavings": 214.00,
    "reasoning": "15% savings with 100% renewable energy and flexible 12-month contract"
  }
]

Provide ONLY the JSON array now:`;

	return prompt;
}
