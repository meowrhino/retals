// ============================================================================
// <r-tooltip> — tooltip accesible anclado a un elemento
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// atributos:
//   text      texto del tooltip (si no hay, usa el attr title del trigger)
//   position  "top" | "bottom" | "left" | "right" (default top)
//   trigger   "hover" | "focus" | "click" (default hover — siempre incluye focus)
//   delay     ms antes de aparecer (default 0)
//   lang      "es" | "en" | "ca" (default es)
//
// contenido:
//   los children se usan como trigger. el tooltip se genera desde `text`.
//   para tooltip con HTML rico: usa el attr text para el label accesible
//   y añade un child con slot data-tooltip-content para el HTML del tooltip.
//
// eventos:
//   r-tooltip:show  · r-tooltip:hide
//
// CSS vars:
//   --r-tooltip-bg          fondo del tooltip       (default ink)
//   --r-tooltip-color       color del texto         (default cream)
//   --r-tooltip-size        font-size               (default 0.8rem)
//   --r-tooltip-padding     padding                 (default 0.3rem 0.65rem)
//   --r-tooltip-radius      border-radius           (default 2px)
//   --r-tooltip-offset      distancia al trigger    (default 8px)
//   --r-tooltip-z           z-index                 (default 1000)
// ============================================================================

const STYLE_ID = 'r-tooltip-styles';

const STRINGS = {
  es: { label: 'información adicional' },
  en: { label: 'additional information' },
  ca: { label: 'informació addicional' },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-tooltip {
      display: inline-block;
      position: relative;
    }
    .r-tooltip__box {
      position: absolute;
      background: var(--r-tooltip-bg, var(--r-fg, #1a1a1a));
      color: var(--r-tooltip-color, var(--r-bg, #fef8e6));
      font-size: var(--r-tooltip-size, 0.8rem);
      padding: var(--r-tooltip-padding, 0.3rem 0.65rem);
      border-radius: var(--r-tooltip-radius, 2px);
      white-space: nowrap;
      pointer-events: none;
      z-index: var(--r-tooltip-z, 1000);
      max-width: 260px;
      white-space: normal;
      line-height: 1.4;
      /* visibilidad gestionada por JS */
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.12s ease, visibility 0.12s ease;
    }
    .r-tooltip__box--visible {
      visibility: visible;
      opacity: 1;
    }
    /* posicionamiento */
    .r-tooltip__box[data-pos="top"] {
      bottom: calc(100% + var(--r-tooltip-offset, 8px));
      left: 50%;
      transform: translateX(-50%);
    }
    .r-tooltip__box[data-pos="bottom"] {
      top: calc(100% + var(--r-tooltip-offset, 8px));
      left: 50%;
      transform: translateX(-50%);
    }
    .r-tooltip__box[data-pos="left"] {
      right: calc(100% + var(--r-tooltip-offset, 8px));
      top: 50%;
      transform: translateY(-50%);
    }
    .r-tooltip__box[data-pos="right"] {
      left: calc(100% + var(--r-tooltip-offset, 8px));
      top: 50%;
      transform: translateY(-50%);
    }
    @media (prefers-reduced-motion: reduce) {
      .r-tooltip__box { transition: none; }
    }
  `;
  document.head.appendChild(style);
}

class RTooltip extends HTMLElement {
  static observedAttributes = ['text', 'position', 'trigger', 'delay', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._triggerEl = null;
    this._boxEl = null;
    this._timeoutId = null;
    this._show = this._show.bind(this);
    this._hide = this._hide.bind(this);
    this._toggle = this._toggle.bind(this);
    this._onKeydown = this._onKeydown.bind(this);
    this._onClickOutside = this._onClickOutside.bind(this);
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      // preservar contenido como trigger
      const triggerContent = this.innerHTML;
      this.innerHTML = '';

      // wrapper del trigger
      this._triggerEl = document.createElement('span');
      this._triggerEl.className = 'r-tooltip__trigger';
      this._triggerEl.innerHTML = triggerContent;

      // caja del tooltip
      this._boxEl = document.createElement('div');
      this._boxEl.className = 'r-tooltip__box';
      this._boxEl.setAttribute('role', 'tooltip');

      this.appendChild(this._triggerEl);
      this.appendChild(this._boxEl);
      this._mounted = true;
    }
    this._update();
    this._bindEvents();
  }

  disconnectedCallback() {
    this._unbindEvents();
    clearTimeout(this._timeoutId);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    if (name === 'trigger') {
      this._unbindEvents();
      this._update();
      this._bindEvents();
    } else {
      this._update();
    }
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  _update() {
    const text = this.getAttribute('text') || '';
    const pos  = this.getAttribute('position') || 'top';

    // contenido del tooltip: attr text, o child con data-tooltip-content
    const richChild = this.querySelector('[data-tooltip-content]');
    if (richChild) {
      this._boxEl.innerHTML = richChild.innerHTML;
      richChild.style.display = 'none';
    } else {
      this._boxEl.textContent = text;
    }

    this._boxEl.setAttribute('data-pos', pos);

    // generar id único para aria-describedby
    if (!this._boxEl.id) {
      this._boxEl.id = `r-tooltip-${Math.random().toString(36).slice(2, 8)}`;
    }
    this._triggerEl.setAttribute('aria-describedby', this._boxEl.id);
  }

  _bindEvents() {
    const triggerType = this.getAttribute('trigger') || 'hover';

    if (triggerType === 'click') {
      this._triggerEl.addEventListener('click', this._toggle);
      document.addEventListener('click', this._onClickOutside);
    } else {
      // hover + siempre focus
      this._triggerEl.addEventListener('mouseenter', this._show);
      this._triggerEl.addEventListener('mouseleave', this._hide);
    }
    this._triggerEl.addEventListener('focusin',  this._show);
    this._triggerEl.addEventListener('focusout', this._hide);
    this._triggerEl.addEventListener('keydown',  this._onKeydown);
  }

  _unbindEvents() {
    this._triggerEl.removeEventListener('click',      this._toggle);
    this._triggerEl.removeEventListener('mouseenter', this._show);
    this._triggerEl.removeEventListener('mouseleave', this._hide);
    this._triggerEl.removeEventListener('focusin',    this._show);
    this._triggerEl.removeEventListener('focusout',   this._hide);
    this._triggerEl.removeEventListener('keydown',    this._onKeydown);
    document.removeEventListener('click', this._onClickOutside);
  }

  _show() {
    const delay = parseInt(this.getAttribute('delay') || '0', 10);
    clearTimeout(this._timeoutId);
    this._timeoutId = setTimeout(() => {
      this._boxEl.classList.add('r-tooltip__box--visible');
      this.dispatchEvent(new CustomEvent('r-tooltip:show', { bubbles: true }));
    }, delay);
  }

  _hide() {
    clearTimeout(this._timeoutId);
    this._boxEl.classList.remove('r-tooltip__box--visible');
    this.dispatchEvent(new CustomEvent('r-tooltip:hide', { bubbles: true }));
  }

  _toggle() {
    if (this._boxEl.classList.contains('r-tooltip__box--visible')) {
      this._hide();
    } else {
      this._show();
    }
  }

  _onKeydown(e) {
    if (e.key === 'Escape') this._hide();
  }

  _onClickOutside(e) {
    if (!this.contains(e.target)) this._hide();
  }
}

customElements.define('r-tooltip', RTooltip);
