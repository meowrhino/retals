# `<r-window>`

ventana arrastrable y redimensionable. tres temas (`none`, `win95`, `macos`). vanilla, light DOM, fallback HTML sin JS.

---

## uso mínimo

```html
<r-window title="hola">
  <p>contenido aquí.</p>
</r-window>

<script type="module" src="components/r-window.js"></script>
```

sin JS, se ve como un bloque con borde y un título arriba (el atributo `title` se renderiza vía `::before`). con JS, se convierte en ventana arrastrable y con botón cerrar.

---

## atributos

| atributo      | tipo / valores                | default  | descripción |
|---------------|-------------------------------|----------|-------------|
| `title`       | texto                         | `""`     | título mostrado en la barra superior. |
| `x`           | px o longitud CSS             | —        | posición horizontal cuando la ventana está mejorada con JS. `"40"` → `40px`, `"5vw"` → `5vw`. |
| `y`           | px o longitud CSS             | —        | posición vertical. |
| `w`           | px o longitud CSS             | —        | ancho. |
| `h`           | px o longitud CSS             | —        | alto. |
| `theme`       | `none` · `win95` · `macos`    | `none`   | look de la ventana. |
| `resizable`   | `"false"` para desactivar     | activo   | muestra/oculta el resize handle de la esquina. |
| `closable`    | `"false"` para desactivar     | activo   | muestra/oculta el botón cerrar. |
| `minimizable` | `"true"` para activar         | inactivo | muestra el botón minimizar (oculta el body al pulsar). |
| `lang`        | `es` · `en` · `ca`            | `es`     | idioma de los aria-labels internos. fallback a `es`. |

todos los atributos se aplican en vivo: cambia `title` o `theme` desde DevTools y la ventana reacciona sin recargar.

---

## eventos custom

todos `bubbles: true`. escúchalos en `document` o en cualquier ancestro.

| evento              | cuándo                       | `detail`                       | cancelable |
|---------------------|------------------------------|--------------------------------|------------|
| `r-window:move`     | al soltar el drag            | `{ x, y }` en píxeles          | no         |
| `r-window:resize`   | al soltar el resize          | `{ w, h }` en píxeles          | no         |
| `r-window:close`    | click en cerrar o pulsar Esc | `{ title, id }`                | **sí**     |
| `r-window:minimize` | toggle del botón minimizar   | `{ minimized: true \| false }` | no         |

ejemplo:

```html
<r-window id="alerta" title="aviso" closable></r-window>
<script>
  document.addEventListener('r-window:close', (e) => {
    if (e.detail.id === 'alerta') {
      // p.ej. guardar que el user la cerró:
      localStorage.setItem('alerta:cerrada', '1');
    }
  });
</script>
```

para **cancelar el cierre** (mantener la ventana visible):

```js
document.addEventListener('r-window:close', (e) => {
  if (!confirm('¿seguro?')) e.preventDefault();
});
```

---

## CSS variables

todas tienen fallback a las globales `--r-*` definidas en `:root`, así que puedes themear globalmente o por ventana.

| variable                | fallback                    | qué controla              |
|-------------------------|-----------------------------|---------------------------|
| `--r-window-bg`         | `--r-bg` → `#fff`           | fondo del body            |
| `--r-window-fg`         | `--r-fg` → `#1a1a1a`        | texto del body            |
| `--r-window-header-bg`  | `--r-accent` → `--amber`    | fondo de la barra         |
| `--r-window-header-fg`  | `--r-fg`                    | texto de la barra         |
| `--r-window-border`     | `--r-border` → `--ink`      | color de borde            |
| `--r-window-shadow`     | depende del tema            | sombra exterior           |

los temas `win95` y `macos` usan colores fijos (look reconocible) — para customizar a fondo, usa `theme="none"` y override las vars.

---

## tres ejemplos

### 1) mínimo

```html
<r-window title="hola">
  <p>una ventana cualquiera.</p>
</r-window>
```

### 2) completo, con interacción

