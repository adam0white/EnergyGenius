#!/bin/bash

echo "==================================================="
echo "  PRODUCTION DEPLOYMENT VERIFICATION"
echo "==================================================="
echo ""
echo "URL: https://genius.adamwhite.work"
echo ""

# Test 1: Health endpoint
echo "TEST 1: Health Endpoint"
echo "---------------------------------------------------"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://genius.adamwhite.work/health)
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Health endpoint returns HTTP 200"
else
    echo "❌ Health endpoint returns HTTP $HTTP_STATUS (expected 200)"
fi
echo ""

# Test 2: Recommendation endpoint with text formatting check
echo "TEST 2: Recommendation & Text Formatting"
echo "---------------------------------------------------"
RESPONSE=$(curl -s -X POST https://genius.adamwhite.work/api/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "usage_kwh": 1000,
    "zipcode": "78701",
    "preferences": {
      "renewable_percentage": 50,
      "contract_length": "12_months",
      "price_importance": 0.7,
      "renewable_importance": 0.3
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
except:
    print('❌ Invalid JSON response')
    sys.exit(1)

# Check for recommendations
if 'recommendations' not in data or len(data['recommendations']) == 0:
    print('❌ No recommendations returned')
    sys.exit(1)

print('✅ Recommendation API working')

# Get first recommendation
rec = data['recommendations'][0]
print(f'   Plan: {rec.get(\"plan_name\", \"Unknown\")}')
print(f'   Provider: {rec.get(\"provider\", \"Unknown\")}')
print()

# Check Why section formatting
if 'why_this_plan' not in rec:
    print('❌ Missing why_this_plan field')
    sys.exit(1)

why = rec['why_this_plan']
print('TEXT FORMATTING VERIFICATION')
print('---------------------------------------------------')

# Check for formatting issues (Story 9.2)
issues = []

# Issue 1: Markdown bold markers should be removed
if '**' in why:
    issues.append('❌ Contains Markdown bold markers (**)')
else:
    print('✅ No Markdown bold markers found')

# Issue 2: Should have proper line breaks
line_count = why.count('\n')
if line_count < 2:
    issues.append(f'❌ Insufficient line breaks (found {line_count}, expected at least 2)')
else:
    print(f'✅ Proper line breaks present ({line_count} breaks)')

# Issue 3: Should contain key sections
if 'Cost Savings' not in why and 'cost savings' not in why.lower():
    issues.append('⚠️  Missing \"Cost Savings\" section (may be ok)')
else:
    print('✅ Contains Cost Savings section')

if 'Renewable Energy' not in why and 'renewable' not in why.lower():
    issues.append('⚠️  Missing \"Renewable Energy\" section (may be ok)')
else:
    print('✅ Contains Renewable Energy section')

print()

# Display sample of formatted text
print('SAMPLE OUTPUT (first 200 chars):')
print('---------------------------------------------------')
print(why[:200] + '...')
print()

if issues:
    print('FORMATTING ISSUES DETECTED:')
    for issue in issues:
        print(f'  {issue}')
    sys.exit(1)
else:
    print('✅ ALL TEXT FORMATTING CHECKS PASSED')
    print()
"

# Final status
echo ""
echo "==================================================="
echo "  DEPLOYMENT VERIFICATION COMPLETE"
echo "==================================================="
