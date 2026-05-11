# DESIGN — retals

## dos estéticas, no confundir

retals tiene **dos capas estéticas distintas** que no deben mezclarse:

### 1. estética del **editor** (lo que vive en retals.[dominio])
- meowrhino studio: vanilla, vintage-web, monospace, sin gradientes.
- una marca clara y reconocible.

### 2. estética de los **outputs** (los starters que el user descarga)
- diversa, plural, todo cabe: Geocities-revival, brutalista minimal, glitchy, kawaii, editorial, terminal, etc.
- retals **NO impone** un estilo único. ofrece bloques + arquetipos, el user decide.
- si todas las webs hechas con retals se parecieran, el proyecto habría fracasado.

esto importa: el editor tiene identidad fuerte; los outputs son del user.

---

## estética del editor

### paleta meowrhino

```css
:root {
  /* base */
  --coral:  #ef7d57;   /* acento primario, hover, links */
  --amber:  #f5b840;   /* acento secundario, highlights */
  --cream:  #fef8e6;   /* fondo cálido del editor */
  --ink:    #1a1a1a;   /* texto principal */
  --paper:  #fafafa;   /* fondos secundarios */
  --moss:   #5a6a3e;   /* acentos terciarios, success */
  --ash:    #d4d4d0;   /* bordes, separadores */
  
  /* funcionales */
  --r-bg:        var(--cream);
  --r-fg:        var(--ink);
  --r-accent:    var(--coral);
  --r-border:    var(--ash);
  --r-font:      'JetBrains Mono', 'Menlo', monospace;
  --r-font-body: ui-sans-serif, system-ui, sans-serif;
}
```

### tipografía

- **brand / títulos / código**: monospace (JetBrains Mono o system mono). aspecto handmade, no corporativo.
- **cuerpo de texto largo**: system sans-serif (`ui-sans-serif, system-ui, sans-serif`).
- **NUNCA**: Inter, Space Grotesk, Roboto, Arial. nada que grite "AI generated landing".

### qué NO hacer
- ❌ glassmorphism (frosted glass, backdrop-blur exagerado)
- ❌ shadcn / componentes que se ven a Vercel
- ❌ purple gradients sobre fondo blanco
- ❌ neumorphism (sombras suaves dobles)
- ❌ dark mode forzado o autodetectado. claro por defecto, oscuro como toggle explícito si se implementa.
- ❌ sombras excesivas (`box-shadow: 0 20px 40px ...`). max `0 2px 0 var(--ink)` (hard shadow) o nada.
- ❌ esquinas redondeadas exageradas. `--r-radius: 0` por defecto, hasta 4px en casos puntuales.
- ❌ iconos de Lucide / Heroicons everywhere. usar glifos tipográficos cuando se pueda.

### separadores y glifos

en lugar de `<hr>` o iconos, usar glifos tipográficos:

```
▮▰▱  ·  ✦ ✺ ✜ ◌  ·  ☼ ✻  ·  ▒▓█
```

### sombras (cuando se usen)

```css
/* hard shadow estilo brutalista light */
box-shadow: 2px 2px 0 var(--ink);

/* o estilo papel doblado */
box-shadow: 1px 1px 0 var(--ash);
```

### bordes

```css
/* default */
border: 1px solid var(--r-border);

/* énfasis */
border: 2px solid var(--ink);
```

### footer estándar

todas las páginas del editor llevan:

```html
<footer class="r-editor__footer">
  made in barcelona ☼ meowrhino studio · vanilla, forever
</footer>
```

### mascota

gato-rinoceronte 8x8 pixel art (continuidad con moixí). archivo en `editor/assets/mascot.svg`. opcional: animación de parpadeo cada 8-15s. el cuerno es ámbar, la naricilla coral.

```
viewBox: 0 0 8 8
fill: var(--ink) para outline
acentos: var(--coral), var(--amber)
```

### tono de voz en docs y UI

- castellano y catalán igual de bienvenidos. inglés como tercer idioma.
- humor seco, sin emojis innecesarios, sin "exciting features!!".
- "el código es tuyo" en lugar de "tu código está seguro con nosotros".
- "vanilla, forever" como mantra.
- "made in barcelona" sin disculpas.

### idioma de la UI hardcoded en componentes

la UI interna de cada componente (botón "cerrar" de `r-window`, aria-labels de `r-gallery`, mensajes de error, etc.) va **en castellano por defecto**. cada componente acepta un atributo opcional `lang="es|en|ca"` para sobrescribir.

mantener un objeto `STRINGS = { es: {...}, en: {...}, ca: {...} }` dentro del propio componente, fallback a `es` si falta un idioma. ver CLAUDE.md → convenciones → "idioma de la UI interna" para el patrón concreto.

razón: coherente con el mercado de retals (barcelona, comunidad de webs personales en castellano y catalán) y con el copy de los docs.

ejemplos de copy correcto:

```
✓ "biblioteca de bloques. cópialos, pégalos, modifícalos."
✗ "🚀 Build amazing websites with our powerful component library!"

✓ "descarga tu web. súbela donde quieras."
✗ "One-click deploy to our cloud platform."

✓ "si retals desaparece, tu web sigue funcionando."
✗ "Backed by enterprise-grade infrastructure."
```

---

## estética de los starters

cada starter debe tener **identidad fuerte y distinta**. directrices por starter:

### `studio-carta/`
- referencia: meowrhino.neocities.org, rikamichie.com, cargo (mejor parte).
- grid de proyectos en cards cuadradas.
- navegación clara: home, proyectos, sobre.
- paleta neutra (off-white, negro, un acento).
- tipografía cuidada: serif para títulos, sans para cuerpo.
- sin animaciones excesivas. mucho aire.

### `one-pager/`
- scroll narrativo vertical, secciones grandes.
- foco editorial: tipografía es la protagonista.
- imágenes grandes intercaladas con bloques de texto.
- paleta más expresiva, puede tener un color dominante.
- anchors con `scroll-behavior: smooth`.

### `archivo/`
- estética 2000s-blogger, monospace dominante.
- lista densa de entradas: fecha · título · resumen.
- mínima decoración, máxima legibilidad.
- referencia: blogs de los 2000, dat.gui-likes, awesome lists.
- fondo blanco/cream, links subrayados color coral o azul tradicional.

### `collage-ventanas/`
- estética 2000s pero **sin caer en el cliché de mmm.page**.
- ventanas con `<r-window>` arrastrables.
- fondos: color sólido vibrante, GIF tileado, o textura simple.
- títulos de ventana en barra clara con `theme="win95"` o `theme="macos"`.
- glifos ✺ ✦ ◌ ✜ en lugar de iconos modernos.
- la diferencia con mmm.page: **el output del user es HTML legible, no un dump generado**.

cada starter trae su propio `style.css` independiente. los componentes respetan las CSS vars del starter, no las imponen.

---

## accesibilidad como parte de la estética

- contraste mínimo AA en todos los starters por defecto.
- focus rings visibles (no quitar `outline` sin reemplazarlo).
- texto alt obligatorio en imágenes de los starters.
- keyboard navigation funcional en todos los componentes con interacción.

la accesibilidad no es "feo pero necesario". es parte del oficio.

---

*retals · vanilla, forever · meowrhino studio*
