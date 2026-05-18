# portfolio-foto · starter de retals

> portfolio editorial para fotógrafx — fondo negro, tipografía ligera, galería en masonry, lightbox interno.

usa: `r-card`, `r-gallery`.

## qué incluye

- hero con nombre + bio breve + nav a 4 anchors
- 3 cards de "proyectos en curso" (imagen, título, descripción, link)
- sección "archivo" con galería masonry de 12 fotos + lightbox
- sección "sobre mí"
- footer

## personalizar

- **paleta**: por defecto modo oscuro (`--bg: #0e0e0c`). para modo claro, invierte `--bg` y `--ink`.
- **imágenes**: las del starter son placeholders de [picsum.photos](https://picsum.photos). reemplaza por tus URLs locales (`img/proyecto-01.webp`) o externas. comprime con [imgToWeb](https://meowrhino.github.io/imgToWeb/) antes.
- **proyectos**: duplica los `<r-card>` para añadir más. el slot `<img slot="image">` admite cualquier `<img>` o `<picture>`.
- **layout galería**: prueba `layout="grid"`, `layout="carousel"` o `layout="stack"` en `<r-gallery>`. cambia `cols="4"` por `cols="3"` o `cols="5"`.

## componentes incluidos

los `.js` en `components/` son **tu copia**. snapshot inmutable.

retals · vanilla, forever · meowrhino studio
