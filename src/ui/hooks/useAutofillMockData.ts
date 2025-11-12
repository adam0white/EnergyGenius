/**
 * Hook for autofilling the intake form with mock usage scenario data
 *
 * Provides functionality to:
 * - Select a random usage scenario from available mock data
 * - Map scenario data to form field structure
 * - Manage loading state during autofill operation
 * - Detect validation errors after autofill
 */

import { useState } from 'react';
import { usageScenarios } from '../../worker/data/usage-scenarios';
import type { UsageScenario } from '../../worker/data/types';

/**
 * Form data structure matching the intake form schema
 */
export interface FormData {
	monthlyUsage: Array<{ month: number; kWh: number }>;
	annualConsumption: number;
	currentPlan: {
		supplier: string;
		planName: string;
		currentRate: number;
		monthlyFee: number;
		contractEndDate?: string;
		monthsRemaining: number;
		earlyTerminationFee: number;
	};
	preferences: {
		prioritizeSavings: boolean;
		prioritizeRenewable: boolean;
		prioritizeFlexibility: boolean;
		maxContractMonths: number;
		riskTolerance: 'low' | 'medium' | 'high';
	};
}

/**
 * Return type for the useAutofillMockData hook
 */
export interface AutofillMockDataReturn {
	/** Function to get a random scenario and autofill data */
	getRandomScenario: () => UsageScenario;
	/** Function to map scenario to form data structure */
	mapScenarioToFormData: (scenario: UsageScenario) => FormData;
	/** Loading state indicator */
	isLoading: boolean;
	/** Set loading state */
	setIsLoading: (loading: boolean) => void;
	/** Validation error message if any */
	formError: string | null;
	/** Set form error */
	setFormError: (error: string | null) => void;
}

/**
 * Custom hook for autofilling mock data into the intake form
 *
 * @returns {AutofillMockDataReturn} Object containing scenario selection, mapping, and state management functions
 *
 * @example
 * ```tsx
 * const { getRandomScenario, mapScenarioToFormData, isLoading, setIsLoading } = useAutofillMockData();
 *
 * const handleAutofill = () => {
 *   setIsLoading(true);
 *   const scenario = getRandomScenario();
 *   const formData = mapScenarioToFormData(scenario);
 *   // Populate form fields with formData
 *   setTimeout(() => setIsLoading(false), 500);
 * };
 * ```
 */
export function useAutofillMockData(): AutofillMockDataReturn {
	const [isLoading, setIsLoading] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	/**
	 * Selects a random usage scenario from the available scenarios
	 *
	 * @returns {UsageScenario} Randomly selected usage scenario
	 */
	const getRandomScenario = (): UsageScenario => {
		const randomIndex = Math.floor(Math.random() * usageScenarios.length);
		return usageScenarios[randomIndex];
	};

	/**
	 * Maps a usage scenario to the form data structure
	 *
	 * Creates realistic current plan and preference data based on the scenario type
	 *
	 * @param {UsageScenario} scenario - The usage scenario to map
	 * @returns {FormData} Mapped form data ready for form population
	 */
	const mapScenarioToFormData = (scenario: UsageScenario): FormData => {
		// Generate realistic current plan based on scenario type
		const currentPlan = generateCurrentPlan(scenario);

		// Generate realistic preferences based on scenario type
		const preferences = generatePreferences(scenario);

		// Apply 5-10% variance to monthly kWh values for realistic variation
		const monthlyUsageWithVariance = scenario.monthlyUsage.map((usage) => ({
			month: usage.month,
			kWh: applyVariance(usage.kWh),
		}));

		// Recalculate annual total based on varied monthly values
		const annualConsumption = monthlyUsageWithVariance.reduce((sum, usage) => sum + usage.kWh, 0);

		return {
			monthlyUsage: monthlyUsageWithVariance,
			annualConsumption,
			currentPlan,
			preferences,
		};
	};

	return {
		getRandomScenario,
		mapScenarioToFormData,
		isLoading,
		setIsLoading,
		formError,
		setFormError,
	};
}

/**
 * Applies 5-10% random variance to a kWh value
 *
 * Each call produces a slightly different result to simulate realistic
 * usage variation while maintaining the overall pattern.
 *
 * @param {number} baseValue - The base kWh value from the scenario
 * @returns {number} The value with 5-10% variance applied (rounded)
 */
