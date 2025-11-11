/**
 * Recommendation endpoint handler
 * Processes intake form data and returns energy plan recommendations
 */

import { Env } from '../index';
import { createErrorResponse, parseJsonBody, validateBodySize } from '../lib/errors';
import { runPipeline, StageInput, PipelineResult } from '../pipeline';

export interface IntakeFormData {
	energyUsageData: {
		monthlyData: Array<{
			month: string;
			usage: number;
			cost: number;
		}>;
	};
	preferences: {
		prioritizeSavings?: boolean;
		preferRenewable?: boolean;
		acceptVariableRates?: boolean;
		maxMonthlyBudget?: number;
	};
	currentPlan: {
		supplier: string;
		planName: string;
		rateStructure: string;
		monthlyFee?: number;
		rate?: number;
	};
}

export interface RecommendationResponse {
	data: {
		recommendations: Array<{
			planId: string;
			supplier: string;
			planName: string;
			score: number;
			estimatedAnnualCost: number;
			estimatedSavings: number;
			rationale: string;
		}>;
		usageSummary: {
			averageMonthlyUsage: number;
			peakUsageMonth: string;
			totalAnnualUsage: number;
			usagePattern: string;
			annualCost: number;
		};
		metadata: {
			executionTime: number;
			timestamp: string;
			requestId: string;
			errors: Array<{
				stage: string;
				message: string;
				timestamp: string;
			}>;
		};
	};
}

/**
 * Handles POST /api/recommend requests
 * Validates intake form data and runs AI pipeline to generate recommendations
 * @param request - Incoming POST request with JSON body
 * @param env - Worker environment bindings
 * @param requestId - Request ID for tracing
 * @returns Recommendation response or error
 */
export async function handleRecommend(request: Request, env: Env, requestId: string): Promise<Response> {
	// const startTime = Date.now(); // Unused for now

	// Validate request method
	if (request.method !== 'POST') {
		return createErrorResponse(405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
	}

	// Validate body size (max 1MB)
	if (!validateBodySize(request, 1024 * 1024)) {
		return createErrorResponse(413, 'Request payload too large (max 1MB)', 'PAYLOAD_TOO_LARGE');
	}

	// Parse and validate JSON body
	const body = await parseJsonBody(request);

	if (body === null) {
		return createErrorResponse(400, 'Invalid request: missing or malformed JSON body', 'INVALID_JSON');
	}

	// Validate required fields with detailed error messages
	const intakeData = body as IntakeFormData;

	// Check which fields are missing
	const missingFields: string[] = [];
	if (!intakeData.energyUsageData) missingFields.push('energyUsageData');
	if (!intakeData.preferences) missingFields.push('preferences');
	if (!intakeData.currentPlan) missingFields.push('currentPlan');

	if (missingFields.length > 0) {
		console.error(`[${requestId}] Validation failed - missing fields:`, missingFields);
		console.error(`[${requestId}] Received body keys:`, Object.keys(body));
		return createErrorResponse(
			400,
			`Missing required fields: ${missingFields.join(', ')}. Received: ${Object.keys(body).join(', ')}`,
			'MISSING_FIELDS',
		);
	}

	// Validate energyUsageData structure
	if (!intakeData.energyUsageData.monthlyData || !Array.isArray(intakeData.energyUsageData.monthlyData)) {
		console.error(`[${requestId}] Invalid energyUsageData structure:`, intakeData.energyUsageData);
		return createErrorResponse(400, 'Invalid energyUsageData: monthlyData array required', 'INVALID_USAGE_DATA');
	}

	// Log successful validation
	console.log(`[${requestId}] Validation passed - processing ${intakeData.energyUsageData.monthlyData.length} months of data`);

	// Build pipeline input
	const pipelineInput: StageInput = {
		energyUsageData: intakeData.energyUsageData,
		currentPlan: intakeData.currentPlan,
		preferences: intakeData.preferences,
	};

	// Run AI pipeline
	let pipelineResult: PipelineResult;

	try {
		pipelineResult = await runPipeline(env, pipelineInput);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown pipeline error';
		return createErrorResponse(500, `Pipeline execution failed: ${errorMessage}`, 'PIPELINE_ERROR');
	}

	// Check if we have any successful results
	if (!pipelineResult.usageSummary && !pipelineResult.planScoring && !pipelineResult.narrative) {
		return createErrorResponse(500, 'Pipeline failed: no stages completed successfully', 'PIPELINE_COMPLETE_FAILURE');
	}

	// Build recommendations from pipeline results
	const recommendations = pipelineResult.planScoring
		? pipelineResult.planScoring.scoredPlans.map((plan) => {
				const narrativeItem = pipelineResult.narrative?.topRecommendations.find((n) => n.planId === plan.planId);
				return {
					...plan,
					rationale: narrativeItem?.rationale || 'No explanation available',
				};
			})
		: [];

	// Build response
	const response: RecommendationResponse = {
		data: {
			recommendations,
			usageSummary: pipelineResult.usageSummary || {
				averageMonthlyUsage: 0,
				peakUsageMonth: 'Unknown',
				totalAnnualUsage: 0,
				usagePattern: 'Unknown',
				annualCost: 0,
			},
			metadata: {
				executionTime: pipelineResult.executionTime,
				timestamp: pipelineResult.timestamp,
				requestId,
				errors: pipelineResult.errors,
			},
		},
	};

	return new Response(JSON.stringify(response), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
