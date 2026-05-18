# ROADMAP — retals

> hoja de ruta por fases. cada fase es publicable y útil por sí sola. no hace falta llegar al final para que valga la pena.

## leyenda
- 🟢 fácil (un commit, horas)
- 🟡 medio (varios commits, días)
- 🔴 complejo (semanas)

---

## Fase 0 — manifiesto + landing 🟢

la entrada pública al proyecto. **gran parte ya está hecha** en el scaffold inicial — esta fase es solo refinar y verificar.

- [x] `editor/index.html` con el manifiesto (presente, revisar copy)
- [x] `editor/style.css` con la paleta meowrhino (presente)
- [x] favicon y mascota en `editor/assets/` (placeholder pixel art 8x8 — sustituir si Manu tiene la oficial de moixí, si no, dejar el placeholder)
- [x] footer estándar `made in barcelona ☼ meowrhino studio · vanilla, forever`
- [x] README.md público con resumen y links
- [ ] verificar que carga sin JS y sin errores en consola
- [ ] dejar marcados con TODO los dos slots vacíos (`#bloques`, `#starters`) para Fases 1-3

**criterio de done**: `python3 -m http.server 8080 → http://localhost:8080/editor/` carga sin errores en consola. la paleta meowrhino se ve correcta (coral/ámbar sobre cream). las dos secciones futuras (`#bloques`, `#starters`) están marcadas con `<!-- TODO -->` visible en el HTML para que las próximas fases sepan dónde insertar.

---

## Fase 1 — primer Web Component end-to-end 🟡

empezar con **`<r-window>`** porque prueba todos los patrones del contrato: atributos, slots, fallback, drag, theming, eventos.

- [ ] `components/_template.js` con el esqueleto base (ver CLAUDE.md)
- [ ] `components/r-window.js` implementando la API completa:
  - atributos: `title`, `x`, `y`, `w`, `h`, `theme` (win95|macos|none), `resizable`, `closable`, `minimizable`
  - drag desde la barra de título
  - resize desde la esquina inferior derecha
  - close emite evento `r-window:close`
  - fallback: un `<div>` con borde, título arriba, contenido debajo (sin drag, pero legible)
- [ ] `editor/demos/r-window.html` con varias ventanas usándose
- [ ] `docs/r-window.md` con ejemplos copy-paste

**criterio de done**: pegas el snippet del docs en un HTML cualquiera, funciona, y sigue mostrando algo decente con JS desactivado.

---

## Fase 2 — biblioteca de bloques 🟡

publicar componentes uno a uno. **cada uno con docs + demo + test de fallback**.

orden sugerido (de más simple a más complejo):

- [x] `r-divider` 🟢 — separador decorativo (svg, gif, o glifo tipográfico)
- [x] `r-marquee` 🟢 — texto en movimiento, configurable (no el `<marquee>` viejo)
- [x] `r-typewriter` 🟢 — texto que se escribe solo
- [x] `r-clock` 🟢 — reloj en vivo con formato
- [x] `r-glitch` 🟢 — texto glitcheado
- [x] `r-tooltip` 🟡 — tooltip que sigue cursor o pegado a elemento
- [x] `r-card` 🟡 — tarjeta con slots (image, title, body, link)
- [x] `r-tabs` 🟡 — tabs accesibles con keyboard nav
- [x] `r-accordion` 🟡 — secciones expandibles
- [x] `r-gallery` 🟡 — galería con layouts (grid, masonry, carousel, stack) + lightbox
- [x] `r-jukebox` 🟡 — reproductor de audio con playlist (children `<r-track>`)
- [x] `r-cursor` 🟢 — efectos de cursor (sparkle, trail, custom)

**criterio de done por componente**: respeta CLAUDE.md, tiene su `docs/r-<name>.md`, tiene demo en `editor/demos/`, pasa TESTING.md.

---

## Fase 3 — primer starter (`collage-ventanas`) 🟡

**solo uno** en esta fase. los otros tres se hacen en Fase 7. razón: hacer cuatro a la vez los acaba todos a medias y todos iguales. concentramos esfuerzo en el que más justifica el proyecto y prueba la cadena completa.

