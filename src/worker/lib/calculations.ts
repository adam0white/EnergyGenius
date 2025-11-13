/**
 * Cost Calculation Utilities
 *
 * CRITICAL: All cost calculations MUST be performed by TypeScript code, not LLMs.
 * LLMs can hallucinate arithmetic results. TypeScript calculations are deterministic and testable.
 *
 * This module provides reliable, tested functions for calculating energy plan costs and savings.
 *
 * @module calculations
 */

/**
 * Plan cost calculation result
 */
export interface PlanCostCalculation {
	/** Total estimated annual cost for this plan (baseRate * usage + monthlyFee * 12) */
	estimatedAnnualCost: number;
	/** Estimated savings compared to current plan (currentAnnualCost - estimatedAnnualCost) */
	estimatedSavings: number;
	/** Savings as a percentage of current annual cost */
	savingsPercent: number;
}

/**
 * Plan data required for cost calculation
 */
export interface PlanForCalculation {
	/** Energy rate in dollars per kWh (e.g., 0.108 for $0.108/kWh) */
	baseRate: number;
	/** Fixed monthly fee in dollars (e.g., 9.95 for $9.95/month) */
	monthlyFee: number;
}

/**
 * Calculate estimated annual cost and savings for an energy plan
 *
 * Formula:
 * - Estimated Annual Cost = (baseRate × totalAnnualUsage) + (monthlyFee × 12)
 * - Estimated Savings = currentAnnualCost - estimatedAnnualCost
 * - Savings Percent = (estimatedSavings / currentAnnualCost) × 100
 *
 * @param plan - Plan with baseRate and monthlyFee
 * @param currentAnnualCost - User's current annual cost in dollars
 * @param totalAnnualUsage - User's total annual usage in kWh
 * @returns Cost calculation with annual cost, savings, and savings percentage
 *
 * @example
 * ```typescript
 * const plan = { baseRate: 0.108, monthlyFee: 9.95 };
 * const result = calculatePlanCosts(plan, 1549, 11000);
 * // result.estimatedAnnualCost = 1307.40
 * // result.estimatedSavings = 241.60
 * // result.savingsPercent = 15.60
 * ```
 */
export function calculatePlanCosts(
	plan: PlanForCalculation,
	currentAnnualCost: number,
	totalAnnualUsage: number
): PlanCostCalculation {
	// Validate inputs
	if (typeof plan.baseRate !== 'number' || plan.baseRate < 0) {
		throw new Error(`Invalid baseRate: ${plan.baseRate}. Must be a non-negative number.`);
	}

	if (typeof plan.monthlyFee !== 'number' || plan.monthlyFee < 0) {
		throw new Error(`Invalid monthlyFee: ${plan.monthlyFee}. Must be a non-negative number.`);
	}

	if (typeof currentAnnualCost !== 'number' || currentAnnualCost < 0) {
		throw new Error(`Invalid currentAnnualCost: ${currentAnnualCost}. Must be a non-negative number.`);
	}

	if (typeof totalAnnualUsage !== 'number' || totalAnnualUsage <= 0) {
		throw new Error(`Invalid totalAnnualUsage: ${totalAnnualUsage}. Must be a positive number.`);
	}

	// Calculate estimated annual cost
	// Formula: (baseRate × kWh) + (monthlyFee × 12 months)
	const energyCost = plan.baseRate * totalAnnualUsage;
	const yearlyFees = plan.monthlyFee * 12;
	const estimatedAnnualCost = energyCost + yearlyFees;

	// Calculate savings
	const estimatedSavings = currentAnnualCost - estimatedAnnualCost;

	// Calculate savings percentage (avoid division by zero)
	const savingsPercent = currentAnnualCost > 0
		? (estimatedSavings / currentAnnualCost) * 100
		: 0;

	// Round to 2 decimal places for currency precision
	return {
		estimatedAnnualCost: Math.round(estimatedAnnualCost * 100) / 100,
		estimatedSavings: Math.round(estimatedSavings * 100) / 100,
		savingsPercent: Math.round(savingsPercent * 100) / 100,
	};
}

