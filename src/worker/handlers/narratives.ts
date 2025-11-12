/**
 * Narratives endpoint handler
 * Generates narratives for plan recommendations in parallel
 */

import { Env } from '../index';
import { createErrorResponse, parseJsonBody, validateBodySize } from '../lib/errors';
import { runNarrativeParallel, UsageSummaryOutput, PlanScoringOutput } from '../pipeline';

/**
 * Request body for POST /api/narratives
 */
export interface NarrativesRequest {
	usageSummary: UsageSummaryOutput;
	planScoring: PlanScoringOutput;
}

/**
 * Response body for POST /api/narratives
 */
export interface NarrativesResponse {
	narratives: Array<{
		planId: string;
		rationale: string;
	}>;
	executionTime: number;
	timestamp: string;
}

/**
 * Handles POST /api/narratives requests
 * Generates narratives for top 3 plan recommendations IN PARALLEL
 * @param request - Incoming POST request with JSON body
 * @param env - Worker environment bindings
 * @param requestId - Request ID for tracing
 * @returns Narratives response or error
 */
export async function handleNarratives(request: Request, env: Env, requestId: string): Promise<Response> {
	const startTime = Date.now();

	// Validate request method
	if (request.method !== 'POST') {
		return createErrorResponse(405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
	}

	// Validate body size (max 512KB)
	if (!validateBodySize(request, 512 * 1024)) {
		return createErrorResponse(413, 'Request payload too large (max 512KB)', 'PAYLOAD_TOO_LARGE');
	}

	// Parse and validate JSON body
	const body = await parseJsonBody(request);

	if (body === null) {
		return createErrorResponse(400, 'Invalid request: missing or malformed JSON body', 'INVALID_JSON');
	}

	// Validate required fields
	const narrativesReq = body as NarrativesRequest;

	if (!narrativesReq.usageSummary || !narrativesReq.planScoring) {
		console.error(`[${requestId}] Validation failed - missing usageSummary or planScoring`);
		return createErrorResponse(400, 'Missing required fields: usageSummary, planScoring', 'MISSING_FIELDS');
	}

	// Validate planScoring structure
	if (!narrativesReq.planScoring.scoredPlans || !Array.isArray(narrativesReq.planScoring.scoredPlans)) {
		console.error(`[${requestId}] Invalid planScoring structure`);
		return createErrorResponse(400, 'Invalid planScoring: scoredPlans array required', 'INVALID_PLAN_SCORING');
	}

	console.log(`[${requestId}] Generating narratives for ${narrativesReq.planScoring.scoredPlans.length} plans`);

	// Generate narratives IN PARALLEL
	try {
		const { result } = await runNarrativeParallel(env, narrativesReq.planScoring, narrativesReq.usageSummary);

		const executionTime = Date.now() - startTime;

		const response: NarrativesResponse = {
			narratives: result.topRecommendations,
			executionTime,
			timestamp: new Date().toISOString(),
		};

		console.log(`[${requestId}] Generated ${result.topRecommendations.length} narratives in ${executionTime}ms`);

		return new Response(JSON.stringify(response), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown narrative generation error';
		console.error(`[${requestId}] Narrative generation failed:`, errorMessage);
		return createErrorResponse(500, `Narrative generation failed: ${errorMessage}`, 'NARRATIVE_ERROR');
	}
}
