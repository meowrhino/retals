# `<r-typewriter>`

texto que se escribe solo, carácter a carácter. opcionalmente borra y reescribe en bucle. cursor parpadeante configurable. respeta `prefers-reduced-motion`. vanilla, light DOM, fallback con texto completo sin JS.

---

## uso mínimo

```html
<r-typewriter>vanilla, forever.</r-typewriter>

<script type="module" src="components/r-typewriter.js"></script>
```

---

## atributos

| atributo     | tipo               | default | descripción |
|--------------|--------------------|---------|-------------|
| `speed`      | number (chars/s)   | `50`    | velocidad de escritura en caracteres por segundo. |
| `delay`      | number (ms)        | `0`     | milisegundos de espera antes de empezar a escribir. |
| `cursor`     | string             | `\|`    | carácter del cursor parpadeante. |
| `loop`       | boolean (atributo) | —       | si está presente, borra el texto y lo reescribe indefinidamente. |
| `erase-speed`| number (chars/s)   | `100`   | velocidad de borrado en modo `loop`. |
| `pause`      | number (ms)        | `1500`  | milisegundos de pausa al terminar de escribir antes de borrar (solo en modo `loop`). |
| `lang`       | `es` · `en` · `ca` | `es`    | idioma del `aria-label`. |

**nota:** el contenido se trata como **texto plano**. las etiquetas HTML dentro del elemento se convierten en texto literal. para combinar estilos, envuelve el componente externamente: `<strong><r-typewriter>...</r-typewriter></strong>`.

---

## CSS variables

| variable                      | default                            | qué controla       |
|-------------------------------|------------------------------------|--------------------|
| `--r-typewriter-color`        | `--r-fg` → `#1a1a1a`               | color del texto    |
| `--r-typewriter-cursor-color` | `--r-typewriter-color`             | color del cursor   |
| `--r-typewriter-font`         | `inherit`                          | fuente             |
| `--r-typewriter-size`         | `inherit`                          | tamaño tipográfico |

---

## tres ejemplos

### 1) mínimo

```html
<r-typewriter>hola, soy retals.</r-typewriter>
```

### 2) completo

```html
<r-typewriter
  loop
  speed="40"
  erase-speed="80"
  pause="2000"
  cursor="▮"
  delay="500">
  tu web, tu código, tu regla.
</r-typewriter>
```

### 3) override de CSS

```html
<r-typewriter
  loop
  style="
    --r-typewriter-color: #ef7d57;
    --r-typewriter-cursor-color: #f5b840;
    --r-typewriter-size: 2rem;">
  meowrhino studio ☼
</r-typewriter>
```

---

## eventos

| evento               | cuándo                                        | `detail` |
|----------------------|-----------------------------------------------|----------|
| `r-typewriter:start` | cuando empieza a escribir (por ciclo en loop) | `{}`     |
| `r-typewriter:done`  | cuando termina de escribir (por ciclo en loop)| `{}`     |

```js
const tw = document.querySelector('r-typewriter');
tw.addEventListener('r-typewriter:start', () => console.log('empieza'));
tw.addEventListener('r-typewriter:done',  () => console.log('termina'));
```

---

## accesibilidad

el componente es `display: inline`, por lo que fluye naturalmente en el texto. el cursor lleva `aria-hidden="true"` para que no se lea. con `prefers-reduced-motion` activo, el texto completo aparece inmediatamente y el cursor no parpadea.

---

## comportamiento sin JS

el texto original se muestra completo e inmediatamente (el `textContent` del elemento está en el DOM antes de que JS lo procese). no hace falta CSS extra.

---

*retals · vanilla, forever · meowrhino studio*
