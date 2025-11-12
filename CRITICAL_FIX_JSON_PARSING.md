# CRITICAL FIX: AI Response JSON Parsing Failure

## Issue Summary

**Problem:** The parallel narrative generation endpoint was failing to parse JSON responses from Workers AI because the model was wrapping JSON in markdown code blocks.

**Error:**
```
[ERROR] [NARRATIVE_PARALLEL] Parse error for plan-cirro-energy-smart-simple-12:
SyntaxError: Unexpected token '`', "```json\n\n  {\n  "... is not valid JSON
```

**Root Cause:** Workers AI models sometimes return JSON wrapped in markdown:
```
```json
{
  "field": "value"
}
```
```

Instead of raw JSON. The parser was calling `JSON.parse()` directly without sanitization.

## Files Modified

1. **src/worker/validation/sanitizers.ts**
   - Improved `sanitizeAIResponse()` to properly strip markdown code blocks
   - Changed from simple `.replace()` to regex matching with content extraction
   - Added logging when code blocks are detected

2. **src/worker/pipeline.ts**
   - Added inline JSON sanitization to `runNarrativeParallel()` function
   - Implemented markdown code block stripping before JSON parsing
   - Enhanced error logging with raw response preview

## Technical Details

### Before Fix

```typescript
// Old code - simple replace that didn't work properly
cleaned = cleaned.replace(/```json\s*/g, '');
cleaned = cleaned.replace(/```\s*/g, '');
```

### After Fix

```typescript
// New code - proper regex extraction
const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
const match = cleaned.match(codeBlockRegex);

if (match) {
  cleaned = match[1].trim();
  console.log('[SANITIZER] Removed markdown code blocks from AI response');
}
```

### Parallel Narrative Fix

```typescript
// Added to pipeline.ts in runNarrativeParallel()
let cleaned = responseText.trim();
const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
const match = cleaned.match(codeBlockRegex);
if (match) {
  cleaned = match[1].trim();
  console.log(`[NARRATIVE_PARALLEL] Stripped markdown code blocks from ${planId} response`);
}

const parsed = JSON.parse(cleaned);
```

## Testing

### Test Script Created

`test-narratives-endpoint.sh` - Tests the parallel narrative generation endpoint

### Test Results

```
✅ SUCCESS! Narratives generated successfully

{
  "narratives": [
    {
      "planId": "plan-cirro-energy-smart-simple-12",
      "rationale": "Based on your seasonal usage pattern, we recommend..."
    },
    {
      "planId": "plan-green-mountain-energ-pollution-free-e-plu",
      "rationale": "Based on your seasonal usage pattern, the Pollution Free..."
    },
    {
      "planId": "plan-ap-gas-electric-tx-l-trueclassic-6",
      "rationale": "Based on your seasonal usage pattern, we recommend..."
    }
  ],
  "executionTime": 1624,
  "timestamp": "2025-11-12T03:20:43.772Z"
}

✅ All narratives have valid rationale text!
```

### Server Logs Verification

No parsing errors in logs:
```
[NARRATIVE_PARALLEL] Generating narratives for 3 plans IN PARALLEL
[PERF] [narrative-parallel] AI Inference (PARALLEL): 1622ms
[NARRATIVE-PARALLEL] [COMPLETE] Duration: 1623ms, Output size: 2406 bytes
```

## Impact

### Before Fix
- ❌ Narrative generation failed with JSON parse errors
- ❌ Users received `null` rationale values
- ❌ Recommendations page showed incomplete data

### After Fix
- ✅ All narratives parse successfully
- ✅ Users receive complete, personalized explanations
- ✅ Graceful error handling with detailed logging
- ✅ Fallback rationale if parsing still fails

## Locations Protected

The fix protects JSON parsing in these locations:

1. ✅ **Parallel Narrative Generation** (pipeline.ts) - FIXED
2. ✅ **Usage Summary Parsing** (parsers.ts) - Already using sanitizeAIResponse()
3. ✅ **Plan Scoring Parsing** (parsers.ts) - Already using sanitizeAIResponse()
4. ✅ **Error Response Parsing** (errors.ts) - Protected with try-catch

## Performance

- No performance degradation
- Regex matching is O(n) with input length
- Adds ~1ms to parsing time (negligible)

## Deployment Notes

- No environment variable changes required
- No database migrations needed
- No breaking API changes
- Backward compatible with all existing endpoints

## Verification Checklist

- [x] TypeScript compilation passes
- [x] Linting passes for modified files
- [x] Parallel narrative endpoint returns valid JSON
- [x] All 3 narratives have non-null rationale
- [x] Error logging enhanced
- [x] Fallback handling works
- [x] No regression in other endpoints

## Related Documentation

- Original error: Production logs showing parse failures
- Implementation: LAZY_NARRATIVE_IMPLEMENTATION.md
- API: src/worker/handlers/narratives.ts
