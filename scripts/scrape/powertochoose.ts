/**
 * Power to Choose Scraper
 *
 * Optional developer utility to scrape supplier catalog data from
 * the Power to Choose website (https://www.powertochoose.org).
 *
 * **IMPORTANT:**
 * - This is an optional developer utility, not a runtime dependency
 * - This script is for data refresh only and is not part of production deployment
 * - Always perform manual review and validation before integrating scraped data
 *
 * Usage:
 *   npx tsx scripts/scrape/powertochoose.ts
 *
 * Output:
 *   scripts/scrape/output/raw-scrape-output.json
 *
 * Documentation:
 *   See scripts/scrape/README.md for complete usage instructions
 *
 * @module scripts/scrape/powertochoose
 * @see {@link ../../scripts/scrape/README.md} Complete documentation
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Configuration for scraper behavior
 */
const CONFIG = {
	/** Target URL for Power to Choose website */
	URL: 'https://www.powertochoose.org',
	/** Request timeout in milliseconds */
	TIMEOUT_MS: parseInt(process.env.SCRAPE_TIMEOUT_MS || '30000', 10),
	/** Output directory for scraped data */
	OUTPUT_DIR: process.env.SCRAPE_OUTPUT_DIR || 'scripts/scrape/output',
	/** Maximum number of plans to extract */
	MAX_PLANS: parseInt(process.env.SCRAPE_MAX_PLANS || '100', 10),
	/** Enable verbose debug logging */
	DEBUG: process.env.DEBUG === 'true',
};

/**
 * Interface matching SupplierPlan from src/worker/data/types.ts
 */
interface SupplierPlan {
	id: string;
	supplier: string;
	planName: string;
	baseRate: number;
	monthlyFee: number;
	contractTermMonths: number;
	earlyTerminationFee: number;
	renewablePercent: number;
	ratings: {
		reliabilityScore: number;
		customerServiceScore: number;
	};
	features: string[];
	availableInStates: string[];
}

/**
 * Debug logging utility (only logs when DEBUG=true)
 */
const log = (...args: any[]) => {
	if (CONFIG.DEBUG) {
		console.log('[DEBUG]', ...args);
	}
};

/**
 * Main scraper execution function
 */
async function main() {
	console.log('🔍 Starting Power to Choose scraper...');
	console.log('📍 Target URL:', CONFIG.URL);
	console.log('⏱️  Timeout:', CONFIG.TIMEOUT_MS, 'ms');
	console.log('');

	try {
		// Step 1: Fetch website HTML
		console.log('📥 Fetching website...');
		const html = await fetchWebsite(CONFIG.URL);
		log('HTML fetched, length:', html.length);

		// Step 2: Extract plan data
		console.log('🔎 Extracting plan data...');
		const plans = extractPlans(html);
		console.log(`✓ Extracted ${plans.length} plans`);

		// Step 3: Validate data
		console.log('✅ Validating extracted data...');
		const validatedPlans = validatePlans(plans);
		console.log(`✓ ${validatedPlans.length} plans passed validation`);

		// Step 4: Write output
		console.log('💾 Writing output file...');
		writeOutput(validatedPlans);
		console.log(`✓ Output saved to ${CONFIG.OUTPUT_DIR}/raw-scrape-output.json`);

		// Summary
		console.log('');
		console.log('✅ Scraping complete!');
		console.log(`   Plans extracted: ${plans.length}`);
		console.log(`   Plans validated: ${validatedPlans.length}`);
		console.log('');
		console.log('⚠️  Next steps:');
		console.log('   1. Review output file for accuracy');
		console.log('   2. Validate data manually (spot-check 3-5 plans)');
		console.log('   3. Update src/worker/data/supplier-catalog.ts');
		console.log('   4. Run: npx tsc --noEmit (verify types)');
		console.log('   5. Test with: npm run dev');
		console.log('');
		console.log('📖 See scripts/scrape/README.md for detailed instructions');
	} catch (error) {
		console.error('');
		console.error('❌ Scraper failed:');
		console.error(error instanceof Error ? error.message : String(error));
		console.error('');
		console.error('💡 Troubleshooting tips:');
		console.error('   - Check internet connection');
		console.error('   - Verify Power to Choose website is accessible');
		console.error('   - Try increasing timeout: SCRAPE_TIMEOUT_MS=60000');
		console.error('   - Enable debug mode: DEBUG=true');
		console.error('');
		console.error('📖 See scripts/scrape/README.md § Troubleshooting');
		process.exit(1);
	}
}

