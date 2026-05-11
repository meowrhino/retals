# `<r-divider>`

separador decorativo. glifo tipográfico repetido, SVG, GIF o cualquier HTML interno. vanilla, light DOM, fallback con texto plano sin JS.

---

## uso mínimo

```html
<r-divider></r-divider>

<script type="module" src="components/r-divider.js"></script>
```

renderiza tres `✦` centrados.

---

## atributos

| atributo  | tipo / valores      | default | descripción |
|-----------|---------------------|---------|-------------|
| `glyph`   | string (1 carácter) | `✦`     | el glifo a repetir. ignorado si hay children. |
| `repeat`  | number              | `3`     | cuántas veces repetir el glyph (clamp: 1-50). ignorado si hay children. |
| `lang`    | `es` · `en` · `ca`  | `es`    | idioma del `aria-label` por defecto. |

si hay **children** (texto, `<img>`, `<svg>`, etc.), se renderizan tal cual centrados y el par `glyph`/`repeat` se ignora.

---

## CSS variables

| variable                | default              | qué controla              |
|-------------------------|----------------------|---------------------------|
| `--r-divider-color`     | `--r-fg` → `#1a1a1a` | color de los glifos       |
| `--r-divider-size`      | `1.2rem`             | tamaño tipográfico        |
| `--r-divider-gap`       | `1rem`               | separación entre items    |
| `--r-divider-margin`    | `1.5rem auto`        | margen exterior           |
| `--r-divider-opacity`   | `0.7`                | transparencia general     |

---

## tres ejemplos

### 1) mínimo

```html
<r-divider></r-divider>
```

### 2) glifo personalizado

```html
<r-divider glyph="✺" repeat="5"></r-divider>
```

### 3) contenido custom

```html
<r-divider style="--r-divider-color: #ef7d57; --r-divider-size: 2rem;">
  <svg width="80" height="12" viewBox="0 0 80 12" aria-hidden="true">
    <path d="M0 6 L80 6" stroke="currentColor" stroke-width="2"/>
  </svg>
</r-divider>
```

---

## accesibilidad

el componente se anota como `role="separator"` con `aria-orientation="horizontal"` y un `aria-label` traducido (`separador decorativo` / `decorative separator` / `separador decoratiu`). los glifos individuales llevan `aria-hidden="true"` para que el screen reader anuncie el divider una sola vez.

si quieres sobrescribir el label, pasa `aria-label="..."` y se respeta.

---

## comportamiento sin JS

el `<r-divider>` se renderiza como inline. los children (si los hay) son visibles, los atributos `glyph`/`repeat` se ignoran (sin JS no hay quien los repita). para fallback estilado, añade al `<head>`:

```html
<style>
  r-divider {
    display: block;
    text-align: center;
    margin: 1.5rem auto;
    color: #1a1a1a;
    font-size: 1.2rem;
    opacity: 0.7;
  }
</style>
```

---

*retals · vanilla, forever · meowrhino studio*
