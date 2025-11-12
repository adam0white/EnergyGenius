/**
 * Type definitions for RecommendationContext state management
 */

export type PipelineStatus = 'idle' | 'running' | 'complete' | 'error';
export type CurrentStep = 'intake' | 'processing' | 'results';
export type RiskTolerance = 'low' | 'medium' | 'high';

/**
 * Recommendation object matching backend /api/recommend response
 */
export interface Recommendation {
	id: string;
	rank: number;
	planName: string;
	monthlyPrice: number;
	annualSavings: number;
	explanation: string | null; // NEW: Can be null for lazy loading
	rationale: {
		savingsScore: number;
		renewableScore: number;
		flexibilityScore: number;
		overallScore: number;
	};
	// Additional supplier catalog fields for display
	supplier?: string;
	contractLength?: number;
	earlyTerminationFee?: number;
	renewablePercentage?: number;
	baseRate?: number; // Price per kWh
	monthlyFee?: number; // Monthly service charge
}

/**
 * Pipeline stage tracking for AI processing steps
 */
export interface PipelineStage {
	status: PipelineStatus;
	timestamp: Date | null; // Start time
	endTime: Date | null; // End time (set when status becomes 'complete')
	output: string;
}

/**
 * User intake data from the form
 */
export interface UserIntakeData {
	monthlyUsage: Array<{ month: number; kWh: number }>;
	annualConsumption: number;
	currentPlan: {
		supplier: string;
		planName: string;
		currentRate: number;
		monthlyFee: number;
		monthsRemaining: number;
		earlyTerminationFee: number;
		contractEndDate?: string;
	};
	preferences: {
		prioritizeSavings: boolean;
		prioritizeRenewable: boolean;
		prioritizeFlexibility: boolean;
		maxContractMonths: number;
		riskTolerance: RiskTolerance;
	};
}

/**
 * Error object for error tracking
 */
export interface ErrorObject {
	message: string;
	code?: string;
	timestamp: Date;
}

/**
 * Complete state shape for recommendation context
 */
export interface RecommendationState {
	recommendations: Recommendation[];
	pipelineStages: {
		dataInterpretation: PipelineStage;
		planScoring: PipelineStage;
		narrativeGeneration: PipelineStage;
	};
	userIntakeData: UserIntakeData | null;
	errors: ErrorObject[];
	isLoading: boolean;
	currentStep: CurrentStep;
}

/**
 * Action types for state reducer
 */
export type RecommendationAction =
	| { type: 'SET_USER_INTAKE_DATA'; payload: UserIntakeData }
	| { type: 'START_PIPELINE_STAGE'; payload: { stage: keyof RecommendationState['pipelineStages'] } }
	| {
			type: 'UPDATE_PIPELINE_STAGE';
			payload: { stage: keyof RecommendationState['pipelineStages']; output: string };
	  }
	| { type: 'COMPLETE_PIPELINE_STAGE'; payload: { stage: keyof RecommendationState['pipelineStages'] } }
	| { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
	| { type: 'SET_ERROR'; payload: ErrorObject }
	| { type: 'CLEAR_ERRORS' }
	| { type: 'RESET_STATE' }
	| { type: 'SET_CURRENT_STEP'; payload: CurrentStep }
	| { type: 'SET_LOADING'; payload: boolean };

/**
 * Context type with state and dispatch functions
 */
export interface RecommendationContextType {
	state: RecommendationState;
	setUserIntakeData: (data: UserIntakeData) => void;
	startPipelineStage: (stage: keyof RecommendationState['pipelineStages']) => void;
	updatePipelineStage: (stage: keyof RecommendationState['pipelineStages'], output: string) => void;
	completePipelineStage: (stage: keyof RecommendationState['pipelineStages']) => void;
	setRecommendations: (recommendations: Recommendation[]) => void;
	setError: (error: ErrorObject) => void;
	clearErrors: () => void;
	resetState: () => void;
	setCurrentStep: (step: CurrentStep) => void;
	setLoading: (loading: boolean) => void;
}