elegimos `collage-ventanas` porque (a) es el más distintivo del proyecto, (b) usa `r-window` que ya está implementado en Fase 1, y (c) demuestra el valor de retals frente a un starter genérico tipo blog.

- [ ] `starters/collage-ventanas/`
  - `index.html` con varias `<r-window>` arrastrables como composición
  - fondo a color sólido vibrante o GIF tileado
  - glifos ✺ ✦ ◌ ✜ en lugar de iconos modernos
  - `style.css` propio (puede sobrescribir las `--r-*` vars sin importar la paleta meowrhino)
  - `components/r-window.js` copiado dentro del starter (snapshot inmutable, ver CLAUDE.md → versionado)
  - `README.md` explicando cómo personalizar texto, imágenes, colores y posiciones
  - opcional: 2-3 GIFs tileables ligeros en `assets/`

el starter debe:
- pesar < 50kb sin contar media
- pasar Lighthouse 90+
- funcionar offline (`file://`, doble click al `index.html`)
- funcionar subido a Neocities (verificar manualmente)

**criterio de done**: descargas el starter como carpeta, abres `index.html` con doble click, ves la composición funcionando. lo subes a Neocities y sigue funcionando. lo personalizas modificando solo HTML y CSS sin tocar JS.

**los otros starters (`studio-carta`, `one-pager`, `archivo`) se posponen a Fase 7.** dejar las carpetas con un `README.md` "próximamente, ver Fase 7" para que la estructura no engañe.

---

## Fase 4 — editor en navegador 🔴 ✅ (cerrada 2026-05-11)

el split-view tres columnas. la parte más ambiciosa.

- [x] `editor/editor.html` con layout de 3 paneles: biblioteca · código · preview
- [x] panel de biblioteca: lista de los 15 bloques con descripción + complexity dot. (preview en miniatura queda como mejora Fase 8 — no aporta tanto como nombre/desc/snippet legible.)
- [x] panel de código:
  - `<textarea>` monoespaciada con `tab-size: 2`. sin resaltado de sintaxis.
  - Tab indenta (incl. multilinea con Shift+Tab para des-indentar), Cmd/Ctrl+Z delegado al navegador.
- [x] panel de preview:
  - iframe con `sandbox="allow-scripts allow-same-origin"` y `srcdoc`
  - live reload con debounce 300ms
  - parsing por regex de tags `r-*` → inyecta sólo los `<script type="module">` necesarios. mapeo de tags-hijo (`r-track`, `r-tab`, `r-panel`) → archivo del padre en `editor/js/library.js`.
- [x] click en bloque de biblioteca → inserta snippet en posición de cursor del código (con `\n` automáticos si no estás en línea limpia).
- [x] toolbar: nuevo, cargar starter (selector con los 4), importar/exportar `.retals.json`, comprimir media (placeholder de Fase 5), descargar zip.
- [x] descarga: ZIP autocontenido con `index.html` + `README.md` + sólo los `components/r-X.js` usados. ZIP "store mode" vanilla (cero dependencias) implementado en [editor/js/zip.js](editor/js/zip.js).
- [x] persistencia: localStorage automática con throttle de 1s.
- [x] import/export `.retals.json` (`{version, name, html, savedAt}`).
- [x] **layout móvil (<700px)**: tabs (biblioteca / código / preview) con código activo por defecto.

**criterio de done**: un user no-coder, partiendo de un starter, puede personalizar texto, añadir bloques, comprimir imágenes y descargar el ZIP listo para subir. **el ZIP descargado solo lleva los componentes que realmente aparecen en el HTML.**

---

## Fase 5 — integración imgToWeb / videoToWeb 🟡

embeber las herramientas existentes en el editor.

- [ ] **comprobación previa**: revisar si imgToWeb y videoToWeb soportan `postMessage` desde el iframe parent. si soportan, integración fluida; si no, flow manual aceptable (descargar + arrastrar).
- [ ] botón "comprimir media" en la toolbar del editor
- [ ] panel modal/lateral con `<iframe src="https://meowrhino.github.io/imgToWeb/">`
- [ ] **flow A — si hay `postMessage`**: el iframe avisa al parent cuando hay archivo listo, el editor lo recoge y lo mete en `/img` del proyecto sin tocar el sistema de archivos del user.
- [ ] **flow B — si no hay `postMessage`**: documentar paso a paso el manual: comprimir en iframe → descargar a `/Downloads` → arrastrar al editor (drop zone) → editor lo mete en `/img`. honesto sobre la fricción.
- [ ] mismo flujo para videoToWeb

