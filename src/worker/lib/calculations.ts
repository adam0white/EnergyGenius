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
