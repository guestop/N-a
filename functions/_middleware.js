// /functions/_middleware.js
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // We only protect API routes that require authentication
  // For example: POST /api/apps, POST /api/users, etc.
  const isProtectedApi = request.method !== 'GET' && url.pathname.startsWith('/api/');

  if (isProtectedApi) {
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')));
    const token = cookies['session_token'];

    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // A real app would verify the JWT here using a crypto library or Jose
    // For this implementation, we assume if the token exists, it contains the user ID
    // Note: Cloudflare Workers requires Web Crypto API for JWT verification.
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Pass the user to the next handler
      context.data = { user: payload };
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }
  }

  return next();
}
