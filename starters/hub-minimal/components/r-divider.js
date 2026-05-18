// ============================================================================
// <r-divider> — separador decorativo (glifo, SVG, GIF, texto literal)
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// atributos:
//   glyph    el carácter a repetir (default: ✦)         · ignorado si hay children
//   repeat   cuántas veces repetir el glyph (default 3) · ignorado si hay children
//   lang     "es" | "en" | "ca" (default es)            · solo para aria-label opcional
//
// children:
//   si hay contenido interno (texto, <img>, <svg>, etc.) se renderiza tal cual,
//   centrado y con la separación estándar — el glyph/repeat se ignoran.
//
// eventos: ninguno (decorativo).
//
// CSS vars:
//   --r-divider-color     color de los glifos    (fallback --r-fg)
//   --r-divider-size      tamaño del glifo       (default 1.2rem)
//   --r-divider-gap       separación entre items (default 1rem)
//   --r-divider-margin    margen exterior        (default 1.5rem auto)
//   --r-divider-opacity   transparencia          (default 0.7)
// ============================================================================

const STYLE_ID = 'r-divider-styles';

const STRINGS = {
  es: { sep: 'separador decorativo' },
  en: { sep: 'decorative separator' },
  ca: { sep: 'separador decoratiu' },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-divider {
      display: block;
      text-align: center;
      margin: var(--r-divider-margin, 1.5rem auto);
      color: var(--r-divider-color, var(--r-fg, #1a1a1a));
      font-size: var(--r-divider-size, 1.2rem);
      line-height: 1;
      opacity: var(--r-divider-opacity, 0.7);
    }
    r-divider.r-divider--ready {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--r-divider-gap, 1rem);
      flex-wrap: wrap;
    }
    .r-divider__item {
      display: inline-block;
      user-select: none;
    }
    .r-divider__custom {
      display: inline-flex;
      align-items: center;
      gap: var(--r-divider-gap, 1rem);
    }
    .r-divider__custom > * { display: inline-block; }
  `;
  document.head.appendChild(style);
}

class RDivider extends HTMLElement {
  static observedAttributes = ['glyph', 'repeat', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._originalContent = '';
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this._originalContent = this.innerHTML.trim();
      this.innerHTML = '';
      this._mounted = true;
    }
    this.classList.add('r-divider--ready');
    this.setAttribute('role', 'separator');
    this.setAttribute('aria-orientation', 'horizontal');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', t(this.langCode, 'sep'));
    }
    this._render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    if (name === 'lang') {
      this.setAttribute('aria-label', t(this.langCode, 'sep'));
    }
    this._render();
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  _render() {
    if (this._originalContent) {
      this.innerHTML = `<span class="r-divider__custom">${this._originalContent}</span>`;
      return;
    }
    const glyph = this.getAttribute('glyph') || '✦';
    const repeatRaw = parseInt(this.getAttribute('repeat'), 10);
    const repeat = Number.isFinite(repeatRaw) && repeatRaw > 0 ? Math.min(repeatRaw, 50) : 3;
    const items = Array.from({ length: repeat }, () =>
      `<span class="r-divider__item" aria-hidden="true">${this._escape(glyph)}</span>`
    ).join('');
    this.innerHTML = items;
  }

  _escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

customElements.define('r-divider', RDivider);
