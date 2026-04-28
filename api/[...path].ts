const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function getBackendOrigin() {
  return process.env.BACKEND_ORIGIN?.trim().replace(/\/+$/, '');
}

function buildUpstreamUrl(request: Request, backendOrigin: string) {
  const incomingUrl = new URL(request.url);
  const upstreamPath =
    incomingUrl.pathname.replace(/^\/api(?=\/|$)/, '') || '/';

  return new URL(`${upstreamPath}${incomingUrl.search}`, backendOrigin);
}

function cloneRequestHeaders(request: Request) {
  const headers = new Headers(request.headers);

  for (const headerName of HOP_BY_HOP_HEADERS) {
    headers.delete(headerName);
  }

  return headers;
}

function createMissingOriginResponse() {
  return Response.json(
    {
      error:
        'Missing BACKEND_ORIGIN environment variable for the Vercel API proxy.',
    },
    {
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

export default {
  async fetch(request: Request) {
    const backendOrigin = getBackendOrigin();

    if (!backendOrigin) {
      return createMissingOriginResponse();
    }

    const upstreamUrl = buildUpstreamUrl(request, backendOrigin);
    const headers = cloneRequestHeaders(request);
    const requestInit: RequestInit & { duplex?: 'half' } = {
      method: request.method,
      headers,
      redirect: 'manual',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      requestInit.body = request.body;
      requestInit.duplex = 'half';
    }

    return fetch(upstreamUrl, requestInit);
  },
};
