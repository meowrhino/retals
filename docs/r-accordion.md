# `<r-accordion>`

secciones expandibles accesibles. los paneles se definen como children con `data-label`. abre uno o varios a la vez. vanilla, light DOM, fallback con todo el contenido visible sin JS.

---

## uso mínimo

```html
<r-accordion>
  <section data-label="Pregunta 1">Respuesta 1.</section>
  <section data-label="Pregunta 2">Respuesta 2.</section>
</r-accordion>

<script type="module" src="components/r-accordion.js"></script>
```

---

## atributos

| atributo   | tipo / valores     | default | descripción |
|------------|--------------------|---------|-------------|
| `multiple` | boolean (atributo) | —       | si está presente, permite varias secciones abiertas a la vez. |
| `open`     | number (o "0,2")   | —       | índice(s) de la sección abierta al inicio. con `multiple`, separar por comas. |
| `lang`     | `es`·`en`·`ca`    | `es`    | idioma de los labels de accesibilidad. |

**contenido:** cualquier hijo con `data-label` se convierte en sección. el valor de `data-label` es el texto del encabezado.

---

## CSS variables

| variable                      | default               | qué controla                      |
|-------------------------------|-----------------------|-----------------------------------|
| `--r-accordion-border`        | `1px solid #1a1a1a`   | borde entre secciones             |
| `--r-accordion-bg`            | `transparent`         | fondo de los encabezados          |
| `--r-accordion-bg-open`       | `transparent`         | fondo encabezado abierto          |
| `--r-accordion-bg-hover`      | `rgba(0,0,0,0.04)`    | fondo en hover                    |
| `--r-accordion-color`         | `--r-fg`              | color del texto del encabezado    |
| `--r-accordion-padding`       | `0.75rem 1rem`        | padding del encabezado            |
| `--r-accordion-panel-padding` | `0.75rem 1rem`        | padding del contenido             |
| `--r-accordion-font-size`     | `0.95rem`             | tamaño fuente encabezados         |

---

## tres ejemplos

### 1) mínimo — FAQ
```html
<r-accordion>
  <section data-label="¿Qué es retals?">
    Una biblioteca de Web Components vanilla.
  </section>
  <section data-label="¿Necesito JS?">
    No para leer el contenido; sí para la interacción.
  </section>
</r-accordion>
```

### 2) varias secciones abiertas + sección pre-abierta
```html
<r-accordion multiple open="0,2">
  <section data-label="A">Abierta al inicio</section>
  <section data-label="B">Cerrada al inicio</section>
  <section data-label="C">También abierta al inicio</section>
</r-accordion>
```

### 3) override CSS
```html
<r-accordion style="
  --r-accordion-border: 1px solid #ef7d57;
  --r-accordion-bg-open: #ef7d57;
  --r-accordion-color: #1a1a1a;" open="0">
  <section data-label="Sección">Contenido.</section>
</r-accordion>
```

---

## eventos

| evento               | cuándo          | `detail`              |
|----------------------|-----------------|-----------------------|
| `r-accordion:open`   | al expandir     | `{ index, label }`    |
| `r-accordion:close`  | al colapsar     | `{ index, label }`    |

---

## teclado

| tecla          | acción                           |
|----------------|----------------------------------|
| `Enter`/`Space`| expandir/colapsar la sección     |
| `↑` / `↓`     | encabezado anterior / siguiente  |
| `Home`         | primer encabezado                |
| `End`          | último encabezado                |

---

## comportamiento sin JS

todos los paneles son visibles con sus etiquetas `data-label` como texto. sin expandir/colapsar, pero todo el contenido accesible.

---

*retals · vanilla, forever · meowrhino studio*
