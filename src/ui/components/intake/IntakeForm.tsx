/**
 * IntakeForm - User energy usage intake form with mock data autofill
 *
 * Collects user energy usage data, current plan details, and preferences
 * for the recommendation pipeline. Includes "Generate Mock Data" button
 * for quick testing with realistic scenarios.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { useAutofillMockData, type FormData } from '../../hooks/useAutofillMockData';

interface IntakeFormProps {
	onSubmit?: (data: FormData) => void;
	isSubmitting?: boolean;
}

export function IntakeForm({ onSubmit, isSubmitting = false }: IntakeFormProps) {
	const { getRandomScenario, mapScenarioToFormData, isLoading, setIsLoading, formError, setFormError } = useAutofillMockData();

	// Form state
	const [formData, setFormData] = useState<FormData>({
		monthlyUsage: Array.from({ length: 12 }, (_, i) => ({
			month: i + 1,
			kWh: 0,
		})),
		annualConsumption: 0,
		currentPlan: {
			supplier: '',
			planName: '',
			currentRate: 0,
			monthlyFee: 0,
			monthsRemaining: 0,
			earlyTerminationFee: 0,
		},
		preferences: {
			prioritizeSavings: false,
			prioritizeRenewable: false,
			prioritizeFlexibility: false,
			maxContractMonths: 12,
			riskTolerance: 'medium',
		},
	});

	const [isAutofilled, setIsAutofilled] = useState(false);
	const [autofillScenarioName, setAutofillScenarioName] = useState<string | null>(null);
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);

	// Ref for error alert to enable auto-scroll
	const errorAlertRef = useRef<HTMLDivElement>(null);

	/**
	 * Auto-scroll to error when formError is set
	 */
	useEffect(() => {
		if (formError && errorAlertRef.current) {
			errorAlertRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}
	}, [formError]);

	/**
	 * Handle autofill button click
	 * Generates random scenario data and populates form
	 */
	const handleAutofill = () => {
		// eslint-disable-next-line no-console
		console.log('[Autofill] Starting autofill at', new Date().toISOString());

		setIsLoading(true);
		setFormError(null);
		setShowSuccessMessage(false);

		// Simulate loading for user feedback (300-500ms)
		setTimeout(() => {
			try {
				const scenario = getRandomScenario();
				// eslint-disable-next-line no-console
				console.log('[Autofill] Selected scenario:', scenario.id, scenario.name);

				const mappedData = mapScenarioToFormData(scenario);
				// eslint-disable-next-line no-console
				console.log('[Autofill] Mapped form data:', mappedData);

				setFormData(mappedData);
				setIsAutofilled(true);
				setAutofillScenarioName(scenario.name);
				setShowSuccessMessage(true);

				// Auto-dismiss success message after 3 seconds
				setTimeout(() => {
					setShowSuccessMessage(false);
				}, 3000);

				setIsLoading(false);
			} catch (error) {
				console.error('[Autofill] Error during autofill:', error);
				setFormError('Failed to generate mock data. Please try again.');
				setIsLoading(false);
			}
		}, 400);
	};

	/**
	 * Clear mock data indicator
	 */
	const clearMockIndicator = () => {
		setIsAutofilled(false);
		setAutofillScenarioName(null);
	};

	/**
	 * Update monthly usage value and auto-calculate annual consumption
	 */
	const updateMonthlyUsage = (month: number, kWh: number) => {
		setFormData((prev) => {
			const updatedMonthlyUsage = prev.monthlyUsage.map((usage) => (usage.month === month ? { ...usage, kWh } : usage));
			const total = updatedMonthlyUsage.reduce((sum, usage) => sum + (usage.kWh || 0), 0);
			return {
				...prev,
				monthlyUsage: updatedMonthlyUsage,
				annualConsumption: total,
			};
		});
	};

	/**
	 * Handle form submission
	 */
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Basic validation
		const hasMonthlyData = formData.monthlyUsage.some((u) => u.kWh > 0);
		if (!hasMonthlyData && formData.annualConsumption === 0) {
			setFormError('Please enter at least one month of usage data');
			return;
		}

		if (!formData.currentPlan.supplier) {
			setFormError('Please enter your current supplier information');
			return;
		}

		// eslint-disable-next-line no-console
		console.log('[IntakeForm] Submitting form data:', formData);

		// Trigger parent component's onSubmit callback
		// This allows App.tsx to handle the state transition
		if (onSubmit) {
			onSubmit(formData);
		}
	};

	return (
		<div className="w-full max-w-4xl mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold">Energy Usage Intake</h1>
				<p className="text-muted-foreground">Enter your energy usage information to get personalized plan recommendations</p>
			</div>

			{/* Autofill Button */}
			<Card className="p-4 border-2 border-dashed">
				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="font-semibold">Quick Test</h3>
							<p className="text-sm text-muted-foreground">Generate realistic mock data for testing</p>
						</div>
						<Button onClick={handleAutofill} disabled={isLoading} variant="default" aria-label="Generate mock data for form autofill">
							{isLoading ? (
								<>
									<span className="animate-spin mr-2">⏳</span>
									Loading...
								</>
							) : (
								'Generate Mock Data'
							)}
						</Button>
					</div>

					{/* Success Message */}
					{showSuccessMessage && autofillScenarioName && (
						<Alert className="bg-green-50 border-green-200">
							<span className="mr-2">✓</span>
							Mock data loaded from <strong>{autofillScenarioName}</strong>
						</Alert>
					)}

					{/* Error Message */}
					{formError && (
						<Alert ref={errorAlertRef} className="bg-red-50 border-red-200 border-2">
							<span className="mr-2 text-lg">⚠</span>
							<span className="font-semibold">{formError}</span>
						</Alert>
					)}
				</div>
			</Card>

			{/* Mock Data Indicator Badge */}
			{isAutofilled && !showSuccessMessage && (
				<div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
					<Badge variant="outline" className="bg-blue-100">
						Generated from mock data
					</Badge>
					<span className="text-sm text-muted-foreground flex-1">Scenario: {autofillScenarioName}</span>
					<button onClick={clearMockIndicator} className="text-sm text-blue-600 hover:underline" aria-label="Clear mock data indicator">
						Dismiss
					</button>
				</div>
			)}

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Monthly Usage Section */}
				<Card className="p-6">
					<h2 className="text-xl font-semibold mb-4">Monthly Usage Data</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
						{formData.monthlyUsage.map((usage) => (
							<div key={usage.month} className="space-y-2">
								<label htmlFor={`month-${usage.month}`} className="text-sm font-medium">
									Month {usage.month}
								</label>
								<Input
									id={`month-${usage.month}`}
									type="number"
									value={usage.kWh || ''}
									onChange={(e) => updateMonthlyUsage(usage.month, parseFloat(e.target.value) || 0)}
									placeholder="kWh"
									min="0"
									step="0.1"
									className={isAutofilled && usage.kWh > 0 ? 'bg-blue-50' : ''}
								/>
							</div>
						))}
					</div>

					{/* Annual Consumption Display */}
					<div className="mt-4 p-3 bg-gray-50 rounded">
						<span className="text-sm font-medium">Annual Consumption: </span>
						<span className="text-lg font-bold">{formData.annualConsumption.toLocaleString()} kWh</span>
					</div>
				</Card>

				{/* Current Plan Section */}
				<Card className="p-6">
					<h2 className="text-xl font-semibold mb-4">Current Plan</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="supplier" className="text-sm font-medium">
								Supplier
							</label>
							<Input
								id="supplier"
								value={formData.currentPlan.supplier}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										currentPlan: { ...prev.currentPlan, supplier: e.target.value },
									}))
								}
								placeholder="e.g., Current Energy Co"
								className={isAutofilled ? 'bg-blue-50' : ''}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="planName" className="text-sm font-medium">
								Plan Name
							</label>
							<Input
								id="planName"
								value={formData.currentPlan.planName}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										currentPlan: { ...prev.currentPlan, planName: e.target.value },
									}))
								}
								placeholder="e.g., Fixed Rate 12"
								className={isAutofilled ? 'bg-blue-50' : ''}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="currentRate" className="text-sm font-medium">
								Current Rate ($/kWh)
							</label>
							<Input
								id="currentRate"
								type="number"
								value={formData.currentPlan.currentRate || ''}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										currentPlan: {
											...prev.currentPlan,
											currentRate: parseFloat(e.target.value) || 0,
										},
									}))
								}
								placeholder="0.12"
								min="0"
								step="0.001"
								className={isAutofilled ? 'bg-blue-50' : ''}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="monthlyFee" className="text-sm font-medium">
								Monthly Fee ($)
							</label>
							<Input
								id="monthlyFee"
								type="number"
								value={formData.currentPlan.monthlyFee || ''}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										currentPlan: {
											...prev.currentPlan,
											monthlyFee: parseFloat(e.target.value) || 0,
										},
									}))
								}
								placeholder="9.95"
								min="0"
								step="0.01"
								className={isAutofilled ? 'bg-blue-50' : ''}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="contractEndDate" className="text-sm font-medium">
								Contract End Date
							</label>
							<Input
								id="contractEndDate"
								type="date"
								value={formData.currentPlan.contractEndDate || ''}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										currentPlan: {
											...prev.currentPlan,
											contractEndDate: e.target.value,
										},
									}))
								}
								className={isAutofilled ? 'bg-blue-50' : ''}
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="monthsRemaining" className="text-sm font-medium">
								Months Remaining
							</label>
							<Input
								id="monthsRemaining"
								type="number"
								value={formData.currentPlan.monthsRemaining || ''}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										currentPlan: {
											...prev.currentPlan,
											monthsRemaining: parseInt(e.target.value) || 0,
										},
									}))
								}
								placeholder="6"
								min="0"
								className={isAutofilled ? 'bg-blue-50' : ''}
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<label htmlFor="earlyTerminationFee" className="text-sm font-medium">
								Early Termination Fee ($)
							</label>
							<Input
								id="earlyTerminationFee"
								type="number"
								value={formData.currentPlan.earlyTerminationFee || ''}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										currentPlan: {
											...prev.currentPlan,
											earlyTerminationFee: parseFloat(e.target.value) || 0,
										},
									}))
								}
								placeholder="150"
								min="0"
								step="0.01"
								className={isAutofilled ? 'bg-blue-50' : ''}
							/>
						</div>
					</div>
				</Card>

				{/* Preferences Section */}
				<Card className="p-6">
					<h2 className="text-xl font-semibold mb-4">Your Preferences</h2>
					<div className="space-y-4">
						{/* Priority Checkboxes */}
						<div className="space-y-3">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.preferences.prioritizeSavings}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											preferences: {
												...prev.preferences,
												prioritizeSavings: e.target.checked,
											},
										}))
									}
									className="w-4 h-4"
								/>
								<span className="text-sm font-medium">Prioritize Cost Savings</span>
							</label>

							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.preferences.prioritizeRenewable}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											preferences: {
												...prev.preferences,
												prioritizeRenewable: e.target.checked,
											},
										}))
									}
									className="w-4 h-4"
								/>
								<span className="text-sm font-medium">Prioritize Renewable Energy</span>
							</label>

							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={formData.preferences.prioritizeFlexibility}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											preferences: {
												...prev.preferences,
												prioritizeFlexibility: e.target.checked,
											},
										}))
									}
									className="w-4 h-4"
								/>
								<span className="text-sm font-medium">Prioritize Contract Flexibility</span>
							</label>
						</div>

						{/* Max Contract Months */}
						<div className="space-y-2">
							<label htmlFor="maxContractMonths" className="text-sm font-medium">
								Maximum Contract Length (months)
							</label>
							<Input
								id="maxContractMonths"
								type="number"
								value={formData.preferences.maxContractMonths || ''}
								onChange={(e) => {
									const value = parseInt(e.target.value) || 12;
									const clamped = Math.max(1, Math.min(36, value));
									setFormData((prev) => ({
										...prev,
										preferences: {
											...prev.preferences,
											maxContractMonths: clamped,
										},
									}));
								}}
								placeholder="12"
								min="1"
								max="36"
								className={isAutofilled ? 'bg-blue-50' : ''}
							/>
							<p className="text-xs text-gray-500">
								Choose between 1-36 months. Most plans offer 3, 6, 12, or 24-month contracts.
							</p>
						</div>

						{/* Risk Tolerance */}
						<div className="space-y-2">
							<label htmlFor="riskTolerance" className="text-sm font-medium">
								Risk Tolerance
							</label>
							<select
								id="riskTolerance"
								value={formData.preferences.riskTolerance}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										preferences: {
											...prev.preferences,
											riskTolerance: e.target.value as 'low' | 'medium' | 'high',
										},
									}))
								}
								className={`w-full px-3 py-2 border rounded-md ${isAutofilled ? 'bg-blue-50' : ''}`}
							>
								<option value="low">Low - Prefer stable, predictable rates</option>
								<option value="medium">Medium - Balance stability and savings</option>
								<option value="high">High - Willing to accept rate variability for potential savings</option>
							</select>
						</div>
					</div>
				</Card>

				{/* Submit Button */}
				<div className="flex justify-end">
					<Button type="submit" size="lg" className="px-8" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<span className="animate-spin mr-2">⏳</span>
								Processing...
							</>
						) : (
							'Get Recommendations'
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}
