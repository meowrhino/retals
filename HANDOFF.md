# HANDOFF — para Claude Code

> instrucciones de arranque. **léeme primero, antes que CLAUDE.md.**

---

## qué es esto

es un paquete inicial para construir **retals** — un sistema vanilla (Web Components + editor en navegador) para que cualquiera se haga una web personal, con la filosofía Geocities/Neocities pero sin el lock-in de los CMSs modernos.

el proyecto se inspira en mosi (de hecho funciona como moixí en cuanto a estructura del repo, brand meowrhino studio, "vanilla, forever" como mantra). léete CLAUDE.md, ROADMAP.md, DESIGN.md y TESTING.md para el contexto completo.

---

## estado actual (actualizado 2026-05-11)

el repo está vivo en https://github.com/meowrhino/retals (público, MIT). dos commits:

- `adf5c3f` — scaffold inicial: contrato (CLAUDE.md, ROADMAP, DESIGN, TESTING, HANDOFF), README, LICENSE, .gitignore, mascot/favicon placeholder, `_template.js`, `editor/index.html` + `style.css`.
- `af1ea4d` (Sonnet) — Fase 1 + 2 + 3 + 6 + 7:
  - **13 componentes** con docs y demo cada uno: `r-window`, `r-divider`, `r-marquee`, `r-typewriter`, `r-clock`, `r-glitch`, `r-cursor`, `r-tooltip`, `r-card`, `r-tabs`, `r-accordion`, `r-counter`, `r-guestbook`.
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

### 2. completar Fase 2 — componentes pendientes

- `r-gallery` 🟡 — galería con layouts (`grid` · `masonry` · `carousel` · `stack`) + lightbox interno (sin reusar `r-window`, replicar lo necesario por dentro).
- `r-jukebox` 🟡 — reproductor de audio con playlist (children `<r-track>`).

seguir el patrón de los 13 ya hechos: i18n trilingüe, fallback, CSS vars `--r-*`, demo en `editor/demos/`, doc en `docs/`.

### 3. Fase 4 — editor en navegador 🔴 (fase grande, requiere su propio plan)

split-view biblioteca · código · preview. todas las decisiones ya cerradas en `ROADMAP.md` (textarea simple sin CodeMirror, parsing de tags `r-*` para inyectar solo lo necesario, ZIP con solo los componentes realmente usados, layout móvil con tabs <700px). ahora hay 13 componentes para poblar la biblioteca.

### 4. Fase 5 — integración imgToWeb / videoToWeb 🟡

comprobación previa: ver si imgToWeb/videoToWeb exponen `postMessage` desde el iframe. si sí, integración fluida; si no, flow manual (descargar + drop zone). decisión documentada en ROADMAP.

### 5. limpieza menor (no bloquea)

- `.claude/launch.json` está sin trackear (launch profile local con `python3 -m http.server` en puerto 8090; el doc oficial usa 8080). decidir si añadir `.claude/` al `.gitignore` o si trackear el launch.json (alinear puerto antes).
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
