/**
 * Structured logging utilities for Worker request/response tracking
 * Provides consistent log format for observability and debugging
 */

export interface LogEntry {
	level: 'INFO' | 'WARN' | 'ERROR';
	requestId: string;
	type: string;
	timestamp: string;
	[key: string]: any;
}

/**
 * Logs incoming request with metadata
 * @param requestId - Unique request identifier
 * @param method - HTTP method (GET, POST, etc.)
 * @param path - Request URL pathname
 * @param startTime - Request start timestamp
 */
export function logRequestStart(requestId: string, method: string, path: string, startTime: number): void {
	const logEntry: LogEntry = {
		level: 'INFO',
		requestId,
		type: 'request_start',
		method,
		path: sanitizePath(path), // Avoid logging full paths with sensitive data
		timestamp: new Date(startTime).toISOString(),
	};

	console.log(JSON.stringify(logEntry));
}

/**
 * Logs completed request with response metadata
 * @param requestId - Unique request identifier
 * @param method - HTTP method
 * @param path - Request URL pathname
 * @param status - HTTP response status code
 * @param duration - Request duration in milliseconds
 */
export function logRequestEnd(requestId: string, method: string, path: string, status: number, duration: number): void {
	const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';

	const logEntry: LogEntry = {
		level,
		requestId,
		type: 'request_end',
		method,
		path: sanitizePath(path),
		status,
		duration,
		timestamp: new Date().toISOString(),
	};

	console.log(JSON.stringify(logEntry));
}

/**
 * Logs error event with context
 * @param requestId - Unique request identifier
 * @param errorMessage - Error message or description
 * @param duration - Time elapsed before error occurred
 * @param context - Additional context (e.g., handler name, operation)
 */
export function logError(requestId: string, errorMessage: string, duration: number, context?: Record<string, any>): void {
	const logEntry: LogEntry = {
		level: 'ERROR',
		requestId,
		type: 'error',
		message: errorMessage,
		duration,
		timestamp: new Date().toISOString(),
		...context,
	};

	console.error(JSON.stringify(logEntry));
}

/**
 * Logs application startup or environment info
 * @param env - Environment variables (masked if sensitive)
 */
export function logStartup(env: Record<string, any>): void {
	const maskedEnv = maskSensitiveData(env);

	const logEntry: LogEntry = {
		level: 'INFO',
		requestId: 'startup',
		type: 'worker_startup',
		timestamp: new Date().toISOString(),
		environment: maskedEnv,
	};

	console.log(JSON.stringify(logEntry));
}

/**
 * Sanitizes URL paths to avoid logging sensitive data
 * @param path - Original URL pathname
 * @returns Sanitized path (query params removed)
 */
function sanitizePath(path: string): string {
	// Remove query parameters to avoid logging sensitive data
	return path.split('?')[0];
}

/**
 * Masks sensitive environment variables for logging
 * @param env - Environment object
 * @returns Masked environment object
 */
function maskSensitiveData(env: Record<string, any>): Record<string, any> {
	const sensitiveKeys = ['API_KEY', 'SECRET', 'TOKEN', 'PASSWORD'];
	const masked: Record<string, any> = {};

	for (const [key, value] of Object.entries(env)) {
		if (sensitiveKeys.some((sensitive) => key.includes(sensitive))) {
			masked[key] = '***MASKED***';
		} else if (typeof value === 'string') {
			masked[key] = value;
		} else {
			masked[key] = '[object]';
		}
	}

	return masked;
}

/**
 * Generates a unique request ID (short alphanumeric hash)
 * @returns Random request ID string
 */
export function generateRequestId(): string {
	return Math.random().toString(36).substring(2, 11);
}
