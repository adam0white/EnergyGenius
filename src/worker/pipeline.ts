/**
 * AI Pipeline Orchestration Module
 * Three-stage sequential pipeline for energy plan recommendations:
 * 1. Usage Summary - Analyzes 12 months of usage data
 * 2. Plan Scoring - Scores supplier plans against usage patterns
 * 3. Narrative - Generates explanations for top 3 recommendations
 */

import { Env } from './index';
import { buildUsageSummaryPrompt, buildPlanScoringPrompt, buildNarrativePrompt } from './prompts';
import { supplierCatalog } from './data/supplier-catalog';
import { withRetry, generateUsageFallback, generatePlanScoringFallback, generateNarrativeFallback } from './lib/retry';
import { parseUsageSummary, parsePlanScoring, parseNarrative } from './validation';

// ===========================
// TypeScript Interfaces
// ===========================

/**
 * Input payload for pipeline stages
 */
export interface StageInput {
	energyUsageData: {
		monthlyData: Array<{
			month: string;
			usage: number;
			cost: number;
		}>;
	};
	currentPlan: {
		supplier: string;
		planName: string;
		rateStructure: string;
		monthlyFee?: number;
		rate?: number;
	};
	preferences: {
		prioritizeSavings?: boolean;
		preferRenewable?: boolean;
		acceptVariableRates?: boolean;
		maxMonthlyBudget?: number;
	};
}

/**
 * Output from Usage Summary stage (Stage 1)
 */
export interface UsageSummaryOutput {
	averageMonthlyUsage: number;
	peakUsageMonth: string;
	totalAnnualUsage: number;
	usagePattern: string; // e.g., "consistent", "seasonal", "high-variance"
	annualCost: number;
}

/**
 * Output from Plan Scoring stage (Stage 2)
 */
export interface PlanScoringOutput {
	scoredPlans: Array<{
		planId: string;
		supplier: string;
		planName: string;
		score: number;
		estimatedAnnualCost: number;
		estimatedSavings: number;
	}>;
	totalPlansScored: number;
}

/**
 * Output from Narrative stage (Stage 3)
 */
export interface NarrativeOutput {
	explanation: string;
	topRecommendations: Array<{
		planId: string;
		rationale: string;
	}>;
}

/**
 * Pipeline error object
 */
export interface PipelineError {
	stage: string;
	message: string;
	timestamp: string;
}

/**
 * Final pipeline result combining all stage outputs
 */
export interface PipelineResult {
	usageSummary?: UsageSummaryOutput;
	planScoring?: PlanScoringOutput;
	narrative?: NarrativeOutput;
	errors: PipelineError[];
	executionTime: number;
	timestamp: string;
}

/**
 * Progress callback signature for SSE support
 */
export type ProgressCallback = (stageName: string, status: 'running' | 'complete' | 'error', output?: any) => void;

// ===========================
// Stage Functions
// ===========================

/**
 * Stage 1: Analyzes usage data and extracts summary metrics
 * @param env - Worker environment bindings
 * @param input - Stage input payload
 * @returns Usage summary output
 */
export async function runUsageSummary(env: Env, input: StageInput): Promise<UsageSummaryOutput> {
	const startTime = Date.now();
	logStageStart('usage-summary', input);

	// Build optimized prompt using prompt builder
	const prompt = buildUsageSummaryPrompt(input);

	// Call Workers AI with JSON mode enabled
	const modelId = env.AI_MODEL_FAST || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

	const aiResponse = await env.AI.run(modelId, {
		prompt,
		max_tokens: 512,
		response_format: { type: 'json_object' },
	});

	// Extract response text
	const responseText = (aiResponse as any)?.response || JSON.stringify(aiResponse);

	// Parse and validate AI response
	const result: UsageSummaryOutput = parseUsageSummary(responseText, 'usage-summary');

	const duration = Date.now() - startTime;
	logStageComplete('usage-summary', duration, result);

	return result;
}

/**
 * Stage 2: Scores available supplier plans against usage patterns
 * @param env - Worker environment bindings
 * @param usageSummary - Output from Stage 1
 * @param input - Original stage input payload
 * @returns Plan scoring output
 */
