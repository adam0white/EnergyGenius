/**
 * Supplier Catalog - Mock supplier electricity plans
 *
 * This module contains 10+ realistic supplier plans with diverse characteristics:
 * - Multiple suppliers (Green Energy Co, Power Plus, EcoFlow, etc.)
 * - Varied pricing ($0.085-$0.135/kWh)
 * - Different renewable percentages (10%-100%)
 * - Multiple contract terms (3, 6, 12, 24 months - extendable to 60 months)
 * - Mix of early termination fees
 * - Quality ratings reflecting supplier reputation
 *
 * Contract lengths can range from 1-60 months. Current catalog uses common terms:
 * 3, 6, 12, and 24 months.
 */

import type { SupplierPlan } from './types';

/**
 * Array of realistic supplier plans for the recommendation engine
 * Data is immutable to prevent accidental modifications
 */
export const supplierCatalog: readonly SupplierPlan[] = [
	{
		id: 'plan-eco-001',
		supplier: 'Green Energy Co',
		planName: 'Eco Max',
		baseRate: 0.12,
		monthlyFee: 15,
		contractTermMonths: 12,
		earlyTerminationFee: 0,
		renewablePercent: 90,
		ratings: {
			reliabilityScore: 4.5,
			customerServiceScore: 4.3,
		},
		features: ['24/7 Customer Support', 'Green Incentives', 'Online Bill Pay', 'Mobile App', 'Renewable Energy Certificates'],
		availableInStates: ['TX', 'CA', 'NY', 'IL', 'PA'],
	},
	{
		id: 'plan-budget-001',
		supplier: 'Power Plus',
		planName: 'Budget Friendly',
		baseRate: 0.089,
		monthlyFee: 5,
		contractTermMonths: 24,
		earlyTerminationFee: 50,
		renewablePercent: 10,
		ratings: {
			reliabilityScore: 3.8,
			customerServiceScore: 3.5,
		},
		features: ['Low Base Rate', 'Online Portal', 'Email Support', 'Auto-Pay Discount'],
		availableInStates: ['TX', 'OH', 'PA', 'IL'],
	},
	{
		id: 'plan-balanced-001',
		supplier: 'EcoFlow',
		planName: 'Balanced Green',
		baseRate: 0.105,
		monthlyFee: 10,
		contractTermMonths: 6,
		earlyTerminationFee: 0,
		renewablePercent: 55,
		ratings: {
			reliabilityScore: 4.2,
			customerServiceScore: 4.0,
		},
		features: ['Flexible Contract', 'Online Bill Pay', '24/7 Support', 'Usage Alerts', 'Energy Efficiency Tips'],
		availableInStates: ['CA', 'NY', 'MA', 'CT', 'NJ'],
	},
	{
		id: 'plan-premium-001',
		supplier: 'Standard Electric',
		planName: 'Premium Stability',
		baseRate: 0.135,
		monthlyFee: 25,
		contractTermMonths: 12,
		earlyTerminationFee: 0,
		renewablePercent: 100,
		ratings: {
			reliabilityScore: 4.8,
			customerServiceScore: 4.9,
		},
		features: [
			'100% Wind & Solar',
			'Concierge Service',
			'Priority Support',
			'Mobile App',
			'Smart Home Integration',
			'Carbon Offset Program',
		],
		availableInStates: ['CA', 'NY', 'MA', 'WA', 'OR', 'CO'],
	},
	{
		id: 'plan-solar-001',
		supplier: 'SolarStrong Energy',
		planName: 'Solar Strong',
		baseRate: 0.115,
		monthlyFee: 12,
		contractTermMonths: 12,
		earlyTerminationFee: 0,
		renewablePercent: 85,
		ratings: {
			reliabilityScore: 4.4,
			customerServiceScore: 4.2,
		},
		features: ['85% Solar Power', 'Community Solar Credits', '24/7 Support', 'Mobile App', 'Free Energy Audit'],
		availableInStates: ['TX', 'CA', 'AZ', 'NV', 'FL'],
	},
	{
		id: 'plan-economy-001',
		supplier: 'Economy Power',
		planName: 'Economy Plus',
		baseRate: 0.095,
		monthlyFee: 0,
		contractTermMonths: 12,
		earlyTerminationFee: 30,
		renewablePercent: 20,
		ratings: {
			reliabilityScore: 3.9,
			customerServiceScore: 3.6,
		},
		features: ['No Monthly Fee', 'Competitive Rates', 'Online Account Access', 'Email Support'],
		availableInStates: ['TX', 'OH', 'PA', 'MD', 'NJ'],
	},
	{
		id: 'plan-flex-001',
		supplier: 'FlexEnergy',
		planName: 'Flex Saver',
		baseRate: 0.102,
		monthlyFee: 8,
		contractTermMonths: 3,
		earlyTerminationFee: 0,
		renewablePercent: 40,
		ratings: {
			reliabilityScore: 4.0,
			customerServiceScore: 3.9,
		},
		features: ['No Commitment', '3-Month Terms', 'Online Bill Pay', 'Mobile App', 'Usage Tracking'],
		availableInStates: ['TX', 'CA', 'IL', 'PA', 'OH'],
	},
	{
		id: 'plan-peak-001',
		supplier: 'TechPower Solutions',
		planName: 'Peak Performance',
		baseRate: 0.108,
		monthlyFee: 18,
		contractTermMonths: 12,
		earlyTerminationFee: 0,
		renewablePercent: 60,
		ratings: {
			reliabilityScore: 4.6,
			customerServiceScore: 4.5,
		},
		features: [
			'Smart Meter Integration',
			'Real-Time Usage Data',
			'AI-Powered Insights',
			'24/7 Live Chat',
			'Mobile App',
			'Paperless Billing Rewards',
		],
		availableInStates: ['CA', 'TX', 'NY', 'MA', 'WA'],
	},
	{
		id: 'plan-community-001',
		supplier: 'Community Power Co-op',
		planName: 'Community Green',
		baseRate: 0.098,
		monthlyFee: 12,
		contractTermMonths: 24,
		earlyTerminationFee: 25,
		renewablePercent: 50,
		ratings: {
			reliabilityScore: 4.3,
			customerServiceScore: 4.4,
		},
		features: ['Local Community Support', 'Member Dividends', 'Online Portal', '24/7 Support', 'Energy Efficiency Programs'],
		availableInStates: ['NY', 'MA', 'VT', 'NH', 'ME'],
	},
	{
		id: 'plan-value-001',
		supplier: 'Discount Power Direct',
		planName: 'Ultimate Value',
		baseRate: 0.085,
		monthlyFee: 3,
		contractTermMonths: 24,
		earlyTerminationFee: 75,
		renewablePercent: 15,
		ratings: {
			reliabilityScore: 3.7,
			customerServiceScore: 3.2,
		},
		features: ['Lowest Base Rate', 'Long-Term Savings', 'Online Account Management', 'Email Billing'],
		availableInStates: ['TX', 'OH', 'PA', 'IL', 'IN'],
	},
	{
		id: 'plan-wind-001',
		supplier: 'WindFlow Energy',
		planName: 'Wind Powered Pro',
		baseRate: 0.118,
		monthlyFee: 14,
		contractTermMonths: 12,
		earlyTerminationFee: 0,
		renewablePercent: 95,
		ratings: {
			reliabilityScore: 4.5,
			customerServiceScore: 4.3,
		},
		features: ['95% Wind Energy', 'Carbon Neutral', 'Smart Meter Ready', 'Mobile App', '24/7 Customer Service', 'Energy Reports'],
		availableInStates: ['TX', 'IA', 'KS', 'OK', 'NE'],
	},
	{
		id: 'plan-fixed-001',
		supplier: 'Reliable Energy Corp',
		planName: 'Fixed Rate Shield',
		baseRate: 0.11,
		monthlyFee: 10,
		contractTermMonths: 24,
		earlyTerminationFee: 40,
		renewablePercent: 35,
		ratings: {
			reliabilityScore: 4.4,
			customerServiceScore: 4.1,
		},
		features: ['Price Lock Guarantee', 'Rate Protection', 'Online Bill Pay', 'Auto-Pay Options', 'Customer Portal'],
		availableInStates: ['TX', 'CA', 'NY', 'PA', 'OH', 'IL'],
	},
] as const;

// Also export as default for convenience
export default supplierCatalog;
