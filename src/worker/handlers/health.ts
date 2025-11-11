/**
 * Health check endpoint handler
 * Returns worker status and validates critical bindings
 */

import { Env } from '../index';

export interface HealthCheckResponse {
	status: 'ok' | 'degraded' | 'error';
	timestamp: string;
	version: string;
	bindings: {
		assets: boolean;
		ai: boolean;
	};
	environment: {
		aiModelFast: boolean;
		aiModelAccurate: boolean;
		enableSSE: boolean;
		enableMockData: boolean;
	};
}

/**
 * Handles GET /health requests
 * Validates critical bindings and returns health status
 * @param request - Incoming request
 * @param env - Worker environment bindings
 * @param requestId - Request ID for logging
 * @returns Health check response with 200 status
 */
export async function handleHealth(request: Request, env: Env, requestId: string): Promise<Response> {
	const startTime = Date.now();

	// Validate bindings
	const bindingsValid = {
		assets: !!env.ASSETS,
		ai: !!env.AI,
	};

	// Validate environment variables
	const envVarsValid = {
		aiModelFast: !!env.AI_MODEL_FAST,
		aiModelAccurate: !!env.AI_MODEL_ACCURATE,
		enableSSE: env.ENABLE_SSE !== undefined,
		enableMockData: env.ENABLE_MOCK_DATA !== undefined,
	};

	// Determine overall status
	const allBindingsValid = Object.values(bindingsValid).every((v) => v);
	const allEnvVarsValid = Object.values(envVarsValid).every((v) => v);

	let status: 'ok' | 'degraded' | 'error' = 'ok';
	if (!allBindingsValid) {
		status = 'error';
	} else if (!allEnvVarsValid) {
		status = 'degraded';
	}

	const response: HealthCheckResponse = {
		status,
		timestamp: new Date().toISOString(),
		version: '1.0.0', // TODO: Extract from package.json or environment
		bindings: bindingsValid,
		environment: envVarsValid,
	};

	const duration = Date.now() - startTime;

	// Log health check (INFO level)
	console.log(
		JSON.stringify({
			level: 'INFO',
			requestId,
			type: 'health_check',
			status,
			duration,
			timestamp: new Date().toISOString(),
		}),
	);

	return new Response(JSON.stringify(response), {
		status: status === 'ok' ? 200 : 503,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
