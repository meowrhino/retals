# HANDOFF — para Claude Code

> instrucciones de arranque. **léeme primero, antes que CLAUDE.md.**

---

## qué es esto

es un paquete inicial para construir **retals** — un sistema vanilla (Web Components + editor en navegador) para que cualquiera se haga una web personal, con la filosofía Geocities/Neocities pero sin el lock-in de los CMSs modernos.

el proyecto se inspira en mosi (de hecho funciona como moixí en cuanto a estructura del repo, brand meowrhino studio, "vanilla, forever" como mantra). léete CLAUDE.md, ROADMAP.md, DESIGN.md y TESTING.md para el contexto completo.

---

## qué hacer primero (literalmente el primer commit)

1. **verificar que el landing carga.**
   ```bash
   python3 -m http.server 8080
   # abrir http://localhost:8080/editor/
   ```
   debería verse el manifiesto con la paleta meowrhino y sin errores en consola. si algo se ve raro, arreglar antes de seguir. ese es el criterio de done de Fase 0 — ya está casi todo, solo refinar.

2. **revisar la mascota.** `editor/assets/mascot.svg` y `editor/assets/favicon.svg` son placeholders pixel art 8x8 muy mínimos (viene marcado como PLACEHOLDER en el propio SVG). **dejarlos como están** salvo que Manu te diga lo contrario y te pase la mascota oficial (probablemente la de moixí). si te la pasa: **conservar el viewBox `0 0 8 8`** para que el CSS no se mueva.

3. **el nombre del proyecto está cerrado: `retals`.** prefijo de componentes: `r-`. ya está aplicado en todo el código y los docs. no hace falta find/replace.

4. **el directorio `files 4/` en la raíz del repo es un duplicado plano del scaffold inicial** (mismos archivos que ya están en su sitio correcto: docs en raíz, código en `editor/` y `components/`). **no es la fuente de verdad — ignóralo y no edites nada ahí dentro.** Manu lo borrará o lo moverá fuera del repo cuando le venga bien. el `retals.zip` que hay dentro tampoco hace falta: ya está descomprimido.

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
