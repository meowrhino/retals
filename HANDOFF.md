# HANDOFF — para Claude Code

> instrucciones de arranque. **léeme primero, antes que CLAUDE.md.**

---

## qué es esto

es un paquete inicial para construir **retals** — un sistema vanilla (Web Components + editor en navegador) para que cualquiera se haga una web personal, con la filosofía Geocities/Neocities pero sin el lock-in de los CMSs modernos.

el proyecto se inspira en mosi (de hecho funciona como moixí en cuanto a estructura del repo, brand meowrhino studio, "vanilla, forever" como mantra). léete CLAUDE.md, ROADMAP.md, DESIGN.md y TESTING.md para el contexto completo.

---

## estado actual (actualizado 2026-05-11 · sesión Opus 4.7)

el repo está vivo en https://github.com/meowrhino/retals (público, MIT). commits:

- `adf5c3f` — scaffold inicial.
- `af1ea4d` (Sonnet) — Fase 1 + 2 (13 componentes) + 3 + 6 + 7.
- **pendiente de commit (Opus 4.7, 2026-05-11)** — cierra **Fase 2** (los 🟡 grandes `r-gallery` y `r-jukebox`) **y Fase 4** (editor en navegador end-to-end).

**Fase 2: 15/15.** componentes con docs y demo:
`r-window`, `r-divider`, `r-marquee`, `r-typewriter`, `r-clock`, `r-glitch`, `r-cursor`, `r-tooltip`, `r-card`, `r-tabs`, `r-accordion`, `r-counter`, `r-guestbook`, `r-gallery`, `r-jukebox`.

**Fase 4: cerrada.** editor en `editor/editor.html` + `editor/js/{editor,library,preview,export,zip}.js`. funcionalidades:
- 3 paneles (biblioteca · código · preview) en desktop, tabs en <700px.
- live preview con debounce 300ms; detección de tags `r-*` por regex, inyección sólo de los scripts necesarios. mapeo `r-track`→`r-jukebox`, `r-tab`→`r-tabs`, `r-panel`→`r-accordion` en `library.js#CHILD_TO_PARENT`.
- snippets de los 15 componentes en `library.js#BLOCKS`. click inserta en cursor.
- starters cargables vía dropdown (fetch a `../starters/<name>/index.html`).
- import/export `.retals.json` (`{version, name, html, savedAt}`).
- ZIP descargable autocontenido: `index.html` + `README.md` + sólo los `components/r-X.js` usados. ZIP "store mode" vanilla en `editor/js/zip.js` (CRC32 + headers binarios, cero dependencias).
- localStorage automático con throttle 1s.
- botón "comprimir media" lleva a modal placeholder hasta Fase 5.

starters y workers como estaban:
- **4 starters**: `collage-ventanas` (con copia snapshot de `r-window.js` dentro), `studio-carta`, `one-pager`, `archivo`.
- **2 workers**: `counter.js` + `guestbook.js` listos para `wrangler deploy`; guía paso a paso en `docs/self-host-workers.md`.

### revisión de código (2026-05-11)

- todos los componentes cumplen el contrato CLAUDE.md: light DOM, `<style>` único auto-inyectado, clases prefijadas `r-<nombre>__`, fallback sin JS, CSS vars `--r-*` con override por componente, eventos custom con namespace, i18n trilingüe (`es`/`en`/`ca`) con fallback a `es`, independencia entre componentes.
- archivo más grande: `r-window.js` (509 líneas, cruza por 9 el umbral de 500 de TESTING.md). **decisión: no se parte** — cada línea sirve a drag/resize/close/minimize/3-temas/i18n; no hay bloat ni código muerto. la regla del umbral apunta a evitar "dumping ground", aquí la complejidad es inherente al componente.
- comentarios siguen la regla "el porqué, no el qué". cada componente abre con un bloque-cabecera documentando atributos, eventos y CSS vars.
- duplicación menor entre archivos (`escapeHtml`, `t(lang, key)`). aceptada por la regla de independencia entre componentes (CLAUDE.md → "acepta la duplicación a cambio de no tener grafo de dependencias").

---

## siguiente sesión — qué falta

en orden de prioridad:

### 1. verificación manual de Fase 0 + 1 + 2 (rápido, bloquea avance)

```bash
cd /Users/manu/Documents/GitHub/retals
python3 -m http.server 8080
# abrir http://localhost:8080/editor/
```

confirmar:
- la landing carga sin errores en consola
- la paleta meowrhino (coral/ámbar sobre cream) se ve correcta
- `mascot.svg` + `favicon.svg` cargan (siguen como placeholder 8x8)
- las dos secciones futuras (`#bloques`, `#starters`) tienen `<!-- TODO -->` visible

