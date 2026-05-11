// ============================================================================
// <r-accordion> — secciones expandibles accesibles
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// uso:
//   <r-accordion>
//     <section data-label="Pregunta 1">Respuesta 1...</section>
//     <section data-label="Pregunta 2">Respuesta 2...</section>
//   </r-accordion>
//
// los children con atributo data-label se convierten en secciones.
//
// atributos:
//   multiple   atributo booleano — permite varias secciones abiertas a la vez
//   open       índice de la sección abierta por defecto (0-based, default -1 = ninguna)
//              con `multiple`, puede ser "0,2" para abrir varias
//   lang       "es" | "en" | "ca" (default es)
//
// keyboard:
//   Enter/Space  abrir/cerrar
//   ↑/↓          mover entre cabeceras
//   Home/End     primera/última
//
// eventos:
//   r-accordion:open    detail: { index, label }
//   r-accordion:close   detail: { index, label }
//
// CSS vars:
//   --r-accordion-border          borde entre items       (default 1px solid ink)
//   --r-accordion-bg              fondo cabecera          (default transparent)
//   --r-accordion-bg-open         fondo cabecera abierta  (default transparent)
//   --r-accordion-color           color cabecera          (fallback --r-fg)
//   --r-accordion-padding         padding cabecera        (default 0.75rem 1rem)
//   --r-accordion-panel-padding   padding del panel       (default 0.75rem 1rem)
//   --r-accordion-font-size       tamaño fuente           (default 0.95rem)
//   --r-accordion-icon            icono cerrado           (default "▸")
//   --r-accordion-icon-open       icono abierto           (default "▾")
// ============================================================================

const STYLE_ID = 'r-accordion-styles';

