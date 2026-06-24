// /functions/api/users.js
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === 'GET') {
    const id = url.searchParams.get('id');
    if (!id) return new Response(JSON.stringify({ error: 'Missing user ID' }), { status: 400 });

    try {
      const user = await env.DB.prepare(`SELECT id, username, avatar, bio, created_at FROM users WHERE id = ?`).bind(id).first();
      if (!user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
      
      return new Response(JSON.stringify(user), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
