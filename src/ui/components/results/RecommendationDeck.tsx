/**
 * RecommendationDeck - Display top 3 energy plan recommendations
 *
 * Shows recommended plans as attractive cards with:
 * - Supplier name and plan title
 * - Annual savings (prominent)
 * - Contract details (length, termination fee, renewable %)
 * - AI-generated narrative explanation
 * - Savings tier badges (Gold/Silver/Bronze)
 */

import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface Recommendation {
	id: string;
	rank: number;
	planName: string;
	monthlyPrice: number;
	annualSavings: number;
	explanation: string;
	rationale?: {
		savingsScore: number;
		renewableScore: number;
		flexibilityScore: number;
		overallScore: number;
	};
	// Additional fields for display
	supplier?: string;
	contractLength?: number;
	earlyTerminationFee?: number;
	renewablePercentage?: number;
}

interface RecommendationDeckProps {
	recommendations: Recommendation[];
}

/**
 * Determine savings tier based on amount
 */
function getSavingsTier(savings: number): 'gold' | 'silver' | 'bronze' {
	if (savings >= 1000) return 'gold';
	if (savings >= 500) return 'silver';
	return 'bronze';
}

/**
 * Savings badge component
 */
function SavingsBadge({ savings }: { savings: number }) {
	const tier = getSavingsTier(savings);

	const tierConfig = {
		gold: {
			icon: '⭐',
			label: 'Gold',
			className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		},
		silver: {
			icon: '⚪',
			label: 'Silver',
			className: 'bg-gray-100 text-gray-800 border-gray-300',
		},
		bronze: {
			icon: '🔶',
			label: 'Bronze',
			className: 'bg-orange-100 text-orange-800 border-orange-300',
		},
	};

	const config = tierConfig[tier];

	return (
		<Badge variant="outline" className={`${config.className} font-semibold`}>
			<span className="mr-1">{config.icon}</span>
			{config.label}
		</Badge>
	);
}

/**
 * Individual recommendation card
 */
function RecommendationCard({ recommendation, rank }: { recommendation: Recommendation; rank: number }) {
	// Extract data with fallbacks
	const supplier = recommendation.supplier || 'Energy Provider';
	const contractLength = recommendation.contractLength || 12;
	const earlyTerminationFee = recommendation.earlyTerminationFee ?? 0;
	const renewablePercentage = recommendation.renewablePercentage ?? 0;
	const savings = recommendation.annualSavings;

	// Calculate contract end date (approximate)
	const contractEndDate = new Date();
	contractEndDate.setMonth(contractEndDate.getMonth() + contractLength);

	return (
		<Card
			className={`p-6 border border-gray-200 rounded-xl shadow-md transition-all hover:shadow-lg hover:bg-gray-50 ${
				rank === 1 ? 'border-blue-400 border-2' : ''
			}`}
		>
			{/* Header: Supplier name + Badge */}
			<div className="flex items-start justify-between mb-4">
				<div>
					<h3 className="text-xl font-bold text-gray-900">{supplier}</h3>
					<p className="text-base text-gray-600 mt-1">{recommendation.planName}</p>
				</div>
				<SavingsBadge savings={savings} />
			</div>

			{/* Savings (prominent) */}
			<div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
				<div className="text-sm text-gray-600 mb-1">Annual Savings</div>
				<div className="text-3xl font-bold text-green-600">
					${Math.abs(savings).toLocaleString()}
					{savings < 0 && <span className="text-red-600"> loss</span>}
					<span className="text-lg text-gray-600">/year</span>
				</div>
			</div>

			{/* Divider */}
			<div className="border-t border-gray-200 my-4" />

			{/* Plan details */}
			<div className="space-y-3 mb-4 bg-gray-50 p-4 rounded-lg">
				<div className="flex justify-between text-sm">
					<span className="text-gray-600">Contract Length:</span>
					<span className="font-medium text-gray-900">{contractLength} months</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-gray-600">Early Termination Fee:</span>
					<span className="font-medium text-gray-900">
						{earlyTerminationFee === 0 ? 'None' : `$${earlyTerminationFee}`}
					</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-gray-600">Renewable Energy:</span>
					<span className="font-medium text-gray-900 flex items-center">
						🌱 {renewablePercentage}%
					</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-gray-600">Monthly Price:</span>
					<span className="font-medium text-gray-900">
						${recommendation.monthlyPrice.toFixed(2)}
					</span>
				</div>
			</div>

			{/* Divider */}
			<div className="border-t border-gray-200 my-4" />

			{/* AI Narrative */}
			<div>
				<h4 className="text-sm font-semibold text-gray-700 mb-2">Why We Recommend This</h4>
				<p className="text-sm text-gray-700 leading-relaxed">{recommendation.explanation}</p>
			</div>

			{/* Best value indicator for top recommendation */}
			{rank === 1 && (
				<div className="mt-4 pt-4 border-t border-blue-200">
					<Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
						⚡ Best Value
					</Badge>
				</div>
			)}
		</Card>
	);
}

/**
 * Main RecommendationDeck component
 */
export function RecommendationDeck({ recommendations }: RecommendationDeckProps) {
	// Handle empty recommendations
	if (!recommendations || recommendations.length === 0) {
		return (
			<div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
				<p className="text-gray-600">No recommendations available.</p>
			</div>
		);
	}

	// Sort by savings (descending) and take top 3
	const sortedRecommendations = [...recommendations]
		.sort((a, b) => b.annualSavings - a.annualSavings)
		.slice(0, 3);

	return (
		<div className="w-full max-w-7xl mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8 text-center">
				<h2 className="text-3xl font-bold text-gray-900 mb-2">Your Top Recommendations</h2>
				<p className="text-gray-600">
					Based on your usage and preferences, here are the best energy plans for you
				</p>
			</div>

			{/* Recommendation cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{sortedRecommendations.map((recommendation, index) => (
					<RecommendationCard
						key={recommendation.id}
						recommendation={recommendation}
						rank={index + 1}
					/>
				))}
			</div>

			{/* Additional info */}
			<div className="mt-12 text-center">
				<p className="text-sm text-gray-500">
					These recommendations are based on your current usage patterns and preferences.
					<br />
					Actual savings may vary based on your consumption.
				</p>
			</div>
		</div>
	);
}
