/**
 * Form validation utilities
 */

import { VALIDATION_PATTERNS } from './constants';

/**
 * Validation result type
 */
export interface ValidationResult {
	isValid: boolean;
	error?: string;
}

/**
 * Form error type
 */
export interface FormError {
	field: string;
	message: string;
}

/**
 * Validate email address
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
	return VALIDATION_PATTERNS.EMAIL.test(email);
}

/**
 * Validate US phone number
 * @param phone - Phone number to validate
 * @returns True if valid US phone format
 */
export function validatePhoneNumber(phone: string): boolean {
	return VALIDATION_PATTERNS.PHONE.test(phone);
}

/**
 * Validate US ZIP code
 * @param zipCode - ZIP code to validate
 * @returns True if valid ZIP code format
 */
export function validateZipCode(zipCode: string): boolean {
	return VALIDATION_PATTERNS.ZIP_CODE.test(zipCode);
}

/**
 * Validate monthly energy usage data
 * @param data - Monthly usage array
 * @returns Validation result with error message if invalid
 */
export function validateUsageData(data: Array<{ month: number; kWh: number }>): ValidationResult {
	if (!data || data.length === 0) {
		return { isValid: false, error: 'Usage data is required' };
	}

	if (data.length !== 12) {
		return { isValid: false, error: 'Must provide 12 months of data' };
	}

	const hasData = data.some((usage) => usage.kWh > 0);
	if (!hasData) {
		return { isValid: false, error: 'At least one month must have usage data' };
	}

	for (const usage of data) {
		if (usage.kWh < 0) {
			return { isValid: false, error: `Invalid usage for month ${usage.month}: cannot be negative` };
		}
		if (usage.kWh > 100000) {
			return {
				isValid: false,
				error: `Invalid usage for month ${usage.month}: unreasonably high (max 100,000 kWh)`,
			};
		}
	}

	return { isValid: true };
}

/**
 * Validate current plan data
 * @param plan - Current plan object
 * @returns Validation result with error message if invalid
 */
export function validateCurrentPlan(plan: {
	supplier: string;
	planName: string;
	currentRate: number;
	monthlyFee: number;
}): ValidationResult {
	if (!plan.supplier || plan.supplier.trim().length === 0) {
		return { isValid: false, error: 'Supplier name is required' };
	}

	if (!plan.planName || plan.planName.trim().length === 0) {
		return { isValid: false, error: 'Plan name is required' };
	}

	if (plan.currentRate <= 0) {
		return { isValid: false, error: 'Current rate must be greater than 0' };
	}

	if (plan.currentRate > 1) {
		return { isValid: false, error: 'Current rate seems too high (should be in $/kWh, e.g., 0.12)' };
	}

	if (plan.monthlyFee < 0) {
		return { isValid: false, error: 'Monthly fee cannot be negative' };
	}

	return { isValid: true };
}

/**
 * Validate preferences
 * @param preferences - User preferences object
 * @returns Validation result with error message if invalid
 */
export function validatePreferences(preferences: {
	maxContractMonths: number;
	riskTolerance: string;
}): ValidationResult {
	if (preferences.maxContractMonths < 1) {
		return { isValid: false, error: 'Contract length must be at least 1 month' };
	}

	if (preferences.maxContractMonths > 36) {
		return { isValid: false, error: 'Contract length cannot exceed 36 months' };
	}

	const validRiskTolerances = ['low', 'medium', 'high'];
	if (!validRiskTolerances.includes(preferences.riskTolerance)) {
		return { isValid: false, error: 'Invalid risk tolerance value' };
	}

	return { isValid: true };
}

/**
 * Validate entire form data
 * @param data - Complete form data object
 * @returns Array of form errors (empty if valid)
 */
export function validateFormData(data: {
	monthlyUsage: Array<{ month: number; kWh: number }>;
	currentPlan: {
		supplier: string;
		planName: string;
		currentRate: number;
		monthlyFee: number;
	};
	preferences: {
		maxContractMonths: number;
		riskTolerance: string;
	};
}): FormError[] {
	const errors: FormError[] = [];

	// Validate usage data
	const usageValidation = validateUsageData(data.monthlyUsage);
	if (!usageValidation.isValid) {
		errors.push({ field: 'monthlyUsage', message: usageValidation.error || 'Invalid usage data' });
	}

	// Validate current plan
	const planValidation = validateCurrentPlan(data.currentPlan);
	if (!planValidation.isValid) {
		errors.push({ field: 'currentPlan', message: planValidation.error || 'Invalid plan data' });
	}

	// Validate preferences
	const preferencesValidation = validatePreferences(data.preferences);
	if (!preferencesValidation.isValid) {
		errors.push({ field: 'preferences', message: preferencesValidation.error || 'Invalid preferences' });
	}

	return errors;
}

/**
 * Check if a string is empty or whitespace only
 * @param value - String to check
 * @returns True if empty or whitespace
 */
export function isEmpty(value: string): boolean {
	return !value || value.trim().length === 0;
}

/**
 * Check if a number is within a range
 * @param value - Number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
	return value >= min && value <= max;
}
