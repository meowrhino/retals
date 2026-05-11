# guía de self-host: Workers de Cloudflare

esta guía explica cómo desplegar tus propios Workers para activar el modo compartido de `<r-counter>` y `<r-guestbook>`.

**los Workers son opcionales.** sin ellos, los componentes funcionan con localStorage.

---

## por qué self-host

retals no ofrece un Worker público compartido para todos los usuarios. mantenerlo invitaría a spam y nos comprometería a una infra que no queremos sostener.

el self-host es la respuesta honesta: tú tienes el control, tú pagas (o no — el plan gratuito de Cloudflare cubre 100k requests/día), y tus datos no pasan por ningún servidor de retals.

---

## guía completa

la guía de instalación paso a paso, con los comandos exactos, está en:

```
workers/README.md
```

---

## qué incluye cada Worker

### `workers/counter.js`
- `GET ?id=<id>` → devuelve `{ count: N }`
- `POST ?id=<id>` → incrementa y devuelve `{ count: N }`
- almacenamiento: Cloudflare KV namespace `COUNTERS`

### `workers/guestbook.js`
- `GET ?id=<id>` → devuelve array de entradas
- `POST ?id=<id>` con body `{ name, message, timestamp }` → guarda entrada
- rate limiting por IP: 1 mensaje cada 30 segundos
- límite de mensaje: 500 caracteres
- máximo 200 entradas (FIFO)
- almacenamiento: dos KV namespaces (`GUESTBOOK` y `RATELIMIT`)

---

## coste

el [plan gratuito de Cloudflare Workers](https://workers.cloudflare.com/) incluye:
- 100.000 requests por día
- KV: 100.000 lecturas/día, 1.000 escrituras/día

para una web personal, esto es más que suficiente.

---

## privacidad

- el Worker del guestbook guarda IPs temporalmente (30s) para el rate limiting. no se guardan IPs de forma permanente.
- no hay cookies, no hay analytics, no hay tracking de terceros.
- el código es tuyo — revísalo antes de desplegarlo.

---

*retals · vanilla, forever · meowrhino studio*
