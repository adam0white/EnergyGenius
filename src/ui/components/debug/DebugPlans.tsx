/**
 * DebugPlans - Debug UI component to view all available energy plans
 *
 * Displays all plans from the catalog in a searchable, filterable table.
 * Useful for developers and testers to validate data integrity.
 */

import React, { useState, useMemo } from 'react';
import { supplierCatalog } from '../../../worker/data/supplier-catalog';
import type { SupplierPlan } from '../../../worker/data/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

interface DebugPlansProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Format currency values
 */
function formatCurrency(value: number): string {
	return `$${value.toFixed(3)}`;
}

/**
 * Format percentage values
 */
function formatPercent(value: number): string {
	return `${value}%`;
}

/**
 * Get tier badge based on renewable percentage, contract flexibility, and pricing
 * Adjusted to work with real scraped data where most ratings are 3.0
 */
function getTier(plan: SupplierPlan): 'Gold' | 'Silver' | 'Bronze' {
	// Calculate a composite score based on multiple factors
	let score = 0;

	// Renewable percentage (0-40 points)
	if (plan.renewablePercent >= 80) {
		score += 40;
	} else if (plan.renewablePercent >= 50) {
		score += 30;
	} else if (plan.renewablePercent >= 25) {
		score += 20;
	} else {
		score += 10;
	}

	// Contract flexibility (0-30 points) - shorter contracts are more flexible
	if (plan.contractTermMonths <= 3) {
		score += 30;
	} else if (plan.contractTermMonths <= 6) {
		score += 25;
	} else if (plan.contractTermMonths <= 12) {
		score += 20;
	} else if (plan.contractTermMonths <= 24) {
		score += 10;
	}

	// Pricing competitiveness (0-30 points)
	// Lower rates and fees are better
	if (plan.baseRate <= 0.12 && plan.monthlyFee <= 9.95) {
		score += 30;
	} else if (plan.baseRate <= 0.15 && plan.monthlyFee <= 9.95) {
		score += 20;
	} else if (plan.baseRate <= 0.18) {
		score += 10;
	}

	// Tier thresholds (out of 100 points)
	if (score >= 70) return 'Gold';
	if (score >= 50) return 'Silver';
	return 'Bronze';
}

/**
 * Get tier badge color
 */
function getTierColor(tier: string): string {
	switch (tier) {
		case 'Gold':
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case 'Silver':
			return 'bg-gray-100 text-gray-800 border-gray-300';
		case 'Bronze':
			return 'bg-orange-100 text-orange-800 border-orange-300';
		default:
			return 'bg-gray-100 text-gray-800';
	}
}

