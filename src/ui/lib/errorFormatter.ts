/**
 * Error formatting and categorization utilities
 */

import { ERROR_MESSAGES } from './constants';

export type ErrorCategory = 'network' | 'validation' | 'server' | 'timeout' | 'unknown';

/**
 * Format an error into a user-friendly message
 * @param error - Error object or string
 * @returns User-friendly error message (sanitized)
 */
export function formatErrorMessage(error: Error | string | unknown): string {
	if (typeof error === 'string') {
		return error;
	}

	if (error instanceof Error) {
		// Check for specific error types
		if (error.message.toLowerCase().includes('network')) {
			return ERROR_MESSAGES.NETWORK_ERROR;
		}
		if (error.message.toLowerCase().includes('timeout')) {
			return ERROR_MESSAGES.TIMEOUT_ERROR;
		}
		if (error.message.toLowerCase().includes('validation')) {
			return ERROR_MESSAGES.VALIDATION_ERROR;
		}

		// Return sanitized error message
		return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
	}

	// Unknown error type
	return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Get an icon/emoji for an error code
 * @param errorCode - Optional error code
 * @returns Icon string (emoji)
 */
export function getErrorIcon(errorCode?: string): string {
	if (!errorCode) return '⚠️';

	const code = errorCode.toLowerCase();

	if (code.includes('network') || code.includes('connection')) {
		return '🌐';
	}
	if (code.includes('timeout')) {
		return '⏱️';
	}
	if (code.includes('validation') || code.includes('invalid')) {
		return '❌';
	}
	if (code.includes('server') || code.includes('500')) {
		return '🔧';
	}
	if (code.includes('auth') || code.includes('forbidden')) {
		return '🔒';
	}
	if (code.includes('notfound') || code.includes('404')) {
		return '🔍';
	}

	return '⚠️';
}

/**
 * Categorize an error for conditional handling
 * @param error - Error object or string
 * @returns Error category
 */
export function categorizeError(error: Error | string | unknown): ErrorCategory {
	const message = formatErrorMessage(error).toLowerCase();

	if (message.includes('network') || message.includes('connection')) {
		return 'network';
	}
	if (message.includes('timeout')) {
		return 'timeout';
	}
	if (message.includes('validation') || message.includes('invalid')) {
		return 'validation';
	}
	if (message.includes('server') || message.includes('500')) {
		return 'server';
	}

	return 'unknown';
}

/**
 * Determine if an error is retryable
 * @param error - Error object or string
 * @returns True if error might succeed on retry
 */
export function isRetryableError(error: Error | string | unknown): boolean {
	const category = categorizeError(error);
	return category === 'network' || category === 'timeout' || category === 'server';
}

/**
 * Extract error code from various error formats
 * @param error - Error object with potential code property
 * @returns Error code or undefined
 */
export function extractErrorCode(error: unknown): string | undefined {
	if (typeof error === 'object' && error !== null) {
		if ('code' in error && typeof error.code === 'string') {
			return error.code;
		}
		if ('status' in error && typeof error.status === 'number') {
			return `HTTP_${error.status}`;
		}
	}
	return undefined;
}
