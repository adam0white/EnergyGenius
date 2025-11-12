/**
 * AI Response Parsers and Validators
 * Parses and validates AI responses using Zod schemas
 */

import { z } from 'zod';
import { UsageSummarySchema, PlanScoringSchema, NarrativeSchema } from './schemas';
import type { UsageSummaryValidated, PlanScoringValidated, NarrativeValidated } from './schemas';
import { ParseError, ValidationError } from './errors';
import { sanitizeAIResponse, sanitizeText, truncateText } from './sanitizers';
import { supplierCatalog } from '../data/supplier-catalog';

/**
 * Fuzzy plan name matching - allows contract length variations
 * Strips contract length numbers to match base plan names
 *
 * Examples:
 * - "Pollution Free e-Plus 12 Choice" matches "Pollution Free e-Plus 36 Choice"
 * - "Frontier Power Saver 6" matches "Frontier Power Saver 12"
 * - "Smart Simple 24" matches "Smart Simple 12"
 *
 * @param aiPlanName - Plan name from AI response
 * @param catalogPlanName - Plan name from catalog
 * @returns true if names match (allowing contract length variations)
 */
function planNamesMatch(aiPlanName: string, catalogPlanName: string): boolean {
	// Exact match always passes
	if (aiPlanName === catalogPlanName) {
		return true;
	}

	// Normalize both names: remove contract length numbers (common patterns)
	// Pattern: remove standalone numbers that are likely contract lengths (3, 6, 9, 12, 15, 18, 24, 32, 36, 60 months)
	const normalizePattern = /\b(3|6|9|12|15|18|19|24|32|36|60)\b/g;

	const normalizedAI = aiPlanName.replace(normalizePattern, '').replace(/\s+/g, ' ').trim();
	const normalizedCatalog = catalogPlanName.replace(normalizePattern, '').replace(/\s+/g, ' ').trim();

	// Compare normalized names
	if (normalizedAI === normalizedCatalog) {
		console.log(
			`[${new Date().toISOString()}] [VALIDATION] Plan name fuzzy match: AI="${aiPlanName}" ≈ Catalog="${catalogPlanName}"`,
		);
		return true;
	}

	// No match
	return false;
}

/**
 * Parses and validates Usage Summary response (Stage 1)
 * @param rawResponse - Raw AI response text
 * @param stageName - Stage name for error reporting
 * @returns Validated usage summary output
 * @throws ParseError, ValidationError
 */
