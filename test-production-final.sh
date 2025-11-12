#!/bin/bash

echo "==================================================="
echo "  PRODUCTION DEPLOYMENT VERIFICATION"
echo "==================================================="
echo ""
echo "URL: https://genius.adamwhite.work"
echo "Deployment Version: d29a5537-56c1-45c6-ae5b-d38d7a11d4fb"
echo ""

# Test 1: Health endpoint
echo "TEST 1: Health Endpoint (Story 9.1)"
echo "---------------------------------------------------"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://genius.adamwhite.work/health)
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Health endpoint returns HTTP 200"
    curl -s https://genius.adamwhite.work/health | python3 -m json.tool | head -20
else
    echo "❌ Health endpoint returns HTTP $HTTP_STATUS (expected 200)"
    exit 1
fi
echo ""

# Test 2: Recommendation endpoint with text formatting check
echo "TEST 2: Recommendation & Text Formatting (Story 9.2)"
echo "---------------------------------------------------"
RESPONSE=$(curl -s -X POST https://genius.adamwhite.work/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "energyUsageData": {
      "monthlyData": [
        {"month": "2024-01", "usage": 800, "cost": 100},
        {"month": "2024-02", "usage": 750, "cost": 95},
        {"month": "2024-03", "usage": 900, "cost": 115},
        {"month": "2024-04", "usage": 850, "cost": 108},
        {"month": "2024-05", "usage": 1000, "cost": 128},
        {"month": "2024-06", "usage": 1200, "cost": 155},
        {"month": "2024-07", "usage": 1400, "cost": 180},
        {"month": "2024-08", "usage": 1350, "cost": 175},
        {"month": "2024-09", "usage": 1100, "cost": 142},
        {"month": "2024-10", "usage": 900, "cost": 116},
        {"month": "2024-11", "usage": 800, "cost": 103},
        {"month": "2024-12", "usage": 950, "cost": 122}
      ]
    },
    "preferences": {
      "prioritizeSavings": true,
      "preferRenewable": true,
      "acceptVariableRates": false,
      "maxMonthlyBudget": 150
    },
    "currentPlan": {
      "supplier": "TXU Energy",
      "planName": "TXU Energy Secure 12",
      "rateStructure": "fixed",
      "monthlyFee": 9.95,
      "rate": 0.125
    }
  }')

# Check if we got an error
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ API returned an error:"
    echo "$RESPONSE" | python3 -m json.tool
    exit 1
fi

# Parse and check recommendation
echo "$RESPONSE" | python3 -c "
import json
import sys

try:
    data = json.load(sys.stdin)
except Exception as e:
    print(f'❌ Invalid JSON response: {e}')
    sys.exit(1)

# Navigate to recommendations
if 'data' not in data:
    print('❌ Missing data field in response')
    sys.exit(1)

if 'recommendations' not in data['data'] or len(data['data']['recommendations']) == 0:
    print('❌ No recommendations returned')
    sys.exit(1)

print('✅ Recommendation API working')

# Get first recommendation
rec = data['data']['recommendations'][0]
print(f'   Plan: {rec.get(\"planName\", \"Unknown\")}')
print(f'   Supplier: {rec.get(\"supplier\", \"Unknown\")}')
print()

# Check Why section formatting (Story 9.2)
if 'rationale' not in rec:
    print('❌ Missing rationale field')
    sys.exit(1)

why = rec['rationale']
print('TEXT FORMATTING VERIFICATION (Story 9.2 Fix)')
print('---------------------------------------------------')

# Check for formatting issues from Story 9.2
issues = []
warnings = []

# Critical Issue 1: Markdown bold markers should be removed
if '**' in why:
    issues.append('❌ CRITICAL: Contains Markdown bold markers (**)')
else:
    print('✅ No Markdown bold markers found')

# Critical Issue 2: Should have proper line breaks
line_count = why.count('\n')
if line_count < 2:
    issues.append(f'❌ CRITICAL: Insufficient line breaks (found {line_count}, expected at least 2)')
else:
    print(f'✅ Proper line breaks present ({line_count} breaks)')

# Check for other markdown artifacts
markdown_artifacts = ['##', '###', '- [', '* [', '___', '***']
found_artifacts = [art for art in markdown_artifacts if art in why]
if found_artifacts:
    issues.append(f'❌ CRITICAL: Contains markdown artifacts: {found_artifacts}')
else:
    print('✅ No markdown artifacts detected')

# Informational: Check for content sections
if 'savings' in why.lower():
    print('✅ Contains savings information')
else:
    warnings.append('⚠️  May be missing savings information')

if 'renewable' in why.lower() or 'green' in why.lower():
    print('✅ Contains renewable energy information')

print()

# Display sample of formatted text
print('SAMPLE OUTPUT (first 300 chars):')
print('---------------------------------------------------')
print(why[:300])
if len(why) > 300:
    print('...')
print()
print('---------------------------------------------------')
print()

# Report results
if issues:
    print('❌ TEXT FORMATTING ISSUES DETECTED (Story 9.2 NOT FIXED):')
    for issue in issues:
        print(f'  {issue}')
    sys.exit(1)

if warnings:
    print('⚠️  WARNINGS:')
    for warning in warnings:
        print(f'  {warning}')
    print()

print('✅ ALL CRITICAL TEXT FORMATTING CHECKS PASSED (Story 9.2 Fixed)')
print()
"

PYTHON_EXIT=$?

if [ $PYTHON_EXIT -ne 0 ]; then
    exit 1
fi

# Test 3: Browser console check (informational)
echo "TEST 3: Browser Console Check"
echo "---------------------------------------------------"
echo "⚠️  Manual verification required:"
echo "   1. Visit https://genius.adamwhite.work"
echo "   2. Open browser console (F12)"
echo "   3. Get a recommendation"
echo "   4. Check for errors or warnings"
echo ""

# Final status
echo "==================================================="
echo "  ✅ DEPLOYMENT VERIFICATION COMPLETE"
echo "==================================================="
echo ""
echo "Summary:"
echo "  ✅ Story 9.1: Health endpoint returns HTTP 200"
echo "  ✅ Story 9.2: Text formatting issues resolved"
echo "  ⚠️  Manual browser console check recommended"
echo ""
echo "Deployment URL: https://genius.adamwhite.work"
echo "Version: d29a5537-56c1-45c6-ae5b-d38d7a11d4fb"
echo ""
