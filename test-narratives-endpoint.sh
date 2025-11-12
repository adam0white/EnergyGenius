#!/bin/bash
# Test script for the parallel narrative generation endpoint

API_URL="http://localhost:49857/api/narratives"

echo "Testing parallel narrative generation endpoint..."
echo "================================================="
echo ""

# Sample request payload (with usageSummary and planScoring)
REQUEST_PAYLOAD='{
  "usageSummary": {
    "averageMonthlyUsage": 892.5,
    "peakUsageMonth": "July",
    "totalAnnualUsage": 10700,
    "usagePattern": "seasonal",
    "annualCost": 1428.5
  },
  "planScoring": {
    "scoredPlans": [
      {
        "planId": "plan-cirro-energy-smart-simple-12",
        "supplier": "CIRRO ENERGY",
        "planName": "Smart Simple 12",
        "score": 85,
        "estimatedAnnualCost": 1250.0,
        "estimatedSavings": 178.5,
        "reasoning": "Best value with competitive rate",
        "renewablePercent": 10,
        "contractTermMonths": 12,
        "earlyTerminationFee": 150
      },
      {
        "planId": "plan-green-mountain-energ-pollution-free-e-plu",
        "supplier": "GREEN MOUNTAIN ENERGY COMPANY",
        "planName": "Pollution Free e-Plus 12",
        "score": 78,
        "estimatedAnnualCost": 1300.0,
        "estimatedSavings": 128.5,
        "reasoning": "100% renewable energy",
        "renewablePercent": 100,
        "contractTermMonths": 12,
        "earlyTerminationFee": 200
      },
      {
        "planId": "plan-ap-gas-electric-tx-l-trueclassic-6",
        "supplier": "AP GAS & ELECTRIC (TX) LLC",
        "planName": "TrueClassic 6",
        "score": 72,
        "estimatedAnnualCost": 1320.0,
        "estimatedSavings": 108.5,
        "reasoning": "Short contract flexibility",
        "renewablePercent": 5,
        "contractTermMonths": 6,
        "earlyTerminationFee": 100
      }
    ],
    "totalPlansScored": 3
  }
}'

echo "Sending request to: $API_URL"
echo ""

# Make the request and capture response
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_PAYLOAD")

# Check if response contains error
if echo "$RESPONSE" | grep -q "\"error\""; then
  echo "❌ ERROR DETECTED in response:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

# Check if response contains narratives
if echo "$RESPONSE" | grep -q "narratives"; then
  echo "✅ SUCCESS! Narratives generated successfully"
  echo ""
  echo "Full Response:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  echo ""

  # Check if all narratives have rationale
  NULL_COUNT=$(echo "$RESPONSE" | jq '[.narratives[] | select(.rationale == null)] | length' 2>/dev/null)

  if [ "$NULL_COUNT" -gt 0 ]; then
    echo "⚠️  WARNING: $NULL_COUNT narratives have null rationale (JSON parsing may have failed)"
    exit 1
  else
    echo "✅ All narratives have valid rationale text!"
  fi
else
  echo "⚠️  Unexpected response format:"
  echo "$RESPONSE"
  exit 1
fi

echo ""
echo "Test complete!"
