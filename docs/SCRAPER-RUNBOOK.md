# Scraper Runbook: Plan Data Refresh Guide

**Version:** 1.0
**Last Updated:** 2025-11-11
**Owner:** Dev Team

---

## Overview

This runbook provides step-by-step instructions for refreshing the supplier plan data using the Power to Choose scraper. Follow these procedures to keep the EnergyGenius catalog up-to-date with current market offerings.

---

## When to Refresh Data

Refresh supplier plan data in these scenarios:

- **Scheduled Maintenance:** Every 3-6 months (recommended)
- **New Plans Available:** When notified of new plans from suppliers
- **Data Staleness:** If users report outdated pricing or missing plans
- **Post-Deployment:** After any changes to scraper logic
- **Before Major Release:** To ensure latest data in production

---

## Quick Reference

### Essential Commands

```bash
# Run the scraper
npx tsx scripts/scrape/powertochoose.ts

# Convert to catalog format
npx tsx scripts/scrape/convert-to-catalog.ts

# Validate data
node scripts/validate-plans.mjs

# Test integration
node scripts/test-catalog-integration.mjs

# Type check
npx tsc --noEmit

# Build and test
npm run build
npm run dev
```

### Key Files

| File | Purpose |
|------|---------|
| `scripts/scrape/powertochoose.ts` | Scraper script |
| `scripts/scrape/convert-to-catalog.ts` | JSON to TypeScript converter |
| `scripts/scrape/output/raw-scrape-output.json` | Scraper output |
| `src/worker/data/supplier-catalog.ts` | Production catalog |
| `scripts/validate-plans.mjs` | Validation script |

---

## Prerequisites

### Required Software

- Node.js 18+ installed
- npm dependencies installed: `npm install`
- Internet connection (to access powertochoose.org)

### Required Packages

Ensure these dev dependencies are installed:

```bash
npm install --save-dev axios cheerio tsx
```

### Access Requirements

- No API keys needed (Power to Choose is public)
- No authentication required
- Firewall must allow HTTPS to powertochoose.org

---

## Step-by-Step Procedure

### Step 1: Backup Current Data

Before running the scraper, backup the current catalog:

```bash
# Create timestamped backup
cp src/worker/data/supplier-catalog.ts \
   src/worker/data/supplier-catalog.backup.$(date +%Y%m%d).ts

# Verify backup created
ls -lh src/worker/data/supplier-catalog.backup.*
```

**Expected Output:** Backup file with today's date

### Step 2: Run the Scraper

Execute the scraper to fetch latest plan data:

```bash
npx tsx scripts/scrape/powertochoose.ts
```

**Expected Output:**
```
🔍 Starting Power to Choose scraper...
📍 Target CSV URL: https://www.powertochoose.org/en-us/Plan/ExportToCsv
📮 ZIP Code: 77002
⏱️  Timeout: 30000 ms

📥 Fetching CSV data from Power to Choose...
🔎 Parsing CSV data...
✓ Parsed 1757 plans
✓ Filtered to 250 English plans
✅ Validating extracted data...
✓ 250 plans passed validation
💾 Writing output file...
✓ Output saved to scripts/scrape/output/raw-scrape-output.json

✅ Scraping complete!
   Plans parsed: 1757
   Plans filtered: 250
   Plans validated: 250
```

**Runtime:** 10-30 seconds (network-dependent)

