# `<r-gallery>`

galería de imágenes con cuatro layouts (`grid`, `masonry`, `carousel`, `stack`) y lightbox modal interno. vanilla, light DOM, fallback HTML sin JS.

---

## uso mínimo

```html
<r-gallery layout="grid" cols="3">
  <img src="img/1.webp" alt="cuadro coral">
  <img src="img/2.webp" alt="cuadro ámbar">
  <img src="img/3.webp" alt="cuadro ocre">
</r-gallery>

<script type="module" src="components/r-gallery.js"></script>
```

sin JS, las imágenes se ven una debajo de otra, todas accesibles y navegables. con JS, se aplica el layout elegido y al hacer click se abre el lightbox.

---

## atributos

| atributo   | valores                                            | default | descripción |
|------------|----------------------------------------------------|---------|-------------|
| `layout`   | `grid` · `masonry` · `carousel` · `stack`          | `grid`  | cómo se disponen las imágenes. |
| `cols`     | entero positivo                                    | `3`     | columnas para `grid` y `masonry`. ignorado en `carousel`/`stack`. |
| `gap`      | longitud CSS (`0.5rem`, `8px`, `1vw`…)             | `0.5rem`| separación entre items. |
| `lightbox` | `on` · `off`                                       | `on`    | si está en `off`, el click no abre el modal. |
| `start`    | índice (0 = primera)                               | `0`     | imagen inicial en `carousel` y al abrir el lightbox por defecto. |
| `lang`     | `es` · `en` · `ca`                                 | `es`    | idioma de los aria-labels y el contador. |

los atributos reaccionan en vivo: cambia `layout` o `cols` desde DevTools y la galería se rehace sin recargar.

---

## children admitidos

```html
<!-- caso normal: <img> directos -->
<r-gallery><img src="a.webp" alt=""></r-gallery>

<!-- thumb pequeño + full grande para lightbox -->
<r-gallery>
  <a href="a-full.webp"><img src="a-thumb.webp" alt=""></a>
</r-gallery>

<!-- equivalente con data-full -->
<r-gallery>
  <img src="a-thumb.webp" data-full="a-full.webp" alt="">
</r-gallery>
```

cuando hay `<a href>` envolviendo a un `<img>`, el `href` actúa como **fuente de alta resolución** para el lightbox. si `lightbox="off"`, el `<a>` se ignora también (no se sigue al click — para mantener consistencia visual entre layouts). para enlaces que vayan a otra página, no uses `r-gallery`: usa un `<a><img></a>` normal.

`<picture>` y `<figure>` **no están soportados** en esta versión. usa `<img>` simple.

---

## eventos custom

todos `bubbles: true`. escúchalos en `document`.

| evento              | cuándo                                             | `detail`                            |
|---------------------|----------------------------------------------------|-------------------------------------|
| `r-gallery:open`    | abrir el lightbox                                  | `{ index, src, alt }`               |
| `r-gallery:close`   | cerrar el lightbox (Esc, ✕ o click fuera)          | `{}`                                |
| `r-gallery:change`  | navegar a otra imagen (lightbox o carousel)        | `{ index, src, alt }`               |

ejemplo:

```html
<r-gallery id="portfolio" layout="masonry" cols="4">…</r-gallery>
<script>
  document.addEventListener('r-gallery:change', (e) => {
    if (e.target.id === 'portfolio') {
      console.log('viendo', e.detail.index, e.detail.src);
    }
  });
</script>
```

---

## CSS variables

