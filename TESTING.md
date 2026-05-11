# TESTING — retals

> checkpoints manuales antes de cada release. retals es vanilla — el testing también.

---

## por componente (antes de mergear)

### contrato vanilla
- [ ] el componente funciona **sin JS** (devtools → desactivar JS → recargar)
- [ ] el fallback HTML interno es legible y útil (no una caja vacía)
- [ ] los atributos del HTML cambian el comportamiento sin recargar la página (via `attributeChangedCallback`)
- [ ] las CSS vars (`--r-*`) permiten cambiar look sin tocar el JS
- [ ] el componente no requiere ninguna librería externa
- [ ] el componente funciona aunque otros componentes no estén cargados

### interacción
- [ ] keyboard navigation funciona (Tab, Enter, Esc, flechas según el caso)
- [ ] focus visible en todos los elementos interactivos
- [ ] los eventos custom (`<componente>:<acción>`) se emiten correctamente

### consola y errores
- [ ] no hay errores en consola al cargar
- [ ] no hay warnings de deprecación
- [ ] no hay leaks de memoria al añadir/quitar el componente repetidamente

### cross-browser
- [ ] Chrome (desktop + Android)
- [ ] Firefox (desktop + Android)
- [ ] Safari (desktop + iOS)

### docs
- [ ] `docs/r-<name>.md` actualizado con la API real
- [ ] al menos 3 ejemplos de uso (mínimo, lleno, con override de CSS)
- [ ] tabla de atributos completa
- [ ] lista de eventos emitidos
- [ ] lista de CSS vars que respeta

---

## el editor

### entrada
- [ ] el editor carga en < 2s en conexión 3G simulada (devtools throttling)
- [ ] el editor funciona desde `file://` (uso offline)
- [ ] el favicon y mascota cargan

### biblioteca
- [ ] click en un bloque inserta su snippet en el código en posición de cursor
- [ ] cada bloque tiene preview en miniatura
- [ ] búsqueda/filtro funciona (si se implementa)

### preview
- [ ] el preview se actualiza al cambiar el código (con debounce, no en cada keystroke)
- [ ] el preview es un iframe sandboxed
- [ ] los scripts de componentes usados se inyectan automáticamente

### persistencia
- [ ] guardar/cargar proyecto en localStorage funciona entre sesiones
- [ ] export a `.retals.json` produce un archivo válido
- [ ] import de `.retals.json` restaura el estado correctamente
- [ ] cerrar y reabrir la pestaña no pierde el trabajo

### descarga
- [ ] el botón "descargar" produce un ZIP
- [ ] el ZIP descargado:
  - se abre sin errores en local
  - funciona desde `file://` (doble click al index.html)
  - **se sube a Neocities y funciona** (test manual)
  - se sube a GitHub Pages y funciona
  - no requiere ninguna dependencia externa
  - pesa lo razonable (sin media: < 100kb, con componentes incluidos)

---

## starters

por cada starter en `starters/`:

- [ ] abierto con doble click (file://) funciona sin errores
- [ ] subido a Neocities funciona
- [ ] pasa Lighthouse con 90+ en performance, accessibility, best practices
- [ ] el peso total (HTML + CSS + JS, **sin media**) < 50kb
- [ ] tiene README.md explicando cómo personalizar texto, imágenes, colores
- [ ] el HTML es legible: alguien que sepa HTML básico entiende dónde meter mano
- [ ] todas las imágenes tienen `alt`
- [ ] contraste mínimo AA

---

## integraciones externas

### imgToWeb / videoToWeb
- [ ] el panel se abre dentro del editor
- [ ] el flujo descrito en CLAUDE.md funciona end-to-end
- [ ] si imgToWeb cambia, documentar dónde reapuntar

### Cloudflare Workers (counter, guestbook)
- [ ] el endpoint público responde en < 500ms
- [ ] rate limiting protege contra abuso
- [ ] dos webs con el mismo `id` comparten estado
- [ ] el user puede self-hostear su propio Worker
- [ ] los datos persisten entre deployments del Worker

---

## el código en sí

revisar antes de cada release:

- [ ] ningún `console.log` olvidado en producción
- [ ] ningún `TODO` o `FIXME` crítico sin cerrar
- [ ] ningún import a librería externa que rompa "vanilla, forever"
- [ ] ningún archivo > 500 líneas (señal de que hace falta partir)
- [ ] todos los nombres de variables y funciones legibles en castellano o inglés (no espanglish mezclado)

---

## tests automatizables (futuro)

cuando el proyecto madure y haga falta:

- snapshot visual de cada componente y sus variantes (Playwright o similar)
- carga del editor en < 2s en 3G simulado (Lighthouse CI)
- el ZIP descargado abierto en `file://` no rompe nada
- los Workers responden correctamente bajo carga

de momento, **todo manual**. retals es vanilla; los tests también.

---

*retals · vanilla, forever · meowrhino studio*
