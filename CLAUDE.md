# retals — contrato del proyecto

> tooling para hacer webs personales con la filosofía de Geocities, la ligereza del JAMstack, y el respeto por el código del visitante.

---

## qué es retals

un sistema en dos capas:

1. **biblioteca de Web Components** (`<r-gallery>`, `<r-window>`, `<r-jukebox>`...) que cualquiera puede meter en su HTML y obtener funcionalidad rica sin escribir JS.
2. **editor en navegador** (hospedado en Cloudflare Pages) con biblioteca de bloques, vista de código, preview en vivo, y descarga del proyecto como ZIP autocontenido.

el output de retals es **HTML + CSS + JS vanilla, navegable sin dependencias externas, hospedable en cualquier sitio** (Neocities, GitHub Pages, Codeberg, servidor propio, lo que sea).

---

## el contexto: por qué existe esto

los CMSs modernos te dan dos opciones malas: aprender a programar, o renunciar al control de tu web (WordPress, Wix, Squarespace, Cargo, mmm.page...). todos vienen con un "marco" alrededor de tu contenido que es de ellos, no tuyo. todos pesan kilos. todos te atan.

retals abre una tercera vía: **bloques que puedes copiar, pegar y modificar**, con curva de aprendizaje voluntaria. el user empieza arrastrando piezas; si quiere meterle la mano al HTML, todo está ahí, legible, sin trucos. el output es suyo y solo suyo.

inspiración: Geocities, Neocities, mmm.page (pero sin el marco hortera), Bear Blog (pero con más libertad estética), los flat-file CMS tipo Kirby (pero sin servidor).

---

## reglas duras — NO NEGOCIABLES

### sí
- HTML, CSS y JS **vanilla**. cero frameworks.
- Web Components nativos: Custom Elements + light DOM (no shadow DOM cerrado).
- cero build step en el output del user. lo que descarga, se sirve tal cual.
- **progressive enhancement obligatorio**: cada componente debe enseñar algo legible y útil sin JS.
- CSS variables para theming. todo customizable desde `:root`.
- atributos para configuración, slots/children para contenido.
- el código del output debe ser **legible por un humano que sepa HTML básico**.
- accesibilidad: ARIA correcto, keyboard nav, contraste AA mínimo.

### no
- nada de React, Vue, Svelte, Lit, Stencil, Alpine. **vanilla, forever**.
- nada de Tailwind, shadcn, glassmorphism, neumorphism, purple gradients.
- nada de Shadow DOM cerrado (estilo encapsulable pero accesible al user).
- nada de config en JSON oculto. lo que hay, se ve en el HTML.
- nada de dependencias externas en el output del user (los componentes van empaquetados con la web descargada).
- nada de lock-in: si retals desaparece mañana, las webs hechas con retals deben seguir funcionando.
- nada de tracking. nada de analytics. nada de cookies salvo localStorage del propio editor.
- nada de "framework de CSS". si necesitas estilo, escríbelo a mano.

**si una decisión choca con "vanilla, forever", la decisión está mal.**

---

## convenciones de código

### nombrado
- prefijo de componentes: **`r-`** (de retals — si el nombre final cambia, el prefijo también).
- tag-names en minúsculas con guiones: `<r-gallery>`, `<r-window>`, `<r-jukebox>`.
- archivo: `components/r-<name>.js` — **un componente por archivo**.
- clases CSS dentro de un componente, prefijadas con el nombre: `.r-window__header`, `.r-gallery__item`.

### estructura de un Web Component

```js
// components/r-window.js
class RWindow extends HTMLElement {
  static observedAttributes = ['title', 'x', 'y', 'w', 'h', 'theme', 'resizable', 'closable'];

  connectedCallback() {
    // 1. preservar el contenido interno (fallback)
    const content = this.innerHTML;
    this.innerHTML = '';

    // 2. construir la UI mejorada
    this.render(content);

    // 3. wire up de interacciones
    this.bindEvents();
  }

  render(content) {
    // light DOM — usar clases con prefijo `r-window__`
    // el `content` se inyecta dentro del body de la ventana
  }

  bindEvents() {
    // drag, resize, close, etc.
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // reaccionar a cambios de atributos en tiempo real
  }

  disconnectedCallback() {
    // cleanup de listeners globales si los hay
  }
}

customElements.define('r-window', RWindow);
```

