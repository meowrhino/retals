# `<r-tabs>`

pestañas accesibles con navegación por teclado. los paneles se definen como children con `data-tab`. vanilla, light DOM, fallback con todos los paneles visibles sin JS.

---

## uso mínimo

```html
<r-tabs>
  <section data-tab="Inicio">Contenido del inicio.</section>
  <section data-tab="Sobre mí">Quién soy.</section>
  <section data-tab="Contacto">Cómo llegar.</section>
</r-tabs>

<script type="module" src="components/r-tabs.js"></script>
```

---

## atributos

| atributo | tipo     | default | descripción |
|----------|----------|---------|-------------|
| `active` | number   | `0`     | índice (0-based) del tab activo al iniciar. |
| `lang`   | `es`·`en`·`ca` | `es` | idioma del `aria-label` de la lista. |

**contenido:** cualquier elemento hijo con atributo `data-tab` se convierte en panel. el valor de `data-tab` es la etiqueta del botón.

---

## CSS variables

| variable                   | default                   | qué controla                  |
|----------------------------|---------------------------|-------------------------------|
| `--r-tabs-border`          | `2px solid #1a1a1a`       | borde bajo la lista de tabs   |
| `--r-tabs-bg`              | `transparent`             | fondo tabs inactivos          |
| `--r-tabs-active-bg`       | `--r-bg`                  | fondo tab activo              |
| `--r-tabs-active-color`    | `--r-fg`                  | color tab activo              |
| `--r-tabs-inactive-color`  | `--r-fg` 60%              | color tabs inactivos          |
| `--r-tabs-font-size`       | `0.9rem`                  | tamaño fuente botones         |
| `--r-tabs-padding`         | `0.5rem 1rem`             | padding de los botones        |
| `--r-tabs-panel-padding`   | `1rem`                    | padding del panel activo      |
| `--r-tabs-radius`          | `0`                       | radio superior de los tabs    |

---

## tres ejemplos

### 1) mínimo
```html
<r-tabs>
  <section data-tab="A">Panel A</section>
  <section data-tab="B">Panel B</section>
</r-tabs>
```

### 2) con tab inicial distinto
```html
<r-tabs active="2">
  <section data-tab="Uno">Panel 1</section>
  <section data-tab="Dos">Panel 2</section>
  <section data-tab="Tres">Panel 3 — abierto por defecto</section>
</r-tabs>
```

### 3) override CSS con acento coral
```html
<r-tabs style="--r-tabs-border:2px solid #ef7d57;--r-accent:#ef7d57;">
  <section data-tab="A">Panel A</section>
  <section data-tab="B">Panel B</section>
</r-tabs>
```

---

## eventos

| evento          | cuándo                   | `detail`               |
|-----------------|--------------------------|------------------------|
| `r-tabs:change` | al cambiar pestaña       | `{ index, label }`     |

---

## teclado

| tecla       | acción                        |
|-------------|-------------------------------|
| `←` / `→`  | tab anterior / siguiente       |
| `Home`      | primer tab                    |
| `End`       | último tab                    |
| `Tab`       | entrar al panel activo        |

---

## comportamiento sin JS

todos los paneles son visibles con sus etiquetas `data-tab` como texto. sin pestañas, pero todo el contenido accesible.

---

*retals · vanilla, forever · meowrhino studio*
