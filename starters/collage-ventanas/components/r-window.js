// ============================================================================
// <r-window> — ventana arrastrable y redimensionable con tres temas
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// atributos:
//   title         texto de la barra superior
//   x, y          posición (px o cualquier longitud CSS válida)
//   w, h          dimensiones (px o cualquier longitud CSS válida)
//   theme         "none" (default, meowrhino) | "win95" | "macos"
//   resizable     "false" para desactivar resize (default: activo)
//   closable      "false" para esconder botón cerrar (default: activo)
//   minimizable   "true" para mostrar botón minimizar (default: no)
//   lang          "es" (default) | "en" | "ca"
//
// eventos custom (todos bubbles: true):
//   r-window:move      detail: { x, y }       al soltar drag
//   r-window:resize    detail: { w, h }       al soltar resize
//   r-window:close     detail: { title, id }  cancelable; click en cerrar / Esc
//   r-window:minimize  detail: { minimized }  toggle al click en minimizar
//
// CSS vars que respeta (con fallback a las globales --r-*):
//   --r-window-bg          fondo del body            (fallback --r-bg, #fff)
//   --r-window-fg          texto del body            (fallback --r-fg, #1a1a1a)
//   --r-window-header-bg   fondo de la barra         (fallback --r-accent / --amber)
//   --r-window-header-fg   texto de la barra         (fallback --r-fg)
//   --r-window-border      color de borde            (fallback --r-border / --ink)
//   --r-window-shadow      sombra exterior           (depende del tema)
// ============================================================================

const STYLE_ID = 'r-window-styles';