**criterio de done**: user comprime una foto sin tener que abrir otra pestaña distinta del editor y ve el archivo aparecer en su proyecto. (con o sin `postMessage`, según lo que descubramos en la comprobación previa.)

---

## Fase 6 — counter y guestbook 🟡

componentes con persistencia. **arrancan en localStorage**, el Worker es upgrade self-hosted opcional. razón: Worker compartido para todos los users invita a spam y nos compromete a una infra que no queremos sostener (ver CLAUDE.md → componentes con persistencia).

### parte A — versión por defecto (localStorage)

- [ ] `components/r-counter.js` — counter decorativo en localStorage
  - sin atributos: cuenta visitas únicas del visitante (con `localStorage.getItem('r-counter:<id>')`)
  - atributo `id` para distinguir varios counters en la misma página
  - fallback HTML: muestra "—" si no hay JS
- [ ] `components/r-guestbook.js` — libro de visitas local del visitante
  - sin atributos: guardado solo en su localStorage, útil como demo o ejercicio personal
  - fallback HTML: textarea + botón submit que no hace nada (mensaje informativo de que JS hace falta para guardar)
- [ ] docs: dejar muy claro que **estos componentes en modo default no son compartidos entre visitantes**. el visitante A no ve el contador del visitante B.

### parte B — versión avanzada (self-host Worker, opcional)

- [ ] `workers/counter.js` — counter compartido por `id`, almacenado en Cloudflare KV
- [ ] `workers/guestbook.js` — libro de visitas con rate limit (IP-based, 1 mensaje cada 30s) y length cap (500 chars)
- [ ] `workers/README.md` con instrucciones paso a paso de `wrangler deploy`
- [ ] `r-counter` y `r-guestbook` aceptan atributo `endpoint="https://mi-worker.workers.dev/..."` que cuando está presente sustituye el modo localStorage
- [ ] `docs/self-host-workers.md` — guía completa de self-host

**no desplegamos un `retals-api.workers.dev` público.**

**criterio de done parte A**: `<r-counter id="x">` funciona en cualquier HTML sin tocar nada, muestra un número que sube con cada visita única del visitante.

**criterio de done parte B**: alguien con cuenta Cloudflare puede clonar `workers/`, ejecutar `wrangler deploy`, copiar la URL al atributo `endpoint=...` de su componente y obtener counter compartido entre todos los visitantes de su web.

---

## Fase 7 — starters restantes + showcase 🟢

los tres starters pospuestos desde Fase 3, ahora que el editor y la biblioteca están maduros y sabemos qué patrones funcionan.

- [ ] `starters/studio-carta/` — portfolio tipo meowrhino / rikamichie
  - grid de proyectos, página de proyecto individual, sobre / contacto
  - paleta neutra, tipografía cuidada
- [ ] `starters/one-pager/` — scroll narrativo vertical
  - secciones grandes con anclajes
  - foco editorial, tipografía protagonista
- [ ] `starters/archivo/` — índice cronológico (blog/diario)
  - lista densa de entradas con fecha
  - estética 2000s-blogger, monospace
- [ ] showcase público de webs hechas con retals
- [ ] formulario simple para enviar URL (manual approval)
- [ ] starters adicionales según pidan: zine editorial, terminal/CLI, escritorio-OS, jardín-wiki, hub/linktree
- [ ] página "made with retals" enlazable desde los starters

---

## Fase 8 — pulido y comunidad 🟢

- [ ] tutoriales en vídeo cortos (1-3 min) screencast del flow básico
- [ ] traducciones: catalán e inglés (castellano es el default)
- [ ] integración opcional de deploy directo a GitHub Pages / Codeberg vía OAuth
- [ ] manifesto extendido como entrada de blog (sostenibilidad web, anti-CMS, soberanía del código)
- [ ] **(opcional, evaluar)** mejorar el panel de código del editor con CodeMirror 6 vía CDN — si el feedback de users lo pide y no choca con "vanilla, forever" en el editor

---

*retals · vanilla, forever · meowrhino studio*
