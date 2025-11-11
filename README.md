# EnergyGenius

AI-powered energy plan recommendation engine built on Cloudflare Workers and Workers AI.

## Overview

EnergyGenius helps electricity subscribers in deregulated markets find the best energy plans by analyzing usage patterns, preferences, and supplier catalogs using AI-powered recommendations.

### Problem Statement

In deregulated energy markets, consumers face hundreds of plan options with complex pricing structures, making it difficult to identify the optimal plan for their specific usage patterns and preferences. EnergyGenius solves this by leveraging AI to analyze usage data and recommend the top 3 most suitable energy plans.

### Solution

A single-page application (SPA) built on Cloudflare Workers that:
1. Collects user energy usage data and preferences via an intuitive form
2. Processes data through a multi-stage AI pipeline
3. Generates personalized plan recommendations with detailed explanations
4. Presents results in an easy-to-understand visual format

### Key Features

- **AI-Powered Recommendations:** Multi-stage pipeline using Cloudflare Workers AI
- **Personalized Analysis:** Considers usage patterns, preferences, and risk tolerance
- **Detailed Explanations:** Each recommendation includes AI-generated rationale
- **Responsive Design:** Works seamlessly on mobile, tablet, and desktop
- **Accessible:** WCAG 2.1 Level AA compliant for inclusive user experience
- **Fast Performance:** < 100KB bundle size, optimized for speed
- **Mock Data Generator:** Quick testing with realistic scenarios

## Documentation

### Core Documentation
- [Technical Specification](./docs/tech-spec.md) - Complete technical architecture and design
- [Project Overview](./docs/project-overview.md) - High-level project summary
- [AI Pipeline Overview](./docs/pipeline-overview.md) - AI recommendation pipeline architecture

### Development Documentation
- [E2E Testing Guide](./docs/e2e-testing-guide.md) - Manual testing checklist
- [Responsive Design Verification](./docs/responsive-design-verification.md) - Mobile/tablet/desktop testing
- [Accessibility Audit](./docs/accessibility-audit.md) - WCAG 2.1 Level AA compliance report
- [Performance Optimization](./docs/performance-optimization-report.md) - Bundle size and performance metrics
- [Deployment Guide](./docs/deployment-guide.md) - Step-by-step production deployment

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers Edge                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────────────┐  │
│  │   React SPA     │◄───────►│   Worker API            │  │
│  │   (Static)      │         │   (/api/recommend)      │  │
│  └─────────────────┘         └──────────┬──────────────┘  │
│                                         │                  │
│                              ┌──────────▼──────────────┐  │
│                              │  AI Pipeline           │  │
│                              │  (3-Stage Processing)  │  │
│                              └──────────┬──────────────┘  │
│                                         │                  │
│                              ┌──────────▼──────────────┐  │
│                              │  Cloudflare Workers AI │  │
│                              │  (Llama 3.1 & 3.3)     │  │
│                              └────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AI Pipeline Stages

The recommendation engine uses a 3-stage AI pipeline:

1. **Stage 1: Data Normalization** (Queued → Running)
   - Analyzes monthly usage patterns
   - Identifies seasonal trends
   - Calculates baseline consumption
   - Duration: ~3-5 seconds

2. **Stage 2: AI Processing** (Running)
   - Scores plans against user preferences
   - Evaluates savings potential
   - Assesses renewable energy options
   - Duration: ~5-8 seconds

3. **Stage 3: Recommendation Synthesis** (Complete)
   - Generates top 3 recommendations
   - Creates AI-powered explanations
   - Calculates savings projections
   - Duration: ~3-5 seconds

**Total Pipeline Time:** 15-20 seconds (typical)

## API Documentation

### POST /api/recommend

Generate personalized energy plan recommendations based on usage data and preferences.

