# `<r-marquee>`

texto desplazándose en bucle. implementado con animación CSS pura (no el `<marquee>` obsoleto). respeta `prefers-reduced-motion`. vanilla, light DOM, fallback con texto estático sin JS.

---

## uso mínimo

```html
<r-marquee>hola · retals · vanilla forever</r-marquee>

<script type="module" src="components/r-marquee.js"></script>
```

---

## atributos

| atributo         | tipo / valores     | default  | descripción |
|------------------|--------------------|----------|-------------|
| `speed`          | number (px/s)      | `60`     | velocidad de desplazamiento en píxeles por segundo. |
| `direction`      | `left` · `right`   | `left`   | sentido del movimiento. |
| `pause-on-hover` | boolean (atributo) | —        | si está presente, pausa la animación al pasar el cursor por encima. |
| `separator`      | string             | ` ✦ `    | texto que se inserta entre las dos repeticiones del contenido. |
| `gap`            | string CSS         | `0px`    | espacio adicional entre items del track (acepta cualquier valor CSS válido). |
| `lang`           | `es` · `en` · `ca` | `es`     | idioma del `aria-label`. |

el contenido puede ser texto plano o HTML inline (`<strong>`, `<em>`, emojis, etc.). bloques (`<div>`, `<p>`) no son adecuados porque el track usa `white-space: nowrap`.

---

## CSS variables

| variable              | default                 | qué controla           |
|-----------------------|-------------------------|------------------------|
| `--r-marquee-color`   | `--r-fg` → `#1a1a1a`    | color del texto        |
| `--r-marquee-size`    | `inherit`               | tamaño tipográfico     |
| `--r-marquee-bg`      | `transparent`           | fondo de la banda      |
| `--r-marquee-padding` | `0.25rem 0`             | padding vertical       |
| `--r-marquee-gap`     | `0px`                   | gap entre items del track |

---

## tres ejemplos

### 1) mínimo

```html
<r-marquee>retals · vanilla, forever · meowrhino studio</r-marquee>
```

### 2) completo

```html
<r-marquee
  speed="40"
  direction="right"
  pause-on-hover
  separator=" ◌ ">
  <strong>retals</strong> · hecho en barcelona
</r-marquee>
```

### 3) override de CSS

```html
<r-marquee style="
  --r-marquee-color: #fef8e6;
  --r-marquee-bg: #1a1a1a;
  --r-marquee-size: 1.2rem;
  --r-marquee-padding: 0.5rem 0;">
  vanilla · forever · ✦
</r-marquee>
```

---

## accesibilidad

el componente lleva `role="marquee"` y un `aria-label` descriptivo según el idioma. los separadores llevan `aria-hidden="true"` para que no se anuncien. el texto del contenido es legible por lectores de pantalla una sola vez.

si el contenido es puramente decorativo, añade `aria-hidden="true"` al elemento.

---

## `prefers-reduced-motion`

cuando el sistema tiene activada la preferencia de movimiento reducido, la animación se desactiva completamente y el texto aparece estático. el contenido sigue siendo legible.

---

## comportamiento sin JS

el contenido original se muestra como texto estático en línea. no hace falta CSS adicional para un fallback digno, pero puedes añadir:

```html
<style>
  r-marquee { display: block; overflow: hidden; white-space: nowrap; }
</style>
```

---

*retals · vanilla, forever · meowrhino studio*
