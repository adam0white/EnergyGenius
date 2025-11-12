# Testing Guide for Story 10.7 - Recommendation Data Flow Fixes

## Overview
This guide helps verify the fixes for baseRate, monthlyFee, and tier badge data flow.

## Prerequisites
- Dev server running: `npm run dev`
- Browser open to: http://localhost:8787

## Test Scenario 1: High Usage (Should show Gold/Silver tier recommendations)

### Input Data:
- **Current Rate:** 0.18 $/kWh
- **Monthly Fee:** $15
- **Monthly Usage:** Use these values for 12 months:
  - Jan-Apr: 800-900 kWh
  - May-Aug: 1200-1400 kWh (high usage months)
  - Sep-Dec: 800-900 kWh

### Expected Results:
✅ **Tier Badges:**
- At least one Gold (≥$1000 savings) or Silver (≥$500 savings) badge
- Not all Bronze

✅ **Price per kWh:**
- Should show actual rates like "$0.110/kWh", "$0.128/kWh", "$0.145/kWh"
- Should NOT show "N/A"

✅ **Monthly Service Fee:**
- Should show varied fees like "$9.95", "$7.95", "$0.00"
- Should NOT all show "$0.00"

✅ **Narrative:**
- Should correctly describe savings (e.g., "saves you $XXX per year")
- For any negative savings, should say "costs $XXX MORE per year" (not "savings")

## Test Scenario 2: Low Usage (Should show Bronze tier or mixed)

### Input Data:
- **Current Rate:** 0.12 $/kWh
- **Monthly Fee:** $5
- **Monthly Usage:** Use these values for 12 months:
  - All months: 400-600 kWh (consistently low)

### Expected Results:
✅ **Tier Badges:**
- Mostly Bronze badges (savings < $500)
- Possibly some negative savings

✅ **Price per kWh:**
- Should show actual rates (NOT "N/A")

✅ **Monthly Service Fee:**
- Should show varied fees (NOT all "$0.00")

✅ **Narrative:**
- For negative savings: Should say "additional cost" or "costs MORE"
- Should NOT say "annual savings of $-XX"

## Manual Testing Checklist

### Before Testing:
- [ ] Dev server is running
- [ ] Browser console is open (F12)
- [ ] No console errors visible

### During Testing:
- [ ] Fill out intake form with test data
- [ ] Submit form and wait for recommendations
- [ ] Check browser console for any errors

### After Recommendations Load:

#### Visual Checks:
- [ ] All 3 recommendations display
- [ ] Tier badges show colors (Gold/Silver/Bronze)
- [ ] "Price per kWh" shows dollar amounts (not "N/A")
- [ ] "Monthly Service Fee" shows dollar amounts (not all "$0.00")
- [ ] Narratives make sense (no "savings of $-XX")

#### Console Checks:
Open browser console and inspect the recommendation data:
```javascript
// Check what data was received
console.log(window.localStorage) // If data is cached
// OR look at Network tab → /api/recommend response
```

Verify the API response includes:
- `baseRate` field with values > 0
- `monthlyFee` field with values ≥ 0
- `estimatedSavings` field with varied values

## Common Issues

### Issue: Still seeing "N/A" for rate
**Check:**
1. Is baseRate in API response? (Network tab)
2. Is baseRate being mapped in frontend? (Console log recommendations)
3. Browser cache cleared?

### Issue: Still seeing "$0.00" for monthly fee
**Check:**
1. Is monthlyFee in API response?
2. Is monthlyFee being mapped in frontend?
3. Browser cache cleared?

### Issue: All Bronze badges
**Not necessarily a bug!**
- Bronze means savings < $500
- Try Test Scenario 1 (high usage, expensive current plan)
- Should produce higher savings and Gold/Silver badges

## Browser Console Commands for Debugging

```javascript
// After recommendations load, run these in console:

// 1. Check if recommendations have baseRate and monthlyFee
const recs = document.querySelector('[data-testid="recommendations"]');
console.log('Recommendations:', recs);

// 2. Check localStorage or state (if exposed)
// (Depends on implementation - adjust as needed)

// 3. Manually check API response
fetch('/api/recommend', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    // ... paste test data ...
  })
}).then(r => r.json()).then(d => {
  console.log('API Response:', d);
  console.log('First rec baseRate:', d.data.recommendations[0].baseRate);
  console.log('First rec monthlyFee:', d.data.recommendations[0].monthlyFee);
  console.log('First rec estimatedSavings:', d.data.recommendations[0].estimatedSavings);
});
```

## Success Criteria

All tests pass when:
- ✅ baseRate displays correctly (no "N/A")
- ✅ monthlyFee displays correctly (varied values, not all "$0.00")
- ✅ Tier badges vary based on savings amounts
- ✅ Narratives correctly describe positive vs negative savings
- ✅ No console errors
- ✅ All 3 recommendations render properly
