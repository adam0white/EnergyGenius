#!/usr/bin/env node

/**
 * Help script - displays available npm scripts and their descriptions
 */

console.log('\n' + '='.repeat(80));
console.log('  ENERGYGENIUS - AVAILABLE NPM SCRIPTS');
console.log('='.repeat(80));

const scripts = [
	{
		command: 'npm run dev',
		description: 'Start concurrent development servers (Vite + Wrangler)',
		details: 'Runs both dev:ui and dev:worker in parallel with hot reload',
	},
	{
		command: 'npm run dev:ui',
		description: 'Start Vite build in watch mode',
		details: 'Watches src/ui/ for changes and rebuilds to dist/',
	},
	{
		command: 'npm run dev:worker',
		description: 'Start Wrangler development server',
		details: 'Launches Worker on http://localhost:8787 with live reload',
	},
	{
		command: 'npm run build',
		description: 'Build production bundle',
		details: 'Creates optimized, minified build in dist/ directory',
	},
	{
		command: 'npm run deploy',
		description: 'Build and deploy to Cloudflare Workers',
		details: 'Runs build + wrangler deploy + verification',
	},
	{
		command: 'npm run deploy:worker',
		description: 'Deploy Worker without rebuilding',
		details: 'Deploys current dist/ to Cloudflare and verifies',
	},
	{
		command: 'npm run verify:deployment',
		description: 'Verify deployed Worker is responding',
		details: 'Runs health check against deployed Worker URL',
	},
	{
		command: 'npm run preview',
		description: 'Preview production build locally',
		details: 'Serves production build from dist/ for testing',
	},
	{
		command: 'npm run type-check',
		description: 'Run TypeScript type checking',
		details: 'Validates types without emitting build output',
	},
	{
		command: 'npm test',
		description: 'Run Vitest test suite',
		details: 'Executes all unit and integration tests',
	},
	{
		command: 'npm run help',
		description: 'Show this help message',
		details: 'Displays available scripts and usage information',
	},
	{
		command: 'npm run cf-typegen',
		description: 'Generate Cloudflare Worker types',
		details: 'Updates TypeScript types from wrangler.toml',
	},
];

scripts.forEach((script, index) => {
	console.log(`\n${index + 1}. ${script.command}`);
	console.log(`   ${script.description}`);
	console.log(`   → ${script.details}`);
});

console.log('\n' + '='.repeat(80));
console.log('  DEVELOPMENT WORKFLOW');
console.log('='.repeat(80));

console.log(`
1. Setup:     npm install
2. Develop:   npm run dev
3. Test:      npm test
4. Build:     npm run build
5. Deploy:    npm run deploy

For more information, see README.md
`);

console.log('='.repeat(80) + '\n');