**Endpoint:** `POST /api/recommend`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "monthlyUsage": [
    { "month": 1, "kWh": 800 },
    { "month": 2, "kWh": 820 },
    // ... 12 months total
  ],
  "annualConsumption": 9800,
  "currentPlan": {
    "supplier": "Current Energy Co",
    "planName": "Fixed Rate 12",
    "currentRate": 0.12,
    "monthlyFee": 9.95,
    "monthsRemaining": 6,
    "earlyTerminationFee": 150
  },
  "preferences": {
    "prioritizeSavings": true,
    "prioritizeRenewable": false,
    "prioritizeFlexibility": false,
    "maxContractMonths": 12,
    "riskTolerance": "medium"
  }
}
```

**Field Constraints:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| monthlyUsage | array | Yes | 12 objects with month (1-12) and kWh (> 0) |
| annualConsumption | number | Yes | Sum of monthly usage |
| currentPlan.supplier | string | Yes | Min 1 character |
| currentPlan.currentRate | number | Yes | > 0 ($/kWh) |
| preferences.maxContractMonths | number | Yes | 1-24 months |
| preferences.riskTolerance | string | Yes | "low", "medium", or "high" |

**Response (200 OK):**

```json
[
  {
    "id": "rec_1",
    "rank": 1,
    "planName": "Green Energy Saver 12",
    "monthlyPrice": 95.50,
    "annualSavings": 450.00,
    "explanation": "This plan offers excellent savings with 50% renewable energy...",
    "supplier": "GreenPower Inc",
    "contractLength": 12,
    "earlyTerminationFee": 0,
    "renewablePercentage": 50,
    "rationale": {
      "savingsScore": 85,
      "renewableScore": 75,
      "flexibilityScore": 90,
      "overallScore": 83
    }
  },
  {
    "id": "rec_2",
    "rank": 2,
    "planName": "Fixed Rate Pro",
    "monthlyPrice": 98.25,
    "annualSavings": 420.00,
    "explanation": "Stable pricing with no surprises...",
    // ... similar structure
  },
  {
    "id": "rec_3",
    "rank": 3,
    "planName": "Flex Energy 6",
    "monthlyPrice": 100.00,
    "annualSavings": 380.00,
    "explanation": "Short-term contract with maximum flexibility...",
    // ... similar structure
  }
]
```

**Error Codes:**

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input (missing fields, invalid values) |
| 500 | Internal Server Error - AI processing failed |
| 503 | Service Unavailable - AI service temporarily unavailable |

**Example curl Request:**

```bash
curl -X POST https://energy-genius.YOUR_ACCOUNT.workers.dev/api/recommend \
  -H "Content-Type: application/json" \
  -d @request.json
```

## Development

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 8.x
- **Cloudflare account** (for deployment)
- **Wrangler CLI** (included as dev dependency)

### Setup

```bash
# Install dependencies
npm install

# Optional: Login to Cloudflare for deployment
wrangler login
```

### Available Scripts

Run `npm run help` to see all available scripts. Key scripts:

#### Development Scripts

- `npm run dev` - **Start concurrent development servers**
  - Runs both Vite (UI) and Wrangler (Worker) in parallel
  - Vite watches `src/ui/` and rebuilds to `dist/` on changes
  - Wrangler serves Worker on `http://localhost:8787` with hot reload
  - Both processes stop cleanly with Ctrl+C

- `npm run dev:ui` - **Start Vite build in watch mode**
  - Watches UI source files and rebuilds automatically
  - Outputs to `dist/` directory
  - Development mode with faster builds

- `npm run dev:worker` - **Start Wrangler development server**
  - Launches Worker on port 8787
  - Watches `dist/` and Worker source for changes
  - Provides live reload and request logging

#### Build Scripts

- `npm run build` - **Build production bundle**
  - Creates optimized, minified build in `dist/`
  - Enables tree-shaking to remove unused code
  - Generates source maps for debugging
  - Typically completes in <15 seconds
  - Output includes asset hashing for cache busting

- `npm run preview` - **Preview production build locally**
  - Serves production build from `dist/` for testing

- `npm run type-check` - **Run TypeScript type checking**
  - Validates types without emitting build output
  - Useful for CI/CD pipelines

#### Deployment Scripts

- `npm run deploy` - **Build and deploy to Cloudflare Workers**
  - Runs `npm run build` first
  - Deploys to Cloudflare using `wrangler deploy`
  - Runs post-deployment verification
  - Typically completes in <60 seconds

- `npm run deploy:worker` - **Deploy Worker without rebuilding**
  - Deploys current `dist/` to Cloudflare
  - Includes automatic health check verification

- `npm run verify:deployment` - **Verify deployed Worker**
  - Checks that Worker is responding at `/health` endpoint
  - 10-second timeout with retry logic
  - Displays helpful error messages on failure

#### Testing Scripts

- `npm test` - **Run Vitest in watch mode**
  - Executes all unit and integration tests
  - Watches for changes and reruns tests

- `npm run test:run` - **Run tests once (CI mode)**
  - Executes all tests once without watching
  - Useful for CI/CD pipelines

- `npm run test:ui` - **Open Vitest UI**
  - Launches interactive test UI in browser
  - Provides detailed test insights and debugging

#### Code Quality Scripts

- `npm run type-check` - **Run TypeScript type checking**
  - Validates types without emitting build output
  - Useful for CI/CD pipelines

