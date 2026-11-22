# collage-ventanas

starter de retals. ventanas arrastrables en un collage que encoge entero en el móvil, sobre un fondo de color sólido. estética 2000s sin los clichés de mmm.page — el HTML es tuyo y es legible.

---

## cómo usar

abre `index.html` con doble click o súbelo a Neocities / GitHub Pages. funciona sin servidor, sin dependencias externas.

---

## cómo personalizar

### cambiar tu nombre y texto

abre `index.html` en cualquier editor de texto. busca los textos entre `[corchetes]` y sustitúyelos:

```html
<h1>hola, soy<br>[tu nombre]</h1>
<p class="tagline">diseñadora · barcelona · 2026</p>
```

### mover las ventanas

las ventanas viven en un lienzo (`<r-collage width="500">`) que mide 500 de ancho. en el móvil el lienzo encoge entero; en una pantalla ancha se queda a 500 px, centrado.

cada ventana va dentro de un `<div>` que dice dónde va:

```html
<div x="170" y="110" w="290">
  <r-window title="hola" resizable="false">
    ...
  </r-window>
</div>
```

- `x`, `y`: el **centro** de la ventana (no la esquina). `x="250"` es el centro del lienzo.
- `w`: el ancho. el alto es el de lo que haya dentro.
- `rot`: giro en grados, si quieres torcer algo. `z`: quién va encima.

también puedes arrastrarlas en el navegador (no se guarda: es para quien visita).

### los márgenes

lo que pongas fuera de 0–500 (`x="-150"`, `x="700"`) solo se ve en pantallas anchas; en el móvil no existe. el starter trae ahí una nota y unos glifos. no pongas nada importante.

### cambiar el fondo

en `style.css`, en `:root`:

```css
--bg: #1a1a2e;   /* cambia este color */
```

para un fondo tileado, descomenta y ajusta en `style.css`:

```css
body {
  background-image: url('assets/tile.gif');
  background-repeat: repeat;
}
```

### cambiar la paleta de colores

en `style.css`, en `:root`:

```css
--accent:  #ef7d57;   /* color de acento (coral) */
--win-bg:  #fef8e6;   /* fondo de las ventanas */
--win-bar: #f5b840;   /* barra de título (amber) */
```

### añadir una imagen real

sustituye el placeholder en la ventana "foto":

```html
<!-- antes -->
<div class="foto-hueco">✦</div>

<!-- después -->
<img src="img/foto.webp" alt="mi foto">
```

pon tus imágenes en una carpeta `img/`. para comprimirlas antes de subir, usa [imgToWeb](https://meowrhino.github.io/imgToWeb/).

### añadir o quitar ventanas

copia un bloque completo (el `<div>` con su `<r-window>` dentro) para añadir una, o bórralo para quitarla:

```html
<div x="250" y="1320" w="260">
  <r-window title="nueva ventana" resizable="false">
    <p>contenido de la ventana.</p>
  </r-window>
</div>
```

fuera de una ventana también vale cualquier cosa: `<img src="img/foto.webp" alt="…" x="100" y="400" w="200" rot="-5">`.

---

## estos componentes son tuyos

`components/r-window.js` y `components/r-collage.js` son copias snapshot de la versión con la que se creó este starter. si retals los actualiza con cambios incompatibles, tu web no se entera — sigue usando sus propias copias.

si quieres actualizarlas, descarga un starter nuevo desde retals y reemplaza los archivos.

---

*retals · vanilla, forever · meowrhino studio*
