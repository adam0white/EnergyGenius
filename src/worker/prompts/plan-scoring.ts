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
 * @returns Object with prompt string and indexed plans catalog for parser
 */
export function buildPlanScoringPrompt(
	usageSummary: UsageSummaryOutput,
	supplierPlans: SupplierPlan[],
	input: StageInput,
): { prompt: string; indexedPlans: Array<{ index: number; planId: string; supplier: string; planName: string }> } {
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
		maxContractMonths: input.preferences?.maxContractMonths || 12,
	};

	// Filter plans by user's max contract length preference, then prepare sanitized plan catalog (limit to first 20 plans)
	const filteredPlans = supplierPlans.filter((plan) => plan.contractTermMonths <= preferences.maxContractMonths);
	const plansToScore = filteredPlans.slice(0, 20).map((plan, index) => ({
		index: index, // Simple index 0-19 for AI to reference
		planId: String(plan.id), // Keep for our reference but AI won't need to copy
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

╔══════════════════════════════════════════════════════════════════════════════╗
║                            CRITICAL CONSTRAINT                                ║
║                          ⚠️  READ THIS FIRST  ⚠️                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

PLAN INDEXING SYSTEM (MOST IMPORTANT):
✓ Each plan has a simple INDEX number (0-${plansToScore.length - 1})
✓ You MUST reference plans by their INDEX number ONLY
✓ DO NOT copy planId, supplier, or planName from the catalog
✓ Just return the INDEX number - we'll map it back to the actual plan

CORRECT: Return index 0, 5, 12, etc.
WRONG: Trying to copy "plan-green-mountain-energy-pollution-free-e-plus-12"
WRONG: Typing out supplier or plan names

OTHER REQUIREMENTS:
✓ You MUST select and score ONLY from the provided list of real plans below
✓ Do NOT create, suggest, or recommend plans that are not in this exact list
✓ Every plan you score MUST use a valid index from the AVAILABLE PLANS list

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
- Max Contract Length: ${preferences.maxContractMonths} months
${preferences.maxMonthlyBudget ? `- Max Monthly Budget: $${preferences.maxMonthlyBudget}` : ''}

AVAILABLE PLANS (REAL DATA - DO NOT MODIFY):
${JSON.stringify(plansToScore, null, 2)}

TASK:
Score each plan on a 0-100 scale based on:
1. Cost savings potential vs. current annual cost
2. Contract length (all plans shown meet user's max contract length preference)
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
    "index": <plan index number 0-${plansToScore.length - 1}>,
    "score": <0-100>,
    "estimatedAnnualCost": <number>,
    "estimatedSavings": <number>,
    "reasoning": "<brief 1-2 sentence explanation>"
  }
]

⚠️  CRITICAL: Use the INDEX number (0-${plansToScore.length - 1}), NOT planId/supplier/planName. Just return the number!

SCORING CRITERIA:
- Base score: 50 points
- Add up to +30 for significant savings (>15% savings = +30, 10-15% = +20, 5-10% = +10)
- Add up to +20 for renewable percentage if user prefers (100% = +20, 50% = +10)
- Add up to +10 for shorter contracts (3mo = +10, 6mo = +7, 12mo = +5)
- Add up to +10 for low monthly fees
- Note: All plans shown already meet user's max contract length requirement
- Minimum 5 plans, maximum 10 plans

VALIDATION REQUIREMENT - TRIPLE CHECK BEFORE RESPONDING:
Before submitting your response, verify EVERY plan you selected:
1. ✓ Index is a valid number from 0 to ${plansToScore.length - 1}
2. ✓ Index corresponds to a plan in the AVAILABLE PLANS list above
3. ✓ You are NOT returning planId, supplier, or planName fields

CRITICAL: Use INDEX numbers ONLY. We will map them to actual plan data.
The validation system will REJECT your response if you use anything OTHER than index numbers.

⚠️  COMMON MISTAKE TO AVOID: Trying to copy plan IDs or names
DO NOT try to copy complex strings like "plan-just-energy-sustainable-simply-drive-12"
JUST use the index number like 0, 5, 12, etc.

EXAMPLE OUTPUT (copy this structure exactly):
[
  {
    "index": 0,
    "score": 92,
    "estimatedAnnualCost": 1214.50,
    "estimatedSavings": 214.00,
    "reasoning": "15% savings with 100% renewable energy and flexible 12-month contract"
  },
  {
    "index": 5,
    "score": 88,
    "estimatedAnnualCost": 1350.00,
    "estimatedSavings": 150.00,
    "reasoning": "Good savings with competitive rate and short contract"
  }
]

Provide ONLY the JSON array now:`;

	// Return both the prompt and the indexed plan catalog for the parser
	const indexedPlans = plansToScore.map((plan) => ({
		index: plan.index,
		planId: plan.planId,
		supplier: plan.supplier,
		planName: plan.planName,
	}));

	return { prompt, indexedPlans };
}
