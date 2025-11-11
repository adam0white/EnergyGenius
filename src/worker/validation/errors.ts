/**
 * Custom Error Types for Response Validation
 */

/**
 * Base error class for response validation errors
 */
export class ResponseError extends Error {
	constructor(
		message: string,
		public stage: string,
		public code: string
	) {
		super(message);
		this.name = 'ResponseError';
	}
}

/**
 * Error thrown when JSON parsing fails
 */
export class ParseError extends ResponseError {
	constructor(
		message: string,
		public stage: string,
		public rawResponse: string
	) {
		super(message, stage, 'PARSE_ERROR');
		this.name = 'ParseError';
	}
}

/**
 * Error thrown when schema validation fails
 */
export class ValidationError extends ResponseError {
	constructor(
		message: string,
		public stage: string,
		public errors: any[]
	) {
		super(message, stage, 'VALIDATION_ERROR');
		this.name = 'ValidationError';
	}
}

/**
 * Error thrown when plan IDs don't match catalog
 */
export class MismatchError extends ResponseError {
	constructor(
		message: string,
		public stage: string,
		public invalidPlanIds: string[]
	) {
		super(message, stage, 'MISMATCH_ERROR');
		this.name = 'MismatchError';
	}
}

/**
 * Error thrown when narrative can't map to plans
 */
export class MappingError extends ResponseError {
	constructor(
		message: string,
		public stage: string,
		public details: string
	) {
		super(message, stage, 'MAPPING_ERROR');
		this.name = 'MappingError';
	}
}
