# `<r-clock>`

reloj en vivo que se actualiza cada segundo. formato configurable con tokens, soporte de timezones y nombres de mes en español, inglés y catalán. vanilla, light DOM, fallback sin JS.

---

## uso mínimo

```html
<r-clock></r-clock>

<script type="module" src="components/r-clock.js"></script>
```

renderiza la hora local en formato `HH:MM:SS` actualizándose cada segundo.

---

## atributos

| atributo   | tipo               | default      | descripción |
|------------|--------------------|--------------|-------------|
| `format`   | string             | `HH:MM:SS`   | cadena de formato con tokens. |
| `timezone` | string (IANA)      | local        | timezone destino (ej: `"Europe/Madrid"`, `"America/New_York"`). si es inválido, fallback a hora local sin error. |
| `lang`     | `es` · `en` · `ca` | `es`         | idioma para el token `Mon` y el `aria-label`. |

### tokens de formato

| token  | valor                        | ejemplo  |
|--------|------------------------------|----------|
| `HH`   | hora 24h con cero (00–23)    | `14`     |
| `hh`   | hora 12h con cero (01–12)    | `02`     |
| `MM`   | minutos con cero (00–59)     | `07`     |
| `SS`   | segundos con cero (00–59)    | `43`     |
| `A`    | AM / PM                      | `PM`     |
| `dd`   | día con cero (01–31)         | `09`     |
| `mm`   | mes con cero (01–12)         | `05`     |
| `YYYY` | año completo                 | `2026`   |
| `Mon`  | mes corto según `lang`       | `may`    |

los tokens se sustituyen en orden de mayor a menor longitud para evitar sustituciones parciales.

---

## CSS variables

| variable                   | default                     | qué controla          |
|----------------------------|-----------------------------|-----------------------|
| `--r-clock-color`          | `--r-fg` → `#1a1a1a`        | color del texto       |
| `--r-clock-font`           | `--r-font` → monospace      | fuente                |
| `--r-clock-size`           | `1rem`                      | tamaño tipográfico    |
| `--r-clock-letter-spacing` | `0.05em`                    | espaciado de letras   |

---

## tres ejemplos

### 1) mínimo

```html
<r-clock></r-clock>
```

### 2) completo

```html
<r-clock
  format="dd Mon YYYY · hh:MM A"
  timezone="America/New_York"
  lang="en">
</r-clock>
```

### 3) override de CSS

```html
<r-clock
  format="HH:MM:SS"
  style="--r-clock-color: #ef7d57; --r-clock-size: 3rem; --r-clock-letter-spacing: 0.15em;">
</r-clock>
```

---

## eventos

| evento        | cuándo                | `detail`                     |
|---------------|-----------------------|------------------------------|
| `r-clock:tick`| cada segundo          | `{ time: Date }` — la fecha/hora en el momento del tick |

```js
document.querySelector('r-clock').addEventListener('r-clock:tick', e => {
  console.log(e.detail.time); // Date object
});
```

---

## accesibilidad

el componente se anota con `role="timer"` y `aria-live="off"` (sin `aria-live` activo para no interrumpir al lector de pantalla cada segundo). el `aria-label` indica "reloj" / "clock" / "rellotge" según el idioma. si quieres un label personalizado, pasa `aria-label="..."` y se respeta.

el elemento `<time>` interno lleva `datetime` con la ISO string completa de la fecha/hora actual.

---

## comportamiento sin JS

el elemento queda vacío. añade un fallback con `<noscript>` o CSS:

```html
<style>
  r-clock:empty::before {
    content: '--:--:--';
    font-family: monospace;
    opacity: 0.5;
  }
</style>
```

o con noscript:

```html
<r-clock></r-clock>
<noscript>
  <span style="font-family: monospace;">--:--:--</span>
</noscript>
```

---

## nota sobre precisión

`setInterval` puede derivar unos pocos milisegundos por tick. para un reloj de pared es suficiente; para un cronómetro de precisión, no.

---

*retals · vanilla, forever · meowrhino studio*
