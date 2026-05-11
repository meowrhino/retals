# Workers — guía de self-host

los Workers de retals son opcionales. los componentes `<r-counter>` y `<r-guestbook>` funcionan sin ellos usando localStorage. si quieres que el contador o el guestbook sea **compartido entre todos los visitantes** de tu web, sigue esta guía.

---

## requisitos

- cuenta gratuita de [Cloudflare](https://cloudflare.com) (plan Workers free: 100k requests/día)
- [Node.js](https://nodejs.org) instalado
- `wrangler` CLI: `npm install -g wrangler`

---

## 1. clonar este repo

```bash
git clone https://github.com/tu-usuario/retals
cd retals/workers
```

---

## 2. autenticarse en Cloudflare

```bash
wrangler login
```

sigue el enlace que aparece en el navegador.

---

## 3. crear los namespaces KV

### para r-counter:

```bash
wrangler kv:namespace create "COUNTERS"
```

guarda el `id` que te devuelve.

### para r-guestbook:

```bash
wrangler kv:namespace create "GUESTBOOK"
wrangler kv:namespace create "RATELIMIT"
```

guarda los dos `id`.

---

## 4. crear wrangler.toml

crea `workers/wrangler.toml` (no está en el repo — cada user tiene sus propios ids):

### para counter.js:

```toml
name = "retals-counter"
main = "counter.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "COUNTERS"
id = "<id-que-te-dio-el-paso-3>"
```

### para guestbook.js:

```toml
name = "retals-guestbook"
main = "guestbook.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "GUESTBOOK"
id = "<id-GUESTBOOK>"

[[kv_namespaces]]
binding = "RATELIMIT"
id = "<id-RATELIMIT>"
```

---

## 5. hacer deploy

```bash
wrangler deploy counter.js
wrangler deploy guestbook.js
```

wrangler te dará URLs del tipo:
```
https://retals-counter.<tu-subdomain>.workers.dev
https://retals-guestbook.<tu-subdomain>.workers.dev
```

---

## 6. usar los endpoints en tus componentes

```html
<!-- contador compartido entre todos los visitantes -->
<r-counter
  id="visitas-home"
  increment
  endpoint="https://retals-counter.<tu-subdomain>.workers.dev/counter">
</r-counter>

<!-- guestbook compartido -->
<r-guestbook
  id="mi-guestbook"
  endpoint="https://retals-guestbook.<tu-subdomain>.workers.dev/guestbook">
</r-guestbook>
```

---

## privacidad

- el Worker del guestbook almacena IPs temporalmente (30 segundos) para el rate limiting. no se guardan IPs de forma permanente.
- no hay analytics, no hay tracking, no hay cookies.
- el código es tuyo — revísalo y modifícalo antes de hacer deploy.

---

## retals no ofrece un Worker público compartido

mantener un Worker compartido para todos los users invitaría a spam y nos comprometería a una infra que no queremos sostener. el self-host es la respuesta honesta.

---

*retals · vanilla, forever · meowrhino studio*
