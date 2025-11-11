# End-to-End Integration Testing Guide

## Overview

This document provides a comprehensive manual testing checklist for the Energy Recommendations Engine. All tests should be executed in the specified order to verify complete functionality.

## Testing Environment

- **Local Dev:** http://localhost:8787 (Cloudflare Workers dev)
- **Browsers:** Chrome, Safari, Firefox
- **Devices:** Desktop (1920px), Tablet (768px), Mobile (375px)
- **Tools:** Chrome DevTools, Network Inspector, Console

## Pre-Test Setup

1. Start development server: `npm run dev`
2. Open browser to http://localhost:8787
3. Open DevTools (F12)
4. Clear browser cache
5. Enable Network tab in DevTools
6. Enable Console tab to monitor errors

---

## Test Suite 1: Complete Flow Testing

### Test 1.1: Residential Scenario Flow
**Input Data:**
- Monthly Usage: 800 kWh
- Utility Type: Electric
- Location: California
- Building Type: Single family house

**Steps:**
1. [ ] Open application - verify intake form loads
2. [ ] Enter residential data in all fields
3. [ ] Click "Submit" button
4. [ ] Observe ProgressTimeline transition (Intake → Loading)
5. [ ] Verify Stage 1: Data Normalization shows "Queued" → "Running"
6. [ ] Verify Stage 2: AI Processing shows "Queued" → "Running"
7. [ ] Verify Stage 3: Synthesis shows "Queued" → "Running"
8. [ ] Wait for all stages to complete (≤20 seconds)
9. [ ] Verify transition to Results view
10. [ ] Verify RecommendationDeck displays 3 recommendations
11. [ ] Verify each recommendation has: title, description, savings
12. [ ] Click "Start Over" button
13. [ ] Verify form resets to intake state

**Expected Results:**
- ✅ All stages progress correctly
- ✅ 3 recommendations displayed
- ✅ Savings projections present ($500-1500/year)
- ✅ No console errors
- ✅ Form resets successfully

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 1.2: Business Scenario Flow
**Input Data:**
- Monthly Usage: 5000 kWh
- Utility Type: Electric + Gas
- Location: Texas
- Building Type: Retail storefront

**Steps:**
1. [ ] Ensure form is in intake state
2. [ ] Enter business data in all fields
3. [ ] Click "Submit" button
4. [ ] Observe ProgressTimeline progression
5. [ ] Wait for all 3 stages to complete
6. [ ] Verify Results view with 3 recommendations
7. [ ] Verify recommendations are business-focused
8. [ ] Verify savings projections ($3000-8000/year)
9. [ ] Click "Start Over" button

**Expected Results:**
- ✅ All stages complete successfully
- ✅ 3 business-oriented recommendations
- ✅ Higher savings projections than residential
- ✅ No console errors

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 1.3: Seasonal Scenario Flow
**Input Data:**
- Monthly Usage: 1200 kWh (or use seasonal toggle if available)
- Utility Type: Electric
- Location: Arizona
- Pattern: Summer peak (high AC usage)

**Steps:**
1. [ ] Ensure form is in intake state
2. [ ] Enter seasonal data
3. [ ] Submit form and observe timeline
4. [ ] Wait for completion
5. [ ] Verify recommendations address seasonal patterns
6. [ ] Verify savings estimates ($2000-5000/year)
7. [ ] Click "Start Over"

**Expected Results:**
- ✅ Recommendations mention seasonal patterns
- ✅ AC/cooling-related suggestions
- ✅ Seasonal savings breakdown
- ✅ No console errors

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

## Test Suite 2: Form Validation Testing

### Test 2.1: Empty Form Submission
**Steps:**
1. [ ] Ensure all form fields are empty
2. [ ] Click "Submit" button
3. [ ] Verify validation errors appear
4. [ ] Verify form does NOT submit
5. [ ] Verify error messages are clear and visible

**Expected Results:**
- ✅ Validation errors displayed
- ✅ Form does not submit
- ✅ Error messages readable

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 2.2: Invalid Monthly Usage (Zero)
**Steps:**
1. [ ] Enter 0 in monthly usage field
2. [ ] Fill other fields with valid data
3. [ ] Click "Submit"
4. [ ] Verify validation error on usage field

**Expected Results:**
- ✅ Error: "Monthly usage must be greater than 0"
- ✅ Form does not submit

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 2.3: Invalid Monthly Usage (Exceeds Max)
**Steps:**
1. [ ] Enter 50001 in monthly usage field
2. [ ] Fill other fields with valid data
3. [ ] Click "Submit"
4. [ ] Verify validation error

**Expected Results:**
- ✅ Error: "Monthly usage too high" or similar
- ✅ Form does not submit

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 2.4: Invalid Zip Code Format (if applicable)
**Steps:**
1. [ ] Enter invalid zip code (e.g., "ABCDE")
2. [ ] Fill other fields with valid data
3. [ ] Click "Submit"
4. [ ] Verify validation error