luego abrir 2-3 demos (`/editor/demos/r-window.html`, `/editor/demos/r-glitch.html`, `/editor/demos/r-guestbook.html`) y pasar TESTING.md por encima: keyboard, fallback sin JS (devtools → disable JS → reload), eventos custom en consola, override de CSS vars.

### 2. ~~completar Fase 2~~ ✅ hecho en esta sesión

- `r-gallery` y `r-jukebox` ya cumplen el contrato: light DOM, `<style>` único auto-inyectado, fallback sin JS, i18n `es/en/ca`, CSS vars `--r-*` con override, eventos custom con namespace.
- decisiones tomadas (no reabrir sin motivo):
  - `r-gallery` no soporta `<picture>`/`<figure>` ni autoplay en carousel — documentado en limitaciones del .md.
  - `r-gallery` `masonry` usa `column-count` (true masonry CSS, orden por columnas).
  - `r-gallery` `stack` rota por hash determinista (función `seededAngle`), no aleatorio en cada carga.
  - `r-jukebox` registra `<r-track>` en el mismo archivo (excepción a "un componente por archivo", justificada en la cabecera del .js).
  - `r-jukebox` no incluye ecualizador, visualizador ni crossfade — el ROADMAP no los pedía.
  - `r-jukebox.html` (demo) usa pistas de SoundHelix (CC). los starters no las tocan; el editor tampoco las inyectará por defecto.

falta verificación manual (no se pudo automatizar sin pulsar play, que el navegador exige por política de autoplay): pasar TESTING.md por ambos demos, incluyendo el fallback con devtools→disable JS.

### 3. ~~Fase 4 — editor en navegador~~ ✅ hecho en esta sesión

ver bloque "Fase 4: cerrada" más arriba. decisiones tomadas:
- biblioteca minimal sin previews-miniatura — nombre + complexity dot + descripción + snippet pegable cubre el caso de uso. previews son nice-to-have de Fase 8.
- ZIP "store" en vanilla (CRC32 + headers binarios). hace ZIPs sin comprimir, no se nota para texto/HTML/JS. si en Fase 8 alguien pide tamaños menores, añadir deflate vía `CompressionStream`.
- el iframe usa `sandbox="allow-scripts allow-same-origin"`. `allow-same-origin` es necesario porque los `<script type="module" src="../components/r-X.js">` se resuelven contra el origen del editor; sin él, el navegador rechaza módulos cross-origin. asumido.
- el `r-cursor` y otros componentes globales que se aplican a `document` funcionan correctamente dentro del iframe (cada srcdoc crea su propio document).
- el comportamiento de `<r-jukebox>` con autoplay está limitado por la política del navegador en iframe — igual que fuera. no es un bug del editor.

falta verificación humana: probar en móvil real (<700px) que las tabs funcionan, probar la descarga ZIP descomprimiendo en Finder/Explorer y abriendo el `index.html` con doble click. screenshots en preview se hicieron pero no sustituyen el doble-click real.

### 4. Fase 5 — integración imgToWeb / videoToWeb 🟡

comprobación previa: ver si imgToWeb/videoToWeb exponen `postMessage` desde el iframe. si sí, integración fluida; si no, flow manual (descargar + drop zone). decisión documentada en ROADMAP.

### 5. limpieza menor (no bloquea)

- si Manu pasa la mascota oficial de moixí, sustituir `editor/assets/mascot.svg` y `favicon.svg` **conservando el `viewBox="0 0 8 8"`** para que el CSS no se descoloque.

---

## contexto del repo a tener presente

- **nombre cerrado**: `retals`. prefijo de componentes: `r-`. aplicado en todo el código y docs; no rehacer find/replace.
- **`files 4/`**: duplicado plano del scaffold inicial (los mismos `.md` + el zip). ignorado por `.gitignore` (`files [0-9]*/` + `*.zip`). Manu lo borrará o moverá cuando le venga bien — no editar nada ahí dentro.

---

## prioridades en orden

el ROADMAP es estricto en orden. **no saltar fases.**

1. Fase 0 — manifiesto + landing (ya casi hecho, solo refinar)
2. Fase 1 — `<r-window>` end-to-end (es el componente piloto que prueba el contrato)
3. Fase 2 — biblioteca de bloques (de simples a complejos, ver lista)
4. Fase 3 — starters
5. Fase 4 — editor en navegador
6. ...

cada fase tiene su criterio de done en ROADMAP.md. no avanzar sin marcarlo.

---

## decisiones ya cerradas (no las reabras)

estas decisiones están **resueltas y documentadas** en CLAUDE.md y ROADMAP.md. si te tienta tomarlas tú por tu cuenta, ya están tomadas. si te parece que ninguna encaja en una situación concreta, pregunta a Manu antes de cambiar la dirección.

