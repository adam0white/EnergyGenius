#!/usr/bin/env tsx
/**
 * Fix Critical QA Blockers in Supplier Catalog
 *
 * Fixes:
 * 1. Duplicate plan IDs (98 duplicates found)
 * 2. Invalid contract terms (contractTermMonths: 0)
 * 3. Missing features (empty features array)
 */

import { supplierCatalog } from '../src/worker/data/supplier-catalog';
import { writeFileSync } from 'fs';
import { join } from 'path';
import type { SupplierPlan } from '../src/worker/data/types';

interface FixStats {
	totalPlans: number;
	duplicatesFixed: number;
	contractTermsFixed: number;
	featuresFixed: number;
	duplicateIds: Map<string, number>;
}

function generateDefaultFeatures(plan: any): string[] {
	const features: string[] = [];

	// Add renewable energy feature if applicable
	if (plan.renewablePercent === 100) {
		features.push('100% renewable energy');
	} else if (plan.renewablePercent >= 50) {
		features.push(`${plan.renewablePercent}% renewable energy`);
	}

	// Add contract term feature
	if (plan.contractTermMonths === 12) {
		features.push('12-month fixed rate plan');
	} else if (plan.contractTermMonths === 24) {
		features.push('24-month fixed rate plan');
	} else if (plan.contractTermMonths === 36) {
		features.push('36-month fixed rate plan');
	} else if (plan.contractTermMonths === 1) {
		features.push('Month-to-month flexibility');
	} else {
		features.push('Fixed rate pricing');
	}

	// Add early termination fee feature
	if (plan.earlyTerminationFee === 0) {
		features.push('No early termination fee');
	}

	// Add monthly fee feature
	if (plan.monthlyFee === 0) {
		features.push('No monthly service fee');
	}

	// Ensure at least one feature
	if (features.length === 0) {
		features.push('Standard electricity plan');
	}

	return features;
}

function fixCatalog(): { fixed: SupplierPlan[]; stats: FixStats } {
	const stats: FixStats = {
		totalPlans: supplierCatalog.length,
		duplicatesFixed: 0,
		contractTermsFixed: 0,
		featuresFixed: 0,
		duplicateIds: new Map(),
	};

	const seenIds = new Map<string, number>(); // id -> count

	// First pass: identify duplicates
	supplierCatalog.forEach((plan) => {
		const count = seenIds.get(plan.id) || 0;
		seenIds.set(plan.id, count + 1);
	});

	// Track duplicates for reporting
	seenIds.forEach((count, id) => {
		if (count > 1) {
			stats.duplicateIds.set(id, count);
		}
	});

	// Second pass: fix issues
	const idCounters = new Map<string, number>();
	const fixed = supplierCatalog.map((plan) => {
		let fixedPlan = { ...plan } as any;

		// Fix 1: Deduplicate IDs
		const originalId = plan.id;
		const idCount = seenIds.get(originalId) || 1;

		if (idCount > 1) {
			const counter = idCounters.get(originalId) || 0;
			idCounters.set(originalId, counter + 1);

			if (counter > 0) {
				fixedPlan.id = `${originalId}-${counter}`;
				stats.duplicatesFixed++;
				console.log(`✓ Deduplicated: ${originalId} → ${fixedPlan.id}`);
			}
		}

		// Fix 2: Invalid contract terms (0 months)
		if (fixedPlan.contractTermMonths === 0) {
			fixedPlan.contractTermMonths = 1; // Month-to-month = 1 month minimum
			stats.contractTermsFixed++;
			console.log(`✓ Fixed contract term: ${fixedPlan.id} (0 → 1 month)`);
		}

		// Fix 3: Missing features
		if (!fixedPlan.features || fixedPlan.features.length === 0) {
			fixedPlan.features = generateDefaultFeatures(fixedPlan);
			stats.featuresFixed++;
			console.log(`✓ Added features to: ${fixedPlan.id} (${fixedPlan.features.length} features)`);
		}

		return fixedPlan as SupplierPlan;
	});

	return { fixed, stats };
}

