/**
 * Sanitization Utilities for AI Responses
 * Removes dangerous content and enforces safe formatting
 */

/**
 * Sanitizes AI response text by removing dangerous content
 * @param text - Raw text from AI
 * @returns Sanitized text safe for client consumption
 */
export function sanitizeText(text: string): string {
	if (!text) return '';

	let sanitized = text;

	// Remove HTML tags
	sanitized = sanitized.replace(/<[^>]*>/g, '');

	// Remove script tags and content
	sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

	// Remove style tags and content
	sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

	// Remove potentially dangerous protocols
	sanitized = sanitized.replace(/javascript:/gi, '');
	sanitized = sanitized.replace(/data:text\/html/gi, '');
	sanitized = sanitized.replace(/vbscript:/gi, '');

	// Trim excessive whitespace
	sanitized = sanitized.replace(/\s+/g, ' ').trim();

	return sanitized;
}

/**
 * Truncates text to maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum allowed length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
	if (!text) return '';
	if (text.length <= maxLength) return text;

	return text.substring(0, maxLength - 3) + '...';
}

/**
 * Sanitizes a numeric value to ensure it's valid
 * @param value - Value to sanitize
 * @param defaultValue - Fallback if invalid
 * @returns Safe numeric value
 */
export function sanitizeNumber(value: any, defaultValue: number = 0): number {
	const parsed = Number(value);
	if (isNaN(parsed) || !isFinite(parsed)) {
		return defaultValue;
	}
	return parsed;
}

/**
 * Sanitizes an array to ensure it's valid and within limits
 * @param value - Value to sanitize
 * @param maxLength - Maximum array length
 * @returns Safe array
 */
export function sanitizeArray<T>(value: any, maxLength: number = 100): T[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.slice(0, maxLength);
}

/**
 * Sanitizes AI response before parsing
 * Removes common issues that might break JSON parsing
 * @param response - Raw AI response
 * @returns Cleaned response ready for parsing
 */
export function sanitizeAIResponse(response: string): string {
	if (!response) return '{}';

	let cleaned = response.trim();

	// Remove markdown code blocks if present
	cleaned = cleaned.replace(/```json\s*/g, '');
	cleaned = cleaned.replace(/```\s*/g, '');

	// Remove leading/trailing quotes if the entire response is quoted
	if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
		cleaned = cleaned.slice(1, -1);
	}

	// Unescape escaped quotes within the string
	cleaned = cleaned.replace(/\\"/g, '"');

	return cleaned;
}
