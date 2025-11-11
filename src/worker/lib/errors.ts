/**
 * Error handling utilities for Worker fetch handler
 * Provides standardized error response formatting and error middleware
 */

export interface ErrorResponse {
	error: {
		code: string;
		message: string;
	};
}

/**
 * Creates a standardized JSON error response
 * @param status - HTTP status code (400, 404, 500, etc.)
 * @param message - User-friendly error message
 * @param code - Optional error code (defaults to status code)
 * @returns Response object with JSON error payload
 */
export function createErrorResponse(status: number, message: string, code?: string): Response {
	const errorBody: ErrorResponse = {
		error: {
			code: code || String(status),
			message,
		},
	};

	return new Response(JSON.stringify(errorBody), {
		status,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
		},
	});
}

/**
 * Global error handler for uncaught exceptions
 * Logs error details and returns sanitized 500 response
 * @param error - Caught error object
 * @param requestId - Unique request identifier for tracing
 * @param startTime - Request start timestamp for duration calculation
 * @returns 500 Internal Server Error response
 */
export function handleError(error: unknown, requestId: string, startTime: number): Response {
	const duration = Date.now() - startTime;
	const errorMessage = error instanceof Error ? error.message : String(error);

	// Structured error logging
	console.error(
		JSON.stringify({
			level: 'ERROR',
			requestId,
			type: 'unhandled_exception',
			message: errorMessage,
			duration,
			timestamp: new Date().toISOString(),
		}),
	);

	// Return sanitized error response (no internal details exposed)
	return createErrorResponse(500, 'Internal server error', 'INTERNAL_ERROR');
}

/**
 * Validates JSON request body and parses it
 * @param request - Incoming request object
 * @returns Parsed JSON body or null if invalid
 */
export async function parseJsonBody(request: Request): Promise<any | null> {
	const contentType = request.headers.get('Content-Type') || '';

	if (!contentType.includes('application/json')) {
		return null;
	}

	try {
		const text = await request.text();
		if (!text || text.trim() === '') {
			return null;
		}
		return JSON.parse(text);
	} catch (_error) {
		return null;
	}
}

/**
 * Validates request body size (prevents oversized payloads)
 * @param request - Incoming request object
 * @param maxSizeBytes - Maximum allowed size in bytes (default 1MB)
 * @returns true if size is valid, false otherwise
 */
export function validateBodySize(request: Request, maxSizeBytes: number = 1024 * 1024): boolean {
	const contentLength = request.headers.get('Content-Length');
	if (contentLength && parseInt(contentLength, 10) > maxSizeBytes) {
		return false;
	}
	return true;
}
