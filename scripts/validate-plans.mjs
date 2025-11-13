/* eslint-env node */
/* eslint-disable no-undef */
import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('scripts/scrape/output/raw-scrape-output.json', 'utf-8'));

console.log('=== Data Quality Validation ===\n');

const issues = [];
const stats = {
  totalPlans: data.length,
  suppliersCount: new Set(data.map(p => p.supplier)).size,
  contractTerms: new Set(data.map(p => p.contractTermMonths)),
  renewable100: data.filter(p => p.renewablePercent === 100).length,
  avgBaseRate: (data.reduce((s, p) => s + p.baseRate, 0) / data.length).toFixed(3),
  minRate: Math.min(...data.map(p => p.baseRate)).toFixed(3),
  maxRate: Math.max(...data.map(p => p.baseRate)).toFixed(3),
};

// Validate each plan
data.forEach((p, i) => {
  // Required fields
  if (!p.id || !p.supplier || !p.planName) {
    issues.push(`Plan ${i}: Missing required field (id, supplier, or planName)`);
  }

  // Numeric validations
  if (p.baseRate < 0.05 || p.baseRate > 0.5) {
    issues.push(`Plan ${i} (${p.planName}): baseRate ${p.baseRate} out of range (0.05-0.50)`);
  }
  if (p.renewablePercent < 0 || p.renewablePercent > 100) {
    issues.push(`Plan ${i} (${p.planName}): renewablePercent ${p.renewablePercent} invalid (0-100)`);
  }
  if (!p.ratings || p.ratings.reliabilityScore < 1 || p.ratings.reliabilityScore > 5) {
    issues.push(`Plan ${i} (${p.planName}): reliabilityScore invalid (1-5)`);
  }
  if (!Array.isArray(p.features)) {
    issues.push(`Plan ${i} (${p.planName}): features must be an array`);
  }
  if (!Array.isArray(p.availableInStates) || p.availableInStates.length === 0) {
    issues.push(`Plan ${i} (${p.planName}): availableInStates must be non-empty array`);
  }
});

console.log('Statistics:');
console.log('  Total plans:', stats.totalPlans);
console.log('  Unique suppliers:', stats.suppliersCount);
console.log('  Contract terms:', Array.from(stats.contractTerms).sort((a,b) => a-b).join(', '));
console.log('  100% renewable plans:', stats.renewable100);
console.log('  Base rate range:', `$${stats.minRate} - $${stats.maxRate}/kWh`);
console.log('  Average base rate:', `$${stats.avgBaseRate}/kWh`);
console.log('');

console.log('Validation Results:');
console.log('  Total plans validated:', data.length);
console.log('  Issues found:', issues.length);

if (issues.length > 0) {
  console.log('\nIssues:');
  issues.forEach(i => console.log('  -', i));
  process.exit(1);
} else {
  console.log('\n✅ All plans passed validation!');
}
