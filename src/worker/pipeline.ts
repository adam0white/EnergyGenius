/**
 * AI Pipeline Orchestration Module
 * Three-stage sequential pipeline for energy plan recommendations:
 * 1. Usage Summary - Analyzes 12 months of usage data
 * 2. Plan Scoring - Scores supplier plans against usage patterns
 * 3. Narrative - Generates explanations for top 3 recommendations
 */

import { Env } from './index';

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

	// Prepare prompt (placeholder for now, Story 3.2 will add proper prompts)
	const prompt = `Analyze this energy usage data and provide summary metrics:
${JSON.stringify(input.energyUsageData, null, 2)}

Current plan: ${JSON.stringify(input.currentPlan, null, 2)}

Provide a structured response with:
- Average monthly usage (kWh)
- Peak usage month
- Total annual usage
- Usage pattern (consistent/seasonal/high-variance)
- Annual cost`;

	// Call Workers AI
	const modelId = env.AI_MODEL_FAST || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

	await env.AI.run(modelId, {
		prompt,
		max_tokens: 512,
	});

	// Parse AI response (placeholder parsing, will improve in Story 3.2)
	const result: UsageSummaryOutput = {
		averageMonthlyUsage: input.energyUsageData.monthlyData.reduce((sum, m) => sum + m.usage, 0) / 12,
		peakUsageMonth: input.energyUsageData.monthlyData.reduce((prev, curr) => (curr.usage > prev.usage ? curr : prev)).month,
		totalAnnualUsage: input.energyUsageData.monthlyData.reduce((sum, m) => sum + m.usage, 0),
		usagePattern: 'consistent', // Simplified for MVP
		annualCost: input.energyUsageData.monthlyData.reduce((sum, m) => sum + m.cost, 0),
	};

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
export async function runPlanScoring(
	env: Env,
	usageSummary: UsageSummaryOutput,
	input: StageInput
): Promise<PlanScoringOutput> {
	const startTime = Date.now();
	logStageStart('plan-scoring', { usageSummary, preferences: input.preferences });

	// Prepare prompt (placeholder)
	const prompt = `Score energy supplier plans based on this usage summary:
${JSON.stringify(usageSummary, null, 2)}

User preferences: ${JSON.stringify(input.preferences, null, 2)}

Rank the top 5 plans with estimated annual costs and savings compared to current plan (${usageSummary.annualCost}).`;

	// Call Workers AI
	const modelId = env.AI_MODEL_FAST || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

	await env.AI.run(modelId, {
		prompt,
		max_tokens: 1024,
	});

	// Placeholder scoring (will improve in Story 3.2 with real catalog)
	const result: PlanScoringOutput = {
		scoredPlans: [
			{
				planId: 'plan-001',
				supplier: 'Green Energy Co',
				planName: 'EcoSaver 12',
				score: 95,
				estimatedAnnualCost: usageSummary.annualCost * 0.85,
				estimatedSavings: usageSummary.annualCost * 0.15,
			},
			{
				planId: 'plan-002',
				supplier: 'PowerChoice',
				planName: 'Fixed Rate Plus',
				score: 88,
				estimatedAnnualCost: usageSummary.annualCost * 0.9,
				estimatedSavings: usageSummary.annualCost * 0.1,
			},
			{
				planId: 'plan-003',
				supplier: 'TexEnergy',
				planName: 'Value Saver',
				score: 82,
				estimatedAnnualCost: usageSummary.annualCost * 0.92,
				estimatedSavings: usageSummary.annualCost * 0.08,
			},
		],
		totalPlansScored: 3,
	};

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
export async function runNarrative(env: Env, planScoring: PlanScoringOutput): Promise<NarrativeOutput> {
	const startTime = Date.now();
	logStageStart('narrative', planScoring);

	// Prepare prompt (placeholder)
	const topPlans = planScoring.scoredPlans.slice(0, 3);
	const prompt = `Explain why these are the top 3 energy plan recommendations:
${JSON.stringify(topPlans, null, 2)}

Provide a clear, user-friendly explanation highlighting savings and key benefits for each plan.`;

	// Call Workers AI
	const modelId = env.AI_MODEL_FAST || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

	await env.AI.run(modelId, {
		prompt,
		max_tokens: 1024,
	});

	// Placeholder narrative (will improve in Story 3.2)
	const result: NarrativeOutput = {
		explanation: `Based on your usage pattern and preferences, we've identified three excellent plan options that could save you money compared to your current plan.`,
		topRecommendations: topPlans.map((plan) => ({
			planId: plan.planId,
			rationale: `${plan.planName} from ${plan.supplier} scores ${plan.score}/100 and could save you approximately $${plan.estimatedSavings.toFixed(2)} annually.`,
		})),
	};

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
export async function runPipeline(
	env: Env,
	input: StageInput,
	progressCallback?: ProgressCallback
): Promise<PipelineResult> {
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

		usageSummary = await withTimeout(runUsageSummary(env, input), 30000, 'usage-summary');

		safeCallback(progressCallback, 'usage-summary', 'complete', usageSummary);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error in usage summary stage';
		errors.push({
			stage: 'usage-summary',
			message: errorMessage,
			timestamp: new Date().toISOString(),
		});
		console.error(`[${new Date().toISOString()}] [USAGE_SUMMARY] [ERROR] ${errorMessage}`);
		safeCallback(progressCallback, 'usage-summary', 'error', null);
	}

	// ===========================
	// Stage 2: Plan Scoring
	// ===========================
	if (usageSummary) {
		try {
			safeCallback(progressCallback, 'plan-scoring', 'running', null);

			planScoring = await withTimeout(runPlanScoring(env, usageSummary, input), 30000, 'plan-scoring');

			safeCallback(progressCallback, 'plan-scoring', 'complete', planScoring);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error in plan scoring stage';
			errors.push({
				stage: 'plan-scoring',
				message: errorMessage,
				timestamp: new Date().toISOString(),
			});
			console.error(`[${new Date().toISOString()}] [PLAN_SCORING] [ERROR] ${errorMessage}`);
			safeCallback(progressCallback, 'plan-scoring', 'error', null);
		}
	} else {
		// Skip stage 2 if stage 1 failed
		errors.push({
			stage: 'plan-scoring',
			message: 'Skipped due to previous stage failure',
			timestamp: new Date().toISOString(),
		});
	}

	// ===========================
	// Stage 3: Narrative
	// ===========================
	if (planScoring) {
		try {
			safeCallback(progressCallback, 'narrative', 'running', null);

			narrative = await withTimeout(runNarrative(env, planScoring), 30000, 'narrative');

			safeCallback(progressCallback, 'narrative', 'complete', narrative);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error in narrative stage';
			errors.push({
				stage: 'narrative',
				message: errorMessage,
				timestamp: new Date().toISOString(),
			});
			console.error(`[${new Date().toISOString()}] [NARRATIVE] [ERROR] ${errorMessage}`);
			safeCallback(progressCallback, 'narrative', 'error', null);
		}
	} else {
		// Skip stage 3 if stage 2 failed
		errors.push({
			stage: 'narrative',
			message: 'Skipped due to previous stage failure',
			timestamp: new Date().toISOString(),
		});
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
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, stageName: string): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new Error(`Stage ${stageName} exceeded ${timeoutMs / 1000}s timeout`)), timeoutMs)
		),
	]);
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
	output: any
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
		`[${new Date().toISOString()}] [${stageName.toUpperCase()}] [COMPLETE] Duration: ${duration}ms, Output size: ${outputSize} bytes`
	);
}
