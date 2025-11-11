/**
 * RecommendationContext - Global state management for recommendation pipeline
 *
 * Provides centralized state management for:
 * - User intake data
 * - AI pipeline progress tracking
 * - Recommendation results
 * - Error handling
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import type {
	RecommendationState,
	RecommendationAction,
	RecommendationContextType,
	UserIntakeData,
	Recommendation,
	ErrorObject,
	CurrentStep,
} from './types';

/**
 * Initial state with sensible defaults
 */
const initialState: RecommendationState = {
	recommendations: [],
	pipelineStages: {
		dataInterpretation: { status: 'idle', timestamp: null, endTime: null, output: '' },
		planScoring: { status: 'idle', timestamp: null, endTime: null, output: '' },
		narrativeGeneration: { status: 'idle', timestamp: null, endTime: null, output: '' },
	},
	userIntakeData: null,
	errors: [],
	isLoading: false,
	currentStep: 'intake',
};

/**
 * Reducer function for state updates
 */
function recommendationReducer(state: RecommendationState, action: RecommendationAction): RecommendationState {
	switch (action.type) {
		case 'SET_USER_INTAKE_DATA':
			return {
				...state,
				userIntakeData: action.payload,
			};

		case 'START_PIPELINE_STAGE':
			return {
				...state,
				pipelineStages: {
					...state.pipelineStages,
					[action.payload.stage]: {
						status: 'running',
						timestamp: new Date(),
						endTime: null,
						output: '',
					},
				},
				isLoading: true,
			};

		case 'UPDATE_PIPELINE_STAGE':
			return {
				...state,
				pipelineStages: {
					...state.pipelineStages,
					[action.payload.stage]: {
						...state.pipelineStages[action.payload.stage],
						output: action.payload.output,
					},
				},
			};

		case 'COMPLETE_PIPELINE_STAGE':
			return {
				...state,
				pipelineStages: {
					...state.pipelineStages,
					[action.payload.stage]: {
						...state.pipelineStages[action.payload.stage],
						status: 'complete',
						endTime: new Date(),
					},
				},
			};

		case 'SET_RECOMMENDATIONS':
			return {
				...state,
				recommendations: action.payload,
				isLoading: false,
				currentStep: 'results',
			};

		case 'SET_ERROR':
			return {
				...state,
				errors: [...state.errors, action.payload],
				isLoading: false,
			};

		case 'CLEAR_ERRORS':
			return {
				...state,
				errors: [],
			};

		case 'RESET_STATE':
			return initialState;

		case 'SET_CURRENT_STEP':
			return {
				...state,
				currentStep: action.payload,
			};

		case 'SET_LOADING':
			return {
				...state,
				isLoading: action.payload,
			};

		default:
			return state;
	}
}

/**
 * Create context with undefined default
 * (will throw error if used outside provider)
 */
const RecommendationContext = createContext<RecommendationContextType | undefined>(undefined);

/**
 * Provider component that wraps application
 */
export function RecommendationProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(recommendationReducer, initialState);

	// Memoized action creators to prevent unnecessary re-renders
	const setUserIntakeData = useCallback((data: UserIntakeData) => {
		dispatch({ type: 'SET_USER_INTAKE_DATA', payload: data });
	}, []);

	const startPipelineStage = useCallback((stage: keyof RecommendationState['pipelineStages']) => {
		dispatch({ type: 'START_PIPELINE_STAGE', payload: { stage } });
	}, []);

	const updatePipelineStage = useCallback((stage: keyof RecommendationState['pipelineStages'], output: string) => {
		dispatch({ type: 'UPDATE_PIPELINE_STAGE', payload: { stage, output } });
	}, []);

	const completePipelineStage = useCallback((stage: keyof RecommendationState['pipelineStages']) => {
		dispatch({ type: 'COMPLETE_PIPELINE_STAGE', payload: { stage } });
	}, []);

	const setRecommendations = useCallback((recommendations: Recommendation[]) => {
		dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
	}, []);

	const setError = useCallback((error: ErrorObject) => {
		dispatch({ type: 'SET_ERROR', payload: error });
	}, []);

	const clearErrors = useCallback(() => {
		dispatch({ type: 'CLEAR_ERRORS' });
	}, []);

	const resetState = useCallback(() => {
		dispatch({ type: 'RESET_STATE' });
	}, []);

	const setCurrentStep = useCallback((step: CurrentStep) => {
		dispatch({ type: 'SET_CURRENT_STEP', payload: step });
	}, []);

	const setLoading = useCallback((loading: boolean) => {
		dispatch({ type: 'SET_LOADING', payload: loading });
	}, []);

	// Memoize context value to prevent unnecessary re-renders
	const value = useMemo(
		() => ({
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
		}),
		[
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
		],
	);

	return <RecommendationContext.Provider value={value}>{children}</RecommendationContext.Provider>;
}

/**
 * Custom hook to access recommendation context
 * @throws Error if used outside RecommendationProvider
 */
export function useRecommendation(): RecommendationContextType {
	const context = useContext(RecommendationContext);

	if (context === undefined) {
		throw new Error('useRecommendation must be used within a RecommendationProvider');
	}

	return context;
}
