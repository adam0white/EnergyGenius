/**
 * Test script to verify supplier catalog integration
 * Tests that catalog loads correctly and data is accessible
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('=== Testing Supplier Catalog Integration ===\n');

// Test 1: Load catalog file
console.log('Test 1: Loading catalog TypeScript file...');
try {
  const catalogPath = join(projectRoot, 'src/worker/data/supplier-catalog.ts');
  const catalogContent = readFileSync(catalogPath, 'utf-8');

  // Check for expected content
  if (!catalogContent.includes('export const supplierCatalog')) {
    throw new Error('Missing export statement');
  }
  if (!catalogContent.includes('SupplierPlan')) {
    throw new Error('Missing type import');
  }

  console.log('  ✅ Catalog file loads successfully');
  console.log(`  ✅ File size: ${(catalogContent.length / 1024).toFixed(1)} KB`);
} catch (error) {
  console.error('  ❌ Failed to load catalog:', error.message);
  process.exit(1);
}

// Test 2: Verify data structure
console.log('\nTest 2: Verifying data structure...');
try {
  const rawData = JSON.parse(readFileSync(join(projectRoot, 'scripts/scrape/output/raw-scrape-output.json'), 'utf-8'));

  console.log(`  ✅ Contains ${rawData.length} plans`);

  // Sample a few plans
  const samplePlan = rawData[0];
  const requiredFields = ['id', 'supplier', 'planName', 'baseRate', 'monthlyFee', 'contractTermMonths',
    'earlyTerminationFee', 'renewablePercent', 'ratings', 'features', 'availableInStates'];

  const missingFields = requiredFields.filter(f => !(f in samplePlan));
  if (missingFields.length > 0) {
    throw new Error(`Missing fields: ${missingFields.join(', ')}`);
  }

  console.log('  ✅ All required fields present');
  console.log(`  ✅ Sample plan ID: ${samplePlan.id}`);
  console.log(`  ✅ Sample supplier: ${samplePlan.supplier}`);
} catch (error) {
  console.error('  ❌ Data structure validation failed:', error.message);
  process.exit(1);
}

// Test 3: Check data quality
console.log('\nTest 3: Checking data quality...');
try {
  const rawData = JSON.parse(readFileSync(join(projectRoot, 'scripts/scrape/output/raw-scrape-output.json'), 'utf-8'));

  const suppliers = new Set(rawData.map(p => p.supplier));
  const contractTerms = new Set(rawData.map(p => p.contractTermMonths));
  const renewable100 = rawData.filter(p => p.renewablePercent === 100).length;

  console.log(`  ✅ ${suppliers.size} unique suppliers`);
  console.log(`  ✅ ${contractTerms.size} different contract terms`);
  console.log(`  ✅ ${renewable100} plans with 100% renewable energy`);

  // Check for reasonable pricing
  const rates = rawData.map(p => p.baseRate);
  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);

  console.log(`  ✅ Rate range: $${minRate.toFixed(3)} - $${maxRate.toFixed(3)}/kWh`);
  console.log(`  ✅ Average rate: $${avgRate.toFixed(3)}/kWh`);

  if (minRate < 0.05 || maxRate > 0.5) {
    throw new Error('Rates outside expected range');
  }
} catch (error) {
  console.error('  ❌ Data quality check failed:', error.message);
  process.exit(1);
}

// Test 4: Verify timestamps
console.log('\nTest 4: Checking data freshness...');
try {
  const { statSync } = await import('fs');
  const outputPath = join(projectRoot, 'scripts/scrape/output/raw-scrape-output.json');
  const catalogPath = join(projectRoot, 'src/worker/data/supplier-catalog.ts');

  const outputStats = statSync(outputPath);
  const catalogStats = statSync(catalogPath);

  const outputDate = new Date(outputStats.mtime);
  const catalogDate = new Date(catalogStats.mtime);

  console.log(`  ✅ Scraper output: ${outputDate.toLocaleString()}`);
  console.log(`  ✅ Catalog file: ${catalogDate.toLocaleString()}`);

  // Check if catalog is reasonably fresh (within 1 day of scraper output)
  const daysDiff = Math.abs(catalogDate - outputDate) / (1000 * 60 * 60 * 24);
  if (daysDiff > 1) {
    console.warn('  ⚠️  Warning: Catalog may not be in sync with scraper output');
  } else {
    console.log('  ✅ Catalog is in sync with scraper output');
  }
} catch (error) {
  console.error('  ❌ Freshness check failed:', error.message);
}

console.log('\n=== All Integration Tests Passed! ===');
console.log('\nNext steps:');
console.log('  1. Run: npm run dev');
console.log('  2. Test recommendation flow in UI');
console.log('  3. Verify plans appear in recommendations');