/**
 * Fetches HTML content from Power to Choose website
 *
 * @param url - Target URL to fetch
 * @returns HTML content as string
 * @throws Error if fetch fails or times out
 */
async function fetchWebsite(url: string): Promise<string> {
	try {
		const response = await axios.get(url, {
			timeout: CONFIG.TIMEOUT_MS,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
			},
		});

		if (response.status !== 200) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.code === 'ECONNABORTED') {
				throw new Error(`Request timeout after ${CONFIG.TIMEOUT_MS}ms. Try increasing SCRAPE_TIMEOUT_MS.`);
			}
			throw new Error(`Network error: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Extracts supplier plan data from HTML content
 *
 * NOTE: This is a placeholder implementation. The actual implementation
 * depends on the current HTML structure of powertochoose.org.
 *
 * @param html - Raw HTML content from website
 * @returns Array of extracted supplier plans
 */
function extractPlans(html: string): SupplierPlan[] {
	const _$ = cheerio.load(html);
	const _plans: SupplierPlan[] = [];

	log('Loaded HTML into Cheerio');

	/**
	 * IMPLEMENTATION NOTE:
	 *
	 * The actual extraction logic depends on the current HTML structure
	 * of powertochoose.org, which changes over time.
	 *
	 * Example extraction pattern (adjust selectors as needed):
	 *
	 * $('.plan-card').each((index, element) => {
	 *   const supplier = $(element).find('.supplier-name').text().trim();
	 *   const planName = $(element).find('.plan-name').text().trim();
	 *   const baseRateText = $(element).find('.rate').text().trim();
	 *   const baseRate = parseRate(baseRateText);
	 *   // ... extract other fields
	 *
	 *   plans.push({
	 *     id: generatePlanId(supplier, planName),
	 *     supplier,
	 *     planName,
	 *     baseRate,
	 *     // ... other fields
	 *   });
	 * });
	 *
	 * For now, this returns mock data to demonstrate the structure.
	 */

	// PLACEHOLDER: Return mock data for demonstration
	// TODO: Implement actual scraping logic based on current website structure
	console.warn('⚠️  WARNING: Using mock data. Implement actual scraping logic in extractPlans()');

	const mockPlans: SupplierPlan[] = [
		{
			id: 'plan-green-energy-001',
			supplier: 'Green Energy Co',
			planName: 'Eco Max 100',
			baseRate: 0.119,
			monthlyFee: 9.95,
			contractTermMonths: 12,
			earlyTerminationFee: 0,
			renewablePercent: 100,
			ratings: {
				reliabilityScore: 4.5,
				customerServiceScore: 4.3,
			},
			features: ['100% Renewable Energy', 'Fixed Rate', 'Online Account Management', 'Paperless Billing'],
			availableInStates: ['TX'],
		},
		{
			id: 'plan-power-plus-002',
			supplier: 'Power Plus',
			planName: 'Budget Saver 24',
			baseRate: 0.089,
			monthlyFee: 4.95,
			contractTermMonths: 24,
			earlyTerminationFee: 150,
			renewablePercent: 12,
			ratings: {
				reliabilityScore: 4.1,
				customerServiceScore: 3.8,
			},
			features: ['24-Month Fixed Rate', 'Low Monthly Fee', 'Auto-Pay Discount', 'Mobile App'],
			availableInStates: ['TX'],
		},
	];

	return mockPlans.slice(0, CONFIG.MAX_PLANS);
}

/**
 * Generates a unique plan ID from supplier and plan name
 *
 * @param supplier - Supplier company name
 * @param planName - Plan name
 * @returns Unique plan ID (e.g., "plan-green-energy-eco-max")
 */
function _generatePlanId(supplier: string, planName: string): string {
	const sanitize = (str: string) =>
		str
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

	return `plan-${sanitize(supplier)}-${sanitize(planName)}`;
}

/**
 * Parses rate string to decimal number
 *
 * Examples:
 *   "11.9¢/kWh" → 0.119
 *   "$0.119/kWh" → 0.119
 *   "11.9" → 0.119
 *
 * @param rateText - Rate text from website
 * @returns Rate as decimal number ($/kWh)
 */
function _parseRate(rateText: string): number {
	// Remove non-numeric characters except decimal point
	const cleaned = rateText.replace(/[^0-9.]/g, '');
	const rate = parseFloat(cleaned);

	// If rate is in cents (>1), convert to dollars
	if (rate > 1) {
		return rate / 100;
	}

	return rate;
}

/**
 * Validates extracted plans and returns only valid plans
 *
 * Performs validation checks:
 * - Required fields present
 * - Numeric fields in valid ranges
 * - Data types correct
 *
 * @param plans - Array of extracted plans
 * @returns Array of validated plans (invalid plans filtered out with warnings)
 */
function validatePlans(plans: SupplierPlan[]): SupplierPlan[] {
	const validPlans: SupplierPlan[] = [];
	const errors: string[] = [];

	for (const plan of plans) {
		const planErrors = validatePlan(plan);

		if (planErrors.length === 0) {
			validPlans.push(plan);
		} else {
			errors.push(`Plan "${plan.supplier} - ${plan.planName}" validation failed:`);
			planErrors.forEach((error) => errors.push(`  - ${error}`));
		}
	}

	// Log validation errors
	if (errors.length > 0) {
		console.warn('');
		console.warn('⚠️  Validation warnings:');
		errors.forEach((error) => console.warn(error));
		console.warn('');
		console.warn(`${plans.length - validPlans.length} plans failed validation and were excluded`);
		console.warn('');
	}

	return validPlans;
}

/**
 * Validates a single supplier plan
 *
 * @param plan - Supplier plan to validate
 * @returns Array of error messages (empty if valid)
 */
function validatePlan(plan: SupplierPlan): string[] {
	const errors: string[] = [];

	// Required string fields
	if (!plan.id || typeof plan.id !== 'string') {
		errors.push('id is required and must be a string');
	}
	if (!plan.supplier || typeof plan.supplier !== 'string') {
		errors.push('supplier is required and must be a string');
	}
	if (!plan.planName || typeof plan.planName !== 'string') {
		errors.push('planName is required and must be a string');
	}

	// Numeric field validations
	if (typeof plan.baseRate !== 'number' || plan.baseRate < 0.05 || plan.baseRate > 0.3) {
		errors.push(`baseRate ${plan.baseRate} out of range (expected 0.05-0.30)`);
	}
	if (typeof plan.monthlyFee !== 'number' || plan.monthlyFee < 0 || plan.monthlyFee > 50) {
		errors.push(`monthlyFee ${plan.monthlyFee} out of range (expected 0-50)`);
	}
	if (![3, 6, 12, 24].includes(plan.contractTermMonths)) {
		errors.push(`contractTermMonths ${plan.contractTermMonths} invalid (expected 3, 6, 12, or 24)`);
	}
	if (typeof plan.earlyTerminationFee !== 'number' || plan.earlyTerminationFee < 0 || plan.earlyTerminationFee > 500) {
		errors.push(`earlyTerminationFee ${plan.earlyTerminationFee} out of range (expected 0-500)`);
	}
	if (typeof plan.renewablePercent !== 'number' || plan.renewablePercent < 0 || plan.renewablePercent > 100) {
		errors.push(`renewablePercent ${plan.renewablePercent} out of range (expected 0-100)`);
	}

	// Ratings validation
	if (!plan.ratings || typeof plan.ratings !== 'object') {
		errors.push('ratings object is required');
	} else {
		if (typeof plan.ratings.reliabilityScore !== 'number' || plan.ratings.reliabilityScore < 1 || plan.ratings.reliabilityScore > 5) {
			errors.push(`reliabilityScore ${plan.ratings.reliabilityScore} out of range (expected 1-5)`);
		}
		if (
			typeof plan.ratings.customerServiceScore !== 'number' ||
			plan.ratings.customerServiceScore < 1 ||
			plan.ratings.customerServiceScore > 5
		) {
			errors.push(`customerServiceScore ${plan.ratings.customerServiceScore} out of range (expected 1-5)`);
		}
	}

	// Array validations
	if (!Array.isArray(plan.features)) {
		errors.push('features must be an array');
	}
	if (!Array.isArray(plan.availableInStates) || plan.availableInStates.length === 0) {
		errors.push('availableInStates must be a non-empty array');
	}

	return errors;
}

/**
 * Writes validated plans to output JSON file
 *
 * @param plans - Array of validated plans
 */
function writeOutput(plans: SupplierPlan[]): void {
	// Ensure output directory exists
	const outputDir = path.resolve(CONFIG.OUTPUT_DIR);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
		log('Created output directory:', outputDir);
	}

	// Write JSON file
	const outputPath = path.join(outputDir, 'raw-scrape-output.json');
	fs.writeFileSync(outputPath, JSON.stringify(plans, null, 2), 'utf-8');

	log('Output written to:', outputPath);
}

// Run main function
main().catch((error) => {
	console.error('Unhandled error:', error);
	process.exit(1);
});
