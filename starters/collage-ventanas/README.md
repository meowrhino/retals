# collage-ventanas

starter de retals. ventanas arrastrables sobre un fondo de color sólido. estética 2000s sin los clichés de mmm.page — el HTML es tuyo y es legible.

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

### mover y redimensionar ventanas

cada `<r-window>` tiene atributos `x`, `y`, `w`, `h` (en píxeles):

```html
<r-window title="hola" x="60" y="40" w="280" h="160">
  ...
</r-window>
```

también puedes arrastrarlas directamente en el navegador.

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
<div style="width:100%;height:200px;background:#333;...">✦</div>

<!-- después -->
<img src="img/foto.webp" alt="mi foto">
```

pon tus imágenes en una carpeta `img/`. para comprimirlas antes de subir, usa [imgToWeb](https://meowrhino.github.io/imgToWeb/).

### añadir o quitar ventanas

copia un bloque `<r-window>` completo para añadir una, o bórralo para quitarla:

```html
<r-window title="nueva ventana" x="200" y="300" w="250" h="150">
  <p>contenido de la ventana.</p>
</r-window>
```

---

## estos componentes son tuyos

`components/r-window.js` es una copia snapshot de la versión con la que se creó este starter. si retals actualiza `r-window` con cambios incompatibles, tu web no se entera — sigue usando su propia copia.

si quieres actualizarla, descarga un starter nuevo desde retals y reemplaza el archivo.

---

*retals · vanilla, forever · meowrhino studio*