const STRINGS = {
  es: { close: 'cerrar', minimize: 'minimizar', resize: 'redimensionar' },
  en: { close: 'close',  minimize: 'minimize',  resize: 'resize' },
  ca: { close: 'tancar', minimize: 'minimitzar', resize: 'redimensionar' },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function toCssLen(v) {
  if (v == null || v === '') return null;
  if (/^-?\d+(\.\d+)?$/.test(String(v))) return `${v}px`;
  return v;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* ===== fallback sin JS: bloque legible con título sintético ===== */
    r-window {
      display: block;
      box-sizing: border-box;
      border: 1px solid var(--r-window-border, var(--r-border, #d4d4d0));
      background: var(--r-window-bg, var(--r-bg, #fff));
      color: var(--r-window-fg, var(--r-fg, #1a1a1a));
      margin: 1rem 0;
      padding: 0;
      font-family: var(--r-font, system-ui, sans-serif);
    }
    r-window::before {
      content: attr(title);
      display: block;
      padding: 0.5rem 0.75rem;
      background: var(--r-window-header-bg, var(--r-accent, #ef7d57));
      color: var(--r-window-header-fg, #1a1a1a);
      font-weight: 700;
      border-bottom: 1px solid var(--r-window-border, var(--r-border, #d4d4d0));
    }

    /* ===== JS-enhanced: clase añadida en connectedCallback ===== */
    r-window.r-window--ready {
      position: absolute;
      margin: 0;
      display: flex;
      flex-direction: column;
      user-select: none;
    }
    r-window.r-window--ready::before { content: none; display: none; }

    .r-window__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.6rem;
      background: var(--r-window-header-bg, var(--r-accent, #ef7d57));
      color: var(--r-window-header-fg, #1a1a1a);
      cursor: grab;
      font-weight: 700;
      border-bottom: 1px solid var(--r-window-border, var(--r-border, #d4d4d0));
      touch-action: none;
      flex: 0 0 auto;
    }
    r-window.r-window--dragging .r-window__header { cursor: grabbing; }

    .r-window__title {
      flex: 1 1 auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    .r-window__controls {
      display: inline-flex;
      gap: 0.25rem;
      flex: 0 0 auto;
    }
    .r-window__btn {
      width: 1.4rem;
      height: 1.4rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      font: inherit;
      font-size: 0.95rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .r-window__btn:hover { background: rgba(0,0,0,0.1); }
    .r-window__btn:focus-visible {
      outline: 2px solid var(--amber, #f5b840);
      outline-offset: 1px;
    }

    .r-window__body {
      flex: 1 1 auto;
      padding: 0.75rem;
      overflow: auto;
      user-select: text;
      min-height: 0;
    }

    .r-window__resize {
      position: absolute;
      right: 0; bottom: 0;
      width: 14px; height: 14px;
      cursor: nwse-resize;
      background:
        linear-gradient(135deg,
          transparent 0%, transparent 45%,
          currentColor 45%, currentColor 55%,
          transparent 55%, transparent 65%,
          currentColor 65%, currentColor 75%,
          transparent 75%, transparent 85%,
          currentColor 85%, currentColor 95%,
          transparent 95%);
      color: var(--r-window-fg, var(--r-fg, #1a1a1a));
      opacity: 0.5;
      touch-action: none;
    }
    r-window.r-window--resizing .r-window__resize { opacity: 1; }
    r-window.r-window--minimized .r-window__body,
    r-window.r-window--minimized .r-window__resize {
      display: none;
    }

    /* ===== theme: none (default, meowrhino) ===== */
    r-window.r-window--none.r-window--ready {
      border: 2px solid var(--r-window-border, var(--ink, #1a1a1a));
      box-shadow: var(--r-window-shadow, 2px 2px 0 var(--ink, #1a1a1a));
      background: var(--r-window-bg, var(--paper, #fafafa));
    }
    r-window.r-window--none .r-window__header {
      background: var(--r-window-header-bg, var(--amber, #f5b840));
      color: var(--r-window-header-fg, var(--ink, #1a1a1a));
      border-bottom: 2px solid var(--ink, #1a1a1a);
    }

    /* ===== theme: win95 ===== */
    r-window.r-window--win95.r-window--ready {
      border: 2px outset #dfdfdf;
      background: #c0c0c0;
      box-shadow: 1px 1px 0 #000;
      border-radius: 0;
      font-family: 'Microsoft Sans Serif', 'Segoe UI', system-ui, sans-serif;
    }
    r-window.r-window--win95 .r-window__header {
      background: linear-gradient(90deg, #000080 0%, #1084d0 100%);
      color: #fff;
      border-bottom: none;
      padding: 0.2rem 0.4rem;
    }
    r-window.r-window--win95 .r-window__btn {
      width: 1.1rem;
      height: 1rem;
      border: 1px outset #dfdfdf;
      background: #c0c0c0;
      color: #000;
      font-size: 0.75rem;
      font-weight: 700;
    }
    r-window.r-window--win95 .r-window__btn:active { border-style: inset; }
    r-window.r-window--win95 .r-window__body {
      background: #c0c0c0;
      color: #000;
    }

    /* ===== theme: macos ===== */
    r-window.r-window--macos.r-window--ready {
      border: 1px solid rgba(0,0,0,0.18);
      border-radius: 6px;
      box-shadow:
        0 6px 18px rgba(0,0,0,0.18),
        0 1px 0 rgba(255,255,255,0.6) inset;
      overflow: hidden;
      font-family: -apple-system, 'SF Pro Text', system-ui, sans-serif;
    }
    r-window.r-window--macos .r-window__header {
      background: linear-gradient(180deg, #ececec, #d6d6d6);
      color: #333;
      border-bottom: 1px solid rgba(0,0,0,0.12);
      justify-content: center;
      position: relative;
      padding: 0.35rem 0.6rem;
    }
    r-window.r-window--macos .r-window__title {
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .r-window__macos-controls {
      display: inline-flex;
      gap: 0.35rem;
      position: absolute;
      left: 0.55rem;
      top: 50%;
      transform: translateY(-50%);
    }
    .r-window__macos-btn {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 1px solid rgba(0,0,0,0.18);
      padding: 0;
      cursor: pointer;
      flex: 0 0 auto;
    }
    .r-window__macos-btn--close { background: #ff5f57; }
    .r-window__macos-btn--min   { background: #febc2e; }
    .r-window__macos-btn:focus-visible {
      outline: 2px solid var(--amber, #f5b840);
      outline-offset: 2px;
    }
    r-window.r-window--macos .r-window__body {
      background: #fff;
      color: #1a1a1a;
    }
  `;
  document.head.appendChild(style);
}

class RWindow extends HTMLElement {
  static observedAttributes = [
    'title', 'x', 'y', 'w', 'h', 'theme',
    'resizable', 'closable', 'minimizable', 'lang',
  ];

  constructor() {
    super();
    this._mounted = false;
    this._originalContent = '';
    this._dragState = null;
    this._resizeState = null;
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp   = this._onPointerUp.bind(this);
    this._onKeyDown     = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this._originalContent = this.innerHTML;
      this.innerHTML = '';
      this._buildSkeleton();
      this._mounted = true;
    }
    this.classList.add('r-window--ready');
    this._update();
    this._bindHeaderEvents();
    this._bindResizeEvents();
    this.addEventListener('keydown', this._onKeyDown);

    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = -1;
    }
  }

  disconnectedCallback() {
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup',   this._onPointerUp);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    this._update();
    if (['title', 'theme', 'closable', 'minimizable', 'lang'].includes(name)) {
      this._bindHeaderEvents();
    }
  }

  // ── getters de atributos normalizados ──────────────────────────────────

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }
  get themeName() {
    const v = this.getAttribute('theme');
    return ['win95', 'macos', 'none'].includes(v) ? v : 'none';
  }
  get isResizable()   { return this.getAttribute('resizable')   !== 'false'; }
  get isClosable()    { return this.getAttribute('closable')    !== 'false'; }
  get isMinimizable() { return this.getAttribute('minimizable') === 'true';  }

  // ── construcción del DOM ───────────────────────────────────────────────

  _buildSkeleton() {
    this._headerEl = document.createElement('div');
    this._headerEl.className = 'r-window__header';

    this._bodyEl = document.createElement('div');
    this._bodyEl.className = 'r-window__body';
    this._bodyEl.innerHTML = this._originalContent;

    this._resizeEl = document.createElement('span');
    this._resizeEl.className = 'r-window__resize';

    this.appendChild(this._headerEl);
    this.appendChild(this._bodyEl);
    this.appendChild(this._resizeEl);
  }

  _update() {
    this.classList.remove('r-window--none', 'r-window--win95', 'r-window--macos');
    this.classList.add(`r-window--${this.themeName}`);

    const x = toCssLen(this.getAttribute('x'));
    const y = toCssLen(this.getAttribute('y'));
    const w = toCssLen(this.getAttribute('w'));
    const h = toCssLen(this.getAttribute('h'));
    if (x != null) this.style.left   = x;
    if (y != null) this.style.top    = y;
    if (w != null) this.style.width  = w;
    if (h != null) this.style.height = h;

    this._headerEl.innerHTML = this._headerHTML();
    this._resizeEl.hidden = !this.isResizable;
    this._resizeEl.setAttribute('aria-label', t(this.langCode, 'resize'));
  }

  _headerHTML() {
    const title = escapeHtml(this.getAttribute('title') || '');
    const lang = this.langCode;

    if (this.themeName === 'macos') {
      const controls = `
        <span class="r-window__macos-controls">
          ${this.isClosable    ? `<button class="r-window__macos-btn r-window__macos-btn--close" type="button" aria-label="${t(lang,'close')}" data-r-action="close"></button>` : ''}
          ${this.isMinimizable ? `<button class="r-window__macos-btn r-window__macos-btn--min"   type="button" aria-label="${t(lang,'minimize')}" data-r-action="min"></button>` : ''}
        </span>`;
      return `${controls}<span class="r-window__title">${title}</span>`;
    }

    const btns = [];
    if (this.isMinimizable) {
      btns.push(`<button class="r-window__btn r-window__min" type="button" aria-label="${t(lang,'minimize')}" data-r-action="min">−</button>`);
    }
    if (this.isClosable) {
      btns.push(`<button class="r-window__btn r-window__close" type="button" aria-label="${t(lang,'close')}" data-r-action="close">×</button>`);
    }
    return `<span class="r-window__title">${title}</span><span class="r-window__controls">${btns.join('')}</span>`;
  }

  // ── eventos ────────────────────────────────────────────────────────────

  _bindHeaderEvents() {
    this._headerEl.onpointerdown = (e) => this._startDrag(e);
    this._headerEl.querySelectorAll('[data-r-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-r-action');
        if (action === 'close') this._close();
        else if (action === 'min') this._minimize();
      });
      btn.addEventListener('pointerdown', (e) => e.stopPropagation());
    });
  }

  _bindResizeEvents() {
    this._resizeEl.onpointerdown = (e) => this._startResize(e);
  }

  _onKeyDown(e) {
    if (e.key === 'Escape' && this.isClosable) {
      this._close();
    }
  }

  _startDrag(e) {
    if (e.button != null && e.button !== 0) return;
    if (e.target.closest('[data-r-action]')) return;
    const rect = this.getBoundingClientRect();
    const parent = this.offsetParent || document.body;
    const parentRect = parent.getBoundingClientRect();
    this._dragState = {
      pointerId: e.pointerId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      parentLeft: parentRect.left,
      parentTop:  parentRect.top,
    };
    this.classList.add('r-window--dragging');
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup',   this._onPointerUp);
    try { this._headerEl.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  }

  _startResize(e) {
    if (e.button != null && e.button !== 0) return;
    const rect = this.getBoundingClientRect();
    this._resizeState = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
    };
    this.classList.add('r-window--resizing');
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup',   this._onPointerUp);
    try { this._resizeEl.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
    e.stopPropagation();
  }

  _onPointerMove(e) {
    if (this._dragState && e.pointerId === this._dragState.pointerId) {
      const newX = e.clientX - this._dragState.offsetX - this._dragState.parentLeft;
      const newY = e.clientY - this._dragState.offsetY - this._dragState.parentTop;
      this.style.left = `${newX}px`;
      this.style.top  = `${newY}px`;
    } else if (this._resizeState && e.pointerId === this._resizeState.pointerId) {
      const newW = Math.max(120, this._resizeState.startW + (e.clientX - this._resizeState.startX));
      const newH = Math.max(80,  this._resizeState.startH + (e.clientY - this._resizeState.startY));
      this.style.width  = `${newW}px`;
      this.style.height = `${newH}px`;
    }
  }

  _onPointerUp(e) {
    if (this._dragState && e.pointerId === this._dragState.pointerId) {
      this.dispatchEvent(new CustomEvent('r-window:move', {
        bubbles: true,
        detail: { x: parseFloat(this.style.left) || 0, y: parseFloat(this.style.top) || 0 },
      }));
      this._dragState = null;
      this.classList.remove('r-window--dragging');
    }
    if (this._resizeState && e.pointerId === this._resizeState.pointerId) {
      this.dispatchEvent(new CustomEvent('r-window:resize', {
        bubbles: true,
        detail: { w: parseFloat(this.style.width) || 0, h: parseFloat(this.style.height) || 0 },
      }));
      this._resizeState = null;
      this.classList.remove('r-window--resizing');
    }
    if (!this._dragState && !this._resizeState) {
      document.removeEventListener('pointermove', this._onPointerMove);
      document.removeEventListener('pointerup',   this._onPointerUp);
    }
  }

  _close() {
    const ok = this.dispatchEvent(new CustomEvent('r-window:close', {
      bubbles: true,
      cancelable: true,
      detail: { title: this.getAttribute('title') || '', id: this.id || '' },
    }));
    if (ok) this.remove();
  }

  _minimize() {
    this.classList.toggle('r-window--minimized');
    this.dispatchEvent(new CustomEvent('r-window:minimize', {
      bubbles: true,
      detail: { minimized: this.classList.contains('r-window--minimized') },
    }));
  }
}

customElements.define('r-window', RWindow);
