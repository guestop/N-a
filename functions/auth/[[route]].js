// /functions/auth/[[route]].js
// Handles GitHub OAuth: Login, Callback, and Logout

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.pathname.replace('/functions/auth/', '');

  const client_id = env.GITHUB_CLIENT_ID;
  const client_secret = env.GITHUB_CLIENT_SECRET;
  const redirect_uri = `${url.origin}/functions/auth/callback`;

  if (action === 'login') {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=read:user user:email`;
    return Response.redirect(githubAuthUrl, 302);
  }

  if (action === 'callback') {
    const code = url.searchParams.get('code');
    if (!code) return Response.redirect(`${url.origin}/?error=no_code`, 302);

    try {
      // 1. Exchange code for access token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ client_id, client_secret, code, redirect_uri })
      });
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // 2. Fetch User Profile
      const userRes = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'User-Agent': 'Cloudflare-Marketplace' }
      });
      const githubUser = await userRes.json();

      // 3. Upsert User in D1 Database
      const userId = `usr_${githubUser.id}`;
      const username = githubUser.login;
      const avatar = githubUser.avatar_url;
      const bio = githubUser.bio || '';

      await env.DB.prepare(
        `INSERT INTO users (id, github_id, username, avatar, bio) 
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(github_id) DO UPDATE SET 
         username=excluded.username, avatar=excluded.avatar, bio=excluded.bio`
      ).bind(userId, githubUser.id.toString(), username, avatar, bio).run();

      // 4. Create dummy JWT token for session
      // Note: In production, sign this properly using Web Crypto and env.JWT_SECRET
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ id: userId, username, avatar, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) }));
      const signature = 'dummy-signature-for-demo'; // REPLACE IN PROD
      const jwt = `${header}.${payload}.${signature}`;

      // 5. Redirect to Home with secure cookie
      const response = Response.redirect(`${url.origin}/`, 302);
      response.headers.append('Set-Cookie', `session_token=${jwt}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
      return response;

    } catch (e) {
      return Response.redirect(`${url.origin}/?error=auth_failed`, 302);
    }
  }

  if (action === 'logout') {
    const response = Response.redirect(`${url.origin}/`, 302);
    response.headers.append('Set-Cookie', `session_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
    return response;
  }

  if (action === 'me') {
    // Return current user from cookie
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')));
    const token = cookies['session_token'];
    
    if (!token) return new Response(JSON.stringify({ user: null }), { status: 200 });

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Response(JSON.stringify({ user: payload }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch(e) {
      return new Response(JSON.stringify({ user: null }), { status: 200 });
    }
  }

  return new Response('Not Found', { status: 404 });
}