function validateFixes(plans: SupplierPlan[]): boolean {
	let allValid = true;

	console.log('\n=== Validation Results ===\n');

	// Validate 1: All IDs unique
	const ids = plans.map((p) => p.id);
	const uniqueIds = new Set(ids);
	const duplicateCheck = uniqueIds.size === plans.length;
	console.log(`✓ Unique IDs: ${uniqueIds.size} / ${plans.length} ${duplicateCheck ? '✓ PASS' : '✗ FAIL'}`);
	allValid = allValid && duplicateCheck;

	if (!duplicateCheck) {
		// Find and report duplicates
		const idCounts = new Map<string, number>();
		ids.forEach((id) => idCounts.set(id, (idCounts.get(id) || 0) + 1));
		const remaining = Array.from(idCounts.entries()).filter(([, count]) => count > 1);
		console.log(`  ✗ Remaining duplicates: ${remaining.length}`);
		remaining.forEach(([id, count]) => console.log(`    - ${id}: ${count} occurrences`));
	}

	// Validate 2: No 0 contract terms
	const invalidTerms = plans.filter((p) => p.contractTermMonths === 0);
	const termsCheck = invalidTerms.length === 0;
	console.log(
		`✓ Valid contract terms: ${termsCheck ? 'All plans >= 1 month' : `${invalidTerms.length} plans with 0 months`} ${termsCheck ? '✓ PASS' : '✗ FAIL'}`,
	);
	allValid = allValid && termsCheck;

	if (!termsCheck) {
		invalidTerms.forEach((p) => console.log(`  ✗ ${p.id}: ${p.contractTermMonths} months`));
	}

	// Validate 3: All have features
	const noFeatures = plans.filter((p) => !p.features || p.features.length === 0);
	const featuresCheck = noFeatures.length === 0;
	console.log(`✓ All have features: ${plans.length - noFeatures.length} / ${plans.length} ${featuresCheck ? '✓ PASS' : '✗ FAIL'}`);
	allValid = allValid && featuresCheck;

	if (!featuresCheck) {
		noFeatures.forEach((p) => console.log(`  ✗ ${p.id}: 0 features`));
	}

	return allValid;
}

function writeCatalog(plans: SupplierPlan[]): void {
	const header = `/**
 * Supplier Catalog - Real supplier electricity plans from Power to Choose
 *
 * This module contains 250 real supplier plans scraped from powertochoose.org:
 * - Multiple suppliers from Texas deregulated market
 * - Varied pricing and contract terms
 * - Different renewable percentages
 * - Real plan features and details
 *
 * Last updated: ${new Date().toISOString().split('T')[0]}
 * Data source: https://www.powertochoose.org
 *
 * FIXED: Critical QA blockers resolved
 * - Duplicate IDs deduplicated
 * - Invalid contract terms corrected
 * - Missing features added
 */

import type { SupplierPlan } from './types';

/**
 * Array of real supplier plans for the recommendation engine
 * Data is immutable to prevent accidental modifications
 */
export const supplierCatalog: readonly SupplierPlan[] = `;

	const content = header + JSON.stringify(plans, null, 2) + ';\n';

	const filePath = join(process.cwd(), 'src/worker/data/supplier-catalog.ts');
	writeFileSync(filePath, content, 'utf-8');
	console.log(`\n✓ Updated catalog file: ${filePath}`);
}

function printStats(stats: FixStats): void {
	console.log('\n=== Fix Summary ===\n');
	console.log(`Total plans: ${stats.totalPlans}`);
	console.log(`Duplicate IDs fixed: ${stats.duplicatesFixed}`);
	console.log(`Contract terms fixed: ${stats.contractTermsFixed}`);
	console.log(`Features added: ${stats.featuresFixed}`);

	if (stats.duplicateIds.size > 0) {
		console.log(`\nDuplicate ID groups found: ${stats.duplicateIds.size}`);
		console.log('Top duplicates:');
		const sorted = Array.from(stats.duplicateIds.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10);
		sorted.forEach(([id, count]) => {
			console.log(`  - ${id}: ${count} occurrences`);
		});
	}
}

// Main execution
console.log('=== Fixing Supplier Catalog Critical Blockers ===\n');

const { fixed, stats } = fixCatalog();

printStats(stats);

const isValid = validateFixes(fixed);

if (isValid) {
	writeCatalog(fixed);
	console.log('\n✓✓✓ All fixes applied successfully! ✓✓✓\n');
	process.exit(0);
} else {
	console.error('\n✗✗✗ Validation failed! Not writing catalog. ✗✗✗\n');
	process.exit(1);
}
