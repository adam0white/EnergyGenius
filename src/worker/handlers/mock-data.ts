/**
 * Mock data endpoint handler
 * Returns supplier catalog and usage scenarios for development/testing
 * Can be disabled via ENABLE_MOCK_DATA environment variable
 */

import { Env } from '../index';
import { supplierCatalog, usageScenarios } from '../data';

export interface MockDataResponse {
	data: {
		suppliers: typeof supplierCatalog;
		scenarios: typeof usageScenarios;
	};
	metadata: {
		count: {
			suppliers: number;
			scenarios: number;
		};
		timestamp: string;
		requestId: string;
	};
}

/**
 * Handles GET /api/mock-data requests
 * Returns mock supplier catalog and usage scenarios
 * @param request - Incoming GET request
 * @param env - Worker environment bindings
 * @param requestId - Request ID for tracing
 * @returns Mock data response with 200 status
 */
export async function handleMockData(request: Request, env: Env, requestId: string): Promise<Response> {
	const response: MockDataResponse = {
		data: {
			suppliers: supplierCatalog,
			scenarios: usageScenarios,
		},
		metadata: {
			count: {
				suppliers: supplierCatalog.length,
				scenarios: usageScenarios.length,
			},
			timestamp: new Date().toISOString(),
			requestId,
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
