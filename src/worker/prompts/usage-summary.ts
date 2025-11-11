/**
 * Usage Summary Prompt Builder (Stage 1)
 * Generates optimized prompts for analyzing 12 months of energy usage data
 */

import type { StageInput } from '../pipeline';

/**
 * Builds a prompt for analyzing usage patterns from 12 months of data
 * @param input - Stage input containing usage data and current plan
 * @returns Formatted prompt string ready for AI model
 */
export function buildUsageSummaryPrompt(input: StageInput): string {
	// Validate inputs
	if (!input.energyUsageData?.monthlyData || !Array.isArray(input.energyUsageData.monthlyData)) {
		throw new Error('Invalid usage data: monthlyData array required');
	}

	if (input.energyUsageData.monthlyData.length !== 12) {
		throw new Error(`Usage data must contain exactly 12 months, got ${input.energyUsageData.monthlyData.length}`);
	}

	// Sanitize and prepare data
	const sanitizedMonthlyData = input.energyUsageData.monthlyData.map((data, idx) => ({
		month: data.month || `Month ${idx + 1}`,
		usage: Math.round(data.usage * 100) / 100,
		cost: Math.round((data.cost || 0) * 100) / 100,
	}));

	const currentPlanInfo = {
		supplier: String(input.currentPlan.supplier || 'Unknown'),
		planName: String(input.currentPlan.planName || 'Unknown'),
		rateStructure: String(input.currentPlan.rateStructure || 'Unknown'),
	};

	// Build structured prompt
	const prompt = `You are an energy usage analyst. Analyze the following 12 months of electricity usage data and provide a structured summary.

USAGE DATA:
${JSON.stringify(sanitizedMonthlyData, null, 2)}

CURRENT PLAN:
Supplier: ${currentPlanInfo.supplier}
Plan: ${currentPlanInfo.planName}
Rate Structure: ${currentPlanInfo.rateStructure}

TASK:
Analyze this usage data and identify key patterns. Calculate the following metrics:

1. Average monthly usage (kWh)
2. Peak usage month and amount
3. Total annual usage
4. Usage pattern classification
5. Total annual cost

OUTPUT FORMAT:
Respond with ONLY a valid JSON object in this exact format:
{
  "averageMonthlyUsage": <number>,
  "peakUsageMonth": "<month name>",
  "totalAnnualUsage": <number>,
  "usagePattern": "<consistent|seasonal|high-variance>",
  "annualCost": <number>
}

PATTERN DEFINITIONS:
- "consistent": Monthly usage varies by less than 20% from average
- "seasonal": Clear summer or winter peaks (>30% above average)
- "high-variance": Irregular usage with no clear pattern

EXAMPLE OUTPUT:
{
  "averageMonthlyUsage": 850,
  "peakUsageMonth": "August",
  "totalAnnualUsage": 10200,
  "usagePattern": "seasonal",
  "annualCost": 1428.50
}

Provide your analysis now:`;

	return prompt;
}
