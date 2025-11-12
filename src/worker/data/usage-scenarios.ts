/**
 * Usage Scenarios - Mock electricity usage profiles
 *
 * This module contains 8 realistic usage scenarios representing diverse
 * household and business patterns:
 * - Average Household (11,000 kWh/year)
 * - High Summer Usage (14,400 kWh/year)
 * - Low Usage Efficient (6,000 kWh/year)
 * - Small Business (26,000 kWh/year)
 * - Winter-Heavy Usage (12,500 kWh/year)
 * - Large Family Home (19,200 kWh/year)
 * - Apartment Dweller (4,600 kWh/year)
 * - Medium Business (50,000 kWh/year)
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
	{
		id: 'scenario-large-family',
		name: 'Large Family Home',
		description: '4-bedroom suburban home with large family and multiple HVAC zones',
		type: 'large-family',
		monthlyUsage: [
			{ month: 1, kWh: 1550 },
			{ month: 2, kWh: 1450 },
			{ month: 3, kWh: 1350 },
			{ month: 4, kWh: 1250 },
			{ month: 5, kWh: 1450 },
			{ month: 6, kWh: 1850 },
			{ month: 7, kWh: 2050 },
			{ month: 8, kWh: 1950 },
			{ month: 9, kWh: 1750 },
			{ month: 10, kWh: 1450 },
			{ month: 11, kWh: 1500 },
			{ month: 12, kWh: 1600 },
		],
		annualKWh: 19200,
		averageMonthlyKWh: 1600,
	},
	{
		id: 'scenario-apartment',
		name: 'Apartment Dweller',
		description: '1-bedroom efficient apartment with minimal heating/cooling needs',
		type: 'apartment',
		monthlyUsage: [
			{ month: 1, kWh: 380 },
			{ month: 2, kWh: 360 },
			{ month: 3, kWh: 340 },
			{ month: 4, kWh: 320 },
			{ month: 5, kWh: 350 },
			{ month: 6, kWh: 420 },
			{ month: 7, kWh: 480 },
			{ month: 8, kWh: 460 },
			{ month: 9, kWh: 400 },
			{ month: 10, kWh: 350 },
			{ month: 11, kWh: 360 },
			{ month: 12, kWh: 380 },
		],
		annualKWh: 4600,
		averageMonthlyKWh: 383,
	},
	{
		id: 'scenario-medium-business',
		name: 'Medium Business',
		description: 'Small office building with HVAC, servers, and extended business hours',
		type: 'medium-business',
		monthlyUsage: [
			{ month: 1, kWh: 3800 },
			{ month: 2, kWh: 3700 },
			{ month: 3, kWh: 3900 },
			{ month: 4, kWh: 4000 },
			{ month: 5, kWh: 4200 },
			{ month: 6, kWh: 4500 },
			{ month: 7, kWh: 4800 },
			{ month: 8, kWh: 4700 },
			{ month: 9, kWh: 4400 },
			{ month: 10, kWh: 4100 },
			{ month: 11, kWh: 4000 },
			{ month: 12, kWh: 3900 },
		],
		annualKWh: 50000,
		averageMonthlyKWh: 4167,
	},
] as const;

// Also export as default for convenience
export default usageScenarios;