```html
<r-window
  id="ficha"
  title="ficha del proyecto"
  theme="macos"
  x="120" y="80" w="380" h="240"
  minimizable="true">
  <h3>retals</h3>
  <p>vanilla, forever.</p>
  <a href="/about">más info</a>
</r-window>

<script>
  document.addEventListener('r-window:move', (e) => {
    if (e.target.id === 'ficha') console.log('movida a', e.detail);
  });
</script>
```

### 3) override de paleta (tema `none`)

```html
<r-window
  title="modo oscuro"
  x="60" y="60" w="320" h="200"
  style="
    --r-window-bg: #1a1a1a;
    --r-window-fg: #fef8e6;
    --r-window-header-bg: #ef7d57;
    --r-window-header-fg: #fef8e6;
    --r-window-border: #ef7d57;
    --r-window-shadow: 4px 4px 0 #f5b840;
  ">
  <p>las CSS vars sobreescriben el tema base.</p>
</r-window>
```

---

## accesibilidad

- focus visible en todos los botones (outline ámbar).
- aria-label en cerrar, minimizar y resize, traducido según `lang`.
- la ventana es focusable (`tabindex="-1"`) para que **Esc** la cierre cuando tenga foco.
- los iconos `×` y `−` no son hablados — el aria-label es el que se anuncia.

para keyboard nav avanzada (Tab cycle entre ventanas, restaurar focus al cerrar), ver Fase 8 del ROADMAP.

---

## comportamiento sin JS

el componente respeta el contrato `vanilla, forever`: **el contenido interno siempre es legible**, esté JS activo o no.

| con JS                                  | sin JS                                  |
|-----------------------------------------|-----------------------------------------|
| ventana decorada, drag, resize, close   | el texto del body se ve, navegable      |

ahora bien, hay una cosa honesta que documentar: como el CSS del componente se inyecta desde el propio `.js` (regla de retals: un archivo por componente), si JS no carga **el navegador no tiene reglas de estilo para `<r-window>`** y lo renderiza como inline. el texto interior sigue siendo legible, pero pierdes el "div con borde y título arriba".

si quieres **fallback estilado sin JS**, pega este snippet en tu `<head>`:

```html
<style>
  r-window {
    display: block;
    box-sizing: border-box;
    border: 2px solid #1a1a1a;
    background: #fafafa;
    color: #1a1a1a;
    margin: 1rem;
    max-width: 480px;
    font-family: ui-monospace, monospace;
    box-shadow: 2px 2px 0 #1a1a1a;
  }
  r-window::before {
    content: attr(title);
    display: block;
    padding: 0.5rem 0.75rem;
    background: #f5b840;
    color: #1a1a1a;
    font-weight: 700;
    border-bottom: 2px solid #1a1a1a;
  }
  r-window > * { padding: 0 0.75rem; }
  /* anular cuando JS ya ha procesado el componente */
  r-window.r-window--ready { max-width: none; margin: 0; }
  r-window.r-window--ready::before { content: none; display: none; }
  r-window.r-window--ready > * { padding: revert; }
</style>
```

los starters de retals ya lo traen incluido. para usos sueltos, es opcional.

---

## posicionamiento

cuando JS arranca, la ventana se aplica `position: absolute`. esto significa que se posiciona respecto al ancestro posicionado más cercano (`position: relative | absolute | fixed`). si no hay ninguno, respecto al `<body>`.

patrón típico para un "canvas" de ventanas:

```html
<main style="position: relative; min-height: 80vh;">
  <r-window title="a" x="20"  y="20"></r-window>
  <r-window title="b" x="200" y="80"></r-window>
</main>
```

---

## limitaciones conocidas

- `<script>` dentro del slot del body no se ejecuta (regla estándar de `innerHTML`).
- al cambiar atributos vivos, el header se re-renderiza — si tenías focus en un botón del header, se pierde. raramente molesta.
- la ventana se quita del DOM al cerrar (`this.remove()`). si quieres restaurarla, vuelve a insertarla.

---

*retals · vanilla, forever · meowrhino studio*
