# `<r-collage>`

lienzo libre. cada bloque lleva su sitio escrito en el HTML (`x`, `y`, `w`, `rot`, `z`) y el collage entero encoge con el ancho de la pantalla. vanilla, light DOM, fallback legible sin JS.

---

## uso mínimo

```html
<r-collage width="600">
  <p x="300" y="60" w="320">hola, esto es un collage.</p>
  <img src="img/1.webp" alt="mi gata" x="200" y="220" w="240" rot="-4">
</r-collage>

<script type="module" src="components/r-collage.js"></script>
```

dentro cabe cualquier cosa: `<img>`, `<p>`, `<a>`, un `<div>` con lo que quieras, otro `r-*`.

---

## cómo se mide

- el lienzo mide **`width` unidades de ancho** (600 si no dices nada).
- una unidad vale `ancho disponible / width`, y **como mucho 1px**. en una pantalla de 1440 px, 600 unidades son 600 px, centrados. en un móvil de 390 px, 600 unidades son los 390 px: todo encoge a la vez, posiciones, anchos y letra.
- **`x` e `y` son el centro del bloque**, no su esquina. `x="300"` en un lienzo de 600 es el centro exacto.
- el alto sale solo: hasta donde llegue el bloque más bajo. si lo quieres fijo, `height`.

### los márgenes: lo que solo se ve en pantallas anchas

lo que pongas fuera de 0–`width` (un `x="-150"`, un `x="760"`) cae en los márgenes: se ve en un escritorio y **en el móvil no existe**. sirve como gesto: una nota al margen, un «gracias por venir desde el ordenador», un adorno que en el móvil estorbaría.

```html
<r-collage width="600">
  <p x="300" y="80" w="400">esto lo ve todo el mundo.</p>
  <p x="-150" y="80" w="180" rot="-4">esto, solo quien tenga pantalla ancha.</p>
</r-collage>
```

para que haya márgenes, el `<r-collage>` tiene que ocupar el ancho de la página (no lo metas en una columna estrecha). y no pongas ahí nada importante: quien usa lector de pantalla lo lee igual, pero en el móvil no se ve.

---

## atributos

de `<r-collage>`:

| atributo | tipo   | default                   | descripción |
|----------|--------|---------------------------|-------------|
| `width`  | número | `600`                     | ancho de referencia del lienzo, en unidades. |
| `height` | número | lo que ocupen los bloques | alto del lienzo, en unidades. |

de cada hijo directo:

| atributo | tipo   | default | descripción |
|----------|--------|---------|-------------|
| `x`      | número | `0`     | centro del bloque, en horizontal. |
| `y`      | número | `0`     | centro del bloque, en vertical. |
| `w`      | número | lo que ocupe | ancho del bloque. ponlo siempre en las imágenes: sin `w` salen a su tamaño real. |
| `rot`    | número | `0`     | giro en grados. negativo, hacia la izquierda. |
| `z`      | número | —       | quién va encima (el número más alto gana). sin `z`, gana el que está más abajo en el HTML. |

un hijo **sin `x` ni `y`** no se coloca: se queda donde estaría en una página normal, debajo del lienzo.

todo se aplica en vivo: cambia un `x` desde DevTools y el bloque se mueve sin recargar.

---

## eventos custom

ninguno. el collage coloca; no hay nada que pulsar.

---

## CSS variables

| variable                 | default       | qué controla |
|--------------------------|---------------|--------------|
| `--r-collage-bg`         | `transparent` | fondo del lienzo. |
| `--r-collage-font-size`  | `16`          | tamaño de letra **en unidades** (sin `px`). en el móvil encoge con todo lo demás. |

el componente escribe además unas variables por si las quieres leer en tu CSS: en `<r-collage>`, `--r-collage-u` (lo que mide una unidad, en px), `--r-collage-width` y `--r-collage-height`; en cada bloque, `--r-collage-x`, `-y`, `-w`, `-rot`, `-z`.

**dentro del collage, mide en `em`** (`padding: 0.6em`, `font-size: 2em`): así encoge con el lienzo. lo que midas en `px` o `rem` se queda igual de grande en el móvil.

