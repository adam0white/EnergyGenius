/**
 * useRecommendation Hook - API Integration for Recommendation Engine
 *
 * Provides API communication, optimistic UI updates, and error handling
 * for the recommendation pipeline. Integrates with RecommendationContext
 * for shared state management.
 *
 * Phase 1: Optimistic timing with simulated stages
 * Phase 2 Ready: SSE support for real-time updates
 */

import { useCallback, useEffect, useRef } from 'react';
import { useRecommendation as useRecommendationContext } from '../context';
import type { UserIntakeData, Recommendation, ErrorObject } from '../context/types';

// API endpoint
const API_ENDPOINT = '/api/recommend';

// Request timeout - increased to 90s to accommodate all 3 AI stages plus overhead
const REQUEST_TIMEOUT = 90000; // 90 seconds

/**
 * Interface for the hook's return value
 */
export interface UseRecommendationHook {
	submit: (intakeData: UserIntakeData) => Promise<void>;
	result: Recommendation[] | null;
	stages: {
		name: string;
		status: 'queued' | 'running' | 'completed' | 'error';
		startTime: Date | null;
		endTime: Date | null;
		output: string;
	}[];
	loading: boolean;
	error: string | null;
	retryCount: number;
	reset: () => void;
}

/**
 * Custom hook for recommendation API integration
 */