const STRINGS = {
  es: { expand: 'expandir', collapse: 'colapsar' },
  en: { expand: 'expand',   collapse: 'collapse' },
  ca: { expand: 'expandir', collapse: 'col·lapsar' },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-accordion {
      display: block;
      border: 1px solid var(--r-accordion-border, var(--r-fg, #1a1a1a));
    }
    .r-accordion__item {
      border-bottom: var(--r-accordion-border, 1px solid var(--r-fg, #1a1a1a));
    }
    .r-accordion__item:last-child { border-bottom: none; }
    .r-accordion__btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: var(--r-accordion-padding, 0.75rem 1rem);
      background: var(--r-accordion-bg, transparent);
      border: none;
      text-align: left;
      font-family: var(--r-font, monospace);
      font-size: var(--r-accordion-font-size, 0.95rem);
      color: var(--r-accordion-color, var(--r-fg, #1a1a1a));
      cursor: pointer;
    }
    .r-accordion__btn:hover {
      background: var(--r-accordion-bg-hover, rgba(0,0,0,0.04));
    }
    .r-accordion__btn:focus-visible {
      outline: 2px solid var(--r-accent, #ef7d57);
      outline-offset: -2px;
    }
    .r-accordion__btn[aria-expanded="true"] {
      background: var(--r-accordion-bg-open, transparent);
      font-weight: bold;
    }
    .r-accordion__icon {
      flex-shrink: 0;
      margin-left: 0.5rem;
      font-style: normal;
      user-select: none;
      transition: transform 0.2s ease;
    }
    .r-accordion__btn[aria-expanded="true"] .r-accordion__icon {
      transform: rotate(90deg);
    }
    .r-accordion__panel {
      padding: var(--r-accordion-panel-padding, 0.75rem 1rem);
      overflow: hidden;
    }
    .r-accordion__panel[hidden] { display: none; }
    .r-accordion__panel > *:first-child { margin-top: 0; }
    .r-accordion__panel > *:last-child  { margin-bottom: 0; }
    @media (prefers-reduced-motion: reduce) {
      .r-accordion__icon { transition: none; }
    }
  `;
  document.head.appendChild(style);
}

let accordionIdCounter = 0;

class RAccordion extends HTMLElement {
  static observedAttributes = ['multiple', 'open', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._items = []; // [{ btn, panel, label }]
    this._uid = `r-accordion-${++accordionIdCounter}`;
    this._onBtnClick = this._onBtnClick.bind(this);
    this._onKeydown  = this._onKeydown.bind(this);
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this._build();
      this._mounted = true;
    }
    this._applyInitialOpen();
  }

  disconnectedCallback() {
    this.removeEventListener('click',   this._onBtnClick);
    this.removeEventListener('keydown', this._onKeydown);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    if (name === 'open') this._applyInitialOpen();
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  _build() {
    const sections = Array.from(this.children).filter(el => el.hasAttribute('data-label'));
    if (!sections.length) return;

    this.setAttribute('role', 'region');
    this._items = [];

    sections.forEach((section, i) => {
      const label   = section.getAttribute('data-label');
      const btnId   = `${this._uid}-btn-${i}`;
      const panelId = `${this._uid}-panel-${i}`;
      const content = section.innerHTML;

      const item = document.createElement('div');
      item.className = 'r-accordion__item';

      const h = document.createElement('h3');
      h.style.margin = '0';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = btnId;
      btn.className = 'r-accordion__btn';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', panelId);

      const labelSpan = document.createElement('span');
      labelSpan.textContent = label;

      const icon = document.createElement('span');
      icon.className = 'r-accordion__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '▸';

      btn.appendChild(labelSpan);
      btn.appendChild(icon);
      h.appendChild(btn);

      const panel = document.createElement('div');
      panel.id = panelId;
      panel.className = 'r-accordion__panel';
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', btnId);
      panel.setAttribute('hidden', '');
      panel.innerHTML = content;

      item.appendChild(h);
      item.appendChild(panel);

      this._items.push({ btn, panel, label });
      section.replaceWith(item);
    });

    this.addEventListener('click',   this._onBtnClick);
    this.addEventListener('keydown', this._onKeydown);
  }

  _applyInitialOpen() {
    const openAttr = this.getAttribute('open');
    if (openAttr === null || openAttr === '') return;
    const indices = openAttr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    indices.forEach(idx => this._setOpen(idx, true, false));
  }

  _setOpen(idx, open, emit = true) {
    const item = this._items[idx];
    if (!item) return;
    item.btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      item.panel.removeAttribute('hidden');
    } else {
      item.panel.setAttribute('hidden', '');
    }
    if (emit) {
      this.dispatchEvent(new CustomEvent(open ? 'r-accordion:open' : 'r-accordion:close', {
        bubbles: true,
        detail: { index: idx, label: item.label },
      }));
    }
  }

  _toggle(idx) {
    const item = this._items[idx];
    if (!item) return;
    const isOpen = item.btn.getAttribute('aria-expanded') === 'true';
    if (!isOpen && !this.hasAttribute('multiple')) {
      // cerrar los demás
      this._items.forEach((_, i) => { if (i !== idx) this._setOpen(i, false); });
    }
    this._setOpen(idx, !isOpen);
  }

  _onBtnClick(e) {
    const btn = e.target.closest('.r-accordion__btn');
    if (!btn) return;
    const idx = this._items.findIndex(item => item.btn === btn);
    if (idx === -1) return;
    this._toggle(idx);
  }

  _onKeydown(e) {
    const btn = e.target.closest('.r-accordion__btn');
    if (!btn) return;
    const idx   = this._items.findIndex(item => item.btn === btn);
    const count = this._items.length;
    let next = idx;

    if      (e.key === 'ArrowDown')  next = (idx + 1) % count;
    else if (e.key === 'ArrowUp')    next = (idx - 1 + count) % count;
    else if (e.key === 'Home')       next = 0;
    else if (e.key === 'End')        next = count - 1;
    else return;

    e.preventDefault();
    this._items[next].btn.focus();
  }
}

customElements.define('r-accordion', RAccordion);