- `npm run lint` - **Run ESLint**
  - Checks code for linting errors
  - Reports issues in TypeScript and React files

- `npm run lint:fix` - **Auto-fix linting errors**
  - Automatically fixes fixable ESLint issues

- `npm run format` - **Format code with Prettier**
  - Formats all TypeScript, JavaScript, JSON, and Markdown files

- `npm run format:check` - **Check code formatting**
  - Verifies code is properly formatted without making changes

- `npm run verify` - **Run all quality checks**
  - Runs type-check, lint, format:check, and test:run
  - Useful pre-commit validation

#### Utility Scripts

- `npm run help` - **Show available scripts**
  - Displays all npm scripts with descriptions

- `npm run cf-typegen` - **Generate Cloudflare Worker types**
  - Updates TypeScript types from `wrangler.toml`
  - Generates `worker-configuration.d.ts`
  - **Note:** This project uses `wrangler types` instead of `@cloudflare/workers-types`

### TypeScript Configuration

This project uses TypeScript with strict mode enabled and separate configurations for different parts of the codebase:

- `tsconfig.json` - Root configuration with project references
- `tsconfig.ui.json` - UI-specific configuration (React, DOM types)
- `tsconfig.worker.json` - Worker-specific configuration (Workers runtime types)

**Cloudflare Workers Types:**

The project uses `wrangler types` to generate TypeScript types from `wrangler.toml` instead of the deprecated `@cloudflare/workers-types` package. Types are auto-generated in `worker-configuration.d.ts`.

To regenerate types after updating `wrangler.toml`:

```bash
npm run cf-typegen
```

**Code Quality Tools:**

- **ESLint** - Lints TypeScript and React code with separate configs for UI and Worker
- **Prettier** - Enforces consistent code formatting across the project
- **Vitest** - Unit and integration testing with Cloudflare Workers runtime

### Local Development Workflow

**Quick Start:**

```bash
# 1. Start development servers
npm run dev

# 2. Open browser to http://localhost:8787

# 3. Edit files in src/ui/ or src/worker/
#    Changes will automatically reload in <1 second

# 4. Stop servers with Ctrl+C (no zombie processes)
```

**Development Features:**

- **Hot Module Reload (HMR)**: UI changes appear instantly
- **Worker Reload**: Worker changes reload automatically
- **Request Logging**: See all requests in terminal via Wrangler
- **Source Maps**: Debug production builds in browser DevTools
- **Clean Exit**: Ctrl+C stops all processes without hanging

**Typical Development Session:**

```bash
# Start development
npm run dev

# In another terminal, watch logs
wrangler tail

# Make changes to src/ui/app/App.tsx
# Browser updates automatically

# Make changes to src/worker/index.ts
# Worker reloads automatically

# Run type checking
npm run type-check

# Run tests
npm test

# Stop development
# Press Ctrl+C
```

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Verify dist/ contents
ls -lh dist/

# Preview production build locally
npm run preview
```

**Build Output:**

- Minified JavaScript with tree-shaking
- CSS bundled and optimized
- Asset hashing for cache busting (e.g., `index-a1b2c3d4.js`)
- Source maps for debugging
- Compressed assets (gzip >50% reduction)
- Performance metrics and bundle size report

**Build Validation:**

- TypeScript compilation must succeed
- No TypeScript strict mode errors
- All required files present (`src/ui/index.html`, `src/worker/index.ts`)
- wrangler.toml syntax validated

### Deployment

**Prerequisites:**

1. Cloudflare account set up
2. Wrangler authenticated: `wrangler login`
3. Account ID configured in `wrangler.toml`

**Deploy to Cloudflare:**

```bash
# Build and deploy in one command
npm run deploy

# Output shows:
# ✓ Build complete
# ✓ Deployment successful
# ✓ Health check passed
# 🌐 Worker URL: https://energy-genius.YOUR_ACCOUNT.workers.dev
```

**Manual Deployment Steps:**

```bash
# 1. Build production bundle
npm run build

# 2. Deploy to Cloudflare
wrangler deploy

# 3. Verify deployment
npm run verify:deployment
```

**Deployment Verification:**

After deployment, the script automatically:

- Checks Worker is accessible at deployed URL
- Verifies `/health` endpoint returns 200 status
- Confirms response contains `status: 'ok'`
- Retries 3 times with 2-second delays on failure
- Displays helpful error messages if verification fails

**Post-Deployment:**

```bash
# View live logs
wrangler tail

# Check dashboard
open https://dash.cloudflare.com/