/**
 * Calculate costs for multiple plans
 *
 * This is a convenience function for calculating costs for an array of plans.
 * Returns a Map indexed by plan ID for O(1) lookup.
 *
 * @param plans - Array of plans with id, baseRate, and monthlyFee
 * @param currentAnnualCost - User's current annual cost in dollars
 * @param totalAnnualUsage - User's total annual usage in kWh
 * @returns Map of plan ID to cost calculation
 *
 * @example
 * ```typescript
 * const plans = [
 *   { id: 'plan-1', baseRate: 0.108, monthlyFee: 9.95 },
 *   { id: 'plan-2', baseRate: 0.12, monthlyFee: 5.00 }
 * ];
 * const costMap = calculateMultiplePlanCosts(plans, 1549, 11000);
 * const plan1Cost = costMap.get('plan-1');
 * ```
 */
export function calculateMultiplePlanCosts(
	plans: Array<{ id: string } & PlanForCalculation>,
	currentAnnualCost: number,
	totalAnnualUsage: number
): Map<string, PlanCostCalculation> {
	const costMap = new Map<string, PlanCostCalculation>();

	for (const plan of plans) {
		try {
			const calculation = calculatePlanCosts(plan, currentAnnualCost, totalAnnualUsage);
			costMap.set(plan.id, calculation);
		} catch (error) {
			// Log error but continue with other plans
			console.error(
				`[${new Date().toISOString()}] [CALCULATIONS] Error calculating costs for plan ${plan.id}:`,
				error instanceof Error ? error.message : 'Unknown error'
			);
			// Store a fallback calculation with zero savings
			costMap.set(plan.id, {
				estimatedAnnualCost: currentAnnualCost,
				estimatedSavings: 0,
				savingsPercent: 0,
			});
		}
	}

	return costMap;
}

/**
 * Calculate the annual cost for a given usage and plan
 *
 * This is a simplified version that only calculates annual cost without savings.
 * Useful when you don't have a current cost baseline.
 *
 * @param baseRate - Energy rate in dollars per kWh
 * @param monthlyFee - Fixed monthly fee in dollars
 * @param totalAnnualUsage - Total annual usage in kWh
 * @returns Estimated annual cost in dollars
 *
 * @example
 * ```typescript
 * const annualCost = calculateAnnualCost(0.108, 9.95, 11000);
 * // annualCost = 1307.40
 * ```
 */
export function calculateAnnualCost(
	baseRate: number,
	monthlyFee: number,
	totalAnnualUsage: number
): number {
	if (baseRate < 0 || monthlyFee < 0 || totalAnnualUsage <= 0) {
		throw new Error('Invalid inputs for annual cost calculation');
	}

	const annualCost = (baseRate * totalAnnualUsage) + (monthlyFee * 12);
	return Math.round(annualCost * 100) / 100;
}

/**
 * Calculate savings between two annual costs
 *
 * @param currentAnnualCost - Current annual cost in dollars
 * @param newAnnualCost - New plan's annual cost in dollars
 * @returns Savings object with amount and percentage
 *
 * @example
 * ```typescript
 * const savings = calculateSavings(1549, 1307.40);
 * // savings.amount = 241.60
 * // savings.percent = 15.60
 * ```
 */
export function calculateSavings(
	currentAnnualCost: number,
	newAnnualCost: number
): { amount: number; percent: number } {
	if (currentAnnualCost < 0 || newAnnualCost < 0) {
		throw new Error('Invalid costs for savings calculation');
	}

	const amount = currentAnnualCost - newAnnualCost;
	const percent = currentAnnualCost > 0 ? (amount / currentAnnualCost) * 100 : 0;

	return {
		amount: Math.round(amount * 100) / 100,
		percent: Math.round(percent * 100) / 100,
	};
}

/**
 * Current plan data for savings calculation
 * Story 10.12: Enhanced savings calculation with ETF and service fees
 */
export interface CurrentPlanForCalculation {
	/** Current energy rate in $/kWh */
	currentRate: number;
	/** Current monthly service fee in dollars */
	monthlyFee: number;
	/** Early termination fee if canceling current plan (optional) */
	earlyTerminationFee?: number;
}

/**
 * Recommended plan data for savings calculation
 */
export interface RecommendedPlanForCalculation {
	/** Energy rate in $/kWh */
	baseRate: number;
	/** Monthly service fee in dollars */
	monthlyFee: number;
	/** Contract term length in months */
	contractTermMonths: number;
}

/**
 * Detailed cost breakdown for transparency
 * Story 10.12: Show users complete picture of switching costs
 */
