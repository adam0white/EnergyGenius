/**
 * App - Root application component
 *
 * Orchestrates the complete user flow:
 * 1. "intake" - IntakeForm for data collection
 * 2. "processing" - ProgressTimeline showing AI pipeline stages
 * 3. "results" - RecommendationDeck showing top 3 plans
 * 4. "error" - Error display with retry option
 */

import React, { useEffect } from 'react';
import { Layout } from '../components/layout';
import { RecommendationProvider, useRecommendation as useRecommendationContext } from '../context';
import { IntakeForm } from '../components/intake/IntakeForm';
import { ProgressTimeline } from '../components/pipeline/ProgressTimeline';
import { RecommendationDeck } from '../components/results/RecommendationDeck';
import { useRecommendation } from '../hooks/useRecommendation';
import { Button } from '../components/ui/button';
import { Alert } from '../components/ui/alert';
import type { UserIntakeData } from '../context/types';

/**
 * Main App content (inside context provider)
 */
function AppContent() {
	const { submit, result, stages, loading, error, reset } = useRecommendation();
	const { state } = useRecommendationContext();

	// Scroll to top on state changes
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [state.currentStep]);

	/**
	 * Handle form submission
	 */
	const handleFormSubmit = async (formData: UserIntakeData) => {
		await submit(formData);
	};

	/**
	 * Handle "Start Over" button
	 */
	const handleStartOver = () => {
		reset();
	};

	/**
	 * Handle retry on error
	 */
	const handleRetry = async () => {
		if (state.userIntakeData) {
			await submit(state.userIntakeData);
		}
	};

	// Determine current view based on state
	const renderContent = () => {
		// Error state
		if (error) {
			return (
				<div className="w-full max-w-2xl mx-auto px-4 py-12">
					<Alert className="bg-red-50 border-red-200 p-6 mb-6">
						<div className="flex items-start gap-3">
							<span className="text-2xl">⚠️</span>
							<div className="flex-1">
								<h3 className="text-lg font-semibold text-red-900 mb-2">
									Error Processing Request
								</h3>
								<p className="text-red-800 mb-4">{error}</p>
								<div className="flex gap-3">
									<Button onClick={handleRetry} variant="default" size="sm">
										Try Again
									</Button>
									<Button onClick={handleStartOver} variant="outline" size="sm">
										Start Over
									</Button>
								</div>
							</div>
						</div>
					</Alert>
				</div>
			);
		}

		// Results state
		if (result && result.length > 0) {
			return (
				<div>
					<RecommendationDeck recommendations={result} />
					<div className="w-full max-w-7xl mx-auto px-4 py-8 text-center">
						<Button onClick={handleStartOver} variant="outline" size="lg">
							Start Over
						</Button>
					</div>
				</div>
			);
		}

		// Processing/Loading state
		if (loading || state.currentStep === 'processing') {
			return <ProgressTimeline stages={stages} />;
		}

		// Default: Intake state
		return <IntakeForm onSubmit={handleFormSubmit} isSubmitting={loading} />;
	};

	return <Layout>{renderContent()}</Layout>;
}

/**
 * Root App component with provider
 */
export default function App() {
	return (
		<RecommendationProvider>
			<AppContent />
		</RecommendationProvider>
	);
}
