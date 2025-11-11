import { supplierCatalog, usageScenarios } from './data';

export interface Env {
  ASSETS: any;  // static assets binding
  AI: any;      // Workers AI binding
  AI_MODEL_FAST: string;
  AI_MODEL_ACCURATE: string;
  ENABLE_SSE: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Mock data endpoint for testing
    if (url.pathname === '/api/mock-data' && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          suppliers: supplierCatalog,
          scenarios: usageScenarios,
          count: {
            suppliers: supplierCatalog.length,
            scenarios: usageScenarios.length
          }
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (url.pathname === '/api/recommend' && request.method === 'POST') {
      // Placeholder: handler to be implemented in next story
      return new Response(
        JSON.stringify({ error: 'Not implemented' }),
        { status: 501, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Serve static assets
    return env.ASSETS.fetch(request);
  },
};