export async function runPlanScoring(env: Env, usageSummary: UsageSummaryOutput, input: StageInput): Promise<PlanScoringOutput> {
	const startTime = Date.now();
	logStageStart('plan-scoring', { usageSummary, preferences: input.preferences });

	// Build optimized prompt using prompt builder with real supplier catalog
	const prompt = buildPlanScoringPrompt(usageSummary, Array.from(supplierCatalog), input);

	// Call Workers AI with JSON mode enabled
	const modelId = env.AI_MODEL_FAST || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

	const aiResponse = await env.AI.run(modelId, {
		prompt,
		max_tokens: 1024,
		response_format: { type: 'json_object' },
	});

	// Extract response text
	const responseText = (aiResponse as any)?.response || JSON.stringify(aiResponse);

	// Get valid plan IDs from catalog
	const validPlanIds = Array.from(supplierCatalog).map((plan) => plan.id);

	// Parse and validate AI response
	const result: PlanScoringOutput = parsePlanScoring(responseText, validPlanIds, 'plan-scoring');

	const duration = Date.now() - startTime;
	logStageComplete('plan-scoring', duration, result);

	return result;
}

/**
 * Stage 3: Generates narrative explanations for top recommendations
 * @param env - Worker environment bindings
 * @param planScoring - Output from Stage 2
 * @returns Narrative output
 */
export async function runNarrative(env: Env, planScoring: PlanScoringOutput, usageSummary: UsageSummaryOutput): Promise<NarrativeOutput> {
	const startTime = Date.now();
	logStageStart('narrative', planScoring);

	// Build optimized prompt using prompt builder
	const prompt = buildNarrativePrompt(planScoring, usageSummary);

	// Call Workers AI with JSON mode enabled
	const modelId = env.AI_MODEL_FAST || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

	const aiResponse = await env.AI.run(modelId, {
		prompt,
		max_tokens: 1024,
		response_format: { type: 'json_object' },
	});

	// Extract response text
	const responseText = (aiResponse as any)?.response || String(aiResponse);

	// Get top plan IDs
	const topPlanIds = planScoring.scoredPlans.slice(0, 3).map((plan) => plan.planId);

	// Parse and validate AI response
	const result: NarrativeOutput = parseNarrative(responseText, topPlanIds, 'narrative');

	const duration = Date.now() - startTime;
	logStageComplete('narrative', duration, result);

	return result;
}

// ===========================
// Main Pipeline Orchestrator
// ===========================

/**
 * Executes the three-stage AI pipeline sequentially
 * @param env - Worker environment bindings
 * @param input - Pipeline input payload
 * @param progressCallback - Optional callback for progress updates (SSE support)
 * @returns Pipeline result with all stage outputs and errors
 */
export async function runPipeline(env: Env, input: StageInput, progressCallback?: ProgressCallback): Promise<PipelineResult> {
	const startTime = Date.now();
	const errors: PipelineError[] = [];

	let usageSummary: UsageSummaryOutput | undefined;
	let planScoring: PlanScoringOutput | undefined;
	let narrative: NarrativeOutput | undefined;

	console.log(`[${new Date().toISOString()}] [PIPELINE] Starting AI pipeline orchestration`);

	// ===========================
	// Stage 1: Usage Summary
	// ===========================
	try {
		safeCallback(progressCallback, 'usage-summary', 'running', null);

		// Wrap with retry logic
		usageSummary = await withRetry(() => withTimeout(runUsageSummary(env, input), 40000, 'usage-summary'), {
			maxAttempts: 2,
			backoffMs: 100,
			stageName: 'usage-summary',
		});

		safeCallback(progressCallback, 'usage-summary', 'complete', usageSummary);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error in usage summary stage';
		errors.push({
			stage: 'usage-summary',
			message: errorMessage,
			timestamp: new Date().toISOString(),
		});
		console.error(`[${new Date().toISOString()}] [USAGE_SUMMARY] [ERROR] ${errorMessage}`);

		// Use fallback data
		usageSummary = generateUsageFallback(input.energyUsageData.monthlyData);

		safeCallback(progressCallback, 'usage-summary', 'error', null);
	}

	// ===========================
	// Stage 2: Plan Scoring
	// ===========================
	if (usageSummary) {
		try {
			safeCallback(progressCallback, 'plan-scoring', 'running', null);

			// Wrap with retry logic
			planScoring = await withRetry(() => withTimeout(runPlanScoring(env, usageSummary, input), 40000, 'plan-scoring'), {
				maxAttempts: 2,
				backoffMs: 100,
				stageName: 'plan-scoring',
			});

			safeCallback(progressCallback, 'plan-scoring', 'complete', planScoring);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error in plan scoring stage';
			errors.push({
				stage: 'plan-scoring',
				message: errorMessage,
				timestamp: new Date().toISOString(),
			});
			console.error(`[${new Date().toISOString()}] [PLAN_SCORING] [ERROR] ${errorMessage}`);

			// Use fallback data
			planScoring = generatePlanScoringFallback(Array.from(supplierCatalog));

			safeCallback(progressCallback, 'plan-scoring', 'error', null);
		}
	} else {
		// Use fallback even if stage 1 failed
		console.log(`[${new Date().toISOString()}] [PLAN_SCORING] Stage 1 failed, using fallback plan scoring`);
		planScoring = generatePlanScoringFallback(Array.from(supplierCatalog));
	}

	// ===========================
	// Stage 3: Narrative
	// ===========================
	if (planScoring) {
		try {
			safeCallback(progressCallback, 'narrative', 'running', null);

			// Wrap with retry logic
			narrative = await withRetry(() => withTimeout(runNarrative(env, planScoring, usageSummary!), 40000, 'narrative'), {
				maxAttempts: 2,
				backoffMs: 100,
				stageName: 'narrative',
			});

			safeCallback(progressCallback, 'narrative', 'complete', narrative);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error in narrative stage';
			errors.push({
				stage: 'narrative',
				message: errorMessage,
				timestamp: new Date().toISOString(),
			});
			console.error(`[${new Date().toISOString()}] [NARRATIVE] [ERROR] ${errorMessage}`);

			// Use fallback data
			narrative = generateNarrativeFallback(planScoring.scoredPlans);

			safeCallback(progressCallback, 'narrative', 'error', null);
		}
	} else {
		// Should not reach here with fallback logic above, but handle gracefully
		console.log(`[${new Date().toISOString()}] [NARRATIVE] No plan scoring available, using generic fallback`);
		narrative = generateNarrativeFallback([]);
	}

	// ===========================
	// Build final result
	// ===========================
	const executionTime = Date.now() - startTime;

	console.log(`[${new Date().toISOString()}] [PIPELINE] Pipeline completed in ${executionTime}ms with ${errors.length} errors`);

	return {
		usageSummary,
		planScoring,
		narrative,
		errors,
		executionTime,
		timestamp: new Date().toISOString(),
	};
}

