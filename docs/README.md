# docs/

documentación pública de cada componente. uno por componente:

```
docs/
├── r-window.md
├── r-gallery.md
├── r-jukebox.md
└── ...
```

estructura sugerida para cada archivo:

1. **qué es** — una frase
2. **uso mínimo** — snippet copy-paste más corto posible
3. **uso completo** — snippet con todos los atributos
4. **atributos** — tabla con nombre, valores, default
5. **slots / children** — qué contenido acepta dentro
6. **eventos emitidos** — lista con nombre y `detail`
7. **CSS vars** — qué `--r-*` respeta
8. **fallback** — cómo se ve sin JS
9. **ejemplos** — al menos 3 variantes