export interface CostBreakdown {
	/** Current plan annual cost (energy + fees) */
	currentAnnualCost: number;
	/** Current plan energy cost component */
	currentEnergyCost: number;
	/** Current plan annual service fees (monthlyFee * 12) */
	currentServiceFees: number;
	/** Recommended plan annual cost (energy + fees) */
	recommendedAnnualCost: number;
	/** Recommended plan energy cost component */
	recommendedEnergyCost: number;
	/** Recommended plan annual service fees (monthlyFee * 12) */
	recommendedServiceFees: number;
	/** Annual cost difference before ETF */
	annualCostDifference: number;
	/** One-time early termination fee */
	etfCost: number;
	/** ETF amortized over contract term */
	amortizedETF: number;
}

/**
 * Complete savings calculation result
 * Story 10.12: True annual savings with all switching costs included
 */
export interface SavingsCalculation {
	/** Annual savings (amortized ETF) - used for tier classification */
	annualSavings: number;
	/** First-year savings (full ETF cost) - shown in breakdown */
	firstYearSavings: number;
	/** Detailed cost breakdown for transparency */
	breakdown: CostBreakdown;
}

/**
 * Calculate true annual savings including ALL switching costs
 *
 * Story 10.12: Comprehensive savings calculation
 *
 * Includes:
 * - Energy cost difference (kWh * rate)
 * - Monthly service fee difference over 12 months
 * - Early termination fee (amortized over contract term)
 *
 * Design Decision: Use amortized annual savings for tier calculation
 * to fairly compare plans across different contract lengths.
 *
 * @param currentPlan - User's current energy plan with rate, fees, ETF
 * @param recommendedPlan - Recommended supplier plan
 * @param annualKWh - Annual energy usage in kWh
 * @returns Savings calculation with amortized annual savings, first-year savings, and breakdown
 *
 * @example
 * ```typescript
 * const current = { currentRate: 0.15, monthlyFee: 9.95, earlyTerminationFee: 150 };
 * const recommended = { baseRate: 0.11, monthlyFee: 12.95, contractTermMonths: 12 };
 * const result = calculateTrueAnnualSavings(current, recommended, 12000);
 * // result.annualSavings = 294 (amortized: $444 savings - $150 ETF / 1 year)
 * // result.firstYearSavings = 294 (first year impact with full ETF)
 * // result.breakdown contains detailed cost components
 * ```
 */
export function calculateTrueAnnualSavings(
	currentPlan: CurrentPlanForCalculation,
	recommendedPlan: RecommendedPlanForCalculation,
	annualKWh: number
): SavingsCalculation {
	// Validate inputs
	if (typeof currentPlan.currentRate !== 'number' || currentPlan.currentRate < 0) {
		throw new Error(`Invalid currentRate: ${currentPlan.currentRate}. Must be a non-negative number.`);
	}

	if (typeof currentPlan.monthlyFee !== 'number' || currentPlan.monthlyFee < 0) {
		throw new Error(`Invalid current monthlyFee: ${currentPlan.monthlyFee}. Must be a non-negative number.`);
	}

	if (typeof recommendedPlan.baseRate !== 'number' || recommendedPlan.baseRate < 0) {
		throw new Error(`Invalid baseRate: ${recommendedPlan.baseRate}. Must be a non-negative number.`);
	}

	if (typeof recommendedPlan.monthlyFee !== 'number' || recommendedPlan.monthlyFee < 0) {
		throw new Error(`Invalid recommended monthlyFee: ${recommendedPlan.monthlyFee}. Must be a non-negative number.`);
	}

	if (typeof annualKWh !== 'number' || annualKWh <= 0) {
		throw new Error(`Invalid annualKWh: ${annualKWh}. Must be a positive number.`);
	}

	if (typeof recommendedPlan.contractTermMonths !== 'number' || recommendedPlan.contractTermMonths <= 0) {
		throw new Error(`Invalid contractTermMonths: ${recommendedPlan.contractTermMonths}. Must be a positive number.`);
	}

	// Current plan costs
	const currentEnergyCost = annualKWh * currentPlan.currentRate;
	const currentServiceFees = currentPlan.monthlyFee * 12;
	const currentAnnualCost = currentEnergyCost + currentServiceFees;

	// Recommended plan costs
	const recommendedEnergyCost = annualKWh * recommendedPlan.baseRate;
	const recommendedServiceFees = recommendedPlan.monthlyFee * 12;
	const recommendedAnnualCost = recommendedEnergyCost + recommendedServiceFees;

	// Cost difference before ETF
	const annualCostDifference = currentAnnualCost - recommendedAnnualCost;

	// ETF amortization over contract term
	// Default to 0 if ETF not provided (some plans have no penalty)
	const etfCost = currentPlan.earlyTerminationFee || 0;
	const contractYears = recommendedPlan.contractTermMonths / 12;
	const amortizedETF = etfCost / contractYears;

	// Final savings calculations
	// Annual savings: amortized ETF (fair comparison across contract lengths)
	const annualSavings = annualCostDifference - amortizedETF;

	// First-year savings: full ETF hit (realistic first-year impact)
	const firstYearSavings = annualCostDifference - etfCost;

	// Round to 2 decimal places for currency precision
	return {
		annualSavings: Math.round(annualSavings * 100) / 100,
		firstYearSavings: Math.round(firstYearSavings * 100) / 100,
		breakdown: {
			currentAnnualCost: Math.round(currentAnnualCost * 100) / 100,
			currentEnergyCost: Math.round(currentEnergyCost * 100) / 100,
			currentServiceFees: Math.round(currentServiceFees * 100) / 100,
			recommendedAnnualCost: Math.round(recommendedAnnualCost * 100) / 100,
			recommendedEnergyCost: Math.round(recommendedEnergyCost * 100) / 100,
			recommendedServiceFees: Math.round(recommendedServiceFees * 100) / 100,
			annualCostDifference: Math.round(annualCostDifference * 100) / 100,
			etfCost: Math.round(etfCost * 100) / 100,
			amortizedETF: Math.round(amortizedETF * 100) / 100,
		},
	};
}

