/**
 * Cloudflare Worker Entry Point
 * Routes API requests to handlers and serves static assets
 *
 * API Routes:
 * - POST /api/recommend - Energy plan recommendation endpoint
 * - GET /api/mock-data - Optional mock data endpoint (requires ENABLE_MOCK_DATA=true)
 * - GET /health - Health check endpoint
 *
 * Static Assets:
 * - All other routes served via env.ASSETS.fetch() (React SPA)
 *
 * Example curl commands:
 * - curl http://localhost:8787/health
 * - curl -X POST http://localhost:8787/api/recommend -H "Content-Type: application/json" -d '{"energyUsageData":{},"preferences":{},"currentPlan":{}}'
 * - curl http://localhost:8787/api/mock-data
 */

import { handleRecommend } from './handlers/recommend';
import { handleMockData } from './handlers/mock-data';
import { handleHealth } from './handlers/health';
import { handleNarratives } from './handlers/narratives';
import { createErrorResponse, handleError } from './lib/errors';
import { logRequestStart, logRequestEnd, generateRequestId } from './lib/logging';

/**
 * Environment bindings and variables
 */
export interface Env {
	ASSETS: any; // Static assets binding
	AI: any; // Workers AI binding
	AI_MODEL_FAST: string; // Fast AI model identifier
	AI_MODEL_ACCURATE: string; // Accurate AI model identifier
	ENABLE_SSE: string; // Feature flag for Server-Sent Events
	ENABLE_MOCK_DATA: string; // Feature flag for mock data endpoint
}

/**
 * Main Worker fetch handler
 * Routes requests and handles errors
 */
export default {
	// eslint-disable-next-line no-undef
	async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
		const startTime = Date.now();
		const requestId = generateRequestId();

		try {
			const url = new URL(request.url);
			const { pathname } = url;

			// Log incoming request
			logRequestStart(requestId, request.method, pathname, startTime);

			// Handle CORS preflight requests
			if (request.method === 'OPTIONS') {
				return handleCorsPrelight();
			}

			// Route: GET /health (Health check)
			if (pathname === '/health' && request.method === 'GET') {
				const response = await handleHealth(request, env, requestId);
				logRequestEnd(requestId, request.method, pathname, response.status, Date.now() - startTime);
				return response;
			}

			// Route: POST /api/recommend (Recommendation endpoint)
			if (pathname === '/api/recommend' && request.method === 'POST') {
				const response = await handleRecommend(request, env, requestId);
				logRequestEnd(requestId, request.method, pathname, response.status, Date.now() - startTime);
				return response;
			}

			// Route: POST /api/narratives (Narrative generation endpoint)
			if (pathname === '/api/narratives' && request.method === 'POST') {
				const response = await handleNarratives(request, env, requestId);
				logRequestEnd(requestId, request.method, pathname, response.status, Date.now() - startTime);
				return response;
			}

			// Route: GET /api/mock-data (Optional mock data endpoint)
			if (pathname === '/api/mock-data' && request.method === 'GET') {
				// Check if mock data endpoint is enabled
				if (env.ENABLE_MOCK_DATA === 'true') {
					const response = await handleMockData(request, env, requestId);
					logRequestEnd(requestId, request.method, pathname, response.status, Date.now() - startTime);
					return response;
				} else {
					const response = createErrorResponse(404, 'Mock data endpoint is disabled', 'ENDPOINT_DISABLED');
					logRequestEnd(requestId, request.method, pathname, response.status, Date.now() - startTime);
					return response;
				}
			}

			// Route: Undefined API paths (404)
			if (pathname.startsWith('/api/')) {
				const response = createErrorResponse(404, `API endpoint not found: ${pathname}`, 'NOT_FOUND');
				logRequestEnd(requestId, request.method, pathname, response.status, Date.now() - startTime);
				return response;
			}

			// Serve static assets via ASSETS binding
			// This includes all React SPA routes (/, /app/*, etc.)
			// In dev mode, env.ASSETS may be undefined
			if (env.ASSETS) {
				const assetResponse = await env.ASSETS.fetch(request);

				// Add CORS headers to asset responses
				const headers = new Headers(assetResponse.headers);
				headers.set('Access-Control-Allow-Origin', '*');

				const response = new Response(assetResponse.body, {
					status: assetResponse.status,
					statusText: assetResponse.statusText,
					headers,
				});

				logRequestEnd(requestId, request.method, pathname, response.status, Date.now() - startTime);
				return response;
			} else {
				// ASSETS not bound (dev mode) - return 404
				const response = new Response('Not Found', { status: 404 });
				logRequestEnd(requestId, request.method, pathname, 404, Date.now() - startTime);
				return response;
			}
		} catch (error) {
			// Global error handler for uncaught exceptions
			return handleError(error, requestId, startTime);
		}
	},
};

/**
 * Handles CORS preflight OPTIONS requests
 * @returns Response with CORS headers
 */
function handleCorsPrelight(): Response {
	return new Response(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': '86400', // 24 hours
		},
	});
}
