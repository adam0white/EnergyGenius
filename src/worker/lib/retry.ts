/**
 * Retry Logic Module
 * Provides retry wrapper with backoff for transient failures
 */

/**
 * Error classification - determines if error is retriable
 */
export function isRetriableError(error: Error): boolean {
	const message = error.message.toLowerCase();

	// Network errors
	if (message.includes('network') || message.includes('fetch')) {
		return true;
	}

	// Timeout errors
	if (message.includes('timeout') || message.includes('timed out')) {
		return true;
	}

	// Rate limit errors (429)
	if (message.includes('rate limit') || message.includes('429')) {
		return true;
	}

	// Server errors (5xx)
	if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
		return true;
	}

	// Model-specific timeout errors
	if (message.includes('exceeded') && message.includes('timeout')) {
		return true;
	}

	// Default: non-retriable (validation errors, etc.)
	return false;
}

/**
 * Options for retry wrapper
 */
export interface RetryOptions {
	/** Maximum number of attempts (including first try) */
	maxAttempts?: number;

	/** Backoff delay in milliseconds */
	backoffMs?: number;

	/** Stage name for logging */
	stageName?: string;
}

/**
 * Wraps an async function with retry logic
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns Promise that resolves with function result or rejects after all retries
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
	const { maxAttempts = 2, backoffMs = 100, stageName = 'unknown' } = options;

	let lastError: Error | null = null;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			// Attempt execution
			const result = await fn();
			return result;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			// Check if error is retriable
			const retriable = isRetriableError(lastError);

			// Log attempt
			console.log(
				`[${new Date().toISOString()}] [RETRY] [${stageName.toUpperCase()}] Attempt ${attempt}/${maxAttempts} failed: ${lastError.message} (retriable: ${retriable})`
			);

			// If not retriable, throw immediately
			if (!retriable) {
				throw lastError;
			}

			// If last attempt, throw
			if (attempt === maxAttempts) {
				throw lastError;
			}

			// Backoff before retry
			console.log(`[${new Date().toISOString()}] [RETRY] [${stageName.toUpperCase()}] Waiting ${backoffMs}ms before retry...`);
			await new Promise((resolve) => setTimeout(resolve, backoffMs));
		}
	}

	// Should never reach here, but TypeScript requires it
	throw lastError || new Error('Unknown retry error');
}

/**
 * Fallback data generators for each stage
 */

/**
 * Generates fallback usage summary from raw monthly data
 */
export function generateUsageFallback(monthlyData: Array<{ month: string; usage: number; cost: number }>): any {
	const totalUsage = monthlyData.reduce((sum, m) => sum + m.usage, 0);
	const totalCost = monthlyData.reduce((sum, m) => sum + (m.cost || 0), 0);
	const avgUsage = totalUsage / 12;
	const peakMonth = monthlyData.reduce((prev, curr) => (curr.usage > prev.usage ? curr : prev));

	// Determine pattern based on variance
	const variance = monthlyData.reduce((sum, m) => sum + Math.pow(m.usage - avgUsage, 2), 0) / 12;
	const stdDev = Math.sqrt(variance);
	const coefficientOfVariation = stdDev / avgUsage;

	let pattern = 'consistent';
	if (coefficientOfVariation > 0.3) {
		pattern = 'high-variance';
	} else if (coefficientOfVariation > 0.2) {
		pattern = 'seasonal';
	}

	console.log(`[${new Date().toISOString()}] [FALLBACK] Using calculated usage summary fallback`);

	return {
		averageMonthlyUsage: Math.round(avgUsage),
		peakUsageMonth: peakMonth.month,
		totalAnnualUsage: totalUsage,
		usagePattern: pattern,
		annualCost: totalCost,
		fallback: true,
	};
}

/**
 * Generates fallback plan scoring (neutral scores for all plans)
 */
export function generatePlanScoringFallback(supplierPlans: any[]): any {
	console.log(`[${new Date().toISOString()}] [FALLBACK] Using neutral plan scoring fallback`);

	return {
		scoredPlans: supplierPlans.slice(0, 10).map((plan) => ({
			planId: plan.id,
			supplier: plan.supplier,
			planName: plan.planName,
			score: 50, // Neutral score
			estimatedAnnualCost: 0,
			estimatedSavings: 0,
		})),
		totalPlansScored: Math.min(supplierPlans.length, 10),
		fallback: true,
	};
}

/**
 * Generates fallback narrative (generic explanations)
 */
export function generateNarrativeFallback(scoredPlans: any[]): any {
	console.log(`[${new Date().toISOString()}] [FALLBACK] Using generic narrative fallback`);

	const topPlans = scoredPlans.slice(0, 3);

	return {
		explanation: 'Based on available plan information, we have identified potential energy plan options for your consideration.',
		topRecommendations: topPlans.map((plan) => ({
			planId: plan.planId,
			rationale: `${plan.planName} from ${plan.supplier} is available for consideration. Please review plan details for more information.`,
		})),
		fallback: true,
	};
}
