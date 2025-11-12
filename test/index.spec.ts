import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/worker/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
// @ts-expect-error - IncomingRequestCfProperties is defined in Cloudflare Workers types
// eslint-disable-next-line no-undef
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('EnergyGenius Worker', () => {
	describe('Health Endpoint', () => {
		it('returns HTTP 200 status code (not 503)', async () => {
			const request = new IncomingRequest('http://example.com/health');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			// CRITICAL: Health endpoint should ALWAYS return 200
			// Status field in response body indicates actual health state
			expect(response.status).toBe(200);
		});

		it('returns valid health check response structure', async () => {
			const request = new IncomingRequest('http://example.com/health');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			const json = (await response.json()) as any;
			expect(json).toHaveProperty('status');
			expect(json).toHaveProperty('timestamp');
			expect(json).toHaveProperty('bindings');
			expect(json).toHaveProperty('environment');
			expect(json.bindings).toHaveProperty('assets');
			expect(json.bindings).toHaveProperty('ai');

			// Status must be one of the valid values
			expect(['ok', 'degraded', 'error']).toContain(json.status);
		});

		it('handles missing ASSETS binding gracefully (development mode)', async () => {
			const request = new IncomingRequest('http://example.com/health');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			const json = (await response.json()) as any;

			// Should return HTTP 200 even without ASSETS binding
			expect(response.status).toBe(200);

			// If ASSETS is missing, status should be 'ok' (not error)
			// Missing ASSETS is acceptable in development mode
			if (!json.bindings.assets) {
				expect(['ok', 'degraded']).toContain(json.status);
				// Should have a helpful message
				if (json.message) {
					expect(json.message).toMatch(/ASSETS/i);
				}
			}
		});

		it('requires AI binding for ok status', async () => {
			const request = new IncomingRequest('http://example.com/health');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			const json = (await response.json()) as any;

			// If AI binding is missing, status should be 'error'
			if (!json.bindings.ai) {
				expect(json.status).toBe('error');
				expect(json.message).toMatch(/AI/i);
			} else {
				// If AI binding exists, status should be ok or degraded (not error)
				expect(['ok', 'degraded']).toContain(json.status);
			}
		});

		it('completes health check quickly (< 100ms)', async () => {
			const request = new IncomingRequest('http://example.com/health');
			const ctx = createExecutionContext();

			const startTime = Date.now();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);
			const duration = Date.now() - startTime;

			expect(response.status).toBe(200);
			expect(duration).toBeLessThan(100);
		});

		it('returns CORS headers', async () => {
			const request = new IncomingRequest('http://example.com/health');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
			expect(response.headers.get('Content-Type')).toBe('application/json');
		});

		it('includes version in response', async () => {
			const request = new IncomingRequest('http://example.com/health');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			const json = (await response.json()) as any;
			expect(json).toHaveProperty('version');
			expect(typeof json.version).toBe('string');
			expect(json.version.length).toBeGreaterThan(0);
		});

		it('includes timestamp in ISO format', async () => {
			const request = new IncomingRequest('http://example.com/health');
			const ctx = createExecutionContext();
			const response = await worker.fetch(request, env, ctx);
			await waitOnExecutionContext(ctx);

			const json = (await response.json()) as any;
			expect(json).toHaveProperty('timestamp');

			// Validate ISO 8601 format
			const timestamp = new Date(json.timestamp);
			expect(timestamp.toISOString()).toBe(json.timestamp);
		});
	});

	it('serves static HTML for root path (integration style)', async () => {
		const response = await SELF.fetch('https://example.com');
		expect(response.status).toBe(200);
		const html = await response.text();
		expect(html).toContain('<!DOCTYPE html>');
		expect(html).toContain('EnergyGenius');
	});
});
