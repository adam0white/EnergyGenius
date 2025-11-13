/**
 * RecommendationDeck - Display top 3 energy plan recommendations
 *
 * Shows recommended plans as attractive cards with:
 * - Supplier name and plan title
 * - Annual savings (prominent)
 * - Contract details (length, termination fee, renewable %)
 * - AI-generated narrative explanation
 * - Savings tier badges (Gold/Silver/Bronze)
 * - Progressive information display with expandable details
 */

import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ErrorBoundary } from '../ErrorBoundary';
import { parseNarrative, type NarrativeSection } from '../../../worker/lib/narrative-parser';

interface Recommendation {
	id: string;
	rank: number;
	planName: string;
	monthlyPrice: number;
	annualSavings: number;
	explanation: string | null; // NEW: Can be null for lazy loading
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
	baseRate?: number; // Price per kWh
	monthlyFee?: number; // Monthly service charge
}

interface RecommendationDeckProps {
	recommendations: Recommendation[];
}

/**
 * Determine savings tier based on amount
 * UPDATED: Story 10.12 - New tier thresholds and "No Value" tier
 * - Gold: ≥$400 (was ≥$1000)
 * - Silver: $200-399 (was $500-999)
 * - Bronze: -$99 to $199 (was <$500)
 * - No Value: ≤-$100 (new tier for significant losses)
 * Defensive type checking prevents edge cases with undefined/null/string values
 */
function getSavingsTier(savings: number): 'gold' | 'silver' | 'bronze' | 'no-value' {
	// Ensure savings is a number (defensive programming against type coercion issues)
	const numericSavings = typeof savings === 'number' ? savings : Number(savings) || 0;

	// Significant loss - clear warning needed
	if (numericSavings <= -100) return 'no-value';

	// Excellent savings - meaningful for most households
	if (numericSavings >= 400) return 'gold';

	// Good savings - worthwhile, covers switching hassle
	if (numericSavings >= 200) return 'silver';

	// Modest savings or small losses - marginal benefit
	return 'bronze';
}

/**
 * Formatted Narrative Section Renderer
 * Renders parsed narrative sections with appropriate formatting
 */
function NarrativeSectionRenderer({ section }: { section: NarrativeSection }) {
	if (section.type === 'list') {
		return (
			<ul className="space-y-2 my-3" role="list">
				{(section.content as string[]).map((item, index) => (
					<li key={index} className="flex items-start text-sm text-gray-700 leading-relaxed">
						<span className="text-blue-600 font-bold mr-2 mt-0.5" aria-hidden="true">
							•
						</span>
						<span>{item}</span>
					</li>
				))}
			</ul>
		);
	}

	if (section.type === 'metric') {
		return (
			<div className="my-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
				<p className="text-sm text-gray-800 font-medium leading-relaxed">{section.content as string}</p>
			</div>
		);
	}

	// Paragraph
	return <p className="text-sm text-gray-700 leading-relaxed my-2">{section.content as string}</p>;
}

/**
 * Formatted Narrative Component
 * Parses and displays narrative text with structure
 * NEW: Supports null text for lazy loading with skeleton
 * NEW: Defensive rendering to prevent crashes from invalid data
 */
function FormattedNarrative({ text }: { text: string | null }) {
	// NEW: Show loading skeleton if text is null
	if (text === null) {
		return (
			<div className="space-y-2 animate-pulse">
				<div className="h-4 bg-gray-200 rounded w-full"></div>
				<div className="h-4 bg-gray-200 rounded w-11/12"></div>
				<div className="h-4 bg-gray-200 rounded w-10/12"></div>
			</div>
		);
	}

	// NEW: Validate text is actually a string
	if (typeof text !== 'string') {
		console.error('FormattedNarrative received non-string text:', text);
		return (
			<p className="text-sm text-red-600 italic">
				Unable to display explanation (invalid format)
			</p>
		);
	}

	const parsed = parseNarrative(text);

	// Fallback to plain text if parsing fails or returns empty
	if (!parsed.sections || parsed.sections.length === 0) {
		return <p className="text-sm text-gray-700 leading-relaxed">{text}</p>;
	}

	return (
		<div className="space-y-1">
			{parsed.sections.map((section, index) => (
				<NarrativeSectionRenderer key={index} section={section} />
			))}
		</div>
	);
}

/**
 * Savings badge component with tooltip explanation
 * Shows savings-based value tier (not plan tier from provider)
 */
function SavingsBadge({ savings }: { savings: number }) {
	const tier = getSavingsTier(savings);

	const tierConfig = {
		gold: {
			icon: '⭐',
			label: 'Gold Value',
			className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
			description: '$400+ annual savings',
		},
		silver: {
			icon: '⚪',
			label: 'Silver Value',
			className: 'bg-gray-100 text-gray-800 border-gray-300',
			description: '$200-$399 annual savings',
		},
		bronze: {
			icon: '🔶',
			label: 'Bronze Value',
			className: 'bg-orange-100 text-orange-800 border-orange-300',
			description: '$0-$199 annual savings',
		},
		'no-value': {
			icon: '⚠️',
			label: 'No Value',
			className: 'bg-red-100 text-red-800 border-red-300',
			description: 'Switching costs more than current plan',
		},
	};

	const config = tierConfig[tier];

	return (
		<div className="group relative inline-block">
			<Badge variant="outline" className={`${config.className} font-semibold cursor-help`}>
				<span className="mr-1">{config.icon}</span>
				{config.label}
			</Badge>
			{/* Tooltip */}
			<div className="absolute right-0 top-full mt-2 w-56 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
				<div className="font-semibold mb-1">Value Tier Explanation</div>
				<div className="mb-2">{config.description}</div>
				<div className="text-gray-300 text-[10px]">
					Tiers indicate potential savings based on your current plan, not the supplier&apos;s plan quality.
				</div>
				{/* Arrow */}
				<div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
			</div>
		</div>
	);
}

