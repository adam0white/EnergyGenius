#!/bin/bash
# Test script to verify narrative JSON parsing fix

API_URL="http://localhost:49857/api/recommend"

echo "Testing narrative JSON parsing fix..."
echo "=================================="
echo ""

# Sample request payload
REQUEST_PAYLOAD='{
  "energyUsageData": {
    "monthlyData": [
      {"month": "January", "usage": 850, "cost": 102},
      {"month": "February", "usage": 780, "cost": 93.6},
      {"month": "March", "usage": 720, "cost": 86.4},
      {"month": "April", "usage": 680, "cost": 81.6},
      {"month": "May", "usage": 920, "cost": 110.4},
      {"month": "June", "usage": 1100, "cost": 132},
      {"month": "July", "usage": 1250, "cost": 150},
      {"month": "August", "usage": 1200, "cost": 144},
      {"month": "September", "usage": 950, "cost": 114},
      {"month": "October", "usage": 750, "cost": 90},
      {"month": "November", "usage": 800, "cost": 96},
      {"month": "December", "usage": 900, "cost": 108}
    ]
  },
  "currentPlan": {
    "supplier": "TXU Energy",
    "planName": "Energy Plus 12",
    "currentRate": 0.12,
    "monthlyFee": 9.95,
    "contractEndDate": "2025-12-31"
  },
  "preferences": {
    "contractLength": "12",
    "greenEnergy": "yes",
    "billPredictability": "fixed"
  }
}'

echo "Sending request to: $API_URL"
echo ""

# Make the request and capture response
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_PAYLOAD")

# Check if response contains error
if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ ERROR DETECTED in response:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

# Check if response contains recommendations
if echo "$RESPONSE" | grep -q "recommendations"; then
  echo "✅ SUCCESS! Recommendations generated successfully"
  echo ""
  echo "Response preview:"
  echo "$RESPONSE" | jq '.recommendations[0:3] | .[] | {planId, rationale: (.rationale | .[0:100])}' 2>/dev/null || echo "$RESPONSE"
else
  echo "⚠️  Unexpected response format:"
  echo "$RESPONSE"
fi

echo ""
echo "Test complete!"
