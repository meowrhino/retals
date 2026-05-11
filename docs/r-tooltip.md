# `<r-tooltip>`

tooltip accesible anclado a un elemento. posición configurable, trigger hover/focus/click, delay. vanilla, light DOM, fallback con atributo `title` sin JS.

---

## uso mínimo

```html
<r-tooltip text="soy un tooltip">
  <button>hover aquí</button>
</r-tooltip>

<script type="module" src="components/r-tooltip.js"></script>
```

---

## atributos

| atributo   | tipo / valores                     | default  | descripción |
|------------|------------------------------------|----------|-------------|
| `text`     | string                             | —        | texto del tooltip. |
| `position` | `top` · `bottom` · `left` · `right`| `top`    | posición relativa al trigger. |
| `trigger`  | `hover` · `click`                  | `hover`  | cómo se activa. el focus siempre activa el tooltip. |
| `delay`    | number (ms)                        | `0`      | retardo antes de mostrar. |
| `lang`     | `es` · `en` · `ca`                | `es`     | idioma del aria-label. |

para contenido HTML rico en el tooltip, añade un child con `data-tooltip-content`:

```html
<r-tooltip text="label accesible" position="bottom">
  <button>info</button>
  <div data-tooltip-content>
    <strong>título</strong><br>descripción rica
  </div>
</r-tooltip>
```

---

## CSS variables

| variable               | default                        | qué controla          |
|------------------------|--------------------------------|-----------------------|
| `--r-tooltip-bg`       | `--r-fg` → `#1a1a1a`           | fondo del tooltip     |
| `--r-tooltip-color`    | `--r-bg` → `#fef8e6`           | color del texto       |
| `--r-tooltip-size`     | `0.8rem`                       | tamaño tipográfico    |
| `--r-tooltip-padding`  | `0.3rem 0.65rem`               | padding interior      |
| `--r-tooltip-radius`   | `2px`                          | radio de esquinas     |
| `--r-tooltip-offset`   | `8px`                          | distancia al trigger  |
| `--r-tooltip-z`        | `1000`                         | z-index               |

---

## tres ejemplos

### 1) mínimo
```html
<r-tooltip text="hola">
  <span>pásame el cursor</span>
</r-tooltip>
```

### 2) completo
```html
<r-tooltip text="más información" position="right" trigger="click" delay="200">
  <button>click para info</button>
</r-tooltip>
```

### 3) override CSS
```html
<r-tooltip text="tooltip coral" style="--r-tooltip-bg:#ef7d57;--r-tooltip-color:#fef8e6;">
  <abbr>CSS</abbr>
</r-tooltip>
```

---

## accesibilidad

- el tooltip lleva `role="tooltip"` con un `id` único
- el trigger lleva `aria-describedby` apuntando al tooltip
- `Escape` cierra el tooltip en modo click
- con `trigger="click"` se cierra al pulsar fuera del elemento

---

## comportamiento sin JS

el tooltip no se muestra. el contenido del trigger (el texto del botón, abbr, etc.) es visible. añade un atributo `title` al trigger para el fallback nativo del navegador.

---

*retals · vanilla, forever · meowrhino studio*
