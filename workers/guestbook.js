/**
 * r-guestbook Worker — Cloudflare Worker para libro de visitas compartido
 *
 * GET  ?id=<id>       devuelve array de entradas (JSON)
 * POST ?id=<id>       body JSON { name, message, timestamp }
 *                     guarda la entrada, devuelve { ok: true }
 *
 * rate limiting: 1 mensaje por IP cada 30 segundos (via KV con TTL)
 * longitud máxima del mensaje: 500 caracteres
 * entradas máximas guardadas: 200 (FIFO)
 *
 * requiere dos KV namespaces en wrangler.toml:
 *   [[kv_namespaces]]
 *   binding = "GUESTBOOK"
 *   id = "<tu-kv-namespace-id>"
 *
 *   [[kv_namespaces]]
 *   binding = "RATELIMIT"
 *   id = "<tu-kv-namespace-id-2>"
 *
 * deploy: wrangler deploy guestbook.js
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
};

const MAX_CHARS    = 500;
const MAX_ENTRIES  = 200;
const RATE_LIMIT_S = 30;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const id  = (url.searchParams.get('id') || 'default').slice(0, 64);
    const key = `guestbook:${id}`;

    if (request.method === 'GET') {
      const raw     = await env.GUESTBOOK.get(key);
      const entries = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify(entries), { headers: CORS });
    }

    if (request.method === 'POST') {
      // rate limit por IP
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rlKey = `rl:${id}:${ip}`;
      const rlHit = await env.RATELIMIT.get(rlKey);
      if (rlHit) {
        return new Response(JSON.stringify({ error: 'rate limited', retryAfter: RATE_LIMIT_S }), {
          status: 429,
          headers: CORS,
        });
      }

      let body;
      try { body = await request.json(); } catch {
        return new Response(JSON.stringify({ error: 'invalid JSON' }), { status: 400, headers: CORS });
      }

      const name    = String(body.name    || '').trim().slice(0, 80);
      const message = String(body.message || '').trim();

      if (!name)    return new Response(JSON.stringify({ error: 'name required' }),    { status: 400, headers: CORS });
      if (!message) return new Response(JSON.stringify({ error: 'message required' }), { status: 400, headers: CORS });
      if ([...message].length > MAX_CHARS) {
        return new Response(JSON.stringify({ error: 'message too long' }), { status: 400, headers: CORS });
      }

      const entry = {
        name,
        message: message.slice(0, MAX_CHARS),
        timestamp: new Date().toISOString(),
      };

      const raw     = await env.GUESTBOOK.get(key);
      const entries = raw ? JSON.parse(raw) : [];
      entries.unshift(entry);
      await env.GUESTBOOK.put(key, JSON.stringify(entries.slice(0, MAX_ENTRIES)));

      // marcar rate limit con TTL
      await env.RATELIMIT.put(rlKey, '1', { expirationTtl: RATE_LIMIT_S });

      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    return new Response(JSON.stringify({ error: 'method not allowed' }), {
      status: 405,
      headers: CORS,
    });
  },
};
