# one-pager

starter de retals. scroll narrativo vertical con cuatro secciones de impacto. tipografía como protagonista: serif para títulos, sans para cuerpo. sin JS obligatorio.

---

## estructura de las secciones

| sección | fondo     | contenido                              |
|---------|-----------|----------------------------------------|
| hero    | claro     | título grande + descripción            |
| dark    | negro     | cita o manifiesto en cursiva           |
| content | claro     | dos columnas de texto                  |
| accent  | coral     | call to action + email de contacto     |

---

## cómo personalizar

### cambiar textos

abre `index.html` y edita los textos entre `[corchetes]`. cada sección tiene comentarios explicando qué va dónde.

### cambiar colores de sección

en `style.css`:

```css
--section-2-bg: #111111;   /* fondo dark */
--section-4-bg: #ef7d57;   /* fondo accent (coral) */
```

### cambiar tipografía del título hero

```css
.hero__title {
  font-family: var(--font-serif);  /* Georgia */
  /* o var(--font-mono) para monospace */
}
```

### cambiar el color de acento

```css
--accent: #ef7d57;  /* cambia aquí */
```

---

## el nav usa mix-blend-mode: difference

el menú superior cambia de color automáticamente según el fondo de la sección visible. en fondos claros aparece oscuro; en fondos oscuros aparece claro. no necesitas cambiarlo.

---

*retals · vanilla, forever · meowrhino studio*
