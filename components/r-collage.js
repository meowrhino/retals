// ============================================================================
// <r-collage> — lienzo libre que escala entero con el ancho
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// el lienzo mide `width` unidades de ancho. una unidad vale
// (ancho disponible / width) y como mucho 1px: en el móvil el collage se
// encoge entero (posiciones, anchos y letra); en escritorio se queda a
// `width` px, centrado. lo que cae fuera de 0–width solo se ve en pantallas
// anchas (los márgenes).
//
// la unidad la mide el JS (--r-collage-u, en px) y no una unidad de
// contenedor (cqw): así la letra escalada se hereda desde <r-collage> y un
// <h1> o un font-size en em dentro del collage siguen funcionando.
//
// atributos de <r-collage>:
//   width    ancho de referencia del lienzo, en unidades (default 600)
//   height   alto del lienzo, en unidades (default: lo que ocupen los bloques)
//
// atributos de cada hijo directo (cualquier elemento):
//   x, y     centro del bloque, en unidades del lienzo
//   w        ancho del bloque, en unidades
//   rot      giro en grados
//   z        orden de apilado (z-index)
//   un hijo sin x ni y no se coloca: se queda en el flujo, debajo del lienzo.
//
// sin eventos y sin textos propios (no hay UI que traducir).
//
// CSS vars que respeta:
//   --r-collage-bg          fondo del lienzo                (transparent)
//   --r-collage-font-size   tamaño de letra, en unidades    (16)
//
// CSS vars que escribe (para leerlas desde tu CSS si quieres):
//   en <r-collage>: --r-collage-width, --r-collage-height, --r-collage-u (1 unidad)
//   en cada bloque: --r-collage-x, -y, -w, -rot, -z
// ============================================================================

const STYLE_ID = 'r-collage-styles';
const PLACE_ATTRS = ['x', 'y', 'w', 'rot', 'z'];

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-collage.r-collage--ready {
      display: block;
      position: relative;
      overflow-x: clip;
      /* el alto va en padding: los hijos sin colocar caen debajo del lienzo */
      padding-top: calc(var(--r-collage-height, 0) * var(--r-collage-u, 1px));
      font-size: calc(var(--r-collage-font-size, 16) * var(--r-collage-u, 1px));
      background: var(--r-collage-bg, transparent);
    }
    .r-collage__item {
      position: absolute;
      box-sizing: border-box;
      margin: 0;
      left: calc(50% + (var(--r-collage-x, 0) - var(--r-collage-width, 600) / 2) * var(--r-collage-u, 1px));
      top: calc(var(--r-collage-y, 0) * var(--r-collage-u, 1px));
      width: calc(var(--r-collage-w) * var(--r-collage-u, 1px));
      z-index: var(--r-collage-z, auto);
      transform: translate(-50%, -50%) rotate(calc(var(--r-collage-rot, 0) * 1deg));
    }
    :is(img, video).r-collage__item { height: auto; }
  `;
  document.head.appendChild(style);
}

class RCollage extends HTMLElement {
  static observedAttributes = ['width', 'height'];

  connectedCallback() {
    injectStyles();
    this._resizes = new ResizeObserver(() => this._measure());
    // hijos que entran o salen, o a los que les cambian x/y/w/rot/z
    this._changes = new MutationObserver((list) => {
      if (list.some(m => m.target === this || m.target.parentElement === this)) this._place();
    });
    this._changes.observe(this, {
      childList: true, subtree: true, attributes: true, attributeFilter: PLACE_ATTRS,
    });
    this.classList.add('r-collage--ready');
    this._place();
  }

  disconnectedCallback() {
    this._resizes.disconnect();
    this._changes.disconnect();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this._resizes) this._place();
  }

  get refWidth() {
    const n = parseFloat(this.getAttribute('width'));
    return n > 0 ? n : 600;
  }

  // pasa los atributos visibles de cada hijo a variables CSS en línea;
  // una sola regla (.r-collage__item) hace el resto.
  _place() {
    this.style.setProperty('--r-collage-width', this.refWidth);
    this._resizes.disconnect();
    this._resizes.observe(this);
    for (const el of this.children) {
      const placed = el.hasAttribute('x') || el.hasAttribute('y');
      el.classList.toggle('r-collage__item', placed);
      if (!placed) continue;
      for (const attr of PLACE_ATTRS) {
        const n = parseFloat(el.getAttribute(attr));
        // 'initial' = variable vacía: manda el valor por defecto de la regla
        // y no se hereda la de un collage de fuera.
        el.style.setProperty(`--r-collage-${attr}`, Number.isFinite(n) ? n : 'initial');
      }
      this._resizes.observe(el);
    }
    this._measure();
  }

  // la unidad (ancho / width, como mucho 1px) y el alto del lienzo: el
  // atributo height, o hasta donde llegue el bloque más bajo
  _measure() {
    const unit = Math.min(this.clientWidth / this.refWidth, 1);
    if (!unit) return; // sin ancho (display: none): no hay nada que medir
    this.style.setProperty('--r-collage-u', `${unit}px`);
    let height = parseFloat(this.getAttribute('height'));
    if (!(height >= 0)) {
      let bottom = 0;
      for (const el of this.children) {
        if (!el.classList.contains('r-collage__item')) continue;
        bottom = Math.max(bottom, el.offsetTop + el.offsetHeight / 2);
      }
      height = Math.ceil(bottom / unit);
    }
    this.style.setProperty('--r-collage-height', height);
  }
}

customElements.define('r-collage', RCollage);
