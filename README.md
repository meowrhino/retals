# retals

> bloques para hacerte una web. cópialos, pégalos, modifícalos. el código es tuyo.

🌐 **web del proyecto** — https://meowrhino.github.io/retals/
✺ **editor en navegador** — https://meowrhino.github.io/retals/editor/editor.html

retals es una biblioteca de Web Components vanilla + un editor en navegador para hacer webs personales con la filosofía de Geocities, la ligereza del JAMstack, y el respeto por el código del visitante.

## qué te ofrece

- **biblioteca de bloques** — `<r-gallery>`, `<r-window>`, `<r-jukebox>`, y más. los pegas en tu HTML y funcionan.
- **editor en navegador** — preview en vivo, biblioteca lateral, descarga como ZIP autocontenido.
- **starters** — arquetipos de webs listas para descargar y personalizar.
- **integración con [imgToWeb](https://meowrhino.github.io/imgToWeb/) y [videoToWeb](https://meowrhino.github.io/videoToWeb/)** — tus fotos y vídeos optimizados antes de salir del navegador.

## qué NO te ofrece

- frameworks. cero. vanilla, forever.
- lock-in. si retals desaparece, tu web sigue funcionando.
- tracking. analytics. cookies. nada.
- un marco con su marca alrededor de tu contenido.

## empezar

1. **descarga un starter** desde `starters/` o usa el editor en línea.
2. **edita texto e imágenes** en el HTML descargado.
3. **comprime tu media** con imgToWeb / videoToWeb.
4. **sube la carpeta** a Neocities, GitHub Pages, Codeberg, tu servidor — donde quieras.

## desarrollo

```bash
cd retals
python3 -m http.server 8080
# abrir http://localhost:8080/editor/
```

## documentación

- [`CLAUDE.md`](./CLAUDE.md) — contrato del proyecto y convenciones de código
- [`ROADMAP.md`](./ROADMAP.md) — fases y tareas
- [`DESIGN.md`](./DESIGN.md) — dirección estética
- [`TESTING.md`](./TESTING.md) — checkpoints manuales
- [`docs/`](./docs/) — referencia de cada componente

---

made in barcelona ☼ meowrhino studio · vanilla, forever
