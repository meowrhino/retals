// ============================================================================
// <r-tabs> — pestañas accesibles con navegación por teclado
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// uso:
//   <r-tabs>
//     <section data-tab="Inicio">contenido 1</section>
//     <section data-tab="Proyectos">contenido 2</section>
//   </r-tabs>
//
// los children con atributo data-tab se convierten en paneles.
// el texto de data-tab es la etiqueta del botón.
//
// atributos:
//   active   índice (0-based) del tab activo al inicio (default 0)
//   lang     "es" | "en" | "ca" (default es)
//
// eventos:
//   r-tabs:change   detail: { index, label }
//
// keyboard:
//   ←/→  mover entre tabs
//   Home/End  ir al primero/último
//   Tab  entrar al panel activo
//   Enter/Space  activar tab enfocado
//
// CSS vars:
//   --r-tabs-border          borde de la lista de tabs   (default 2px solid ink)
//   --r-tabs-bg              fondo tabs inactivos        (default transparent)
//   --r-tabs-active-bg       fondo tab activo            (default bg)
//   --r-tabs-active-color    color tab activo            (default ink)
//   --r-tabs-inactive-color  color tabs inactivos        (default ink 0.6)
//   --r-tabs-font-size       font-size de los botones    (default 0.9rem)
//   --r-tabs-padding         padding de los botones      (default 0.5rem 1rem)
//   --r-tabs-panel-padding   padding del panel           (default 1rem)
//   --r-tabs-radius          radio de esquinas tab       (default 0)
// ============================================================================

const STYLE_ID = 'r-tabs-styles';

const STRINGS = {
  es: { tablist: 'pestañas de navegación' },
  en: { tablist: 'navigation tabs' },
  ca: { tablist: 'pestanyes de navegació' },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-tabs {
      display: block;
    }
    .r-tabs__list {
      display: flex;
      flex-wrap: wrap;
      gap: 0;
      border-bottom: var(--r-tabs-border, 2px solid var(--r-fg, #1a1a1a));
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .r-tabs__btn {
      font-family: var(--r-font, monospace);
      font-size: var(--r-tabs-font-size, 0.9rem);
      padding: var(--r-tabs-padding, 0.5rem 1rem);
      border: none;
      border-bottom: 3px solid transparent;
      background: var(--r-tabs-bg, transparent);
      color: var(--r-tabs-inactive-color, var(--r-fg, #1a1a1a));
      cursor: pointer;
      opacity: 0.6;
      border-radius: var(--r-tabs-radius, 0) var(--r-tabs-radius, 0) 0 0;
      transition: opacity 0.1s, border-color 0.1s;
      white-space: nowrap;
    }
    .r-tabs__btn:hover {
      opacity: 0.85;
    }
    .r-tabs__btn[aria-selected="true"] {
      background: var(--r-tabs-active-bg, var(--r-bg, #fef8e6));
      color: var(--r-tabs-active-color, var(--r-fg, #1a1a1a));
      border-bottom-color: var(--r-accent, #ef7d57);
      opacity: 1;
      font-weight: bold;
    }
    .r-tabs__btn:focus-visible {
      outline: 2px solid var(--r-accent, #ef7d57);
      outline-offset: -2px;
    }
    .r-tabs__panel {
      padding: var(--r-tabs-panel-padding, 1rem);
    }
    .r-tabs__panel[hidden] {
      display: none;
    }
    @media (prefers-reduced-motion: reduce) {
      .r-tabs__btn { transition: none; }
    }
  `;
  document.head.appendChild(style);
}

let tabsIdCounter = 0;

class RTabs extends HTMLElement {
  static observedAttributes = ['active', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._panels = [];
    this._btns = [];
    this._uid = `r-tabs-${++tabsIdCounter}`;
    this._onBtnClick = this._onBtnClick.bind(this);
    this._onKeydown  = this._onKeydown.bind(this);
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this._build();
      this._mounted = true;
    }
    this._activateIndex(parseInt(this.getAttribute('active') || '0', 10));
  }

  disconnectedCallback() {
    const list = this.querySelector('.r-tabs__list');
    if (list) {
      list.removeEventListener('click',   this._onBtnClick);
      list.removeEventListener('keydown', this._onKeydown);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    if (name === 'active') {
      this._activateIndex(parseInt(newValue || '0', 10));
    }
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  _build() {
    // recopilar panels originales (children con data-tab)
    const originalPanels = Array.from(this.children).filter(el => el.hasAttribute('data-tab'));
    if (!originalPanels.length) return;

    // lista de tabs
    const list = document.createElement('ul');
    list.className = 'r-tabs__list';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', t(this.langCode, 'tablist'));

    this._btns = [];
    this._panels = [];

    originalPanels.forEach((panel, i) => {
      const label  = panel.getAttribute('data-tab');
      const btnId  = `${this._uid}-btn-${i}`;
      const panelId= `${this._uid}-panel-${i}`;

      // botón de tab
      const li = document.createElement('li');
      li.setAttribute('role', 'presentation');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'r-tabs__btn';
      btn.id = btnId;
      btn.textContent = label;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('aria-controls', panelId);
      btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
      li.appendChild(btn);
      list.appendChild(li);
      this._btns.push(btn);

      // panel
      panel.id = panelId;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', btnId);
      panel.setAttribute('tabindex', '0');
      panel.className = (panel.className ? panel.className + ' ' : '') + 'r-tabs__panel';
      this._panels.push(panel);
    });

    // insertar la lista antes del primer panel
    this.insertBefore(list, originalPanels[0]);

    list.addEventListener('click',   this._onBtnClick);
    list.addEventListener('keydown', this._onKeydown);
  }

  _activateIndex(idx) {
    const count = this._btns.length;
    if (!count) return;
    idx = Math.max(0, Math.min(idx, count - 1));

    this._btns.forEach((btn, i) => {
      const active = i === idx;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.setAttribute('tabindex', active ? '0' : '-1');
    });
    this._panels.forEach((panel, i) => {
      if (i === idx) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });
  }

  _onBtnClick(e) {
    const btn = e.target.closest('.r-tabs__btn');
    if (!btn) return;
    const idx = this._btns.indexOf(btn);
    if (idx === -1) return;
    this._activateIndex(idx);
    this.dispatchEvent(new CustomEvent('r-tabs:change', {
      bubbles: true,
      detail: { index: idx, label: btn.textContent },
    }));
  }

  _onKeydown(e) {
    const btn = e.target.closest('.r-tabs__btn');
    if (!btn) return;
    const idx   = this._btns.indexOf(btn);
    const count = this._btns.length;
    let next = idx;

    if      (e.key === 'ArrowRight') next = (idx + 1) % count;
    else if (e.key === 'ArrowLeft')  next = (idx - 1 + count) % count;
    else if (e.key === 'Home')       next = 0;
    else if (e.key === 'End')        next = count - 1;
    else return;

    e.preventDefault();
    this._activateIndex(next);
    this._btns[next].focus();
    this.dispatchEvent(new CustomEvent('r-tabs:change', {
      bubbles: true,
      detail: { index: next, label: this._btns[next].textContent },
    }));
  }
}

customElements.define('r-tabs', RTabs);
