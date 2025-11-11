# EnergyGenius

AI-powered energy plan recommendation engine built on Cloudflare Workers and Workers AI.

## Overview

EnergyGenius helps electricity subscribers in deregulated markets find the best energy plans by analyzing usage patterns, preferences, and supplier catalogs using AI-powered recommendations.

## Documentation

- [Technical Specification](./docs/tech-spec.md)
- [Project Overview](./docs/project-overview.md)

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

- `npm test` - **Run Vitest test suite**
  - Executes all unit and integration tests

#### Utility Scripts

- `npm run help` - **Show available scripts**
  - Displays all npm scripts with descriptions

- `npm run cf-typegen` - **Generate Cloudflare Worker types**
  - Updates TypeScript types from `wrangler.toml`

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
  }
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
