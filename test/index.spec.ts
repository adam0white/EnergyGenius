import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/worker/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
// @ts-expect-error - IncomingRequestCfProperties is defined in Cloudflare Workers types
// eslint-disable-next-line no-undef
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('EnergyGenius Worker', () => {
	it('responds with health check endpoint', async () => {
		const request = new IncomingRequest('http://example.com/health');
		// Create an empty context to pass to `worker.fetch()`.
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		// Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
		await waitOnExecutionContext(ctx);
		// Health check returns 200 (ok) or 503 (degraded/error)
		expect([200, 503]).toContain(response.status);
		const json = await response.json();
		expect(json).toHaveProperty('status');
		expect(json).toHaveProperty('timestamp');
		expect(json).toHaveProperty('bindings');
	});

	it('serves static HTML for root path (integration style)', async () => {
		const response = await SELF.fetch('https://example.com');
		expect(response.status).toBe(200);
		const html = await response.text();
		expect(html).toContain('<!DOCTYPE html>');
		expect(html).toContain('EnergyGenius');
	});
});