**Expected Results:**
- ✅ Zip code validation error
- ✅ Form does not submit

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 2.5: Tab Order and Focus
**Steps:**
1. [ ] Click on first form field
2. [ ] Press Tab key repeatedly
3. [ ] Verify tab order: field 1 → field 2 → field 3 → Submit button
4. [ ] Press Shift+Tab to go backwards
5. [ ] Verify reverse tab order works

**Expected Results:**
- ✅ Tab order is logical (top to bottom)
- ✅ All fields accessible via keyboard
- ✅ Focus visible on all elements

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

## Test Suite 3: Error Scenario Testing

### Test 3.1: API Timeout Simulation
**Steps:**
1. [ ] Open DevTools → Network tab
2. [ ] Throttle network to "Slow 3G" or offline
3. [ ] Submit valid form data
4. [ ] Wait for timeout (30+ seconds)
5. [ ] Verify error message displays
6. [ ] Verify "Retry" button appears
7. [ ] Restore network and click "Retry"
8. [ ] Verify request retries successfully

**Expected Results:**
- ✅ Timeout error message displayed
- ✅ Retry button visible
- ✅ Retry works after network restored

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 3.2: Network Error
**Steps:**
1. [ ] Disable network (Offline mode in DevTools)
2. [ ] Submit form
3. [ ] Verify network error message
4. [ ] Enable network
5. [ ] Click "Retry"
6. [ ] Verify successful submission

**Expected Results:**
- ✅ Clear network error message
- ✅ No app crash
- ✅ Retry mechanism works

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 3.3: Start Over from Error State
**Steps:**
1. [ ] Trigger an error (network offline)
2. [ ] Verify error state displays
3. [ ] Click "Start Over" button (if visible in error state)
4. [ ] Verify form resets to intake

**Expected Results:**
- ✅ "Start Over" accessible from error state
- ✅ Form resets correctly
- ✅ Error state cleared

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

## Test Suite 4: State Machine Verification

### Test 4.1: State Transitions
**Steps:**
1. [ ] Initial state: verify app loads in Intake state
2. [ ] Submit form: verify transition to Loading state
3. [ ] Wait for completion: verify transition to Results state
4. [ ] Click "Start Over": verify transition back to Intake
5. [ ] Verify state doesn't persist after page refresh

**Expected Results:**
- ✅ Intake → Loading → Results → Intake cycle works
- ✅ Page refresh resets to Intake
- ✅ No localStorage persistence (or intended behavior)

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

## Test Suite 5: Browser DevTools Validation

### Test 5.1: Network Tab Inspection
**Steps:**
1. [ ] Open DevTools → Network tab
2. [ ] Submit form
3. [ ] Locate POST /api/recommend request
4. [ ] Verify request headers include Content-Type: application/json
5. [ ] Verify request payload matches expected schema
6. [ ] Verify response status code: 200 (success)
7. [ ] Verify response body contains recommendations array
8. [ ] Verify no 404 or CORS errors

**Expected Results:**
- ✅ POST request visible
- ✅ Status: 200 OK
- ✅ Request payload correct
- ✅ Response has recommendations array with 3+ items
- ✅ No CORS errors

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 5.2: Console Error Check
**Steps:**
1. [ ] Open DevTools → Console tab
2. [ ] Clear console
3. [ ] Execute complete flow (intake → loading → results)
4. [ ] Verify no JavaScript errors
5. [ ] Verify no warnings (or only expected warnings)

**Expected Results:**
- ✅ No errors in console
- ✅ No unexpected warnings
- ✅ Clean console output

**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

## Test Suite 6: Cross-Browser Testing

### Test 6.1: Chrome
**Steps:**
1. [ ] Execute all tests in Google Chrome
2. [ ] Document Chrome version
3. [ ] Note any Chrome-specific issues

**Chrome Version:** _______________
**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 6.2: Safari
**Steps:**
1. [ ] Execute core flows in Safari
2. [ ] Document Safari version
3. [ ] Note any Safari-specific issues

**Safari Version:** _______________
**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

### Test 6.3: Firefox
**Steps:**
1. [ ] Execute core flows in Firefox
2. [ ] Document Firefox version
3. [ ] Note any Firefox-specific issues

**Firefox Version:** _______________
**Status:** ⬜ PASS / ⬜ FAIL
**Notes:**

---

## Summary

**Total Tests:** 18
**Tests Passed:** ___ / 18
**Tests Failed:** ___ / 18
**Critical Issues:** ___
**Non-Critical Issues:** ___

**Overall Status:** ⬜ READY FOR PRODUCTION / ⬜ NEEDS FIXES

**Tested By:** _______________
**Date:** _______________
**Environment:** _______________

---

## Known Limitations

Document any known issues or limitations discovered during testing:

1.
2.
3.

---

## Next Steps

- [ ] Address all critical issues
- [ ] Retest failed scenarios
- [ ] Document fixes in story 6.1
- [ ] Proceed to Story 6.2 (Responsive Design Polish)