/**
 * Individual recommendation card
 */
function RecommendationCard({ recommendation, rank }: { recommendation: Recommendation; rank: number }) {
	const [showMore, setShowMore] = useState(false);

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
			role="article"
			aria-labelledby={`recommendation-${rank}-title`}
		>
			{/* Header: Supplier name + Badge */}
			<div className="flex items-start justify-between mb-4">
				<div>
					<h3 id={`recommendation-${rank}-title`} className="text-xl font-bold text-gray-900">
						{supplier}
					</h3>
					<p className="text-base text-gray-600 mt-1">{recommendation.planName}</p>
				</div>
				<SavingsBadge savings={savings} />
			</div>

			{/* Key Details (Prominent) */}
			<div className="mb-4 space-y-2">
				<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
					<div className="text-sm text-gray-700">
						<span className="font-semibold text-gray-900">Contract:</span> {contractLength} months
						{earlyTerminationFee > 0 ? (
							<span className="ml-2">
								• <span className="font-semibold text-gray-900">ETF:</span> ${earlyTerminationFee}
							</span>
						) : (
							<span className="ml-2 text-green-600 font-medium">• No cancellation fee</span>
						)}
					</div>
				</div>
				{renewablePercentage > 0 && (
					<div className={`p-3 rounded-lg border ${renewablePercentage >= 50 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
						<div className="text-sm text-gray-700">
							<span className="font-semibold text-gray-900">Renewable Energy:</span>{' '}
							<span className={`font-bold ${renewablePercentage >= 50 ? 'text-green-700' : 'text-gray-900'}`}>
								{renewablePercentage}%
							</span>
							{renewablePercentage === 100 && <span className="ml-2">🌟 100% Clean Energy</span>}
						</div>
					</div>
				)}
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

			{/* Pricing Summary (always visible) */}
			<div className="space-y-2 mb-4">
				<div className="flex justify-between text-sm">
					<span className="text-gray-600">Price per kWh:</span>
					<span className="font-semibold text-gray-900">
						{recommendation.baseRate && recommendation.baseRate > 0
							? `$${recommendation.baseRate.toFixed(3)}/kWh`
							: 'N/A'}
					</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-gray-600">Monthly Service Fee:</span>
					<span className="font-semibold text-gray-900">
						${(recommendation.monthlyFee ?? 0).toFixed(2)}
					</span>
				</div>
				<div className="flex justify-between text-sm border-t pt-2 mt-2">
					<span className="text-gray-600">Est. Monthly Cost:</span>
					<span className="font-bold text-lg text-gray-900">${recommendation.monthlyPrice.toFixed(2)}</span>
				</div>
			</div>

			{/* Expandable "Show more details" section */}
			<div className="mb-4">
				<button
					onClick={() => setShowMore(!showMore)}
					className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
				>
					{showMore ? '▼' : '▶'} {showMore ? 'Hide details' : 'Show more details'}
				</button>

				{showMore && (
					<div className="mt-3 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Contract Length:</span>
							<span className="font-medium text-gray-900">{contractLength} months</span>
						</div>

						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Contract End Date (approx):</span>
							<span className="font-medium text-gray-900">{contractEndDate.toLocaleDateString()}</span>
						</div>

						{earlyTerminationFee > 0 && (
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Cancellation Policy:</span>
								<span className="font-medium text-gray-900">${earlyTerminationFee} early termination fee</span>
							</div>
						)}

						{renewablePercentage > 0 && (
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Environmental Impact:</span>
								<span className="font-medium text-gray-900">{renewablePercentage}% renewable energy</span>
							</div>
						)}

						<div className="flex justify-between text-sm">
							<span className="text-gray-600">Plan Type:</span>
							<span className="font-medium text-gray-900">Fixed Rate</span>
						</div>
					</div>
				)}
			</div>

			{/* Divider */}
			<div className="border-t border-gray-200 my-4" />

			{/* AI Narrative */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<h4 className="text-sm font-semibold text-gray-700">Why We Recommend This</h4>
					{recommendation.explanation === null && (
						<span className="text-xs text-blue-600 font-medium animate-pulse">Loading...</span>
					)}
				</div>
				<ErrorBoundary
				fallback={
					<p className="text-sm text-red-600 italic">
						Unable to display explanation. Please refresh the page.
					</p>
				}
			>
				<FormattedNarrative text={recommendation.explanation} />
			</ErrorBoundary>
			</div>

			{/* Best value indicator for top recommendation */}
			{rank === 1 && (
				<div className="mt-4 pt-4 border-t border-blue-200">
					{savings >= 0 ? (
						<Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
							⚡ Best Value
						</Badge>
					) : (
						<Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
							⚡ Top Pick
						</Badge>
					)}
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
	const sortedRecommendations = [...recommendations].sort((a, b) => b.annualSavings - a.annualSavings).slice(0, 3);

	return (
		<div className="w-full max-w-7xl mx-auto px-4 py-8">
			{/* Header */}
			<div className="mb-8 text-center">
				<h2 className="text-3xl font-bold text-gray-900 mb-2">Your Top Recommendations</h2>
				<p className="text-gray-600">Based on your usage and preferences, here are the best energy plans for you</p>
			</div>

			{/* Recommendation cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{sortedRecommendations.map((recommendation, index) => (
					<RecommendationCard key={recommendation.id} recommendation={recommendation} rank={index + 1} />
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
