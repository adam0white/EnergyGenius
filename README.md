# EnergyGenius

AI-powered energy plan recommendation engine built on Cloudflare Workers and Workers AI.

## Overview

EnergyGenius helps electricity subscribers in deregulated markets find the best energy plans by analyzing usage patterns, preferences, and supplier catalogs using AI-powered recommendations.

## Documentation

- [Technical Specification](./docs/tech-spec.md)
- [Project Overview](./docs/project-overview.md)

## Development

### Prerequisites

- Node.js >= 18.x
- Cloudflare account (for deployment)

### Setup

```bash
npm install
```

### Scripts

- `npm run dev` - Start development server (both UI and Worker)
- `npm run dev:ui` - Start Vite build watch mode
- `npm run dev:worker` - Start Wrangler development server
- `npm run build` - Build production bundle
- `npm run deploy` - Build and deploy to Cloudflare Workers

### Local Development

1. Run `npm run dev` to start the development server
2. Visit `http://localhost:8787` to see the application
3. Make changes to files in `src/ui` or `src/worker` - they will automatically reload

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