**arquitectura (CLAUDE.md):**
- el CSS de cada componente vive **dentro** de su `.js` (auto-inyección de `<style>` único en `<head>`). un solo archivo por componente, no `.js + .css` separado.
- componentes **independientes entre sí**. si `r-gallery` necesita un modal, lo implementa por dentro — no reusa `r-window`.
- UI hardcoded en **castellano por defecto**. atributo `lang="es|en|ca"` opcional.
- el ZIP descargado por el user es **snapshot inmutable**: lleva los componentes copiados dentro, sigue funcionando aunque retals desaparezca.
- counter y guestbook **arrancan en localStorage**, sin servidor. el Worker es self-host opcional. **no desplegar un Worker público de retals.**

**editor (ROADMAP Fase 4):**
- panel de código = `<textarea>` monoespaciada. nada de CodeMirror en Fase 4 (se evalúa en Fase 8 si lo piden).
- preview e inyección de scripts: el editor parsea el HTML del user, detecta tags `r-*` e inyecta solo los scripts necesarios.
- ZIP descargable: solo lleva los componentes realmente usados.
- móvil <700px: el editor usa tabs (biblioteca / código / preview), no tres columnas.

**starters (ROADMAP Fase 3):**
- Fase 3 hace **solo `collage-ventanas`**. los otros tres (`studio-carta`, `one-pager`, `archivo`) se hacen en Fase 7.

**flow para el user no-coder (D1):**
- el user trabaja en el editor online (Cloudflare Pages). el preview es un iframe interno → nunca tiene que abrir terminal ni servir HTTP localmente.
- cuando descarga el ZIP, le decimos: "súbelo a Neocities o GitHub Pages". esos son los caminos recomendados de hosting. el `python3 -m http.server` es solo para **nosotros desarrollando retals**, no para el user final.

---

## qué NO hacer (errores típicos)

- ❌ **no metas un framework.** ni Lit, ni Alpine, ni nada. vanilla Custom Elements.
- ❌ **no uses Shadow DOM.** light DOM con clases prefijadas. el user debe poder estilarlo desde fuera.
- ❌ **no añadas build step.** ni Vite, ni esbuild, ni Webpack. el código se sirve tal cual.
- ❌ **no asumas que JS está disponible.** todo componente debe tener fallback HTML útil.
- ❌ **no inventes JSON oculto.** la config es por atributos visibles en el HTML.
- ❌ **no copies estética genérica.** ni shadcn, ni Vercel-style, ni glassmorphism, ni purple gradients. la paleta meowrhino está en DESIGN.md.
- ❌ **no añadas dependencias al output del user.** si usa `<r-gallery>`, el ZIP descargado lleva `components/r-gallery.js` dentro. cero fetch a CDNs externos en runtime.

---

## el flow con el user (Manu, meowrhino)

- **idioma**: castellano casual. catalán bienvenido en docs públicos.
- **tiene su ecosistema**: imgToWeb, videoToWeb, trackr, etc. **integra, no reimplementes**.
- **prefiere decisiones**: cuando haya dudas de arquitectura, plantéale 2-3 opciones con trade-offs claros, no preguntas abiertas.
- **vibe**: barcelona, ético, anti-bigtech, pro-código-tuyo, sostenibilidad web. todo el copy debe respirar eso.

---

## comando inicial sugerido al user (Manu)

```bash
cd retals
python3 -m http.server 8080
# abrir http://localhost:8080/editor/ y verificar que la landing carga ok
```

luego, en Claude Code, usar el **prompt de revisión crítica** primero (ver más abajo) y solo después arrancar implementación.

---

## los dos prompts que Manu te va a pasar

el flow acordado es: primero te lee y critica antes de tocar código, luego te da luz verde fase a fase. los dos prompts canónicos son:

### prompt 1 — revisión crítica (no tocar código)

```
Léete HANDOFF.md, CLAUDE.md, ROADMAP.md, DESIGN.md y TESTING.md
en ese orden. No escribas código todavía.

Cuando termines, dame:

1. Resumen en 5 bullets de qué es retals y cuál es la filosofía.
2. Ambigüedades o contradicciones que detectes en los docs.
3. Decisiones técnicas implícitas que tú resolverías por tu cuenta —
   quiero ver tu propuesta antes de que las tomes.
4. Dependencias o herramientas externas que creas necesarias y que
   choquen con "vanilla, forever".
5. Estimación honesta de qué fases del ROADMAP son realistas y
   cuáles huelen a optimismo.

No avances a Fase 1 hasta que yo te diga.
```

### prompt 2 — arranque de implementación (después de discutir tu review)

```
Vale, resolvemos lo que has marcado:
[Manu te pegará aquí las decisiones que se hayan tomado conjuntamente]

Empieza por Fase 1 del ROADMAP: implementa <r-window> end-to-end.
Sigue estrictamente CLAUDE.md y DESIGN.md.
Antes de marcar la fase como done, pasa TESTING.md y enséñame
el resultado en /editor/demos/r-window.html.
```

---

*retals · vanilla, forever · meowrhino studio*
