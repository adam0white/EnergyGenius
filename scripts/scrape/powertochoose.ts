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
	/** Target URL for Power to Choose CSV export */
	CSV_URL: 'https://www.powertochoose.org/en-us/Plan/ExportToCsv',
	/** Default ZIP code for Houston, TX */
	ZIP_CODE: process.env.SCRAPE_ZIP_CODE || '77002',
	/** Request timeout in milliseconds */
	TIMEOUT_MS: parseInt(process.env.SCRAPE_TIMEOUT_MS || '30000', 10),
	/** Output directory for scraped data */
	OUTPUT_DIR: process.env.SCRAPE_OUTPUT_DIR || 'scripts/scrape/output',
	/** Maximum number of plans to extract */
	MAX_PLANS: parseInt(process.env.SCRAPE_MAX_PLANS || '250', 10),
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
	language?: string; // Temporary field for filtering
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
	console.log('📍 Target CSV URL:', CONFIG.CSV_URL);
	console.log('📮 ZIP Code:', CONFIG.ZIP_CODE);
	console.log('⏱️  Timeout:', CONFIG.TIMEOUT_MS, 'ms');
	console.log('');

	try {
		// Step 1: Fetch CSV data
		console.log('📥 Fetching CSV data from Power to Choose...');
		const csvData = await fetchCSV(CONFIG.CSV_URL, CONFIG.ZIP_CODE);
		log('CSV data fetched, length:', csvData.length);

		// Step 2: Parse CSV data
		console.log('🔎 Parsing CSV data...');
		const plans = parseCSV(csvData);
		console.log(`✓ Parsed ${plans.length} plans`);

		// Step 3: Filter to max plans and English only
		const filteredPlans = plans.filter((p) => p.language === 'English').slice(0, CONFIG.MAX_PLANS);
		console.log(`✓ Filtered to ${filteredPlans.length} English plans`);

		// Step 4: Validate data
		console.log('✅ Validating extracted data...');
		const validatedPlans = validatePlans(filteredPlans);
		console.log(`✓ ${validatedPlans.length} plans passed validation`);

		// Step 5: Write output
		console.log('💾 Writing output file...');
		writeOutput(validatedPlans);
		console.log(`✓ Output saved to ${CONFIG.OUTPUT_DIR}/raw-scrape-output.json`);

		// Summary
		console.log('');
		console.log('✅ Scraping complete!');
		console.log(`   Plans parsed: ${plans.length}`);
		console.log(`   Plans filtered: ${filteredPlans.length}`);
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
 * Fetches CSV data from Power to Choose export endpoint
 *
 * @param url - CSV export URL
 * @param zipCode - ZIP code to filter plans
 * @returns CSV data as string
 * @throws Error if fetch fails or times out
 */
async function fetchCSV(url: string, zipCode: string): Promise<string> {
	try {
		const response = await axios.post(
			url,
			new URLSearchParams({
				zip_code: zipCode,
				language: 'en',
			}),
			{
				timeout: CONFIG.TIMEOUT_MS,
				headers: {
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			}
		);

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
 * Parses CSV data from Power to Choose into SupplierPlan objects
 *
 * CSV Columns:
 * - [RepCompany]: Supplier company name
 * - [Product]: Plan name
 * - [kwh1000]: Rate at 1000 kWh usage ($/kWh)
 * - [Renewable]: Renewable percentage (0-100)
 * - [TermValue]: Contract term in months
 * - [CancelFee]: Early termination fee
 * - [Rating]: Supplier rating (1-5)
 * - [Language]: Plan language (English/Spanish)
 * - [SpecialTerms]: Features and special terms
 *
 * @param csvData - Raw CSV data from Power to Choose
 * @returns Array of parsed supplier plans
 */
function parseCSV(csvData: string): SupplierPlan[] {
	const plans: SupplierPlan[] = [];
	const lines = csvData.split('\n');

	// Parse header row to get column indices
	const headerLine = lines[0];
	if (!headerLine) {
		throw new Error('CSV data is empty');
	}

	const headers = parseCSVLine(headerLine);
	const colIndices = {
		supplier: headers.indexOf('[RepCompany]'),
		planName: headers.indexOf('[Product]'),
		kwh1000: headers.indexOf('[kwh1000]'),
		renewable: headers.indexOf('[Renewable]'),
		termValue: headers.indexOf('[TermValue]'),
		cancelFee: headers.indexOf('[CancelFee]'),
		rating: headers.indexOf('[Rating]'),
		language: headers.indexOf('[Language]'),
		specialTerms: headers.indexOf('[SpecialTerms]'),
		fixed: headers.indexOf('[Fixed]'),
	};

	log('Column indices:', colIndices);

	// Parse data rows (skip header)
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue; // Skip empty lines

		try {
			const cols = parseCSVLine(line);

			const supplier = cols[colIndices.supplier] || '';
			const planName = cols[colIndices.planName] || '';
			const baseRateStr = cols[colIndices.kwh1000] || '0';
			const renewableStr = cols[colIndices.renewable] || '0';
			const termStr = cols[colIndices.termValue] || '12';
			const cancelFeeStr = cols[colIndices.cancelFee] || '0';
			const ratingStr = cols[colIndices.rating] || '3';
			const language = cols[colIndices.language] || 'English';
			const specialTerms = cols[colIndices.specialTerms] || '';
			const fixedStr = cols[colIndices.fixed] || '0';

			// Skip if missing critical data
			if (!supplier || !planName) {
				log(`Skipping row ${i}: missing supplier or planName`);
				continue;
			}

			// Parse numeric values
			const baseRate = parseFloat(baseRateStr);
			const renewablePercent = parseInt(renewableStr, 10);
			const contractTermMonths = parseInt(termStr, 10);
			const earlyTerminationFee = parseFloat(cancelFeeStr);
			const rating = parseInt(ratingStr, 10);
			const isFixed = fixedStr === '1';

			// Extract features from special terms
			const features: string[] = [];
			if (specialTerms) {
				// Split on ::: which is the delimiter used in the data
				const terms = specialTerms.split(':::').map((t) => t.trim());
				features.push(...terms.filter((t) => t.length > 0));
			}
			if (isFixed) {
				features.unshift('Fixed Rate');
			}
			if (renewablePercent === 100) {
				features.unshift('100% Renewable Energy');
			}

			// Generate plan ID
			const id = generatePlanId(supplier, planName);

			// Create plan object
			const plan: SupplierPlan = {
				id,
				supplier,
				planName,
				baseRate,
				monthlyFee: 9.95, // Default - not in CSV
				contractTermMonths,
				earlyTerminationFee,
				renewablePercent,
				ratings: {
					reliabilityScore: rating,
					customerServiceScore: rating, // Use same rating for both
				},
				features,
				availableInStates: ['TX'], // Power to Choose is Texas-only
				language,
			};

			plans.push(plan);
		} catch (error) {
			log(`Error parsing row ${i}:`, error);
			// Continue with other rows
		}
	}

	return plans;
}

/**
 * Parses a single CSV line, handling quoted fields properly
 *
 * @param line - Single CSV line
 * @returns Array of field values
 */
function parseCSVLine(line: string): string[] {
	const fields: string[] = [];
	let currentField = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			// Handle escaped quotes
			if (inQuotes && line[i + 1] === '"') {
				currentField += '"';
				i++; // Skip next quote
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			fields.push(currentField);
			currentField = '';
		} else {
			currentField += char;
		}
	}

	// Add last field
	fields.push(currentField);

	return fields;
}

/**
 * Generates a unique plan ID from supplier and plan name
 *
 * @param supplier - Supplier company name
 * @param planName - Plan name
 * @returns Unique plan ID (e.g., "plan-green-energy-eco-max")
 */
function generatePlanId(supplier: string, planName: string): string {
	const sanitize = (str: string) =>
		str
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

	const supplierPart = sanitize(supplier).slice(0, 20);
	const planPart = sanitize(planName).slice(0, 20);

	return `plan-${supplierPart}-${planPart}`;
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
	if (typeof plan.baseRate !== 'number' || plan.baseRate < 0.05 || plan.baseRate > 0.5) {
		errors.push(`baseRate ${plan.baseRate} out of range (expected 0.05-0.50)`);
	}
	if (typeof plan.monthlyFee !== 'number' || plan.monthlyFee < 0 || plan.monthlyFee > 100) {
		errors.push(`monthlyFee ${plan.monthlyFee} out of range (expected 0-100)`);
	}
	// Contract terms can be 0 (no contract/variable), 1-60 months
	if (typeof plan.contractTermMonths !== 'number' || plan.contractTermMonths < 0 || plan.contractTermMonths > 60) {
		errors.push(`contractTermMonths ${plan.contractTermMonths} invalid (expected 0-60)`);
	}
	if (typeof plan.earlyTerminationFee !== 'number' || plan.earlyTerminationFee < 0 || plan.earlyTerminationFee > 1000) {
		errors.push(`earlyTerminationFee ${plan.earlyTerminationFee} out of range (expected 0-1000)`);
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

	// Remove language field from output (was only used for filtering)
	const cleanedPlans = plans.map((plan) => {
		const { language, ...cleanPlan } = plan;
		return cleanPlan;
	});

	// Write JSON file
	const outputPath = path.join(outputDir, 'raw-scrape-output.json');
	fs.writeFileSync(outputPath, JSON.stringify(cleanedPlans, null, 2), 'utf-8');

	log('Output written to:', outputPath);
}

// Run main function
main().catch((error) => {
	console.error('Unhandled error:', error);
	process.exit(1);
});
