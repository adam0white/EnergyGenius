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
 * Performance timing breakdown for a stage
 */
export interface StagePerformance {
	promptBuildMs?: number;
	inferenceMs?: number;
	parseMs?: number;
	totalMs: number;
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
	performance?: {
		usageSummary?: StagePerformance;
		planScoring?: StagePerformance;
		narrative?: StagePerformance;
	};
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
 * @returns Usage summary output and performance metrics
 */
export async function runUsageSummary(env: Env, input: StageInput): Promise<{ result: UsageSummaryOutput; performance: StagePerformance }> {
	const stageStartTime = Date.now();
	logStageStart('usage-summary', input);

	// Build optimized prompt using prompt builder
	const promptStartTime = Date.now();
	const prompt = buildUsageSummaryPrompt(input);
	const promptBuildTime = Date.now() - promptStartTime;

	// Call Workers AI with JSON mode enabled
	const modelId = env.AI_MODEL_FAST || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

	const inferenceStartTime = Date.now();
	const aiResponse = await env.AI.run(modelId, {
		prompt,
		max_tokens: 512,
		response_format: { type: 'json_object' },
	});
	const inferenceTime = Date.now() - inferenceStartTime;

	// Extract response text
	const responseText = (aiResponse as any)?.response || JSON.stringify(aiResponse);

	// Parse and validate AI response
	const parseStartTime = Date.now();
	const result: UsageSummaryOutput = parseUsageSummary(responseText, 'usage-summary');
	const parseTime = Date.now() - parseStartTime;

	const totalDuration = Date.now() - stageStartTime;

	const performance: StagePerformance = {
		promptBuildMs: promptBuildTime,
		inferenceMs: inferenceTime,
		parseMs: parseTime,
		totalMs: totalDuration,
	};

	// Enhanced performance logging
	console.log(`[PERF] [usage-summary] Model: ${modelId}`);
	console.log(`[PERF] [usage-summary] Prompt Build: ${promptBuildTime}ms`);
	console.log(`[PERF] [usage-summary] AI Inference: ${inferenceTime}ms`);
	console.log(`[PERF] [usage-summary] Response Parse: ${parseTime}ms`);
	console.log(`[PERF] [usage-summary] Total Duration: ${totalDuration}ms`);

	logStageComplete('usage-summary', totalDuration, result);

	return { result, performance };
}

/**
 * Stage 2: Scores available supplier plans against usage patterns
 * @param env - Worker environment bindings
 * @param usageSummary - Output from Stage 1
 * @param input - Original stage input payload
 * @returns Plan scoring output and performance metrics
 */
export async function runPlanScoring(
	env: Env,
	usageSummary: UsageSummaryOutput,
	input: StageInput,
): Promise<{ result: PlanScoringOutput; performance: StagePerformance }> {
	const stageStartTime = Date.now();
	logStageStart('plan-scoring', { usageSummary, preferences: input.preferences });

	// Build optimized prompt using prompt builder with real supplier catalog
	const promptStartTime = Date.now();
	const prompt = buildPlanScoringPrompt(usageSummary, Array.from(supplierCatalog), input);
	const promptBuildTime = Date.now() - promptStartTime;

	// Call Workers AI with JSON mode enabled
	const modelId = env.AI_MODEL_FAST || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

	const inferenceStartTime = Date.now();
	const aiResponse = await env.AI.run(modelId, {
		prompt,
		max_tokens: 1024,
		response_format: { type: 'json_object' },
	});
	const inferenceTime = Date.now() - inferenceStartTime;

	// Extract response text
	const responseText = (aiResponse as any)?.response || JSON.stringify(aiResponse);

	// Get valid plan IDs from catalog
	const validPlanIds = Array.from(supplierCatalog).map((plan) => plan.id);

	// Parse and validate AI response
	const parseStartTime = Date.now();
	const result: PlanScoringOutput = parsePlanScoring(responseText, validPlanIds, 'plan-scoring');
	const parseTime = Date.now() - parseStartTime;

	const totalDuration = Date.now() - stageStartTime;

	const performance: StagePerformance = {
		promptBuildMs: promptBuildTime,
		inferenceMs: inferenceTime,
		parseMs: parseTime,
		totalMs: totalDuration,
	};

	// Enhanced performance logging
	console.log(`[PERF] [plan-scoring] Model: ${modelId}`);
	console.log(`[PERF] [plan-scoring] Prompt Build: ${promptBuildTime}ms`);
	console.log(`[PERF] [plan-scoring] AI Inference: ${inferenceTime}ms`);
	console.log(`[PERF] [plan-scoring] Response Parse: ${parseTime}ms`);
	console.log(`[PERF] [plan-scoring] Total Duration: ${totalDuration}ms`);

	logStageComplete('plan-scoring', totalDuration, result);

	return { result, performance };
}

/**
 * Stage 3: Generates narrative explanations for top recommendations
 * @param env - Worker environment bindings
 * @param planScoring - Output from Stage 2
 * @returns Narrative output and performance metrics
 */
export async function runNarrative(
	env: Env,
	planScoring: PlanScoringOutput,
	usageSummary: UsageSummaryOutput,
): Promise<{ result: NarrativeOutput; performance: StagePerformance }> {
	const stageStartTime = Date.now();
	logStageStart('narrative', planScoring);

	// Build optimized prompt using prompt builder
	const promptStartTime = Date.now();
	const prompt = buildNarrativePrompt(planScoring, usageSummary);
	const promptBuildTime = Date.now() - promptStartTime;

	// Call Workers AI with JSON mode enabled
	const modelId = env.AI_MODEL_FAST || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

	const inferenceStartTime = Date.now();
	const aiResponse = await env.AI.run(modelId, {
		prompt,
		max_tokens: 1024,
		response_format: { type: 'json_object' },
	});
	const inferenceTime = Date.now() - inferenceStartTime;

	// Extract response text
	const responseText = (aiResponse as any)?.response || String(aiResponse);

	// Get top plan IDs
	const topPlanIds = planScoring.scoredPlans.slice(0, 3).map((plan) => plan.planId);

	// Parse and validate AI response
	const parseStartTime = Date.now();
	const result: NarrativeOutput = parseNarrative(responseText, topPlanIds, 'narrative');
	const parseTime = Date.now() - parseStartTime;

	const totalDuration = Date.now() - stageStartTime;

	const performance: StagePerformance = {
		promptBuildMs: promptBuildTime,
		inferenceMs: inferenceTime,
		parseMs: parseTime,
		totalMs: totalDuration,
	};

	// Enhanced performance logging
	console.log(`[PERF] [narrative] Model: ${modelId}`);
	console.log(`[PERF] [narrative] Prompt Build: ${promptBuildTime}ms`);
	console.log(`[PERF] [narrative] AI Inference: ${inferenceTime}ms`);
	console.log(`[PERF] [narrative] Response Parse: ${parseTime}ms`);
	console.log(`[PERF] [narrative] Total Duration: ${totalDuration}ms`);

	logStageComplete('narrative', totalDuration, result);

	return { result, performance };
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
	const performanceMetrics: {
		usageSummary?: StagePerformance;
		planScoring?: StagePerformance;
		narrative?: StagePerformance;
	} = {};

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
		const stage1Result = await withRetry(() => withTimeout(runUsageSummary(env, input), 40000, 'usage-summary'), {
			maxAttempts: 2,
			backoffMs: 100,
			stageName: 'usage-summary',
		});

		usageSummary = stage1Result.result;
		performanceMetrics.usageSummary = stage1Result.performance;

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
			const stage2Result = await withRetry(() => withTimeout(runPlanScoring(env, usageSummary, input), 40000, 'plan-scoring'), {
				maxAttempts: 2,
				backoffMs: 100,
				stageName: 'plan-scoring',
			});

			planScoring = stage2Result.result;
			performanceMetrics.planScoring = stage2Result.performance;

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
			const stage3Result = await withRetry(() => withTimeout(runNarrative(env, planScoring, usageSummary!), 40000, 'narrative'), {
				maxAttempts: 2,
				backoffMs: 100,
				stageName: 'narrative',
			});

			narrative = stage3Result.result;
			performanceMetrics.narrative = stage3Result.performance;

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

	// Log performance summary
	if (performanceMetrics.usageSummary || performanceMetrics.planScoring || performanceMetrics.narrative) {
		console.log(`[PERF] [SUMMARY] Total Inference Time: ${(performanceMetrics.usageSummary?.inferenceMs || 0) + (performanceMetrics.planScoring?.inferenceMs || 0) + (performanceMetrics.narrative?.inferenceMs || 0)}ms`);
	}

	return {
		usageSummary,
		planScoring,
		narrative,
		errors,
		executionTime,
		timestamp: new Date().toISOString(),
		performance: performanceMetrics,
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
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

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
