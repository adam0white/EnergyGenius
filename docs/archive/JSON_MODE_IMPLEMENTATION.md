# Workers AI JSON Mode Implementation

## Summary
Fixed persistent JSON parsing issues where AI was returning text after valid JSON.

## Changes Made

### 1. Enhanced JSON Sanitizer (`src/worker/validation/sanitizers.ts`)
- **Added `extractFirstJSON()` function** with bracket depth tracking
  - Finds first `{` or `[`
  - Tracks bracket depth accounting for strings and escapes
  - Stops at matching closing bracket
  - Ignores everything after the closing bracket
- **Updated `sanitizeAIResponse()`** to use the new extractor
  - Removes markdown code blocks
  - Removes comment markers
  - Extracts ONLY first complete JSON structure
  - Falls back gracefully on extraction errors

### 2. Enabled JSON Mode in AI Calls (`src/worker/pipeline.ts`)
- **Added `response_format: { type: 'json_object' }` to all three AI stages:**
  - `runUsageSummary()` - Stage 1
  - `runPlanScoring()` - Stage 2
  - `runNarrative()` - Stage 3

## How It Works

### JSON Mode Parameter
Workers AI now receives:
```typescript
const aiResponse = await env.AI.run(modelId, {
  prompt,
  max_tokens: 1024,
  response_format: { type: 'json_object' }  // <-- Forces JSON output
});
```

This instructs the LLM to:
- Return ONLY valid JSON
- Not add explanatory text before/after
- Follow JSON schema more strictly

### Robust JSON Extraction
If AI still adds text after JSON (fallback safety):
```typescript
function extractFirstJSON(text: string): string {
  // Find first { or [
  // Track depth: +1 for {/[, -1 for }/]
  // When depth reaches 0, stop
  // Return substring from start to closing bracket
}
```

Example input:
```
{ "valid": "json" }
This is incorrect. Here is the correct response:
{ "another": "json" }
```

Example output:
```
{ "valid": "json" }
```

## Testing Instructions

1. **Rebuild:**
   ```bash
   npm run build
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Submit form with test data**

4. **Check logs for:**
   - `response_format: { type: 'json_object' }` in AI calls
   - Clean JSON parsing without sanitizer errors
   - Successful validation of all three stages

5. **Verify recommendations appear** in the UI

## Expected Improvements

- **No more "Unexpected token" errors** from trailing text
- **Cleaner AI responses** conforming to JSON schema
- **Faster parsing** (no complex sanitization needed)
- **Higher reliability** with double protection (JSON mode + extractor)

## Model Compatibility

The `llama-3.3-70b-instruct-fp8-fast` model supports JSON mode via the `response_format` parameter. This is standard across:
- Llama 3.x models on Workers AI
- OpenAI-compatible models
- Most modern instruction-tuned LLMs

## Rollback Plan

If issues occur:
1. Remove `response_format` parameter from AI calls
2. Rely solely on enhanced `extractFirstJSON()` sanitizer
3. The sanitizer is backward compatible with old behavior
