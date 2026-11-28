import type { NextRequest } from 'next/server';
import { loadEnvConfig } from '@next/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Route workers need to load the workspace .env themselves; Next is launched
// with frontend/ as its project root while the backend settings stay at repo root.
loadEnvConfig(process.cwd());

type Context = { params: Promise<{ path: string[] }> };

// Upper bounds for one upstream call. The assistant can legitimately take longer because
// the API retries and falls back between Gemini models.
const UPSTREAM_TIMEOUT_MS = 30_000;
const ASSISTANT_TIMEOUT_MS = 120_000;

async function forward(request: NextRequest, context: Context): Promise<Response> {
  const { path } = await context.params;
  // `.`/`..` survive encodeURIComponent and would be resolved by URL(), escaping the /api prefix.
  if (path.some((segment) => segment === '.' || segment === '..')) {
    return Response.json({ error: { message: 'Not found.', code: 'NOT_FOUND' } }, { status: 404 });
  }
  const backend = process.env.API_BASE_URL || `http://127.0.0.1:${process.env.API_PORT || '5000'}`;
  const upstreamUrl = new URL(
    `/api/${path.map((segment) => encodeURIComponent(segment)).join('/')}${request.nextUrl.search}`,
    backend,
  );
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');
  // Node's fetch transparently decompresses responses; asking for identity avoids
  // returning a decoded body that still carries a content-encoding header.
  headers.delete('accept-encoding');
  const timeoutMs = path[0] === 'agaz' ? ASSISTANT_TIMEOUT_MS : UPSTREAM_TIMEOUT_MS;

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return Response.json(
        {
          error: {
            message: 'The Meraki API took too long to respond. Please try again.',
            code: 'UPSTREAM_TIMEOUT',
          },
        },
        { status: 504 },
      );
    }
    return Response.json(
      { error: { message: 'The Meraki API is unavailable. Check that the Express server is running.' } },
      { status: 503 },
    );
  }
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('connection');
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('transfer-encoding');
  responseHeaders.delete('content-length');
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
export const OPTIONS = forward;
