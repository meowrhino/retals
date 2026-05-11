/**
 * r-counter Worker — Cloudflare Worker para contador compartido
 *
 * GET  ?id=<id>       devuelve { count: N }
 * POST ?id=<id>       incrementa y devuelve { count: N }
 *
 * requiere un KV namespace "COUNTERS" vinculado en wrangler.toml:
 *   [[kv_namespaces]]
 *   binding = "COUNTERS"
 *   id = "<tu-kv-namespace-id>"
 *
 * deploy: wrangler deploy counter.js
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const id  = (url.searchParams.get('id') || 'default').slice(0, 64);
    const key = `counter:${id}`;

    if (request.method === 'GET') {
      const val   = await env.COUNTERS.get(key);
      const count = parseInt(val || '0', 10);
      return new Response(JSON.stringify({ count }), { headers: CORS });
    }

    if (request.method === 'POST') {
      const val   = await env.COUNTERS.get(key);
      const count = parseInt(val || '0', 10) + 1;
      await env.COUNTERS.put(key, String(count));
      return new Response(JSON.stringify({ count }), { headers: CORS });
    }

    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: CORS,
    });
  },
};
