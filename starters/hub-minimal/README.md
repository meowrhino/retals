# hub-minimal · starter de retals

> linktree honesto — un puñado de links, contador de visitas local, reloj de tu ciudad, cursor decorativo. cero JS extra.

usa: `r-cursor`, `r-divider`, `r-counter`, `r-clock`.

## qué incluye

- avatar circular CSS (sin imagen — se genera con `radial-gradient`)
- nombre + bio breve (2 líneas)
- 5 links centrados con hover
- contador de visitas (localStorage, no compartido)
- reloj en vivo de tu ciudad
- cursor decorativo (sparkle ✸ coral)

## personalizar

- **nombre y bio**: cambia `<h1 class="name">june</h1>` y el `<p class="bio">`.
- **avatar**: si quieres una foto, sustituye `<div class="avatar">` por `<img class="avatar" src="img/avatar.webp">` (mantén el `border-radius: 50%`).
- **links**: duplica los `<a class="link">`. el ícono final `→` puedes cambiarlo a `↗`, `↪`, lo que quieras.
- **paleta**: `--bg` `--accent` en `:root`.
- **counter compartido entre visitantes**: añade `endpoint="https://tu-worker.workers.dev/"` al `<r-counter>` después de desplegar el Worker (ver `docs/self-host-workers.md`).
- **reloj otra ciudad**: añade `timezone="America/Mexico_City"` al `<r-clock>`.

## componentes incluidos

los `.js` en `components/` son **tu copia**. snapshot inmutable.

retals · vanilla, forever · meowrhino studio