/**
 * Calculate comprehensive savings for multiple plans with ETF
 * Story 10.12: Enhanced cost calculation for pipeline integration
 *
 * This is the new version of calculateMultiplePlanCosts that includes ETF
 * in the savings calculation for accurate tier classification.
 *
 * @param plans - Array of supplier plans with id, baseRate, monthlyFee, contractTermMonths
 * @param currentPlan - Current plan with rate, fees, and ETF
 * @param totalAnnualUsage - User's total annual usage in kWh
 * @returns Map of plan ID to comprehensive cost calculation with breakdown
 */
export function calculateComprehensivePlanCosts(
	plans: Array<{ id: string; baseRate: number; monthlyFee: number; contractTermMonths: number }>,
	currentPlan: CurrentPlanForCalculation,
	totalAnnualUsage: number
): Map<string, SavingsCalculation & { estimatedAnnualCost: number; estimatedSavings: number }> {
	const costMap = new Map<string, SavingsCalculation & { estimatedAnnualCost: number; estimatedSavings: number }>();

	for (const plan of plans) {
		try {
			const calculation = calculateTrueAnnualSavings(
				currentPlan,
				{
					baseRate: plan.baseRate,
					monthlyFee: plan.monthlyFee,
					contractTermMonths: plan.contractTermMonths,
				},
				totalAnnualUsage
			);

			// Store with both new and old field names for backward compatibility
			costMap.set(plan.id, {
				...calculation,
				// Legacy fields for existing code
				estimatedAnnualCost: calculation.breakdown.recommendedAnnualCost,
				estimatedSavings: calculation.annualSavings, // Use amortized savings
			});
		} catch (error) {
			// Log error but continue with other plans
			console.error(
				`[${new Date().toISOString()}] [CALCULATIONS] Error calculating comprehensive costs for plan ${plan.id}:`,
				error instanceof Error ? error.message : 'Unknown error'
			);

			// Calculate current annual cost for fallback
			const currentEnergyCost = totalAnnualUsage * currentPlan.currentRate;
			const currentServiceFees = currentPlan.monthlyFee * 12;
			const currentAnnualCost = currentEnergyCost + currentServiceFees;

			// Store a fallback calculation with zero savings
			costMap.set(plan.id, {
				annualSavings: 0,
				firstYearSavings: 0,
				breakdown: {
					currentAnnualCost,
					currentEnergyCost,
					currentServiceFees,
					recommendedAnnualCost: currentAnnualCost,
					recommendedEnergyCost: currentEnergyCost,
					recommendedServiceFees: currentServiceFees,
					annualCostDifference: 0,
					etfCost: 0,
					amortizedETF: 0,
				},
				estimatedAnnualCost: currentAnnualCost,
				estimatedSavings: 0,
			});
		}
	}

	return costMap;
}