export function useRecommendation(): UseRecommendationHook {
	const context = useRecommendationContext();
	const {
		state,
		setUserIntakeData,
		startPipelineStage,
		updatePipelineStage,
		completePipelineStage,
		setRecommendations,
		setError,
		clearErrors,
		resetState,
		setCurrentStep,
		setLoading,
	} = context;

	// Refs for cleanup
	const abortControllerRef = useRef<AbortController | null>(null);
	const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
	const retryCountRef = useRef(0);

	/**
	 * Clear all timers
	 */
	const clearTimers = useCallback(() => {
		timersRef.current.forEach((timer) => clearTimeout(timer));
		timersRef.current = [];
	}, []);

	/**
	 * Validate intake data
	 */
	const validateIntakeData = (data: UserIntakeData): string | null => {
		// Validate kWh
		if (data.annualConsumption < 0 || data.annualConsumption > 999999) {
			return 'Annual consumption must be between 0 and 999,999 kWh';
		}

		// Validate supplier
		if (!data.currentPlan.supplier || data.currentPlan.supplier.trim() === '') {
			return 'Please select a supplier';
		}

		// Validate rate
		if (data.currentPlan.currentRate < 0.01 || data.currentPlan.currentRate > 1.0) {
			return 'Current rate must be between $0.01 and $1.00 per kWh';
		}

		return null;
	};

	/**
	 * Initialize pipeline stages to queued state
	 * No more optimistic timing - stages update based on actual API response
	 */
	const initializePipelineStages = useCallback(() => {
		// Set all stages to queued state with descriptive output
		updatePipelineStage('dataInterpretation', 'Analyzing your energy usage patterns...');
		updatePipelineStage('planScoring', 'Evaluating available energy plans...');
		updatePipelineStage('narrativeGeneration', 'Generating personalized recommendations...');
	}, [updatePipelineStage]);

	/**
	 * Submit intake data to API
	 */
	const submit = useCallback(
		async (intakeData: UserIntakeData) => {
			const requestStartTime = Date.now();
			console.log(`[PROGRESS] Request started at ${new Date().toISOString()}`);

			// Validate intake data
			const validationError = validateIntakeData(intakeData);
			if (validationError) {
				const errorObj: ErrorObject = {
					message: validationError,
					code: 'VALIDATION_ERROR',
					timestamp: new Date(),
				};
				setError(errorObj);
				return;
			}

			// Clear previous errors
			clearErrors();

			// Store intake data
			setUserIntakeData(intakeData);

			// Set loading state
			setLoading(true);
			setCurrentStep('processing');

			// Initialize pipeline stages (no optimistic timing)
			initializePipelineStages();

			// Start first stage immediately
			console.log(`[PROGRESS] Stage 1 (Data Interpretation) started at ${Date.now() - requestStartTime}ms`);
			startPipelineStage('dataInterpretation');

			// Create abort controller for request cancellation
			abortControllerRef.current = new AbortController();

			try {
				// Set up a progress timer to simulate stage transitions
				// Since we don't have SSE yet, we'll transition stages based on expected timing
				// Stage 1 starts immediately (already started above)
				const stage2Timer = setTimeout(() => {
					console.log(`[PROGRESS] Stage 1 (Data Interpretation) completed at ${Date.now() - requestStartTime}ms`);
					completePipelineStage('dataInterpretation');
					console.log(`[PROGRESS] Stage 2 (Plan Scoring) started at ${Date.now() - requestStartTime}ms`);
					startPipelineStage('planScoring');
				}, 5000); // ~5s for usage summary

				const stage3Timer = setTimeout(() => {
					console.log(`[PROGRESS] Stage 2 (Plan Scoring) completed at ${Date.now() - requestStartTime}ms`);
					completePipelineStage('planScoring');
					console.log(`[PROGRESS] Stage 3 (Narrative Generation) started at ${Date.now() - requestStartTime}ms`);
					startPipelineStage('narrativeGeneration');
				}, 11000); // ~6s for plan scoring (total 11s)

				timersRef.current = [stage2Timer, stage3Timer];

				// Transform intakeData to match API expectations
				const apiPayload = {
					energyUsageData: {
						monthlyData: intakeData.monthlyUsage.map((entry) => ({
							month: new Date(2024, entry.month - 1).toLocaleString('default', { month: 'long' }),
							usage: entry.kWh,
							cost: entry.kWh * intakeData.currentPlan.currentRate,
						})),
					},
					currentPlan: {
						supplier: intakeData.currentPlan.supplier,
						planName: intakeData.currentPlan.planName,
						rateStructure: 'Fixed', // Default assumption
						monthlyFee: intakeData.currentPlan.monthlyFee,
						rate: intakeData.currentPlan.currentRate,
					},
					preferences: {
						prioritizeSavings: intakeData.preferences.prioritizeSavings,
						preferRenewable: intakeData.preferences.prioritizeRenewable,
						acceptVariableRates: intakeData.preferences.riskTolerance !== 'low',
						maxMonthlyBudget: (intakeData.annualConsumption * intakeData.currentPlan.currentRate) / 12,
					},
				};

				// Send POST request
				console.log(`[PROGRESS] API request sent at ${Date.now() - requestStartTime}ms`);
				const response = await Promise.race([
					fetch(API_ENDPOINT, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(apiPayload),
						signal: abortControllerRef.current.signal,
					}),
					new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)),
				]);

				console.log(`[PROGRESS] API response received at ${Date.now() - requestStartTime}ms`);

				// Check response status
				if (!response.ok) {
					throw new Error(`API error: ${response.status} ${response.statusText}`);
				}

				// Parse response
				const apiResponse = await response.json();
				console.log(`[PROGRESS] Response parsed at ${Date.now() - requestStartTime}ms`);

				// Validate response structure (API returns data.recommendations)
				if (!apiResponse.data || !apiResponse.data.recommendations || !Array.isArray(apiResponse.data.recommendations)) {
					throw new Error('Invalid response format: missing data.recommendations array');
				}

				// Transform API response to frontend format
				// Enrich recommendations with supplier catalog data
				const transformedRecommendations = apiResponse.data.recommendations
					.slice(0, 3)
					.map((rec: any, index: number) => {
						// Find matching plan in the response to get full details
						// The API should include supplier info, but we'll enrich from catalog if available
						const recommendation: Recommendation = {
							id: rec.planId,
							rank: index + 1,
							planName: rec.planName,
							monthlyPrice: rec.estimatedAnnualCost / 12,
							annualSavings: rec.estimatedSavings,
							explanation: rec.rationale,
							rationale: {
								savingsScore: rec.score * 0.8, // Approximate based on score
								renewableScore: rec.score * 0.5,
								flexibilityScore: rec.score * 0.6,
								overallScore: rec.score,
							},
							// Add supplier catalog fields from API response
							supplier: rec.supplier || 'Energy Provider',
							contractLength: rec.contractTermMonths || 12,
							earlyTerminationFee: rec.earlyTerminationFee ?? 0,
							renewablePercentage: rec.renewablePercent ?? 0,
						};
						return recommendation;
					})
					.sort((a: Recommendation, b: Recommendation) => b.annualSavings - a.annualSavings);

				// Complete the final stage
				console.log(`[PROGRESS] Stage 3 (Narrative Generation) completed at ${Date.now() - requestStartTime}ms`);
				completePipelineStage('narrativeGeneration');

				// Clear timers before setting recommendations
				clearTimers();

				// Update state with recommendations
				console.log(`[PROGRESS] Total request time: ${Date.now() - requestStartTime}ms`);
				setRecommendations(transformedRecommendations);

				// Reset retry count on success
				retryCountRef.current = 0;
			} catch (error) {
				// Handle errors
				let errorMessage = 'An unexpected error occurred';
				let errorCode = 'UNKNOWN_ERROR';

				if (error instanceof Error) {
					if (error.name === 'AbortError') {
						errorMessage = 'Request was cancelled';
						errorCode = 'CANCELLED';
					} else if (error.message === 'Request timeout') {
						errorMessage = 'Request timeout after 30 seconds';
						errorCode = 'TIMEOUT';
					} else if (error.message.startsWith('API error:')) {
						errorMessage = error.message;
						errorCode = 'API_ERROR';
					} else if (error.message.startsWith('Invalid response')) {
						errorMessage = error.message;
						errorCode = 'INVALID_RESPONSE';
					} else if (error.message.includes('fetch')) {
						errorMessage = 'Network error: unable to reach server';
						errorCode = 'NETWORK_ERROR';
					} else {
						errorMessage = error.message;
					}
				}

				const errorObj: ErrorObject = {
					message: errorMessage,
					code: errorCode,
					timestamp: new Date(),
				};

				setError(errorObj);
				setLoading(false);

				// Increment retry count
				retryCountRef.current += 1;

				// Clear timers on error
				clearTimers();
			}
		},
		[
			setUserIntakeData,
			setLoading,
			setCurrentStep,
			setRecommendations,
			setError,
			clearErrors,
			initializePipelineStages,
			startPipelineStage,
			completePipelineStage,
			clearTimers,
		],
	);

	/**
	 * Reset hook state
	 */
	const reset = useCallback(() => {
		clearTimers();
		abortControllerRef.current?.abort();
		retryCountRef.current = 0;
		resetState();
	}, [resetState, clearTimers]);

	/**
	 * Cleanup on unmount
	 */
	useEffect(() => {
		return () => {
			clearTimers();
			abortControllerRef.current?.abort();
		};
	}, [clearTimers]);

	/**
	 * Convert pipeline stages to hook format
	 */
	const stages = [
		{
			name: 'Usage Summary',
			status: state.pipelineStages.dataInterpretation.status,
			startTime: state.pipelineStages.dataInterpretation.timestamp,
			endTime: state.pipelineStages.dataInterpretation.endTime,
			output: state.pipelineStages.dataInterpretation.output,
		},
		{
			name: 'Plan Scoring',
			status: state.pipelineStages.planScoring.status,
			startTime: state.pipelineStages.planScoring.timestamp,
			endTime: state.pipelineStages.planScoring.endTime,
			output: state.pipelineStages.planScoring.output,
		},
		{
			name: 'Narrative Generation',
			status: state.pipelineStages.narrativeGeneration.status,
			startTime: state.pipelineStages.narrativeGeneration.timestamp,
			endTime: state.pipelineStages.narrativeGeneration.endTime,
			output: state.pipelineStages.narrativeGeneration.output,
		},
	];

	// Get error message
	const errorMessage = state.errors.length > 0 ? state.errors[state.errors.length - 1].message : null;

	return {
		submit,
		result: state.recommendations.length > 0 ? state.recommendations : null,
		stages,
		loading: state.isLoading,
		error: errorMessage,
		retryCount: retryCountRef.current,
		reset,
	};
}
