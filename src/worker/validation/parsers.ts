/**
 * AI Response Parsers and Validators
 * Parses and validates AI responses using Zod schemas
 */

import { z } from 'zod';
import { UsageSummarySchema, PlanScoringSchema, NarrativeSchema } from './schemas';
import type { UsageSummaryValidated, PlanScoringValidated, NarrativeValidated } from './schemas';
import { ParseError, ValidationError } from './errors';
import { sanitizeAIResponse, sanitizeText, truncateText } from './sanitizers';

/**
 * Parses and validates Usage Summary response (Stage 1)
 * @param rawResponse - Raw AI response text
 * @param stageName - Stage name for error reporting
 * @returns Validated usage summary output
 * @throws ParseError, ValidationError
 */
export function parseUsageSummary(rawResponse: string, stageName: string = 'usage-summary'): UsageSummaryValidated {
	// Log raw response (truncated)
	console.log(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Raw response (first 500 chars): ${rawResponse.substring(0, 500)}`);

	// Sanitize response
	const sanitized = sanitizeAIResponse(rawResponse);

	// Parse JSON
	let parsed: any;
	try {
		parsed = JSON.parse(sanitized);
	} catch (error) {
		const message = `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`;
		console.error(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
		throw new ParseError(message, stageName, rawResponse.substring(0, 500));
	}

	// Validate with Zod
	try {
		const validated = UsageSummarySchema.parse(parsed);
		console.log(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Validation successful`);
		return validated;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const message = `Schema validation failed: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
			console.error(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
			throw new ValidationError(message, stageName, error.errors);
		}
		throw error;
	}
}

/**
 * Parses and validates Plan Scoring response (Stage 2)
 * @param rawResponse - Raw AI response text
 * @param validPlanIds - Array of valid plan IDs from catalog
 * @param stageName - Stage name for error reporting
 * @returns Validated plan scoring output
 * @throws ParseError, ValidationError, MismatchError
 */
export function parsePlanScoring(
	rawResponse: string,
	validPlanIds: string[],
	stageName: string = 'plan-scoring'
): PlanScoringValidated {
	// Log raw response (truncated)
	console.log(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Raw response (first 500 chars): ${rawResponse.substring(0, 500)}`);

	// Sanitize response
	const sanitized = sanitizeAIResponse(rawResponse);

	// Parse JSON
	let parsed: any;
	try {
		parsed = JSON.parse(sanitized);
	} catch (error) {
		const message = `Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`;
		console.error(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
		throw new ParseError(message, stageName, rawResponse.substring(0, 500));
	}

	// If parsed is an array, wrap it in expected structure
	if (Array.isArray(parsed)) {
		parsed = {
			scoredPlans: parsed,
			totalPlansScored: parsed.length,
		};
	}

	// Validate with Zod
	let validated: PlanScoringValidated;
	try {
		validated = PlanScoringSchema.parse(parsed);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const message = `Schema validation failed: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
			console.error(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
			throw new ValidationError(message, stageName, error.errors);
		}
		throw error;
	}

	// Verify plan IDs match catalog
	const invalidPlanIds = validated.scoredPlans.filter((plan) => !validPlanIds.includes(plan.planId)).map((plan) => plan.planId);

	if (invalidPlanIds.length > 0) {
		const message = `Plan IDs not found in catalog: ${invalidPlanIds.join(', ')}`;
		console.warn(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
		// Don't throw, just log warning - AI might use different IDs
	}

	// Sort by score descending
	validated.scoredPlans.sort((a, b) => b.score - a.score);

	// Ensure we have at least 5 plans
	if (validated.scoredPlans.length < 5) {
		const message = `Insufficient plans returned: got ${validated.scoredPlans.length}, expected at least 5`;
		console.warn(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
		// Don't throw, continue with what we have
	}

	console.log(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Validation successful: ${validated.scoredPlans.length} plans`);
	return validated;
}

/**
 * Parses and validates Narrative response (Stage 3)
 * @param rawResponse - Raw AI response text (plain text, not JSON)
 * @param topPlanIds - Array of top 3 plan IDs that should be explained
 * @param stageName - Stage name for error reporting
 * @returns Validated narrative output
 * @throws ValidationError, MappingError
 */
export function parseNarrative(rawResponse: string, topPlanIds: string[], stageName: string = 'narrative'): NarrativeValidated {
	// Log raw response (truncated)
	console.log(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Raw response (first 500 chars): ${rawResponse.substring(0, 500)}`);

	// Sanitize response
	const sanitized = sanitizeText(rawResponse);

	// Validate length
	if (sanitized.length < 200) {
		const message = `Response too short: ${sanitized.length} chars, expected at least 200`;
		console.error(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
		throw new ValidationError(message, stageName, []);
	}

	if (sanitized.length > 5000) {
		console.warn(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Response too long (${sanitized.length} chars), truncating to 5000`);
	}

	// Split response by plan sections (look for plan ID patterns or separators)
	const sections = sanitized.split(/---+|\*\*\*+/).filter((s) => s.trim().length > 50);

	// Build narrative structure
	const topRecommendations = topPlanIds.slice(0, 3).map((planId, index) => {
		// Try to find matching section
		const section = sections[index] || sanitized.substring(index * 500, (index + 1) * 500);
		return {
			planId,
			rationale: truncateText(section.trim(), 2000),
		};
	});

	// Validate with Zod
	const narrative = {
		explanation: truncateText(sanitized, 5000),
		topRecommendations,
	};

	try {
		const validated = NarrativeSchema.parse(narrative);
		console.log(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Validation successful`);
		return validated;
	} catch (error) {
		if (error instanceof z.ZodError) {
			const message = `Schema validation failed: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
			console.error(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
			throw new ValidationError(message, stageName, error.errors);
		}
		throw error;
	}
}
