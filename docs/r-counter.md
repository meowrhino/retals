# `<r-counter>`

contador de visitas. por defecto usa localStorage — cada visitante ve el suyo propio. con un Cloudflare Worker propio, pasa a ser compartido entre todos los visitantes.

---

## uso mínimo

```html
<r-counter id="visitas" increment></r-counter>

<script type="module" src="components/r-counter.js"></script>
```

---

## atributos

| atributo    | tipo / valores     | default     | descripción |
|-------------|--------------------|-------------|-------------|
| `id`        | string             | `default`   | identificador del contador. permite varios contadores distintos en la misma página. |
| `increment` | boolean (atributo) | —           | si está presente, suma 1 cada vez que el componente se conecta. |
| `label`     | string             | `visitas`   | texto que aparece junto al número. |
| `endpoint`  | URL                | —           | URL del Worker CF para modo compartido. |
| `lang`      | `es`·`en`·`ca`    | `es`        | idioma del label por defecto. |

---

## modo localStorage (por defecto)

sin `endpoint`, el contador vive en el `localStorage` del visitante:

```html
<!-- solo muestra el número guardado -->
<r-counter id="mis-visitas"></r-counter>

<!-- suma 1 en esta carga de página -->
<r-counter id="mis-visitas" increment></r-counter>
```

⚠ **cada visitante ve su propio número.** el visitante A no ve el contador del visitante B. para un contador compartido, necesitas el Worker.

---

## modo compartido (Worker CF)

```html
<r-counter
  id="visitas-home"
  increment
  endpoint="https://mi-worker.workers.dev/counter">
</r-counter>
```

la URL del Worker se obtiene después de hacer `wrangler deploy counter.js`. ver `workers/README.md` para la guía completa.

---

## CSS variables

| variable            | default                  | qué controla         |
|---------------------|--------------------------|----------------------|
| `--r-counter-color` | `--r-fg` → `#1a1a1a`     | color del número     |
| `--r-counter-font`  | `--r-font` → monospace   | fuente               |
| `--r-counter-size`  | `1rem`                   | tamaño tipográfico   |
| `--r-counter-gap`   | `0.4em`                  | espacio nº/label     |

---

## eventos

| evento           | cuándo          | `detail`       |
|------------------|-----------------|----------------|
| `r-counter:tick` | al actualizarse | `{ count }`    |

---

## comportamiento sin JS

el elemento queda vacío. añade un fallback si lo necesitas.

---

*retals · vanilla, forever · meowrhino studio*