# Test Worker
curl https://energy-genius.YOUR_ACCOUNT.workers.dev/health
```

### Environment Variables

Environment variables are configured in `wrangler.toml`:

```toml
[vars]
AI_MODEL_FAST = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
AI_MODEL_ACCURATE = "@cf/meta/llama-3.1-8b-instruct"
ENABLE_MOCK_DATA = "true"
ENABLE_SSE = "false"
```

**Accessing Variables in Worker:**

```typescript
// In Worker code
export default {
	async fetch(request: Request, env: Env) {
		const model = env.AI_MODEL_FAST;
		const mockEnabled = env.ENABLE_MOCK_DATA === 'true';
		// ...
	},
};
```

**Secrets (Production):**

For sensitive data (API keys, tokens), use Wrangler secrets:

```bash
# Set secret
wrangler secret put API_KEY

# List secrets
wrangler secret list

# Delete secret
wrangler secret delete API_KEY
```

**NEVER** commit secrets to `wrangler.toml` or `.env` files!

### Troubleshooting

#### Development Server Issues

**Problem**: `npm run dev` fails to start both servers

**Solutions**:

- Check Node.js version: `node --version` (must be >= 18.x)
- Check npm version: `npm --version` (must be >= 8.x)
- Kill existing processes: `killall node` (macOS/Linux)
- Clear `.wrangler/` cache: `rm -rf .wrangler/`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Problem**: Port 8787 already in use

**Solutions**:

- Find process: `lsof -i :8787` (macOS/Linux)
- Kill process: `kill -9 <PID>`
- Change port in `package.json`: `wrangler dev --port 8788`

**Problem**: Changes not reloading

**Solutions**:

- Verify Vite watch is running (check terminal output)
- Check file is in `src/ui/` (not outside watched directories)
- Try hard refresh: Cmd+Shift+R (macOS) or Ctrl+Shift+R (Windows/Linux)
- Restart dev servers: Ctrl+C, then `npm run dev`

#### Build Issues

**Problem**: Build fails with TypeScript errors

**Solutions**:

- Run type check: `npm run type-check`
- Fix reported TypeScript errors
- Ensure `tsconfig.json` is valid
- Check imports are correct (use `@/` alias for UI files)

**Problem**: Build output too large

**Solutions**:

- Check for accidentally imported large dependencies
- Verify tree-shaking is enabled in `vite.config.ts`
- Use dynamic imports for code splitting
- Run `npm run build` and check bundle size report

**Problem**: Build succeeds but app doesn't work

**Solutions**:

- Test with `npm run preview` before deploying
- Check browser console for errors
- Verify source maps are generated: `ls dist/assets/*.map`
- Ensure all assets are included in `dist/`

#### Deployment Issues

**Problem**: Deployment fails with authentication error

**Solutions**:

- Login to Wrangler: `wrangler login`
- Check account ID in `wrangler.toml` matches your account
- Verify you have permission to deploy Workers

**Problem**: Deployment succeeds but health check fails

**Solutions**:

- Check Worker URL is correct: `wrangler deployments list`
- Verify `/health` endpoint exists in Worker
- Test manually: `curl https://YOUR_WORKER.workers.dev/health`
- Check Cloudflare dashboard for Worker errors
- View logs: `wrangler tail`

**Problem**: Deployment takes too long

**Solutions**:

- Check internet connection
- Verify `dist/` size is reasonable (<5MB)
- Try deploying again (may be temporary Cloudflare issue)

#### Process Management Issues

**Problem**: Processes don't stop with Ctrl+C

**Solutions**:

- Use `killall node` (macOS/Linux) or Task Manager (Windows)
- Check for zombie processes: `ps aux | grep node`
- Restart terminal

**Problem**: "Address already in use" errors persist

**Solutions**:

- List all Node processes: `ps aux | grep node`
- Kill all: `killall node`
- Check `.wrangler/` for lock files: `rm -rf .wrangler/`

### Cross-Platform Notes

**Windows Users:**

- Use Git Bash or PowerShell for running scripts
- concurrently handles Windows process management
- Paths work across platforms (forward slashes in configs)

**macOS/Linux Users:**

- All scripts work natively
- Can use `&` syntax for background processes
- concurrently provides consistent behavior

**CI/CD Environments:**

- Scripts detect `CI=true` environment variable
- No interactive prompts in CI mode
- Full script output and timing logged

## Project Structure

```
src/
  worker/          # Cloudflare Worker code
    index.ts       # Worker entry point
    pipeline.ts    # AI pipeline orchestration
    data/          # Mock data
  ui/              # React application
    main.tsx       # React entry point
    app/           # Application components
    components/
      ui/          # shadcn/ui components
    lib/           # Utilities (cn helper)
    globals.css    # Tailwind CSS global styles
```

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Frontend**: React + Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **AI**: Cloudflare Workers AI
- **Language**: TypeScript
- **Build Tool**: Vite

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for component primitives. shadcn/ui provides accessible, customizable components built on Radix UI.

### Available Components

The following shadcn/ui components are installed and ready to use:

- `button` - Button component with variants
- `card` - Card container with header and content sections
- `input` - Input field component
- `textarea` - Textarea component for multi-line input
- `progress` - Progress bar component
- `alert` - Alert message component
- `badge` - Badge component for labels
- `accordion` - Collapsible accordion component
- `tabs` - Tab navigation component

### Using Components

Import components using the `@/` path alias:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function MyComponent() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Example Card</CardTitle>
			</CardHeader>
			<CardContent>
				<Button>Click Me</Button>
			</CardContent>
		</Card>
	);
}
```

### Adding More Components

To add additional shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

Examples: `select`, `switch`, `dropdown-menu`, `toast`, `dialog`, etc.

See the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for all available components.

### Tailwind Configuration

Tailwind CSS is configured with:

- Custom color variables for theming (light/dark mode support)
- Path aliases for component imports
- `tailwindcss-animate` plugin for animations
- Content paths covering all UI files

Configuration files:

- `tailwind.config.ts` - Tailwind theme and plugin configuration
- `postcss.config.js` - PostCSS configuration with Tailwind
- `src/ui/globals.css` - Global styles and CSS variables

## Contributing

### Bug Reports

To report bugs, please provide:
1. **Description:** Clear description of the issue
2. **Steps to Reproduce:** Exact steps to reproduce the bug
3. **Expected Behavior:** What you expected to happen
4. **Actual Behavior:** What actually happened
5. **Environment:** OS, browser version, Node.js version
6. **Screenshots:** If applicable

### Feature Requests

For feature requests, please describe:
1. **Use Case:** What problem does this feature solve?
2. **Proposed Solution:** How should it work?
3. **Alternatives Considered:** Other approaches you've considered
4. **Additional Context:** Any other relevant information

### Code Contributions

**Branch Naming:**
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

**Commit Messages:**
- Use clear, descriptive commit messages
- Follow conventional commits format when possible
- Example: "feat: add seasonal usage pattern detection"

**Pull Request Process:**
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run `npm run verify` (type-check, lint, format, tests)
5. Submit pull request with clear description
6. Ensure all CI checks pass

### Testing Requirements

Before submitting a pull request:
- ✅ Run `npm run type-check` - No TypeScript errors
- ✅ Run `npm run lint` - No linting errors
- ✅ Run `npm run format:check` - Code properly formatted
- ✅ Run `npm run test:run` - All tests pass
- ✅ Run `npm run build` - Production build succeeds
- ✅ Manual testing in browser (if UI changes)

### Code Review Process

All pull requests require:
1. Passing CI checks
2. Code review approval
3. No merge conflicts
4. Updated documentation (if applicable)

## License & Attribution

### License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 EnergyGenius

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Third-Party Libraries

This project uses the following open-source libraries:

**Frontend:**
- [React](https://react.dev/) - MIT License
- [Radix UI](https://www.radix-ui.com/) - MIT License
- [Tailwind CSS](https://tailwindcss.com/) - MIT License
- [Vite](https://vitejs.dev/) - MIT License
- [shadcn/ui](https://ui.shadcn.com/) - MIT License

**Backend:**
- [Cloudflare Workers](https://workers.cloudflare.com/) - Proprietary (Cloudflare)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) - Proprietary (Cloudflare)
- [Meta Llama 3](https://llama.meta.com/) - Meta License

**Development:**
- [TypeScript](https://www.typescriptlang.org/) - Apache 2.0 License
- [ESLint](https://eslint.org/) - MIT License
- [Prettier](https://prettier.io/) - MIT License
- [Vitest](https://vitest.dev/) - MIT License

### AI Model Attribution

This application uses **Cloudflare Workers AI** with the following models:
- **Meta Llama 3.3 70B Instruct** - Fast inference for data normalization
- **Meta Llama 3.1 8B Instruct** - Accurate inference for recommendation generation

AI-generated recommendations are clearly labeled with:
> Powered by Cloudflare Workers + AI

### Acknowledgments

- Built with [BMAD (Build Modern Apps Differently)](https://github.com/bmadcode/bmad) methodology
- Developed using Claude Code (Anthropic AI assistant)
- Deployed on Cloudflare Workers edge network

---

**Project Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** 2025-11-11

For questions, issues, or feature requests, please open an issue on GitHub.
