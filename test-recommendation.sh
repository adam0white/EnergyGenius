#!/bin/bash
curl -s -X POST https://genius.adamwhite.work/api/recommendations \
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
  }' | python3 -c "
import json
import sys

data = json.load(sys.stdin)
if 'error' in data:
    print('ERROR:', data['error'])
    sys.exit(1)

# Check for recommendations
if 'recommendations' not in data or len(data['recommendations']) == 0:
    print('ERROR: No recommendations returned')
    sys.exit(1)

# Get first recommendation
rec = data['recommendations'][0]
print('✅ Recommendation received')
print(f'Plan: {rec[\"plan_name\"]}')
print(f'Provider: {rec[\"provider\"]}')
print()

# Check Why section formatting
if 'why_this_plan' in rec:
    why = rec['why_this_plan']
    print('=== WHY THIS PLAN SECTION ===')
    print(why)
    print()

    # Check for formatting issues
    issues = []
    if '**' in why:
        issues.append('Contains Markdown bold markers (**)')
    if why.count('\n') < 2:
        issues.append('Missing proper line breaks')
    if 'Key Benefits:' not in why and 'key benefits' not in why.lower():
        issues.append('Missing Key Benefits section')

    if issues:
        print('⚠️  FORMATTING ISSUES DETECTED:')
        for issue in issues:
            print(f'  - {issue}')
    else:
        print('✅ Text formatting appears correct')
else:
    print('❌ Missing why_this_plan field')
"