export function DebugPlans({ open, onOpenChange }: DebugPlansProps) {
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedTiers, setSelectedTiers] = useState<Set<string>>(new Set(['Gold', 'Silver', 'Bronze']));
	const [renewableRange, setRenewableRange] = useState<[number, number]>([0, 100]);

	// Add plan tier information
	const plansWithTiers = useMemo(() => {
		return supplierCatalog.map((plan) => ({
			...plan,
			tier: getTier(plan),
		}));
	}, []);

	// Filter plans based on search and filters
	const filteredPlans = useMemo(() => {
		return plansWithTiers.filter((plan) => {
			// Search filter
			const searchLower = searchTerm.toLowerCase();
			const matchesSearch =
				!searchTerm ||
				plan.supplier.toLowerCase().includes(searchLower) ||
				plan.planName.toLowerCase().includes(searchLower) ||
				plan.features.some((f) => f.toLowerCase().includes(searchLower));

			// Tier filter
			const matchesTier = selectedTiers.has(plan.tier);

			// Renewable filter
			const matchesRenewable = plan.renewablePercent >= renewableRange[0] && plan.renewablePercent <= renewableRange[1];

			return matchesSearch && matchesTier && matchesRenewable;
		});
	}, [plansWithTiers, searchTerm, selectedTiers, renewableRange]);

	// Calculate statistics
	const stats = useMemo(() => {
		const tierCounts = filteredPlans.reduce(
			(acc, plan) => {
				acc[plan.tier] = (acc[plan.tier] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		const avgRenewable =
			filteredPlans.length > 0 ? filteredPlans.reduce((sum, plan) => sum + plan.renewablePercent, 0) / filteredPlans.length : 0;

		const prices = filteredPlans.map((p) => p.baseRate);
		const priceRange =
			prices.length > 0
				? {
						min: Math.min(...prices),
						max: Math.max(...prices),
					}
				: { min: 0, max: 0 };

		const uniqueSuppliers = new Set(filteredPlans.map((p) => p.supplier)).size;

		return {
			total: filteredPlans.length,
			totalAvailable: plansWithTiers.length,
			tierCounts,
			avgRenewable,
			priceRange,
			uniqueSuppliers,
		};
	}, [filteredPlans, plansWithTiers.length]);

	// Toggle tier filter
	const toggleTier = (tier: string) => {
		setSelectedTiers((prev) => {
			const next = new Set(prev);
			if (next.has(tier)) {
				next.delete(tier);
			} else {
				next.add(tier);
			}
			return next;
		});
	};

	// Clear all filters
	const clearFilters = () => {
		setSearchTerm('');
		setSelectedTiers(new Set(['Gold', 'Silver', 'Bronze']));
		setRenewableRange([0, 100]);
	};

	// Export as CSV
	const exportCSV = () => {
		const headers = ['Supplier', 'Plan Name', 'Price/kWh', 'Monthly Fee', 'Renewable %', 'Tier', 'Contract (months)', 'ETF'];
		const rows = filteredPlans.map((plan) => [
			plan.supplier,
			plan.planName,
			plan.baseRate.toFixed(3),
			plan.monthlyFee.toFixed(2),
			plan.renewablePercent,
			plan.tier,
			plan.contractTermMonths,
			plan.earlyTerminationFee,
		]);

		const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'energy-plans-debug.csv';
		a.click();
		URL.revokeObjectURL(url);
	};

	// Copy as JSON
	const copyJSON = () => {
		const json = JSON.stringify(filteredPlans, null, 2);
		navigator.clipboard.writeText(json).then(() => {
			alert('JSON copied to clipboard!');
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-white">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">Energy Plan Explorer</DialogTitle>
					<DialogDescription>View and analyze all energy plans in the catalog with advanced filtering and export options</DialogDescription>
				</DialogHeader>

				{/* Tier System Explanation */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-start gap-3">
						<svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div className="flex-1">
							<h4 className="font-semibold text-blue-900 mb-1">Understanding Plan Tiers</h4>
							<p className="text-sm text-blue-800 mb-2">Plans are categorized into tiers based on their overall features and value:</p>
							<div className="grid md:grid-cols-3 gap-2 mb-3">
								<div className="text-sm">
									<span className="font-semibold text-blue-900">Gold:</span>
									<span className="text-blue-800">
										{' '}
										Best combination of high renewable energy, flexible contracts, and competitive pricing
									</span>
								</div>
								<div className="text-sm">
									<span className="font-semibold text-blue-900">Silver:</span>
									<span className="text-blue-800"> Good balance with moderate renewable energy or pricing</span>
								</div>
								<div className="text-sm">
									<span className="font-semibold text-blue-900">Bronze:</span>
									<span className="text-blue-800"> Standard plans with basic features or longer contract terms</span>
								</div>
							</div>
							<div className="bg-blue-100 rounded p-2 text-sm text-blue-900">
								<strong>Important:</strong> The tier reflects overall plan quality, not your personal match. Your recommendations consider
								your specific usage and preferences, so a Bronze plan might be your best option based on what matters most to you (e.g.,
								lowest price, contract flexibility, or specific renewable percentage).
							</div>
						</div>
					</div>
				</div>

				{/* Statistics Panel */}
				<Card className="p-4 bg-blue-50 border-blue-200">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>
							<div className="text-muted-foreground">Total Plans</div>
							<div className="text-2xl font-bold">
								{stats.total} / {stats.totalAvailable}
							</div>
						</div>
						<div>
							<div className="text-muted-foreground">Suppliers</div>
							<div className="text-2xl font-bold">{stats.uniqueSuppliers}</div>
						</div>
						<div>
							<div className="text-muted-foreground">Avg Renewable</div>
							<div className="text-2xl font-bold">{stats.avgRenewable.toFixed(0)}%</div>
						</div>
						<div>
							<div className="text-muted-foreground">Price Range</div>
							<div className="text-2xl font-bold">
								{formatCurrency(stats.priceRange.min)} - {formatCurrency(stats.priceRange.max)}
							</div>
						</div>
					</div>
					<div className="mt-3 flex gap-2 text-sm">
						<span className="text-muted-foreground">By Tier:</span>
						<span>Gold: {stats.tierCounts.Gold || 0}</span>
						<span>Silver: {stats.tierCounts.Silver || 0}</span>
						<span>Bronze: {stats.tierCounts.Bronze || 0}</span>
					</div>
				</Card>

				{/* Filters Section */}
				<div className="space-y-4">
					<div className="flex flex-col md:flex-row gap-4">
						{/* Search */}
						<div className="flex-1">
							<label htmlFor="search" className="text-sm font-medium mb-1 block">
								Search
							</label>
							<Input
								id="search"
								type="text"
								placeholder="Search supplier, plan name, or features..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full"
							/>
						</div>

						{/* Renewable Range */}
						<div className="flex-1">
							<label className="text-sm font-medium mb-1 block">
								Renewable % ({renewableRange[0]}-{renewableRange[1]}%)
							</label>
							<div className="flex gap-2 items-center">
								<Input
									type="number"
									min="0"
									max="100"
									value={renewableRange[0]}
									onChange={(e) => setRenewableRange([parseInt(e.target.value) || 0, renewableRange[1]])}
									className="w-20"
								/>
								<span>-</span>
								<Input
									type="number"
									min="0"
									max="100"
									value={renewableRange[1]}
									onChange={(e) => setRenewableRange([renewableRange[0], parseInt(e.target.value) || 100])}
									className="w-20"
								/>
							</div>
						</div>
					</div>

					{/* Tier Filters */}
					<div>
						<label className="text-sm font-medium mb-2 block">Filter by Tier</label>
						<div className="flex gap-2">
							{['Gold', 'Silver', 'Bronze'].map((tier) => (
								<Button key={tier} variant={selectedTiers.has(tier) ? 'default' : 'outline'} size="sm" onClick={() => toggleTier(tier)}>
									{tier} ({plansWithTiers.filter((p) => p.tier === tier).length})
								</Button>
							))}
						</div>
					</div>

					{/* Clear Filters */}
					<div className="flex justify-between items-center">
						<Button variant="ghost" size="sm" onClick={clearFilters}>
							Clear All Filters
						</Button>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={exportCSV}>
								Export CSV
							</Button>
							<Button variant="outline" size="sm" onClick={copyJSON}>
								Copy JSON
							</Button>
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="border rounded-lg overflow-hidden">
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[150px]">Supplier</TableHead>
									<TableHead className="w-[180px]">Plan Name</TableHead>
									<TableHead className="text-right">Price/kWh</TableHead>
									<TableHead className="text-right">Monthly Fee</TableHead>
									<TableHead className="text-right">Renewable</TableHead>
									<TableHead>Tier</TableHead>
									<TableHead className="text-right">Contract</TableHead>
									<TableHead className="text-right">ETF</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredPlans.length === 0 ? (
									<TableRow>
										<TableCell colSpan={8} className="text-center text-muted-foreground py-8">
											No plans match the current filters
										</TableCell>
									</TableRow>
								) : (
									filteredPlans.map((plan) => (
										<TableRow key={plan.id}>
											<TableCell className="font-medium">{plan.supplier}</TableCell>
											<TableCell>{plan.planName}</TableCell>
											<TableCell className="text-right font-mono">{formatCurrency(plan.baseRate)}</TableCell>
											<TableCell className="text-right">${plan.monthlyFee}</TableCell>
											<TableCell className="text-right">{formatPercent(plan.renewablePercent)}</TableCell>
											<TableCell>
												<Badge className={getTierColor(plan.tier)}>{plan.tier}</Badge>
											</TableCell>
											<TableCell className="text-right">{plan.contractTermMonths} mo</TableCell>
											<TableCell className="text-right">${plan.earlyTerminationFee}</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>

				{/* Footer Info */}
				<div className="text-xs text-muted-foreground text-center">
					Showing {stats.total} of {stats.totalAvailable} plans • Data updated as of January 2025
				</div>
			</DialogContent>
		</Dialog>
	);
}