---

## tres ejemplos

### 1) mínimo

```html
<r-collage width="300">
  <p x="150" y="30">hola</p>
  <p x="150" y="80">adiós</p>
</r-collage>
```

### 2) lleno: fotos giradas, apiladas y una nota al margen

```html
<r-collage width="600">
  <h1 x="300" y="60" w="500">verano 2026</h1>
  <img src="img/1.webp" alt="la playa a las ocho" x="190" y="230" w="260" rot="-5" z="1">
  <img src="img/2.webp" alt="sandía"              x="400" y="300" w="240" rot="4"  z="2">
  <p x="320" y="470" w="300" rot="-1">dos semanas sin mirar el correo.</p>
  <a href="mailto:hola@miweb.com" x="300" y="540">escríbeme</a>
  <p x="-140" y="230" w="170" rot="-6">gracias por venir desde una pantalla ancha ☼</p>
</r-collage>
```

### 3) con override de CSS

```html
<r-collage width="400" height="300"
           style="--r-collage-bg: #f5b840; --r-collage-font-size: 22;">
  <p x="200" y="120" w="300" rot="-2">fondo ámbar, letra a 22.</p>
  <span x="200" y="220" style="font-size: 3em;">✦</span>
</r-collage>
```

ojo con poner letra clara sobre `--r-collage-bg` oscuro: sin JS el fondo no se pinta y la letra clara no se lee. si quieres fondo oscuro, dáselo tú con `background` en tu CSS.

---

## en el editor de retals

en el preview del editor puedes **arrastrar los bloques** de un `<r-collage>` con el ratón: al soltar, el editor reescribe su `x` y su `y` en el código. un clic sin mover sigue siendo un clic (los enlaces y botones del preview funcionan). con el dedo no: en el móvil, arrastrar y hacer scroll del preview son el mismo gesto, así que ahí las posiciones se cambian en el código.

---

## con `<r-window>` dentro

`<r-window>` no puede ir directamente dentro de `<r-collage>`: las dos leen `x`, `y` y `w` del mismo elemento, y la ventana se coloca en px (no encoge). se envuelve en un `<div>`: el `<div>` lleva el sitio y la ventana va dentro, sin `x`/`y`/`w`.

```html
<r-collage width="600">
  <div x="170" y="110" w="280">
    <r-window title="hola" resizable="false">
      <p>el div me coloca; a mí me puedes arrastrar.</p>
    </r-window>
  </div>
</r-collage>
```

y en tu CSS, una línea para que la ventana ocupe su `<div>`:

```css
r-collage r-window.r-window--ready { position: relative; width: 100%; }
```

arrastrar funciona, también en el móvil. `resizable="false"` porque al estirar una ventana centrada el tirador se va quedando atrás.

---

## accesibilidad

- **el orden del HTML es el orden de lectura.** un lector de pantalla y la tecla Tab recorren los bloques como están escritos, no como están colocados. escríbelos en el orden en que los leerías en voz alta.
- la letra encoge en el móvil. con `width="600"` y letra a 16, en un móvil queda a unos 10 px: poco. para texto que haya que leer, sube `--r-collage-font-size` (22–24) o usa un lienzo más estrecho (`width="450"`).
- `alt` en todas las imágenes; a los adornos, `aria-hidden="true"`.

---

## comportamiento sin JS

sin JS no hay lienzo: los bloques salen uno detrás de otro, en el orden del HTML, y se lee todo (también lo de los márgenes). para que queden apilados y ninguna foto se salga, añade al `<head>`:

```html
<style>
  r-collage { display: block; }
  r-collage > * { display: block; max-width: 100%; margin: 0 auto 1rem; }
</style>
```

---

## limitaciones

- la unidad la calcula el JS al cargar y al cambiar el ancho (no es CSS puro). a cambio, un `<h1>` o un `font-size` en `em` dentro del collage escalan bien.
- no hay `h` por bloque: el alto de cada bloque es el de su contenido.
- un bloque muy girado sobresale un poco de su caja; el alto automático no lo cuenta. si se corta, pon `height`.

---

*retals · vanilla, forever · meowrhino studio*
