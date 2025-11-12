/**
 * Health check endpoint handler
 * Returns worker status and validates critical bindings
 *
 * ASSETS Binding Behavior:
 * - ASSETS binding is OPTIONAL (used for serving static files)
 * - Missing ASSETS does NOT cause error status (development mode is acceptable)
 * - ASSETS.fetch() is validated only when binding exists
 * - AI binding is REQUIRED for ok status
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
	message?: string;
}

/**
 * Handles GET /health requests
 * Validates critical bindings and returns health status
 *
 * Status Codes:
 * - HTTP 200: Always returned for successful health check
 * - Response body 'status' field indicates actual health:
 *   - 'ok': All critical bindings valid (AI required, ASSETS optional)
 *   - 'degraded': Optional features missing or non-critical issues
 *   - 'error': Critical bindings missing (AI binding)
 *
 * @param request - Incoming request
 * @param env - Worker environment bindings
 * @param requestId - Request ID for logging
 * @returns Health check response with 200 status
 */
export async function handleHealth(request: Request, env: Env, requestId: string): Promise<Response> {
	const startTime = Date.now();

	// Validate bindings
	// ASSETS is optional - used for static file serving, not required for API functionality
	// AI is required - core functionality depends on AI binding
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

	// Validate ASSETS.fetch() if binding exists
	let assetsAccessible = bindingsValid.assets;
	if (bindingsValid.assets) {
		try {
			// Quick validation that ASSETS binding is functional
			// Don't actually fetch, just ensure the binding has the method
			assetsAccessible = typeof env.ASSETS.fetch === 'function';
		} catch (error) {
			assetsAccessible = false;
			console.warn('ASSETS binding exists but fetch() validation failed:', error);
		}
	}

	// Determine overall status
	// Only AI binding is CRITICAL - ASSETS is optional
	const criticalBindingsValid = bindingsValid.ai;
	const allEnvVarsValid = Object.values(envVarsValid).every((v) => v);

	let status: 'ok' | 'degraded' | 'error' = 'ok';
	let message: string | undefined;

	if (!criticalBindingsValid) {
		// AI binding missing - CRITICAL ERROR
		status = 'error';
		message = 'Critical binding missing: AI';
	} else if (!allEnvVarsValid) {
		// Environment variables incomplete - DEGRADED
		status = 'degraded';
		message = 'Some environment variables not configured';
	} else if (bindingsValid.assets && !assetsAccessible) {
		// ASSETS binding exists but not functional - DEGRADED
		status = 'degraded';
		message = 'ASSETS binding not functional';
	} else if (!bindingsValid.assets) {
		// ASSETS binding missing - OK (development mode or API-only deployment)
		// No status change - this is acceptable
		message = 'ASSETS binding not configured (development mode or API-only)';
	}

	const response: HealthCheckResponse = {
		status,
		timestamp: new Date().toISOString(),
		version: '1.0.0', // TODO: Extract from package.json or environment
		bindings: {
			assets: assetsAccessible, // Report actual accessibility, not just presence
			ai: bindingsValid.ai,
		},
		environment: envVarsValid,
		...(message && { message }),
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
			...(message && { message }),
		}),
	);

	// ALWAYS return HTTP 200 for health checks
	// Status field in response body indicates actual health state
	// This prevents false alarms in monitoring systems
	return new Response(JSON.stringify(response), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
