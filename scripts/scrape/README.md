# Power to Choose Scraper Documentation

**DISCLAIMER:** This is an optional developer utility, not a runtime dependency.

---

## Purpose

The Power to Choose scraper is a one-off Node.js script designed to refresh the supplier catalog data used in the EnergyGenius MVP. It extracts electricity plan information from the [Power to Choose](https://www.powertochoose.org) website and generates structured JSON data suitable for integration into the application.

**Key Points:**

- **Not part of runtime:** This scraper is for data refresh only and is not included in the production deployment
- **Manual workflow:** Scraping requires manual review and validation before integrating data into the codebase
- **Development utility:** Intended for developers maintaining or extending the supplier catalog

---

## Quick Start

Follow these steps to run the scraper:

1. **Install dependencies:** `npm install` (installs scraper dependencies)
2. **Set environment:** No API keys required for Power to Choose
3. **Run command:** `npx tsx scripts/scrape/powertochoose.ts`
4. **Verify output:** Check `scripts/scrape/output/raw-scrape-output.json`
5. **Review data:** Manually validate extracted plans before integration

**Example:**

```bash
cd /path/to/energy-genius
npx tsx scripts/scrape/powertochoose.ts
# Output: scripts/scrape/output/raw-scrape-output.json
```

---

## Prerequisites

### Node.js Version

- **Node.js 18+** (recommended)
- **TypeScript 5+** (for type checking)
- **tsx** (TypeScript execution runtime)

### Required npm Packages

The scraper requires the following packages (listed as dev dependencies):

- **cheerio** (^1.0.0) - HTML parsing and DOM traversal
- **axios** (^1.6.0) - HTTP client for fetching web pages
- **tsx** (^4.7.0) - TypeScript execution runtime

Install with:

```bash
npm install --save-dev cheerio axios tsx
```

### Important Notes

- These packages are **development dependencies only** and are not included in production bundle
- The scraper is **separate from runtime dependencies** and does not affect Worker deployment size
- Scraper execution is **manual and offline** (not automated)

---

## Installation & Setup

### Installation

Install scraper dependencies:

```bash
npm install --save-dev cheerio axios tsx
```

Or if already in `package.json`:

```bash
npm install
```

### Configuration

**No authentication required:** Power to Choose is a public website and does not require API keys or credentials.

**Optional Environment Variables:**

You can optionally set environment variables to customize scraper behavior:

```bash
# .env (optional)
SCRAPE_TIMEOUT_MS=30000         # Request timeout (default: 30000ms)
SCRAPE_OUTPUT_DIR=scripts/scrape/output  # Output directory
SCRAPE_MAX_PLANS=250            # Maximum plans to extract (default: 250)
```

### Expected Execution Time

- **Typical runtime:** 10-30 seconds (depending on network speed and website response time)
- **Network-dependent:** Execution time varies based on internet connection
- **Rate limiting:** Script includes reasonable delays to avoid overwhelming the website

---

## Data Format & Extraction

### Output JSON Structure

The scraper produces a JSON file containing an array of supplier plans. Each plan follows the `SupplierPlan` interface:

```typescript
interface SupplierPlan {
	id: string; // Unique plan identifier (auto-generated)
	supplier: string; // Supplier company name
	planName: string; // Descriptive plan name
	baseRate: number; // Base rate in $/kWh
	monthlyFee: number; // Monthly service fee in $/month
	contractTermMonths: number; // Contract term (3, 6, 12, or 24)
	earlyTerminationFee: number; // Early termination fee in $ (0 for none)
	renewablePercent: number; // Renewable energy % (0-100)
	ratings: {
		reliabilityScore: number; // Reliability score (1-5)
		customerServiceScore: number; // Customer service score (1-5)
	};
	features: string[]; // Array of plan features
	availableInStates: string[]; // State abbreviations (e.g., ["TX"])
}
```

### Example JSON Output

```json
[
	{
		"id": "plan-green-energy-001",
		"supplier": "Green Energy Co",
		"planName": "Eco Max 100",
		"baseRate": 0.119,
		"monthlyFee": 9.95,
		"contractTermMonths": 12,
		"earlyTerminationFee": 0,
		"renewablePercent": 100,
		"ratings": {
			"reliabilityScore": 4.5,
			"customerServiceScore": 4.3
		},
		"features": ["100% Renewable Energy", "Fixed Rate", "Online Account Management", "Paperless Billing"],
		"availableInStates": ["TX"]
	},
	{
		"id": "plan-power-plus-002",
		"supplier": "Power Plus",
		"planName": "Budget Saver 24",
		"baseRate": 0.089,
		"monthlyFee": 4.95,
		"contractTermMonths": 24,
		"earlyTerminationFee": 150,
		"renewablePercent": 12,
		"ratings": {
			"reliabilityScore": 4.1,
			"customerServiceScore": 3.8
		},
		"features": ["24-Month Fixed Rate", "Low Monthly Fee", "Auto-Pay Discount", "Mobile App"],
		"availableInStates": ["TX"]
	}
]
```

### Field Descriptions

| Field                          | Type     | Unit      | Description                                                  |
| ------------------------------ | -------- | --------- | ------------------------------------------------------------ |
| `id`                           | string   | -         | Unique identifier (auto-generated from supplier + plan name) |
| `supplier`                     | string   | -         | Company name providing the plan                              |
| `planName`                     | string   | -         | Marketing name of the plan                                   |
| `baseRate`                     | number   | $/kWh     | Base electricity rate (typically 0.08-0.15)                  |
| `monthlyFee`                   | number   | $/month   | Fixed monthly service charge                                 |
| `contractTermMonths`           | number   | months    | Contract duration (3, 6, 12, or 24)                          |
| `earlyTerminationFee`          | number   | $         | Penalty for early cancellation (0 if none)                   |
| `renewablePercent`             | number   | %         | Percentage of renewable energy (0-100)                       |
| `ratings.reliabilityScore`     | number   | 1-5 scale | Service reliability rating                                   |
| `ratings.customerServiceScore` | number   | 1-5 scale | Customer service quality rating                              |
| `features`                     | string[] | -         | Array of plan features and benefits                          |
| `availableInStates`            | string[] | -         | State abbreviations where plan is offered                    |

### Data Transformations Applied

The scraper applies the following transformations:

1. **Rate normalization:** Converts rates to $/kWh decimal format (e.g., "11.9¢/kWh" → 0.119)
2. **ID generation:** Creates unique IDs from supplier name + plan name (lowercase, hyphenated)
3. **Feature extraction:** Parses plan features from HTML descriptions
4. **Rating inference:** Estimates ratings from available data or assigns defaults
5. **State mapping:** Extracts or defaults to Texas ("TX")
6. **Renewable percentage extraction:** Parses renewable energy claims or defaults to 0

---

## Validation Requirements

### Automated Validation Checks

The scraper performs the following validation checks on extracted data:

1. **Field Type Checking:**
   - `baseRate` is a positive number
   - `monthlyFee` is a non-negative number
   - `contractTermMonths` is one of [3, 6, 12, 24]
   - `renewablePercent` is 0-100
   - `ratings` are 1-5 scale

2. **Range Validation:**
   - `baseRate`: 0.05 ≤ rate ≤ 0.30 ($/kWh)
   - `monthlyFee`: 0 ≤ fee ≤ 50 ($/month)
   - `earlyTerminationFee`: 0 ≤ fee ≤ 500 ($)
   - `renewablePercent`: 0 ≤ percent ≤ 100
   - `ratings.*`: 1 ≤ score ≤ 5

3. **Required Field Validation:**
   - All required fields must be present
   - `id`, `supplier`, `planName` must be non-empty strings
   - `features` must be an array (can be empty)
   - `availableInStates` must contain at least one state

### Error Handling

**Invalid Data Behavior:**

- **Validation fails:** Invalid plans are **flagged for manual review** (not auto-removed)
- **Output includes warnings:** Validation warnings are written to console and log file
- **Manual review required:** Developer must review flagged plans before integration

### What Constitutes Invalid Data

Examples of invalid data that will trigger warnings:

- Base rate outside realistic range (e.g., $0.01/kWh or $1.00/kWh)
- Missing required fields (supplier, planName, baseRate)
- Renewable percentage > 100% or < 0%
- Contract term not in [3, 6, 12, 24] months
- Empty or malformed plan ID

### Manual Review & Fixing Invalid Records

**Review Process:**

1. Run scraper and check console output for validation warnings
2. Open `scripts/scrape/output/raw-scrape-output.json`
3. Search for flagged plans (validation errors noted in output)
4. Manually correct invalid data:
   - Verify rates against source website
   - Fix typos or parsing errors
   - Fill in missing fields with defaults or research
   - Remove completely invalid plans if unfixable

**Example Fix:**

```json
// Before (invalid: baseRate too high)
{
  "id": "plan-bad-001",
  "baseRate": 1.50,  // INVALID: Unrealistic rate
  ...
}

// After (fixed)
{
  "id": "plan-bad-001",
  "baseRate": 0.15,  // FIXED: Correct rate
  ...
}
```

---

## Workflow & Process

### Complete Workflow from Scrape to Integration

Follow these steps to refresh supplier catalog data:

#### Step 1: Run Scraper

```bash
npx tsx scripts/scrape/powertochoose.ts
```

**Output:** `scripts/scrape/output/raw-scrape-output.json`

#### Step 2: Review Output

Open the output file and review:

- Number of plans extracted (should be 20-100 plans)
- Validation warnings (check console output)
- Data quality (spot-check 3-5 plans for accuracy)

```bash
cat scripts/scrape/output/raw-scrape-output.json | jq length
# Expected: 20-100 plans
```

#### Step 3: Validate Data

Run validation manually:

```bash
node -e "const data = require('./scripts/scrape/output/raw-scrape-output.json'); console.log(\`Plans: \${data.length}\`);"
```

Or use validation function:

```typescript
import { validateSupplierCatalog } from './src/worker/data/validation';
import rawData from './scripts/scrape/output/raw-scrape-output.json';

try {
	validateSupplierCatalog(rawData);
	console.log('✓ Validation passed');
} catch (error) {
	console.error('✗ Validation failed:', error.message);
}
```

#### Step 4: Manual Review Step

**CRITICAL:** Do not auto-integrate scraped data. Always perform manual review:

- Verify at least 5 random plans are accurate
- Check for pricing anomalies (rates too high/low)
- Confirm renewable percentages are realistic
- Verify features make sense

#### Step 5: Replace File

**Backup current data:**

```bash
cp src/worker/data/supplier-catalog.ts src/worker/data/supplier-catalog.backup.ts
```

**Update catalog:**

Manually edit `src/worker/data/supplier-catalog.ts`:

```typescript
// src/worker/data/supplier-catalog.ts
import type { SupplierPlan } from './types';

// Import scraped data and convert to TypeScript
export const supplierCatalog: readonly SupplierPlan[] = [
	// Paste scraped plans here (formatted as TypeScript objects)
	{
		id: 'plan-green-energy-001',
		supplier: 'Green Energy Co',
		// ... etc
	},
	// ... more plans
] as const;

export default supplierCatalog;
```

**Alternative:** Use a script to automate conversion from JSON to TypeScript.

#### Step 6: Test Data Integration

Run TypeScript compilation to ensure no type errors:

```bash
npx tsc --noEmit
```

Test the data loads correctly:

```bash
npm run dev
# Visit: http://localhost:8787/api/mock-data
# Verify: New plans appear in response
```

#### Step 7: Run Full Pipeline Test

Test that the AI pipeline works with new data:

```bash
npm run dev
# Open UI, generate mock data, run recommendation
# Verify: No errors, plans appear in recommendations
```

### Backup & Rollback Guidance

**Before replacing data:**

```bash
# Create timestamped backup
cp src/worker/data/supplier-catalog.ts \
   src/worker/data/supplier-catalog.backup.$(date +%Y%m%d).ts
```

**Rollback procedure:**

```bash
# Restore previous version
cp src/worker/data/supplier-catalog.backup.20251110.ts \
   src/worker/data/supplier-catalog.ts

# Verify
npm run build
npm run dev
```

**Git-based rollback:**

```bash
git checkout HEAD~1 -- src/worker/data/supplier-catalog.ts
npm run build
```

---

## Integration & Updating

### How to Update `src/worker/data/supplier-catalog.ts`

#### Step-by-Step Instructions

**1. Backup existing data:**

```bash
cp src/worker/data/supplier-catalog.ts \
   src/worker/data/supplier-catalog.backup.ts
```

**2. Convert JSON to TypeScript:**

The scraper outputs JSON, but the catalog is a TypeScript module. You have two options:

**Option A: Manual conversion (recommended for small updates)**

Open `scripts/scrape/output/raw-scrape-output.json` and `src/worker/data/supplier-catalog.ts` side-by-side. Copy plan data and format as TypeScript objects.

**Option B: Scripted conversion (for large updates)**

Create a conversion script:

```typescript
// scripts/convert-json-to-ts.ts
import * as fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('scripts/scrape/output/raw-scrape-output.json', 'utf-8'));

const tsContent = `import type { SupplierPlan } from './types';

export const supplierCatalog: readonly SupplierPlan[] = ${JSON.stringify(rawData, null, 2)} as const;

export default supplierCatalog;
`;

fs.writeFileSync('src/worker/data/supplier-catalog.ts', tsContent);
console.log('✓ Converted JSON to TypeScript module');
```

Run with:

```bash
npx tsx scripts/convert-json-to-ts.ts
```

**3. Format the file:**

```bash
npx prettier --write src/worker/data/supplier-catalog.ts
```

**4. Verify TypeScript compilation:**

```bash
npx tsc --noEmit
```

**5. Test with pipeline:**

```bash
npm run dev
# Test UI and recommendation flow
```

### TypeScript Compilation Checks

After updating the catalog, ensure:

1. **No type errors:**

   ```bash
   npx tsc --noEmit
   # Should return exit code 0
   ```

2. **Data matches interface:**
   - All plans conform to `SupplierPlan` interface
   - No missing required fields
   - Correct field types

3. **Immutability preserved:**
   - Data is marked `as const`
   - Export type is `readonly SupplierPlan[]`

### How to Test Updated Data with Pipeline

**Test Plan:**

1. **Start development server:**

   ```bash
   npm run dev
   ```

2. **Verify mock data endpoint:**

   ```
   GET http://localhost:8787/api/mock-data
   ```

   Check response includes new plans

3. **Test intake form:**
   - Open UI in browser
   - Click "Generate Mock Data"
   - Verify form populates

4. **Run recommendation:**
   - Submit intake form
   - Verify pipeline completes successfully
   - Check that new plans appear in recommendations

5. **Check console for errors:**
   - No TypeScript errors
   - No runtime errors
   - AI pipeline completes

### Git Workflow

**Commit Message Format:**

```
chore(data): refresh supplier catalog from Power to Choose

- Scraped 42 plans from powertochoose.org
- Updated src/worker/data/supplier-catalog.ts
- Validated all plans meet schema requirements
- Tested with recommendation pipeline

Resolves: Story 2.4
```

**Branch Naming:**

```bash
git checkout -b data/refresh-supplier-catalog-2025-11-10
git add src/worker/data/supplier-catalog.ts
git commit -m "chore(data): refresh supplier catalog from Power to Choose"
git push origin data/refresh-supplier-catalog-2025-11-10
```

### Rollback Procedure if New Data Breaks Pipeline

**Immediate rollback:**

```bash
# Restore from backup
cp src/worker/data/supplier-catalog.backup.ts \
   src/worker/data/supplier-catalog.ts

# Verify fix
npm run dev
```

**Git-based rollback:**

```bash
# Revert to previous commit
git checkout HEAD~1 -- src/worker/data/supplier-catalog.ts

# Test
npm run build && npm run dev
```

**Production rollback:**

```bash
# Revert and redeploy
git revert <commit-hash>
npm run build
npm run deploy
```

---

## Troubleshooting

### Common Errors & Solutions

#### Error: Network Timeout

**Symptom:**

```
Error: connect ETIMEDOUT
```

**Cause:** Network connection issue or Power to Choose website is down

**Solution:**

1. Verify internet connectivity: `ping powertochoose.org`
2. Increase timeout in script (default: 30s)
3. Try again later if website is down
4. Check firewall/proxy settings

#### Error: HTML Parsing Failure

**Symptom:**

```
Error: Failed to parse plan data
TypeError: Cannot read property 'text' of undefined
```

**Cause:** Power to Choose website HTML structure changed

**Solution:**

1. Inspect website HTML manually
2. Update scraper selectors in `powertochoose.ts`
3. Check if website has changed layout or moved data
4. Consider alternative data sources

#### Error: Scraper Returns No Data

**Symptom:**

```
Warning: No plans extracted
Output: []
```

**Causes & Solutions:**

| Cause                     | Solution                              |
| ------------------------- | ------------------------------------- |
| Website structure changed | Update HTML selectors                 |
| Rate limiting/blocking    | Add delays, change user agent         |
| Invalid URL               | Verify Power to Choose URL is correct |
| Parsing logic error       | Debug with console logs               |

**Debug steps:**

```bash
# Test URL is reachable
curl -I https://www.powertochoose.org

# Run scraper with verbose logging
DEBUG=true npx tsx scripts/scrape/powertochoose.ts
```

#### Error: Validation Failures

**Symptom:**

```
Validation Error: baseRate 1.5 out of range (expected 0.05-0.30)
```

**Solution:**

1. Review scraper output for obvious errors
2. Manually inspect flagged plans
3. Adjust validation thresholds if legitimate data
4. Fix parsing logic if rate conversion is wrong

### Debugging Tips

**Enable verbose logging:**

Add to `powertochoose.ts`:

```typescript
const DEBUG = process.env.DEBUG === 'true';
const log = (...args: any[]) => DEBUG && console.log(...args);

// Use throughout script
log('Fetching URL:', url);
log('Extracted plans:', plans.length);
```

Run with:

```bash
DEBUG=true npx tsx scripts/scrape/powertochoose.ts
```

**Partial runs:**

Test scraping logic on single plan:

```typescript
// Test on first plan only
const plans = extractPlans(html).slice(0, 1);
console.log(JSON.stringify(plans[0], null, 2));
```

**Inspect raw HTML:**

Save HTML for manual inspection:

```typescript
import * as fs from 'fs';

const response = await axios.get(url);
fs.writeFileSync('scripts/scrape/output/debug.html', response.data);
console.log('HTML saved to debug.html');
```

---

## Limitations & Future Work

### Limitations

1. **Point-in-time snapshot:**
   - Scraped data is a snapshot and becomes stale
   - No real-time updates
   - Plans may change or be discontinued

2. **Data freshness:**
   - Last scraped: _Manual refresh required_
   - Recommended refresh: Every 3-6 months
   - Check Power to Choose website for current plans

3. **Website dependency:**
   - Power to Choose website may change HTML structure
   - Scraper will break if website redesigns
   - Requires manual updates to selectors and parsing logic

4. **Limited coverage:**
   - Only covers Texas deregulated market (Power to Choose)
   - Does not include all Texas suppliers
   - No coverage of other states

5. **Manual workflow:**
   - Requires manual review and validation
   - No automated integration
   - Developer intervention needed for data refresh

### Alternative Data Sources

If Power to Choose scraping becomes unreliable:

1. **Public APIs:**
   - Texas Public Utility Commission API (if available)
   - Supplier direct APIs (requires partnerships)
   - Third-party aggregators (may require licensing)

2. **Manual data entry:**
   - Manually research and enter plans
   - Use supplier websites directly
   - Compile from comparison sites

3. **Crowdsourced data:**
   - Community contributions
   - User submissions
   - Verified by moderators

### Future Work

**Automated Scraping:**

- Schedule scraper to run weekly/monthly
- Store historical data for trend analysis
- Alert on significant plan changes

**CI/CD Integration:**

- Run scraper in GitHub Actions
- Auto-create PR with updated data
- Require manual approval before merge

**Expanded Coverage:**

- Scrape additional comparison websites
- Cover more states (PA, OH, MA, etc.)
- Integrate multiple data sources

**Enhanced Validation:**

- Machine learning for anomaly detection
- Cross-reference with historical data
- Flag suspicious changes

**API Integration:**

- Replace scraping with official APIs when available
- Real-time plan updates
- Live pricing data

**Data Versioning:**

- Track data changes over time
- Maintain changelog of plan updates
- Enable rollback to previous versions

---

## References & Links

### External Resources

- **Power to Choose Website:** [https://www.powertochoose.org](https://www.powertochoose.org)
- **Texas Public Utility Commission:** [https://www.puc.texas.gov](https://www.puc.texas.gov)

### Internal Documentation

- **Tech Spec:** [docs/tech-spec.md](../../docs/tech-spec.md) - See "Source Tree Changes" section
- **Supplier Catalog Module:** [src/worker/data/supplier-catalog.ts](../../src/worker/data/supplier-catalog.ts)
- **Data Types:** [src/worker/data/types.ts](../../src/worker/data/types.ts)
- **Validation Module:** [src/worker/data/validation.ts](../../src/worker/data/validation.ts)
- **Data README:** [src/worker/data/README.md](../../src/worker/data/README.md)

### Story Reference

This documentation is part of:

- **Story 2.4:** Power to Choose Scraper Documentation
- **Epic 2:** Mock Data Layer
- **Project:** EnergyGenius - AI Energy Plan Recommendation Agent

---

## Quick Reference

### Essential Commands

```bash
# Install dependencies
npm install --save-dev cheerio axios tsx

# Run scraper
npx tsx scripts/scrape/powertochoose.ts

# Validate output
npx tsc --noEmit

# Test with dev server
npm run dev

# Backup catalog
cp src/worker/data/supplier-catalog.ts src/worker/data/supplier-catalog.backup.ts
```

### Key Files

| File                                           | Purpose                    |
| ---------------------------------------------- | -------------------------- |
| `scripts/scrape/powertochoose.ts`              | Scraper script (this tool) |
| `scripts/scrape/output/raw-scrape-output.json` | Scraper output             |
| `src/worker/data/supplier-catalog.ts`          | Production data file       |
| `src/worker/data/types.ts`                     | TypeScript interfaces      |
| `src/worker/data/validation.ts`                | Validation functions       |

### Support

For questions or issues:

1. Review this documentation
2. Check [src/worker/data/README.md](../../src/worker/data/README.md)
3. Inspect tech spec: [docs/tech-spec.md](../../docs/tech-spec.md)
4. Review Story 2.4: `stories/2.4-scraper-docs.md`

---

**Last Updated:** 2025-11-10
**Maintained By:** Dev Team
**Version:** 1.0.0