| variable                          | fallback                            | qué controla                          |
|-----------------------------------|-------------------------------------|---------------------------------------|
| `--r-gallery-gap`                 | atributo `gap` o `0.5rem`           | separación entre items                |
| `--r-gallery-bg`                  | `transparent`                       | fondo del contenedor / carousel       |
| `--r-gallery-radius`              | `0`                                 | radio de borde de las imágenes        |
| `--r-gallery-border`              | `none`                              | borde de las imágenes                 |
| `--r-gallery-shadow`              | depende del layout                  | sombra (sobre todo en `stack`)        |
| `--r-gallery-lightbox-bg`         | `rgba(0,0,0,0.85)`                  | fondo del modal                       |
| `--r-gallery-lightbox-fg`         | `#fff`                              | texto/iconos del modal                |
| `--r-gallery-control-bg`          | `rgba(0,0,0,0.55)`                  | fondo de botones (prev/next/dots)     |
| `--r-gallery-control-bg-hover`    | `rgba(0,0,0,0.75)`                  | hover de los botones del carousel     |
| `--r-gallery-control-fg`          | `#fff`                              | texto de los botones                  |

---

## tres ejemplos

### 1) grid clásico, 4 columnas, sin lightbox

```html
<r-gallery layout="grid" cols="4" gap="0.4rem" lightbox="off">
  <img src="img/01.webp" alt="">
  <img src="img/02.webp" alt="">
  <img src="img/03.webp" alt="">
  <img src="img/04.webp" alt="">
</r-gallery>
```

### 2) masonry decorada (radio + sombra)

```html
<r-gallery
  layout="masonry"
  cols="3"
  style="--r-gallery-radius: 6px; --r-gallery-shadow: 2px 2px 0 #1a1a1a;">
  <img src="img/tall-1.webp"  alt="vertical">
  <img src="img/wide-1.webp"  alt="horizontal">
  <img src="img/tall-2.webp"  alt="otra vertical">
</r-gallery>
```

### 3) carousel con thumbs y full

```html
<r-gallery layout="carousel" start="0">
  <a href="img/full-01.webp"><img src="img/thumb-01.webp" alt="primera"></a>
  <a href="img/full-02.webp"><img src="img/thumb-02.webp" alt="segunda"></a>
  <a href="img/full-03.webp"><img src="img/thumb-03.webp" alt="tercera"></a>
</r-gallery>
```

flechas + dots aparecen automáticamente si hay más de una imagen. click sobre la imagen activa abre el lightbox con la versión `full`.

---

## accesibilidad

- cada item es un `<button>` real con `aria-label` traducido por `lang`.
- el lightbox es un `role="dialog"` con `aria-modal="true"`.
- al abrir, el foco se mueve al botón cerrar; al cerrar, vuelve al elemento que tenía el foco antes.
- atajos de teclado dentro del lightbox: **Esc** cierra, **←/→** navegan.
- el `alt` de cada imagen se hereda al `<img>` del lightbox y al caption.

---

## comportamiento sin JS

| con JS                                  | sin JS                                          |
|-----------------------------------------|-------------------------------------------------|
| layout aplicado + lightbox modal        | imágenes apiladas verticalmente, navegables     |

como el CSS del componente vive en su propio `.js`, sin JS no hay regla de layout: las imágenes se renderizan en stream vertical (la regla mínima del fallback es `display: block; max-width: 100%`). esto es legible y honesto: pierdes el grid bonito pero no el contenido.

si quieres un fallback estilado para los casos extremos sin JS, mete tu propia regla CSS en el `<head>` para `r-gallery > img` antes del componente — al añadirse la clase `r-gallery--ready`, las reglas internas la sobrescriben.

---

## limitaciones conocidas

- `<picture>` y `<figure>` no se reconocen como items.
- `masonry` usa `column-count` (true masonry de CSS), no JS — el orden de las imágenes va por columnas, no por filas. si necesitas orden por filas, usa `grid`.
- en `stack`, el ángulo de rotación se calcula por índice (es determinista, no aleatorio en cada carga).
- el carousel **no** trae autoplay en esta versión. añadirlo es una línea, pero contra-recomendamos autoplay por accesibilidad. si lo necesitas, escucha `r-gallery:change` y lanza un `setInterval` con `_step(+1)` desde tu propio JS.
- el lightbox sólo cierra con click fuera de la imagen (sobre el fondo oscuro), no clicando la propia imagen. esto es intencional: facilita usar el cursor para descansar entre flecha y flecha.

---

*retals · vanilla, forever · meowrhino studio*
