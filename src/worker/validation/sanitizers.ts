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
 * Extracts the first complete JSON object or array from text
 * Uses bracket depth tracking to handle nested structures
 * @param text - Text containing JSON
 * @returns First complete JSON string
 * @throws Error if no valid JSON found
 */
function extractFirstJSON(text: string): string {
	// Find first opening bracket
	const startBrace = text.indexOf('{');
	const startBracket = text.indexOf('[');

	let start = -1;
	if (startBrace !== -1 && startBracket !== -1) {
		start = Math.min(startBrace, startBracket);
	} else if (startBrace !== -1) {
		start = startBrace;
	} else if (startBracket !== -1) {
		start = startBracket;
	}

	if (start === -1) {
		throw new Error('No JSON object or array found in response');
	}

	// Track bracket depth to find matching closing bracket
	let depth = 0;
	let inString = false;
	let escape = false;

	for (let i = start; i < text.length; i++) {
		const char = text[i];

		// Handle escape sequences
		if (escape) {
			escape = false;
			continue;
		}

		if (char === '\\') {
			escape = true;
			continue;
		}

		// Toggle string state
		if (char === '"') {
			inString = !inString;
			continue;
		}

		// Only count brackets outside strings
		if (inString) continue;

		// Track depth
		if (char === '{' || char === '[') {
			depth++;
		} else if (char === '}' || char === ']') {
			depth--;
			// Found matching closing bracket
			if (depth === 0) {
				return text.substring(start, i + 1);
			}
		}
	}

	throw new Error('Unclosed JSON structure');
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

	// Remove code comment markers that appear before JSON (AI model artifacts)
	// Example: "*/\n{...}" or "*/*\n{...}"
	cleaned = cleaned.replace(/^\*+\/\*?\s*/g, '');
	cleaned = cleaned.replace(/^\*+\s*/g, '');
	cleaned = cleaned.replace(/^\/\*+\s*/g, '');

	// Remove trailing comment markers
	cleaned = cleaned.replace(/\s*\*+\/?\s*$/g, '');

	// CRITICAL FIX: Extract ONLY the first complete JSON structure
	// This handles cases where AI adds text after valid JSON
	try {
		cleaned = extractFirstJSON(cleaned);
	} catch (error) {
		console.error('[SANITIZER] Failed to extract JSON:', error);
		// If extraction fails, fall back to original logic
	}

	// Final trim
	cleaned = cleaned.trim();

	// Remove leading/trailing quotes if the entire response is quoted
	if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
		cleaned = cleaned.slice(1, -1);
		// Unescape escaped quotes within the string
		cleaned = cleaned.replace(/\\"/g, '"');
	}

	return cleaned;
}
