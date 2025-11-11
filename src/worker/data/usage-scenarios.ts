/**
 * Usage Scenarios - Mock electricity usage profiles
 *
 * This module contains 5 realistic usage scenarios representing different
 * household and business patterns:
 * - Average Household (10,800 kWh/year)
 * - High Summer Usage (14,400 kWh/year)
 * - Low Usage Efficient (6,000 kWh/year)
 * - Small Business (25,000 kWh/year)
 * - Winter-Heavy Usage (13,200 kWh/year)
 *
 * Each scenario includes 12 months of detailed usage data with realistic
 * seasonal variations.
 */

import type { UsageScenario } from './types';

/**
 * Array of realistic usage scenarios for testing and demonstration
 * Data is immutable to prevent accidental modifications
 */
export const usageScenarios: readonly UsageScenario[] = [
	{
		id: 'scenario-avg',
		name: 'Average Household',
		description: 'Typical suburban home with electric heating and cooling',
		type: 'residential',
		monthlyUsage: [
			{ month: 1, kWh: 920 },
			{ month: 2, kWh: 850 },
			{ month: 3, kWh: 800 },
			{ month: 4, kWh: 780 },
			{ month: 5, kWh: 900 },
			{ month: 6, kWh: 1000 },
			{ month: 7, kWh: 1100 },
			{ month: 8, kWh: 1050 },
			{ month: 9, kWh: 950 },
			{ month: 10, kWh: 850 },
			{ month: 11, kWh: 900 },
			{ month: 12, kWh: 900 },
		],
		annualKWh: 11000,
		averageMonthlyKWh: 917,
	},
	{
		id: 'scenario-summer-high',
		name: 'High Summer Usage',
		description: 'Hot climate home with heavy summer air conditioning',
		type: 'seasonal-high',
		monthlyUsage: [
			{ month: 1, kWh: 900 },
			{ month: 2, kWh: 850 },
			{ month: 3, kWh: 1000 },
			{ month: 4, kWh: 1200 },
			{ month: 5, kWh: 1400 },
			{ month: 6, kWh: 1600 },
			{ month: 7, kWh: 1650 },
			{ month: 8, kWh: 1600 },
			{ month: 9, kWh: 1400 },
			{ month: 10, kWh: 1200 },
			{ month: 11, kWh: 900 },
			{ month: 12, kWh: 700 },
		],
		annualKWh: 14400,
		averageMonthlyKWh: 1200,
	},
	{
		id: 'scenario-efficient',
		name: 'Low Usage (Efficient)',
		description: 'Energy-efficient apartment with minimal heating/cooling needs',
		type: 'residential',
		monthlyUsage: [
			{ month: 1, kWh: 550 },
			{ month: 2, kWh: 500 },
			{ month: 3, kWh: 450 },
			{ month: 4, kWh: 420 },
			{ month: 5, kWh: 450 },
			{ month: 6, kWh: 500 },
			{ month: 7, kWh: 550 },
			{ month: 8, kWh: 550 },
			{ month: 9, kWh: 500 },
			{ month: 10, kWh: 450 },
			{ month: 11, kWh: 480 },
			{ month: 12, kWh: 600 },
		],
		annualKWh: 6000,
		averageMonthlyKWh: 500,
	},
	{
		id: 'scenario-business',
		name: 'Small Business',
		description: 'Small retail shop with extended business hours',
		type: 'small-business',
		monthlyUsage: [
			{ month: 1, kWh: 2000 },
			{ month: 2, kWh: 1900 },
			{ month: 3, kWh: 2000 },
			{ month: 4, kWh: 2100 },
			{ month: 5, kWh: 2200 },
			{ month: 6, kWh: 2300 },
			{ month: 7, kWh: 2400 },
			{ month: 8, kWh: 2300 },
			{ month: 9, kWh: 2200 },
			{ month: 10, kWh: 2100 },
			{ month: 11, kWh: 2100 },
			{ month: 12, kWh: 2400 },
		],
		annualKWh: 26000,
		averageMonthlyKWh: 2167,
	},
	{
		id: 'scenario-winter-heavy',
		name: 'Winter-Heavy Usage',
		description: 'Northern climate home with electric heating',
		type: 'seasonal-low',
		monthlyUsage: [
			{ month: 1, kWh: 1500 },
			{ month: 2, kWh: 1400 },
			{ month: 3, kWh: 1200 },
			{ month: 4, kWh: 950 },
			{ month: 5, kWh: 800 },
			{ month: 6, kWh: 700 },
			{ month: 7, kWh: 650 },
			{ month: 8, kWh: 700 },
			{ month: 9, kWh: 800 },
			{ month: 10, kWh: 1000 },
			{ month: 11, kWh: 1300 },
			{ month: 12, kWh: 1500 },
		],
		annualKWh: 12500,
		averageMonthlyKWh: 1042,
	},
] as const;

// Also export as default for convenience
export default usageScenarios;
