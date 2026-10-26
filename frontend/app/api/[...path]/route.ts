import type { NextRequest } from 'next/server';
import { loadEnvConfig } from '@next/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Route workers need to load the workspace .env themselves; Next is launched
// with frontend/ as its project root while the backend settings stay at repo root.
loadEnvConfig(process.cwd());

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: Context): Promise<Response> {
  const { path } = await context.params;
  const backend = process.env.API_BASE_URL || `http://127.0.0.1:${process.env.API_PORT || '5000'}`;
  const upstreamUrl = new URL(`/api/${path.map(segment => encodeURIComponent(segment)).join('/')}${request.nextUrl.search}`, backend);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch {
    return Response.json({ error: { message: 'The Meraki API is unavailable. Check that the Express server is running.' } }, { status: 503 });
  }
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('connection');
  responseHeaders.delete('transfer-encoding');
  responseHeaders.delete('content-length');
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
export const OPTIONS = forward;