function applyVariance(baseValue: number): number {
	// Generate 5-10% variance
	const variancePercent = 0.05 + Math.random() * 0.05;
	// Randomly apply positive or negative variance
	const multiplier = 1 + (Math.random() > 0.5 ? variancePercent : -variancePercent);
	return Math.round(baseValue * multiplier);
}

/**
 * Generates realistic current plan data based on scenario type
 *
 * @param {UsageScenario} scenario - The usage scenario
 * @returns Current plan data
 */
function generateCurrentPlan(scenario: UsageScenario) {
	/**
	 * Base current rates for mock data scenarios
	 *
	 * Rates are intentionally set higher (0.14-0.17 $/kWh) than average
	 * catalog plans (0.09-0.13 $/kWh) to enable meaningful savings
	 * demonstrations showing Gold/Silver tier recommendations.
	 *
	 * This reflects realistic scenarios where users are on expensive
	 * legacy plans or default utility rates.
	 */
	const baseRates: Record<string, number> = {
		residential: 0.155,
		'small-business': 0.145,
		'seasonal-high': 0.165,
		'seasonal-low': 0.15,
		'large-family': 0.17,
		'apartment': 0.14,
		'medium-business': 0.16,
	};

	const monthlyFees: Record<string, number> = {
		residential: 9.95,
		'small-business': 14.95,
		'seasonal-high': 9.95,
		'seasonal-low': 9.95,
		'large-family': 12.95,
		'apartment': 9.95,
		'medium-business': 19.95,
	};

	// Generate contract end date 1-12 months in future
	const monthsRemaining = Math.floor(Math.random() * 12) + 1;
	const contractEndDate = new Date();
	contractEndDate.setMonth(contractEndDate.getMonth() + monthsRemaining);

	// Early termination fee based on months remaining
	const earlyTerminationFee = monthsRemaining > 6 ? 150 : 75;

	return {
		supplier: 'Current Energy Co',
		planName: 'Standard Fixed Rate',
		currentRate: baseRates[scenario.type] || 0.12,
		monthlyFee: monthlyFees[scenario.type] || 9.95,
		contractEndDate: contractEndDate.toISOString().split('T')[0],
		monthsRemaining,
		earlyTerminationFee,
	};
}

/**
 * Generates realistic preference data based on scenario type
 *
 * @param {UsageScenario} scenario - The usage scenario
 * @returns User preferences data
 */
function generatePreferences(scenario: UsageScenario) {
	// Different scenario types have different typical preferences
	const preferenceProfiles: Record<
		string,
		{
			prioritizeSavings: boolean;
			prioritizeRenewable: boolean;
			prioritizeFlexibility: boolean;
			maxContractMonths: number;
			riskTolerance: 'low' | 'medium' | 'high';
		}
	> = {
		residential: {
			prioritizeSavings: true,
			prioritizeRenewable: true,
			prioritizeFlexibility: false,
			maxContractMonths: 12,
			riskTolerance: 'medium',
		},
		'small-business': {
			prioritizeSavings: true,
			prioritizeRenewable: false,
			prioritizeFlexibility: true,
			maxContractMonths: 6,
			riskTolerance: 'low',
		},
		'seasonal-high': {
			prioritizeSavings: true,
			prioritizeRenewable: false,
			prioritizeFlexibility: false,
			maxContractMonths: 12,
			riskTolerance: 'high',
		},
		'seasonal-low': {
			prioritizeSavings: false,
			prioritizeRenewable: true,
			prioritizeFlexibility: true,
			maxContractMonths: 6,
			riskTolerance: 'medium',
		},
		'large-family': {
			prioritizeSavings: true,
			prioritizeRenewable: false,
			prioritizeFlexibility: false,
			maxContractMonths: 24,
			riskTolerance: 'medium',
		},
		'apartment': {
			prioritizeSavings: true,
			prioritizeRenewable: true,
			prioritizeFlexibility: true,
			maxContractMonths: 6,
			riskTolerance: 'low',
		},
		'medium-business': {
			prioritizeSavings: true,
			prioritizeRenewable: false,
			prioritizeFlexibility: false,
			maxContractMonths: 12,
			riskTolerance: 'low',
		},
	};

	return preferenceProfiles[scenario.type] || preferenceProfiles['residential'];
}
