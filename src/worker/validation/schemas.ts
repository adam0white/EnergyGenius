/**
 * Zod Schemas for AI Response Validation
 * Defines runtime validation schemas for each pipeline stage output
 */

import { z } from 'zod';

/**
 * Usage Summary Output Schema (Stage 1)
 */
export const UsageSummarySchema = z.object({
	averageMonthlyUsage: z.number().min(1).max(10000),
	peakUsageMonth: z.string().min(1),
	totalAnnualUsage: z.number().min(1).max(120000),
	usagePattern: z.enum(['consistent', 'seasonal', 'high-variance']),
	annualCost: z.number().min(0),
});

export type UsageSummaryValidated = z.infer<typeof UsageSummarySchema>;

/**
 * Plan Scoring Output Schema (Stage 2)
 * Single scored plan
 */
export const ScoredPlanSchema = z.object({
	planId: z.string().min(1),
	supplier: z.string().min(1),
	planName: z.string().min(1),
	score: z.number().int().min(0).max(100),
	estimatedAnnualCost: z.number().min(0),
	estimatedSavings: z.number(),
	reasoning: z.string().min(1).max(500).optional(),
});

export const PlanScoringSchema = z.object({
	scoredPlans: z.array(ScoredPlanSchema).min(1).max(20),
	totalPlansScored: z.number().int().min(1),
});

export type PlanScoringValidated = z.infer<typeof PlanScoringSchema>;
export type ScoredPlanValidated = z.infer<typeof ScoredPlanSchema>;

/**
 * Narrative Output Schema (Stage 3)
 */
export const NarrativeRecommendationSchema = z.object({
	planId: z.string().min(1),
	rationale: z.string().min(1).max(2000),
});

export const NarrativeSchema = z.object({
	explanation: z.string().min(50).max(5000),
	topRecommendations: z.array(NarrativeRecommendationSchema).min(1).max(3),
});

export type NarrativeValidated = z.infer<typeof NarrativeSchema>;
