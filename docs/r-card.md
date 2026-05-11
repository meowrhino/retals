# `<r-card>`

tarjeta con imagen, título, cuerpo y enlace opcional. la primera imagen child se extrae automáticamente. toda la tarjeta se convierte en enlace si se pasa `href`. vanilla, light DOM, fallback con contenido visible sin JS.

---

## uso mínimo

```html
<r-card heading="Mi proyecto">
  <p>Descripción breve.</p>
</r-card>

<script type="module" src="components/r-card.js"></script>
```

---

## atributos

| atributo  | tipo / valores     | default | descripción |
|-----------|--------------------|---------|-------------|
| `heading` | string             | —       | texto del encabezado. |
| `href`    | URL                | —       | si está presente, convierte toda la tarjeta en enlace. |
| `target`  | string             | `_self` | target del enlace. `_blank` añade `rel="noopener noreferrer"`. |
| `tag`     | `h2`·`h3`·`h4`·`p`| `h3`    | tag HTML del encabezado. |
| `lang`    | `es`·`en`·`ca`    | `es`    | — |

**contenido:** el primer `<img>` o `<picture>` child se usa como imagen (se coloca arriba con `aspect-ratio: 4/3`). el resto es el cuerpo de la tarjeta.

---

## CSS variables

| variable                  | default                      | qué controla              |
|---------------------------|------------------------------|---------------------------|
| `--r-card-bg`             | `--r-bg` → `#fef8e6`         | fondo                     |
| `--r-card-border`         | `1px solid #1a1a1a`          | borde                     |
| `--r-card-padding`        | `1rem`                       | padding del cuerpo        |
| `--r-card-radius`         | `0`                          | radio de esquinas         |
| `--r-card-shadow`         | `2px 2px 0 #1a1a1a`          | sombra hard               |
| `--r-card-img-ratio`      | `4/3`                        | aspect-ratio de la imagen |
| `--r-card-heading-size`   | `1rem`                       | tamaño del heading        |
| `--r-card-heading-color`  | `--r-fg`                     | color del heading         |
| `--r-card-content-size`   | `0.9rem`                     | tamaño del cuerpo         |

---

## tres ejemplos

### 1) mínimo
```html
<r-card heading="Proyecto">
  <p>Descripción breve del trabajo.</p>
</r-card>
```

### 2) completo
```html
<r-card heading="Studio carta" href="/studio" tag="h2">
  <img src="img/proyecto.webp" alt="captura del estudio">
  <p>Portfolio minimalista con grid de proyectos y página individual.</p>
</r-card>
```

### 3) grid de tarjetas
```html
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.5rem;">
  <r-card heading="A" href="/a"><img src="..." alt="..."><p>...</p></r-card>
  <r-card heading="B" href="/b"><img src="..." alt="..."><p>...</p></r-card>
</div>
```

---

## eventos

| evento        | cuándo      | `detail`       |
|---------------|-------------|----------------|
| `r-card:click`| al clickar  | `{ href }`     |

---

## comportamiento sin JS

el contenido original se muestra como texto e imágenes sueltas. sin estructura de tarjeta, pero legible.

---

*retals · vanilla, forever · meowrhino studio*
