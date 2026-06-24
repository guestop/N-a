// /functions/api/apps.js
export async function onRequest(context) {
  const { request, env, data } = context;
  const url = new URL(request.url);

  if (request.method === 'GET') {
    // GET /api/apps -> list all published apps
    // GET /api/apps?id=xyz -> get single app
    // GET /api/apps?publisher=xyz -> get apps for dashboard
    
    const id = url.searchParams.get('id');
    const publisher = url.searchParams.get('publisher');

    try {
      if (id) {
        const app = await env.DB.prepare(`SELECT * FROM apps WHERE id = ?`).bind(id).first();
        if (!app) return new Response(JSON.stringify({ error: 'App not found' }), { status: 404 });
        
        // Track view logic could be asynchronous here or update directly
        await env.DB.prepare(`UPDATE apps SET views = views + 1 WHERE id = ?`).bind(id).run();
        
        return new Response(JSON.stringify(app), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (publisher) {
        const { results } = await env.DB.prepare(`SELECT * FROM apps WHERE publisher_id = ? ORDER BY created_at DESC`).bind(publisher).all();
        return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      const category = url.searchParams.get('category');
      const sort = url.searchParams.get('sort') || 'newest';
      
      let query = `SELECT * FROM apps WHERE status = 'published'`;
      const binds = [];

      if (category && category !== 'All') {
        query += ` AND category = ?`;
        binds.push(category);
      }

      if (sort === 'newest') query += ` ORDER BY created_at DESC`;
      if (sort === 'most_viewed') query += ` ORDER BY views DESC`;
      if (sort === 'most_liked') query += ` ORDER BY likes DESC`;

      query += ` LIMIT 50`; // Basic pagination can be added via OFFSET

      const { results } = await env.DB.prepare(query).bind(...binds).all();
      return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  if (request.method === 'POST') {
    // Must be authenticated via _middleware.js
    if (!data.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    try {
      const body = await request.json();
      const appId = `app_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
      
      await env.DB.prepare(
        `INSERT INTO apps (id, title, description, app_url, thumbnail, publisher_id, publisher_name, category, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        appId,
        body.title,
        body.description || '',
        body.app_url,
        body.thumbnail || '',
        data.user.id,
        data.user.username,
        body.category || 'Experiments',
        body.tags || ''
      ).run();

      return new Response(JSON.stringify({ success: true, id: appId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 400 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
