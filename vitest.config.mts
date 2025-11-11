import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.toml' },
			},
		},
		testTimeout: 10000, // 10 seconds default timeout for all tests
		hookTimeout: 10000, // 10 seconds for beforeEach/afterEach hooks
	},
});
