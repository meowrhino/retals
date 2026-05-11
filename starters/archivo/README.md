# archivo

starter de retals. índice cronológico de entradas: blog, diario, notas, links. estética 2000s-blogger con monospace dominante y links azules clásicos. sin JS obligatorio.

---

## cómo personalizar

### añadir una entrada

copia este bloque dentro de `<ul class="entry-list">`:

```html
<li class="entry">
  <span class="entry__date">11 may 2026</span>
  <div>
    <div class="entry__title"><a href="entradas/nombre.html">título de la entrada</a></div>
    <div class="entry__tags"><span>#categoria</span></div>
  </div>
</li>
```

las entradas están ordenadas de más reciente a más antiguo. añade un separador de año cuando cambies de año:

```html
<li class="year-header">2025</li>
```

### añadir una entrada con su página propia

crea un archivo `entradas/nombre.html` con el contenido completo. el `index.html` es solo el índice.

### cambiar los colores de los links

en `style.css`:

```css
--link:    #0000cc;   /* azul clásico */
--visited: #551a8b;   /* violeta visitado */
--accent:  #ef7d57;   /* hover coral */
```

o cámbialo todo a monócromo:

```css
--link:    #111111;
--visited: #777777;
--accent:  #111111;
```

### añadir RSS

crea un `feed.xml` con el formato Atom o RSS estándar. muchos editores de texto tienen plantillas. el link al feed ya está en el footer.

### cambiar la tipografía

```css
--font-body: ui-sans-serif, system-ui, sans-serif;  /* sin-serif en lugar de mono */
```

---

## estructura

```
archivo/
├── index.html           ← el índice principal
├── style.css            ← estilos
├── feed.xml             ← RSS (créalo manualmente)
├── entradas/            ← páginas individuales de cada entrada
│   ├── primera.html
│   └── segunda.html
└── README.md
```

---

*retals · vanilla, forever · meowrhino studio*
