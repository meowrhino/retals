# `<r-cursor>`

efectos de cursor personalizados: chispas, estela, punto o emoji siguiendo al puntero. en dispositivos táctiles no hace nada. respeta `prefers-reduced-motion`. vanilla, light DOM, fallback con cursor nativo sin JS.

---

## uso mínimo

```html
<r-cursor></r-cursor>

<script type="module" src="components/r-cursor.js"></script>
```

añade chispas (`✦ ✺ ✜ ◌ ★`) que aparecen al mover el cursor. el componente puede colocarse en cualquier parte del documento — el efecto es a nivel de página.

---

## atributos

| atributo      | tipo / valores                           | default    | descripción |
|---------------|------------------------------------------|------------|-------------|
| `effect`      | `sparkle` · `trail` · `dot` · `emoji`   | `sparkle`  | tipo de efecto. |
| `color`       | string CSS                               | `#ef7d57`  | color de los elementos del efecto. también acepta `--r-cursor-color`. |
| `size`        | number (px)                              | `12`       | tamaño base del efecto en píxeles. |
| `emoji`       | string                                   | `✦`        | carácter o emoji para `effect="emoji"`. |
| `hide-native` | boolean (atributo)                       | —          | si está presente, oculta el cursor nativo del SO. se restaura al quitar el elemento del DOM. |
| `lang`        | `es` · `en` · `ca`                      | `es`       | (sin efecto en la UI — reservado para extensiones). |

### efectos disponibles

- **`sparkle`** — crea glifos (`✦ ✺ ✜ ◌ ★`) en la posición del cursor. se animan y desaparecen (throttle a 25/seg).
- **`trail`** — ring buffer de 14 puntos con tamaño y opacidad decrecientes. sin crear DOM en cada `pointermove`.
- **`dot`** — un punto único que sigue el cursor. combina con `hide-native` para reemplazar completamente el cursor.
- **`emoji`** — un emoji/carácter sobre el cursor.

---

## CSS variables

| variable           | default           | qué controla                   |
|--------------------|-------------------|--------------------------------|
| `--r-cursor-color` | `#ef7d57` (coral) | color de los elementos         |
| `--r-cursor-size`  | `12px`            | tamaño base del efecto         |

---

## tres ejemplos

### 1) mínimo

```html
<r-cursor></r-cursor>
```

### 2) cursor personalizado que reemplaza el nativo

```html
<r-cursor
  effect="dot"
  color="#1a1a1a"
  size="8"
  hide-native>
</r-cursor>
```

### 3) emoji con color y tamaño

```html
<r-cursor
  effect="emoji"
  emoji="🐱"
  size="20"
  style="--r-cursor-color: #f5b840;">
</r-cursor>
```

---

## notas técnicas

- el componente crea un `<div class="r-cursor__overlay">` en `document.body` al conectarse. lo elimina al desconectarse.
- escucha `pointermove` en `document` con `{ passive: true }`.
- si hay varios `r-cursor` a la vez en el documento, cada uno tiene su propio overlay y se limpian de forma independiente.
- `hide-native` restaura `cursor: ''` en `<body>` al desconectarse, salvo que otro `r-cursor[hide-native]` siga activo.

---

## dispositivos táctiles

en dispositivos con `(pointer: coarse)` (móvil, tablet), el componente no hace nada. el cursor táctil nativo se respeta sin cambios.

---

## `prefers-reduced-motion`

el efecto `sparkle` omite la animación CSS de pop (los elementos aparecen y desaparecen instantáneamente vía timeout). los otros efectos (`trail`, `dot`, `emoji`) no tienen animación y no se ven afectados.

---

## comportamiento sin JS

el cursor nativo se mantiene intacto. ningún elemento extra en el DOM.

---

*retals · vanilla, forever · meowrhino studio*
