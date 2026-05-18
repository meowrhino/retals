# zine-personal · starter de retals

> diario abierto / cuaderno digital — estética 2000s blogger sobre papel hueso.

usa: `r-marquee`, `r-glitch`, `r-typewriter`, `r-divider`.

## qué incluye

- header con título glitcheado y subtítulo
- frase introductoria que se escribe sola
- 3 entradas de diario con fecha y citas
- marquee superior con texto rotando
- 2 dividers decorativos

## personalizar

todo se edita en `index.html`. piezas clave:

- **título**: cambia `<r-glitch>diario · meri</r-glitch>` por tu nombre.
- **entradas**: duplica `<article class="entry">` para añadir más.
- **paleta**: las variables `--bg`, `--ink`, `--accent` en `:root`. cambia los hex y el resto se ajusta solo.
- **marquee**: el texto va dentro del propio `<r-marquee>`. ajusta `speed="55"` (mayor = más rápido).

## componentes incluidos

los `.js` en `components/` son **tu copia**. snapshot inmutable: aunque retals desaparezca, tu web sigue funcionando.

## hosting

doble click en `index.html` funciona offline. para subirlo:
- **Neocities**: arrastra la carpeta a la interfaz web.
- **GitHub Pages**: push del repo, activa Pages en la rama main.

retals · vanilla, forever · meowrhino studio
