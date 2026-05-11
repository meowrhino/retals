# `<r-glitch>`

texto con efecto de distorsión digital. tres variantes: aberración cromática, parpadeo, y sustitución de caracteres. activable automáticamente o al hover. respeta `prefers-reduced-motion`. vanilla, light DOM, fallback con texto normal sin JS.

---

## uso mínimo

```html
<r-glitch>RETALS</r-glitch>

<script type="module" src="components/r-glitch.js"></script>
```

renderiza el texto con efecto `shift` (aberración cromática) en bucle.

---

## atributos

| atributo    | tipo / valores                  | default   | descripción |
|-------------|---------------------------------|-----------|-------------|
| `effect`    | `shift` · `flicker` · `noise`   | `shift`   | tipo de efecto glitch. |
| `intensity` | `low` · `medium` · `high`       | `medium`  | intensidad del efecto. |
| `speed`     | `slow` · `normal` · `fast`      | `normal`  | velocidad del ciclo de animación. |
| `trigger`   | `auto` · `hover`                | `auto`    | `auto`: efecto continuo. `hover`: solo al pasar el cursor. |
| `lang`      | `es` · `en` · `ca`              | `es`      | idioma del `aria-label`. |

### efectos

- **`shift`** — usa pseudo-elementos `::before` y `::after` con colores distintos y desplazamiento horizontal. solo CSS.
- **`flicker`** — animación de opacidad irregular. solo CSS.
- **`noise`** — sustituye caracteres aleatorios con glifos de ruido (`▒░█▓@#$%!?*&^~`) en un intervalo JS.

---

## CSS variables

| variable              | default              | qué controla                                |
|-----------------------|----------------------|---------------------------------------------|
| `--r-glitch-color-1`  | `#ef7d57` (coral)    | color del canal 1 (pseudo `::before`)       |
| `--r-glitch-color-2`  | `#5a6a3e` (moss)     | color del canal 2 (pseudo `::after`)        |
| `--r-glitch-speed`    | calculado de `speed` | duración del ciclo (sobreescribe el atributo) |
| `--r-glitch-offset`   | calculado de `intensity` | desplazamiento en píxeles (sobreescribe el atributo) |

---

## tres ejemplos

### 1) mínimo

```html
<r-glitch>ERROR 404</r-glitch>
```

### 2) completo

```html
<r-glitch
  effect="shift"
  intensity="high"
  speed="fast"
  trigger="hover">
  HOVER ME
</r-glitch>
```

### 3) override de CSS

```html
<r-glitch
  intensity="high"
  style="
    --r-glitch-color-1: #f5b840;
    --r-glitch-color-2: #5a6a3e;
    font-size: 3rem;">
  CUSTOM
</r-glitch>
```

---

## accesibilidad

el elemento lleva `role="img"` implícito (hereda del custom element) y el texto real está siempre presente en el DOM. los pseudo-elementos (`::before`, `::after`) no son leídos por lectores de pantalla al usar `content: attr(data-text)`. el efecto `noise` sustituye caracteres temporalmente, por lo que el lector de pantalla puede anunciar texto corrupto — si el contenido es importante para la lectura, usa `trigger="hover"` o añade `aria-label` con el texto correcto.

con `prefers-reduced-motion` activo, todos los efectos se desactivan y el texto aparece sin animación.

---

## comportamiento sin JS

el texto original se muestra sin ningún efecto. es el comportamiento ideal: el componente mejora el texto, no lo crea.

---

*retals · vanilla, forever · meowrhino studio*
