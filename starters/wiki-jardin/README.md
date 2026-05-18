# wiki-jardin · starter de retals

> jardín digital / wiki personal — notas que crecen, no posts terminados. estética serif sobre fondo crema.

usa: `r-tabs`, `r-tab`, `r-accordion`, `r-panel`.

## qué incluye

- header con título + breadcrumb
- 3 tabs:
  - **recientes**: notas con fecha, tags y estado de madurez (`brote`, `en crecimiento`...)
  - **por tema**: accordion con categorías expandibles (lectura, trabajo, código, cocina)
  - **sobre este jardín**: meta-explicación del formato
- footer con email

## el patrón del jardín digital

en lugar de blog post (cronológico, "terminado"), las notas tienen **estados de madurez**:

- 🌱 `brote` — idea recién plantada
- 🌿 `en crecimiento` — varias notas o borradores
- 🌳 `verde` — estable
- 🪵 `leñoso` — apenas cambia

inspirado en [Maggie Appleton](https://maggieappleton.com/garden-history) y [gwern](https://gwern.net/about).

## personalizar

- **paleta**: `--accent` verde mojo (`#557a3a`), `--accent-2` terracota para enlaces.
- **añadir notas**: duplica un `.leaf` dentro del tab "recientes". usa `<span class="tag">brote</span>` para etiquetar.
- **añadir categoría**: nuevo `<r-panel title="…">` dentro del accordion.
- **mover una nota** entre estados: cambia el `<span class="tag">`.

## componentes incluidos

los `.js` en `components/` son **tu copia**. snapshot inmutable.

retals · vanilla, forever · meowrhino studio
