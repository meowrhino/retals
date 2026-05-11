# `<r-guestbook>`

libro de visitas. por defecto guarda mensajes en localStorage — solo visibles para el mismo visitante. con un Cloudflare Worker propio, los mensajes son compartidos entre todos los visitantes.

---

## uso mínimo

```html
<r-guestbook></r-guestbook>

<script type="module" src="components/r-guestbook.js"></script>
```

---

## atributos

| atributo    | tipo / valores     | default   | descripción |
|-------------|--------------------|-----------|-------------|
| `id`        | string             | `default` | identificador del guestbook. |
| `endpoint`  | URL                | —         | URL del Worker CF para modo compartido. |
| `max-chars` | number             | `280`     | límite de caracteres por mensaje. |
| `lang`      | `es`·`en`·`ca`    | `es`      | idioma de la UI. |

---

## modo localStorage (por defecto)

sin `endpoint`, los mensajes se guardan en el localStorage del visitante. no son visibles para otros. útil como demo o ejercicio personal.

⚠ el guestbook en modo localStorage guarda hasta 50 entradas por `id`. las más antiguas se descartan.

---

## modo compartido (Worker CF)

```html
<r-guestbook
  id="visitas"
  endpoint="https://mi-worker.workers.dev/guestbook">
</r-guestbook>
```

el Worker incluye:
- rate limiting: 1 mensaje por IP cada 30 segundos
- límite de longitud: 500 caracteres
- máximo 200 entradas guardadas (FIFO)

ver `workers/README.md` para desplegar tu propio Worker.

---

## CSS variables

| variable                       | default                  | qué controla               |
|--------------------------------|--------------------------|----------------------------|
| `--r-guestbook-border`         | `1px solid #1a1a1a`      | bordes del formulario      |
| `--r-guestbook-bg`             | `--r-bg`                 | fondo del formulario       |
| `--r-guestbook-entry-bg`       | `--r-bg`                 | fondo de las entradas      |
| `--r-guestbook-font-size`      | `0.9rem`                 | tamaño de fuente general   |
| `--r-guestbook-radius`         | `0`                      | radio de esquinas          |

---

## eventos

| evento                | cuándo      | `detail`                             |
|-----------------------|-------------|--------------------------------------|
| `r-guestbook:submit`  | al enviar   | `{ name, message, timestamp }`       |

---

## comportamiento sin JS

el componente queda vacío. para fallback sin JS, añade un enlace a un formulario alternativo (email, formulario externo):

```html
<r-guestbook></r-guestbook>
<noscript>
  <p>activa JavaScript para usar el libro de visitas,
     o escríbeme a <a href="mailto:hola@miweb.com">hola@miweb.com</a>.</p>
</noscript>
```

---

*retals · vanilla, forever · meowrhino studio*
