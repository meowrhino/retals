# banda-album · starter de retals

> página de lanzamiento de un disco — portada generativa, tracklist sonando, créditos en ventana arrastrable.

usa: `r-jukebox`, `r-track`, `r-window`, `r-divider`.

## qué incluye

- header con nombre de banda + título de álbum (italic Georgia coral)
- portada generativa hecha con CSS radial gradients
- jukebox al lado con 9 tracks
- ventana arrastrable con créditos
- ventana arrastrable con notas
- footer con email de booking

## audio

los `src` apuntan a `audio/01-amanecer.mp3`, etc. — esa carpeta está vacía en el starter. **pon tus mp3 ahí** con esos nombres, o cambia los `src` en `index.html`.

para comprimir audio antes de subir, usa [videoToWeb](https://meowrhino.github.io/videoToWeb/) (también admite mp3).

## personalizar

- **paleta**: `--accent` y `--soft` en `:root` controlan toda la estética.
- **portada generativa**: el `.cover` se renderiza con dos `radial-gradient`. cambia los `%` para mover los gradientes, o reemplaza por `<img src="img/cover.webp">`.
- **tracklist**: duplica `<r-track>` para añadir/quitar canciones.
- **ventanas**: las posiciones `x="30%"` `y="60%"` son relativas al wrap. arrástralas en producción para reposicionar y luego copia los nuevos valores al HTML.

## componentes incluidos

los `.js` en `components/` son **tu copia**. snapshot inmutable.

retals · vanilla, forever · meowrhino studio