### CSS de componentes

**un solo archivo por componente.** el CSS vive **dentro del propio `r-<name>.js`**. nada de `r-<name>.css` separado. el JS inyecta un bloque `<style>` único en `<head>` la primera vez que se instancia el componente:

```js
// dentro del módulo, fuera de la clase
const STYLE_ID = 'r-window-styles';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;  // ya inyectado
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .r-window { background: var(--r-window-bg, var(--r-bg, #fff)); ... }
    .r-window__header { ... }
  `;
  document.head.appendChild(style);
}

class RWindow extends HTMLElement {
  connectedCallback() {
    injectStyles();
    // ...
  }
}
```

las reglas leen variables globales `--r-*`:

```css
.r-window {
  background: var(--r-window-bg, var(--r-bg, #fff));
  color: var(--r-window-fg, var(--r-fg, #111));
  font-family: var(--r-font, system-ui, sans-serif);
}
```

el user puede override globalmente (`--r-bg`) o por componente (`--r-window-bg`).

### independencia entre componentes

**cada componente se basta a sí mismo.** cero dependencias entre componentes de la biblioteca. si `r-gallery` necesita un modal para el lightbox, lo implementa por dentro — **no reusa `r-window`**. acepta la duplicación a cambio de no tener grafo de dependencias.

regla práctica: el user puede meter un solo componente en su HTML y debe funcionar sin cargar nada más de retals.

### idioma de la UI interna

la UI hardcoded de cada componente (botones tipo "cerrar", aria-labels, mensajes) va **en castellano por defecto**. cada componente acepta un atributo opcional `lang="es|en|ca"` para sobrescribir.

```html
<r-window title="hola" lang="en">…</r-window>
<!-- usa "close" en lugar de "cerrar", aria-labels en inglés, etc. -->
```

mantener un objeto `STRINGS = { es: {...}, en: {...}, ca: {...} }` dentro del componente. si falta un idioma, fallback a `es`.

### fallback obligatorio

todo componente debe enseñar algo legible cuando JS no carga. ejemplo:

```html
<!-- input del user -->
<r-gallery layout="grid" cols="3">
  <img src="img/1.webp" alt="">
  <img src="img/2.webp" alt="">
</r-gallery>

<!-- si JS no carga: dos imgs apiladas, legibles, navegables. -->
<!-- si JS carga: grid de 3 columnas con lightbox. -->
```

regla: **el componente mejora el contenido, no lo crea**.

---

## la integración con imgToWeb / videoToWeb

retals **no reimplementa compresión de media**. embebe vía iframe los tools del autor ya existentes:

- imgToWeb: https://meowrhino.github.io/imgToWeb/
- videoToWeb: https://meowrhino.github.io/videoToWeb/

en el editor hay un botón "comprimir media" que abre estas herramientas en un panel. flujo:

1. user arrastra foto al panel imgToWeb embebido.
2. imgToWeb la comprime en el navegador del user (no sube nada).
3. el archivo optimizado vuelve al editor y se mete en `/img` del proyecto.

ambos tools ya existen y funcionan. **no los toques**, solo embébelos.

---

## componentes con persistencia (counter, guestbook)

**opción canónica por defecto: localStorage**. cero servidor, cero mantenimiento, funciona offline. `r-counter` y `r-guestbook` arrancan así.

- `<r-counter>` sin atributos = counter decorativo en localStorage del visitante. cada visita única suma 1. funciona pero no es compartido entre visitantes.
- `<r-guestbook>` sin atributos = libro de visitas local del visitante. útil como ejercicio o demo.

**opción avanzada: Cloudflare Worker self-hosted.** el user que quiera contador o guestbook compartido entre visitantes se monta su Worker:

```html
<r-counter id="mi-counter" endpoint="https://mi-worker.workers.dev/counter"></r-counter>
```

- el código del Worker está en `workers/` de este repo, listo para `wrangler deploy`.
- documentar el flow de self-host paso a paso en `docs/self-host-workers.md`.

**no hay Worker público de retals.** mantener uno compartido por todos los users invita a spam y rate-limit abuse, y nos compromete a una infra que no queremos sostener. el self-host es la respuesta sincera.

---

## estructura del repo

```
retals/
├── README.md                  ← entrada pública, link a docs
├── CLAUDE.md                  ← este archivo (contrato)
├── ROADMAP.md                 ← fases con tareas tickables
├── DESIGN.md                  ← dirección estética
├── TESTING.md                 ← checkpoints manuales
├── editor/                    ← el editor en navegador (Cloudflare Pages)
│   ├── index.html             ← landing + entrada al editor
│   ├── editor.html            ← el editor split-view
│   ├── style.css              ← estilos del editor + paleta meowrhino
│   ├── js/
│   │   ├── editor.js          ← lógica del editor
│   │   ├── preview.js         ← iframe preview con live reload
│   │   ├── library.js         ← panel de bloques
│   │   └── export.js          ← zip download
│   ├── assets/
│   │   ├── mascot.svg
│   │   └── favicon.svg
│   └── demos/                 ← una página de demo por componente
│       ├── r-window.html
│       ├── r-gallery.html
│       └── ...
├── components/                ← Web Components (un archivo cada uno)
│   ├── _template.js           ← plantilla para nuevos componentes
│   ├── r-window.js
│   ├── r-gallery.js
│   ├── r-jukebox.js
│   └── ...
├── starters/                  ← arquetipos de webs listas para descargar
│   ├── studio-carta/          ← portfolio tipo meowrhino / rikamichie
│   ├── one-pager/             ← scroll narrativo
│   ├── archivo/               ← índice cronológico (blog/diario)
│   └── collage-ventanas/      ← estética 2000s con ventanas drag
├── docs/                      ← documentación pública por componente
│   ├── r-window.md
│   ├── r-gallery.md
│   └── ...
└── workers/                   ← Cloudflare Workers para persistencia
    ├── counter.js
    └── guestbook.js
```

---

## comandos

```bash
# desarrollo local (módulos ES requieren HTTP server)
cd retals && python3 -m http.server 8080
# abrir http://localhost:8080/editor/

# crear un componente nuevo
cp components/_template.js components/r-newthing.js
# editar siguiendo el contrato

# verificar fallbacks (test manual)
# desactivar JS en devtools → recargar → todo debe seguir legible

# deploy del editor a Cloudflare Pages
# (configurar en Cloudflare dashboard apuntando a este repo)

# deploy de Workers
cd workers && wrangler deploy counter.js
```

---

## hooks y eventos globales

los componentes pueden emitir eventos custom para que el user los enganche desde su propio JS:

```js
// dentro de r-window.js
this.dispatchEvent(new CustomEvent('r-window:close', { bubbles: true }));

// el user lo escucha en su HTML
document.addEventListener('r-window:close', e => { ... });
```

convención de naming: `<componente>:<acción>` (`r-jukebox:play`, `r-gallery:select`, `r-counter:tick`).

---

## qué hacer cuando tengas dudas

- ¿hace falta un framework para esto? → no. busca la solución vanilla.
- ¿necesito un build step? → no. busca cómo servirlo tal cual.
- ¿puedo asumir que JS está disponible? → no. siempre hay un fallback.
- ¿esto añade dependencias al output del user? → no. el user descarga algo autocontenido.
- ¿esto introduce un punto de fallo externo? → minimízalo, documenta cómo replazarlo.

---

## qué hacer cuando tomes decisiones de diseño

leer DESIGN.md. la regla resumen: el **editor** se ve a meowrhino studio (paleta coral/ámbar, monospace, sin gradientes). los **starters** son diversos — el user no debe sentir que todas las webs hechas con retals se parecen.

---

## versionado: el ZIP descargado es snapshot inmutable

cuando el user descarga su web desde el editor, el ZIP lleva los componentes que usa **copiados dentro** (en `/components/r-X.js`). esa copia es **suya para siempre**: si mañana saco `r-window` v2 con cambios incompatibles, su web sigue funcionando sin tocarla porque su `r-window.js` es el que era cuando descargó.

implicaciones:
- no hace falta versionado semántico estricto en los componentes.
- cuando cambie un componente de forma incompatible, los users que quieran la nueva versión pueden volver al editor, regenerar y descargar un ZIP nuevo.
- documentar esto en el README descargado: "estos componentes son tuyos. si retals desaparece o cambia, tu web no se entera."
- evita la tentación de meter un loader que vaya a buscar la última versión a un CDN. **eso sería lock-in disfrazado.**

---

*retals · vanilla, forever · meowrhino studio*
