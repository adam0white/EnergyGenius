/**
 * Converts scraped JSON data to TypeScript supplier catalog format
 *
 * Usage:
 *   npx tsx scripts/scrape/convert-to-catalog.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const INPUT_FILE = 'scripts/scrape/output/raw-scrape-output.json';
const OUTPUT_FILE = 'src/worker/data/supplier-catalog.ts';
const BACKUP_FILE = 'src/worker/data/supplier-catalog.backup.ts';

async function main() {
	console.log('📝 Converting scraped data to TypeScript catalog...');
	console.log('');

	try {
		// Read scraped data
		console.log('📥 Reading scraped data from', INPUT_FILE);
		const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
		console.log(`✓ Loaded ${rawData.length} plans`);

		// Backup existing catalog
		console.log('💾 Backing up existing catalog...');
		if (fs.existsSync(OUTPUT_FILE)) {
			fs.copyFileSync(OUTPUT_FILE, BACKUP_FILE);
			console.log(`✓ Backup saved to ${BACKUP_FILE}`);
		}

		// Generate TypeScript content
		console.log('🔨 Generating TypeScript module...');
		const tsContent = generateTypeScriptModule(rawData);

		// Write to file
		console.log('💾 Writing to', OUTPUT_FILE);
		fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
		console.log('✓ Catalog updated successfully');

		// Summary
		console.log('');
		console.log('✅ Conversion complete!');
		console.log(`   Plans in catalog: ${rawData.length}`);
		console.log(`   Backup location: ${BACKUP_FILE}`);
		console.log('');
		console.log('⚠️  Next steps:');
		console.log('   1. Run: npx tsc --noEmit (verify types)');
		console.log('   2. Test with: npm run dev');
		console.log('   3. If issues, restore: cp', BACKUP_FILE, OUTPUT_FILE);
	} catch (error) {
		console.error('');
		console.error('❌ Conversion failed:');
		console.error(error instanceof Error ? error.message : String(error));
		console.error('');
		process.exit(1);
	}
}

function generateTypeScriptModule(plans: any[]): string {
	const header = `/**
 * Supplier Catalog - Real supplier electricity plans from Power to Choose
 *
 * This module contains ${plans.length} real supplier plans scraped from powertochoose.org:
 * - Multiple suppliers from Texas deregulated market
 * - Varied pricing and contract terms
 * - Different renewable percentages
 * - Real plan features and details
 *
 * Last updated: ${new Date().toISOString().split('T')[0]}
 * Data source: https://www.powertochoose.org
 */

import type { SupplierPlan } from './types';

/**
 * Array of real supplier plans for the recommendation engine
 * Data is immutable to prevent accidental modifications
 */
export const supplierCatalog: readonly SupplierPlan[] = `;

	// Convert to TypeScript object notation
	const plansTS = JSON.stringify(plans, null, 2)
		.replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
		.replace(/\n/g, '\n\t'); // Indent properly

	const footer = ` as const;

export default supplierCatalog;
`;

	return header + plansTS + footer;
}

main().catch((error) => {
	console.error('Unhandled error:', error);
	process.exit(1);
});