// ===========================
// Utility Functions
// ===========================

/**
 * Wraps a promise with a timeout
 * @param promise - Promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param stageName - Stage name for error message
 * @returns Promise that rejects if timeout is exceeded
 *
 * CRITICAL: This function properly clears the timeout when the promise completes
 * to prevent race conditions where the timeout fires after successful completion.
 * See bug-timeout-race-condition.md for details.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, stageName: string): Promise<T> {
	let timeoutId: NodeJS.Timeout | null = null;

	const timeoutPromise = new Promise<T>((_, reject) => {
		timeoutId = setTimeout(() => {
			reject(new Error(`Stage ${stageName} exceeded ${timeoutMs / 1000}s timeout`));
		}, timeoutMs);
	});

	try {
		// Race between promise completion and timeout
		const result = await Promise.race([promise, timeoutPromise]);

		// Clear timeout immediately on successful completion
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		return result;
	} catch (error) {
		// Clear timeout on error as well
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}
		throw error;
	}
}

/**
 * Safely invokes progress callback, catching and logging any errors
 * @param callback - Optional progress callback
 * @param stageName - Stage name
 * @param status - Stage status
 * @param output - Stage output
 */
function safeCallback(
	callback: ProgressCallback | undefined,
	stageName: string,
	status: 'running' | 'complete' | 'error',
	output: any,
): void {
	if (!callback) return;

	try {
		callback(stageName, status, output);
	} catch (error) {
		console.error(`[${new Date().toISOString()}] [CALLBACK] Error in progress callback:`, error);
		// Don't propagate callback errors
	}
}

/**
 * Logs stage start with metadata
 * @param stageName - Stage name
 * @param input - Stage input
 */
function logStageStart(stageName: string, input: any): void {
	const inputSize = JSON.stringify(input).length;
	console.log(`[${new Date().toISOString()}] [${stageName.toUpperCase()}] [RUNNING] Input size: ${inputSize} bytes`);
}

/**
 * Logs stage completion with metadata
 * @param stageName - Stage name
 * @param duration - Stage duration in milliseconds
 * @param output - Stage output
 */
function logStageComplete(stageName: string, duration: number, output: any): void {
	const outputSize = JSON.stringify(output).length;
	console.log(
		`[${new Date().toISOString()}] [${stageName.toUpperCase()}] [COMPLETE] Duration: ${duration}ms, Output size: ${outputSize} bytes`,
	);
}