export function parseUsageSummary(rawResponse: string, stageName: string = 'usage-summary'): UsageSummaryValidated {
	// Log raw response (truncated)
	console.log(
		`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Raw response (first 500 chars): ${rawResponse.substring(0, 500)}`,
	);

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
export function parsePlanScoring(rawResponse: string, validPlanIds: string[], stageName: string = 'plan-scoring'): PlanScoringValidated {
	// Log raw response (truncated)
	console.log(
		`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Raw response (first 500 chars): ${rawResponse.substring(0, 500)}`,
	);

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

	// STRICT VALIDATION: Verify plan IDs match catalog
	const invalidPlanIds = validated.scoredPlans.filter((plan) => !validPlanIds.includes(plan.planId)).map((plan) => plan.planId);

	if (invalidPlanIds.length > 0) {
		const message = `Plan IDs not found in catalog: ${invalidPlanIds.join(', ')}. AI generated non-existent plans. All plan IDs must exactly match the catalog.`;
		console.error(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
		throw new ValidationError(message, stageName, [{ path: ['planId'], message: `Invalid plan IDs: ${invalidPlanIds.join(', ')}` }]);
	}

	// STRICT VALIDATION: Verify plan names and suppliers match catalog
	// - Supplier: STRICT (exact match required)
	// - Plan Name: RELAXED (fuzzy matching to allow contract length variations)
	const catalogMap = new Map(Array.from(supplierCatalog).map((p) => [p.id, p]));
	const mismatchedPlans: string[] = [];

	for (const scoredPlan of validated.scoredPlans) {
		const catalogPlan = catalogMap.get(scoredPlan.planId);
		if (!catalogPlan) continue; // Already caught by ID validation above

		// Check if supplier name matches exactly (STRICT)
		if (scoredPlan.supplier !== catalogPlan.supplier) {
			mismatchedPlans.push(
				`${scoredPlan.planId}: supplier mismatch (AI: "${scoredPlan.supplier}", Catalog: "${catalogPlan.supplier}")`,
			);
		}

		// Check if plan name matches (RELAXED - allow contract length variations)
		if (!planNamesMatch(scoredPlan.planName, catalogPlan.planName)) {
			mismatchedPlans.push(
				`${scoredPlan.planId}: planName mismatch (AI: "${scoredPlan.planName}", Catalog: "${catalogPlan.planName}")`,
			);
		}
	}

	if (mismatchedPlans.length > 0) {
		const message = `AI modified plan details. Supplier must exactly match. Plan names must match (allowing contract length variations). Mismatches: ${mismatchedPlans.join('; ')}`;
		console.error(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
		throw new ValidationError(message, stageName, [{ path: ['plans'], message: mismatchedPlans.join('; ') }]);
	}

	// Sort by score descending
	validated.scoredPlans.sort((a, b) => b.score - a.score);

	// Ensure we have at least 5 plans
	if (validated.scoredPlans.length < 5) {
		const message = `Insufficient plans returned: got ${validated.scoredPlans.length}, expected at least 5`;
		console.warn(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
		// Don't throw, continue with what we have
	}

	console.log(
		`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Validation successful: ${validated.scoredPlans.length} plans`,
	);
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
	console.log(
		`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Raw response (first 500 chars): ${rawResponse.substring(0, 500)}`,
	);

	// Sanitize response
	const sanitized = sanitizeText(rawResponse);

	// Validate length
	if (sanitized.length < 200) {
		const message = `Response too short: ${sanitized.length} chars, expected at least 200`;
		console.error(`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] ${message}`);
		throw new ValidationError(message, stageName, []);
	}

	if (sanitized.length > 5000) {
		console.warn(
			`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Response too long (${sanitized.length} chars), truncating to 5000`,
		);
	}

	// Split response by plan sections (look for --- separators)
	// Split on exactly "---" with optional whitespace before/after
	const rawSections = sanitized.split(/\s*---+\s*/);

	// Filter out empty/too-short sections and trim
	const sections = rawSections
		.map(s => s.trim())
		.filter(s => s.length > 50);

	// CRITICAL: Log section parsing for debugging
	console.log(
		`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Split into ${sections.length} sections (expected ${topPlanIds.length})`
	);

	// ROBUSTNESS: Handle malformed AI responses
	let topRecommendations: Array<{ planId: string; rationale: string }>;

	if (sections.length >= topPlanIds.length) {
		// AI generated proper separators - use sections as-is
		topRecommendations = topPlanIds.map((planId, index) => ({
			planId,
			rationale: truncateText(sections[index].trim(), 2000),
		}));
		console.log(
			`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Using ${sections.length} properly separated sections`
		);
	} else {
		// AI generated too few sections - split by character count as fallback
		console.warn(
			`[${new Date().toISOString()}] [PARSE] [${stageName.toUpperCase()}] Warning: Expected ${topPlanIds.length} sections but got ${sections.length}. Using character-based fallback.`
		);

		const charsPerPlan = Math.floor(sanitized.length / topPlanIds.length);
		topRecommendations = topPlanIds.map((planId, index) => {
			const startPos = index * charsPerPlan;
			const endPos = (index + 1) * charsPerPlan;
			const section = sanitized.substring(startPos, endPos).trim();

			return {
				planId,
				rationale: truncateText(section, 2000),
			};
		});
	}

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
