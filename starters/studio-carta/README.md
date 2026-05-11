# studio-carta

starter de retals. portfolio tipo meowrhino / rikamichie: grid de proyectos, sección sobre mí, contacto. paleta neutra, tipografía serif para títulos, sin javascript obligatorio.

---

## cómo personalizar

### tu nombre y descripción

en `index.html`, busca y reemplaza los textos entre `[corchetes]`:

```html
<title>[Tu nombre] — studio carta</title>
<a href="#" class="nav__brand">[tu nombre]</a>
<h2>soy [tu nombre],<br>diseñadora en [ciudad].</h2>
```

### añadir proyectos

copia este bloque dentro de `<div class="grid">`:

```html
<a href="url-del-proyecto" class="project">
  <div class="project__img">
    <img src="img/proyecto.webp" alt="descripción del proyecto">
  </div>
  <div class="project__body">
    <p class="project__title">nombre del proyecto</p>
    <p class="project__meta">categoría · año</p>
  </div>
</a>
```

### añadir imágenes

pon tus imágenes en una carpeta `img/`. para comprimirlas antes de subir, usa [imgToWeb](https://meowrhino.github.io/imgToWeb/).

reemplaza los placeholders de glifos (`✦`, `✺`, etc.):

```html
<!-- antes -->
<div class="project__img">✦</div>

<!-- después -->
<div class="project__img">
  <img src="img/proyecto-1.webp" alt="nombre del proyecto">
</div>
```

### cambiar colores

en `style.css`, en `:root`:

```css
--bg:     #f8f5f0;   /* fondo principal */
--accent: #ef7d57;   /* acento (coral) */
--ink:    #1a1a1a;   /* texto principal */
```

### cambiar tipografía del título

```css
.hero__title {
  font-family: var(--font-serif);   /* serif: Georgia */
  /* o cambia a:
  font-family: var(--font-mono);    /* monospace */
  /* font-family: var(--font-body); /* sans-serif */
}
```

---

## estructura

```
studio-carta/
├── index.html    ← edita aquí: nombre, proyectos, sobre, contacto
├── style.css     ← edita aquí: colores, tipografía, layout
├── img/          ← pon aquí tus imágenes
└── README.md     ← esta guía
```

---

*retals · vanilla, forever · meowrhino studio*