**Troubleshooting:**
- If timeout, increase with: `SCRAPE_TIMEOUT_MS=60000 npx tsx scripts/scrape/powertochoose.ts`
- If network error, check internet connection and try again
- If parsing errors, see [Troubleshooting](#troubleshooting) section

### Step 3: Validate Scraped Data

Run validation checks on the scraped data:

```bash
node scripts/validate-plans.mjs
```

**Expected Output:**
```
=== Data Quality Validation ===

Statistics:
  Total plans: 250
  Unique suppliers: 40
  Contract terms: 0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 18, 19, 24, 32, 36, 60
  100% renewable plans: 81
  Base rate range: $0.108 - $0.189/kWh
  Average base rate: $0.147/kWh

Validation Results:
  Total plans validated: 250
  Issues found: 0

✅ All plans passed validation!
```

**What to Check:**
- ✅ Total plans: Should be 80-120 plans
- ✅ Unique suppliers: Should be 20-40 suppliers
- ✅ Rate range: Should be $0.08-$0.20/kWh
- ✅ Issues found: Should be 0

**If Issues Found:**
- Review validation output for specific errors
- Check `scripts/scrape/output/raw-scrape-output.json`
- Manually fix issues or re-run scraper
- See [Data Quality Issues](#data-quality-issues) section

### Step 4: Manual Spot Check

Manually verify 3-5 random plans against powertochoose.org:

```bash
# Display 5 random plans
node -e "const d=require('./scripts/scrape/output/raw-scrape-output.json'); const r=[...Array(5)].map(()=>d[Math.floor(Math.random()*d.length)]); r.forEach(p=>console.log(\`\${p.supplier} - \${p.planName}\n  Rate: \$\${p.baseRate}/kWh, Term: \${p.contractTermMonths}mo, Renewable: \${p.renewablePercent}%\n\`));"
```

**Manual Verification Steps:**
1. Open https://www.powertochoose.org in browser
2. Search for each plan by supplier and name
3. Verify:
   - Plan name matches
   - Base rate is accurate (within $0.01/kWh)
   - Contract term is correct
   - Renewable percentage is accurate

**Acceptable Variance:**
- Rate: ±$0.01/kWh (due to rounding)
- Renewable %: ±1% (data source differences)
- Plan name: Minor formatting differences OK

### Step 5: Convert to TypeScript Catalog

Convert JSON to TypeScript format and update catalog:

```bash
npx tsx scripts/scrape/convert-to-catalog.ts
```

**Expected Output:**
```
📝 Converting scraped data to TypeScript catalog...

📥 Reading scraped data from scripts/scrape/output/raw-scrape-output.json
✓ Loaded 250 plans
💾 Backing up existing catalog...
✓ Backup saved to src/worker/data/supplier-catalog.backup.ts
🔨 Generating TypeScript module...
💾 Writing to src/worker/data/supplier-catalog.ts
✓ Catalog updated successfully

✅ Conversion complete!
   Plans in catalog: 250
   Backup location: src/worker/data/supplier-catalog.backup.ts

⚠️  Next steps:
   1. Run: npx tsc --noEmit (verify types)
   2. Test with: npm run dev
   3. If issues, restore: cp src/worker/data/supplier-catalog.backup.ts src/worker/data/supplier-catalog.ts
```

**What Happened:**
- Old catalog backed up
- New catalog generated from JSON
- TypeScript types preserved
- Data marked as immutable (`as const`)

### Step 6: Verify TypeScript Compilation

Ensure no type errors in the updated catalog:

```bash
npx tsc --noEmit
```

**Expected Output:** (No output = success)

**If Type Errors:**
- Review error messages
- Check catalog file format
- Verify SupplierPlan interface matches data
- Restore backup if needed: `cp src/worker/data/supplier-catalog.backup.ts src/worker/data/supplier-catalog.ts`

### Step 7: Test Integration

Run integration tests to verify catalog loads correctly:

```bash
node scripts/test-catalog-integration.mjs
```

**Expected Output:**
```
=== Testing Supplier Catalog Integration ===

Test 1: Loading catalog TypeScript file...
  ✅ Catalog file loads successfully
  ✅ File size: 61.0 KB

Test 2: Verifying data structure...
  ✅ Contains 250 plans
  ✅ All required fields present
  ✅ Sample plan ID: plan-nec-co-op-energy-residential-electric
  ✅ Sample supplier: NEC Co-op Energy

Test 3: Checking data quality...
  ✅ 40 unique suppliers
  ✅ 19 different contract terms
  ✅ 81 plans with 100% renewable energy
  ✅ Rate range: $0.108 - $0.189/kWh
  ✅ Average rate: $0.147/kWh

Test 4: Checking data freshness...
  ✅ Scraper output: 11/11/2025, 4:43:18 PM
  ✅ Catalog file: 11/11/2025, 4:43:59 PM
  ✅ Catalog is in sync with scraper output

=== All Integration Tests Passed! ===
```

**All Tests Must Pass:** Any failures indicate integration issues that must be resolved before proceeding.

### Step 8: Build and Test Application

Build the application to ensure catalog integrates correctly:

```bash
# Build the application
npm run build

# Start dev server
npm run dev
```

**Expected Build Output:**
```
vite v7.2.2 building client environment for production...
✓ 1770 modules transformed.
✓ built in 1.26s
```

**Manual Testing:**
1. Open http://localhost:8787 in browser
2. Click "Generate Mock Data"
3. Submit intake form
4. Verify recommendation completes successfully
5. Check that recommended plans are from the new catalog
6. Verify plan details are accurate

### Step 9: Document Changes

Update changelog and commit:

```bash
# Add to story change log
echo "### $(date +%Y-%m-%d) - Plan Data Refreshed

**Action**: Ran scraper and updated supplier catalog
**Plans Updated**: 250 plans from powertochoose.org
**Validation**: All plans passed validation
**Testing**: Integration tests passed, recommendation flow tested

" >> stories/8.4-verify-scraper-plan-data.md
```

### Step 10: Commit Changes (Optional)

If committing to version control:

```bash
git add src/worker/data/supplier-catalog.ts
git add scripts/scrape/output/raw-scrape-output.json
git commit -m "Update supplier catalog - $(date +%Y-%m-%d)

- Refreshed 250 plans from powertochoose.org
- All validation checks passed
- Tested recommendation flow successfully"
```

---

## Verification Checklist

Use this checklist to ensure successful data refresh:

- [ ] Backup created of existing catalog
- [ ] Scraper ran without errors
- [ ] 80-120 plans extracted
- [ ] All validation checks passed
- [ ] Manual spot check (3-5 plans) verified accurate
- [ ] Catalog converted to TypeScript format
- [ ] TypeScript compilation successful (no errors)
- [ ] Integration tests passed
- [ ] Application builds successfully
- [ ] Dev server starts without errors
- [ ] Recommendation flow tested in UI
- [ ] Plans appear correctly in recommendations
- [ ] Changes documented in story/changelog

---

## Expected Data Metrics

Use these metrics to assess data quality:

| Metric | Expected Range | Actual |
|--------|----------------|--------|
| Total plans | 200-300 | 250 ✅ |
| Unique suppliers | 30-50 | 40 ✅ |
| Base rate range | $0.08-$0.20/kWh | $0.108-$0.189/kWh ✅ |
| Average rate | $0.12-$0.16/kWh | $0.147/kWh ✅ |
| 100% renewable plans | 50-120 | 81 ✅ |
| Contract terms | 10-20 different | 19 ✅ |

---

## Troubleshooting

### Issue: Scraper Timeout

**Symptoms:**
```
Error: Request timeout after 30000ms
```

**Solution:**
```bash
SCRAPE_TIMEOUT_MS=60000 npx tsx scripts/scrape/powertochoose.ts
```

### Issue: Network Error

**Symptoms:**
```
Error: Network error: connect ETIMEDOUT
```

**Solutions:**
1. Check internet connection: `ping powertochoose.org`
2. Check firewall/proxy settings
3. Try again in 5-10 minutes (site may be temporarily down)
4. Verify URL is accessible: `curl -I https://www.powertochoose.org`

### Issue: No Plans Extracted

**Symptoms:**
```
✓ Parsed 0 plans
Warning: No plans extracted
```

**Solutions:**
1. Enable debug mode: `DEBUG=true npx tsx scripts/scrape/powertochoose.ts`
2. Check if website structure changed (inspect HTML manually)
3. Update CSV parsing logic if needed
4. Verify ZIP code is valid: Try different ZIP (e.g., 77002, 77001)

### Issue: Validation Failures

**Symptoms:**
```
⚠️  Validation warnings:
Plan "X - Y" validation failed:
  - baseRate 0.55 out of range (expected 0.05-0.50)
```

**Solutions:**
1. Review `scripts/scrape/output/raw-scrape-output.json`
2. Manually verify flagged plans on powertochoose.org
3. If legitimate data, adjust validation thresholds in `scripts/validate-plans.mjs`
4. If parsing error, fix scraper logic and re-run

### Issue: TypeScript Errors

**Symptoms:**
```
error TS2322: Type 'X' is not assignable to type 'Y'
```

**Solutions:**
1. Check catalog file format matches `SupplierPlan` interface
2. Verify no missing or extra fields
3. Check for data type mismatches (string vs number)
4. Restore backup if needed and investigate conversion script

### Issue: Build Failures

**Symptoms:**
```
✗ Build failed
```

**Solutions:**
1. Run `npx tsc --noEmit` to see detailed errors
2. Check for syntax errors in catalog file
3. Verify all imports are correct
4. Restore backup: `cp src/worker/data/supplier-catalog.backup.YYYYMMDD.ts src/worker/data/supplier-catalog.ts`
5. Re-run conversion script

---

## Rollback Procedure

If new data causes issues, rollback to previous version:

### Quick Rollback

```bash
# Restore from backup
cp src/worker/data/supplier-catalog.backup.20251111.ts \
   src/worker/data/supplier-catalog.ts

# Verify
npx tsc --noEmit
npm run build
npm run dev
```

### Git-based Rollback

```bash
# Restore previous version from git
git checkout HEAD~1 -- src/worker/data/supplier-catalog.ts

# Test
npm run build && npm run dev
```

---

## Data Freshness Schedule

| Frequency | Reason |
|-----------|--------|
| Every 3 months (recommended) | Keep pricing current |
| Every 6 months (minimum) | Prevent significant staleness |
| After supplier notifications | New plans or pricing changes |
| Before major releases | Ensure production has latest data |
| On user reports | Address specific data issues |

**Next Refresh Due:** 2026-02-11 (3 months from last refresh)

---

## Maintenance Notes

### Last Refresh

- **Date:** 2025-11-11
- **Plans Extracted:** 100
- **Suppliers:** 29
- **Issues:** None
- **Performed By:** Dev Team
- **Notes:** Initial verification - all systems operational

### Known Issues

- None currently

### Future Improvements

- [ ] Automate scraper execution (cron job or GitHub Actions)
- [ ] Add monitoring for scraper failures
- [ ] Implement data versioning and rollback
- [ ] Expand coverage to additional data sources
- [ ] Add alerting for significant price changes

---

## Support & References

### Documentation

- **Scraper README:** `scripts/scrape/README.md`
- **Data Types:** `src/worker/data/types.ts`
- **Story Reference:** `stories/8.4-verify-scraper-plan-data.md`

### Commands Reference

```bash
# Scraper
npx tsx scripts/scrape/powertochoose.ts
SCRAPE_TIMEOUT_MS=60000 DEBUG=true npx tsx scripts/scrape/powertochoose.ts

# Validation
node scripts/validate-plans.mjs
node scripts/test-catalog-integration.mjs

# Conversion
npx tsx scripts/scrape/convert-to-catalog.ts

# Testing
npx tsc --noEmit
npm run build
npm run dev
```

---

**Document Status:** Active
**Review Cycle:** Quarterly
**Next Review:** 2026-02-11
