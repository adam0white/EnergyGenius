/**
 * Application constants and configuration values
 */

/**
 * Error message constants
 */
export const ERROR_MESSAGES = {
	NETWORK_ERROR: 'Network error. Please check your connection and try again.',
	VALIDATION_ERROR: 'Please check your input and try again.',
	SERVER_ERROR: 'Server error. Please try again later.',
	UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
	TIMEOUT_ERROR: 'Request timed out. Please try again.',
	INVALID_DATA: 'Invalid data format received.',
} as const;

/**
 * UI step constants
 */
export const STEPS = {
	INTAKE: 'intake',
	PROCESSING: 'processing',
	RESULTS: 'results',
} as const;

/**
 * Pipeline stage names
 */
export const PIPELINE_STAGES = {
	DATA_INTERPRETATION: 'dataInterpretation',
	PLAN_SCORING: 'planScoring',
	NARRATIVE_GENERATION: 'narrativeGeneration',
} as const;

/**
 * Validation regex patterns
 */
export const VALIDATION_PATTERNS = {
	EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	PHONE: /^(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})$/,
	ZIP_CODE: /^\d{5}(-\d{4})?$/,
} as const;

/**
 * Component size variants
 */
export const SIZES = {
	SM: 'sm',
	MD: 'md',
	LG: 'lg',
	XL: 'xl',
} as const;

/**
 * Animation durations (ms)
 */
export const ANIMATION_DURATION = {
	FAST: 150,
	NORMAL: 300,
	SLOW: 500,
} as const;
