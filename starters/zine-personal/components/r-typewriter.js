// ============================================================================
// <r-typewriter> — texto que se escribe solo, carácter a carácter
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// atributos:
//   speed       caracteres por segundo al escribir (default 50)
//   delay       ms antes de empezar (default 0)
//   cursor      carácter del cursor parpadeante (default |)
//   loop        atributo booleano — borra y reescribe en bucle
//   erase-speed caracteres por segundo al borrar (default 100)
//   pause       ms de pausa al final antes de borrar (default 1500)
//   lang        "es" | "en" | "ca" (default es)
//
// nota: el contenido se trata como texto plano. el HTML interno se convierte
//       a texto; si necesitas formatear, envuelve el r-typewriter externamente.
//
// eventos:
//   r-typewriter:start  — cuando empieza a escribir (cada ciclo en modo loop)
//   r-typewriter:done   — cuando termina de escribir (cada ciclo)
//
// CSS vars:
//   --r-typewriter-color         color del texto       (fallback --r-fg)
//   --r-typewriter-cursor-color  color del cursor      (fallback --r-typewriter-color)
//   --r-typewriter-font          fuente                (default inherit)
//   --r-typewriter-size          tamaño tipográfico    (default inherit)
// ============================================================================

const STYLE_ID = 'r-typewriter-styles';

const STRINGS = {
  es: { label: 'texto animado' },
  en: { label: 'animated text' },
  ca: { label: 'text animat' },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-typewriter {
      display: inline;
      font-family: var(--r-typewriter-font, inherit);
      font-size: var(--r-typewriter-size, inherit);
      color: var(--r-typewriter-color, var(--r-fg, #1a1a1a));
    }
    .r-typewriter__cursor {
      display: inline-block;
      color: var(--r-typewriter-cursor-color, var(--r-typewriter-color, var(--r-fg, #1a1a1a)));
      animation: r-typewriter-blink 1s step-end infinite;
      user-select: none;
    }
    @keyframes r-typewriter-blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .r-typewriter__cursor {
        animation: none;
      }
    }
  `;
  document.head.appendChild(style);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

class RTypewriter extends HTMLElement {
  static observedAttributes = ['speed', 'delay', 'cursor', 'loop', 'erase-speed', 'pause', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._text = '';
    this._chars = [];    // array unicode-safe
    this._displayed = 0;
    this._state = 'idle'; // idle | typing | pausing | erasing
    this._intervalId = null;
    this._timeoutId = null;
    this._textEl = null;
    this._cursorEl = null;
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      // guardar texto plano antes de limpiar
      this._text = this.textContent.trim();
      this._chars = [...this._text]; // split unicode-safe
      this.innerHTML = '';

      this._textEl = document.createElement('span');
      this._cursorEl = document.createElement('span');
      this._cursorEl.className = 'r-typewriter__cursor';
      this._cursorEl.setAttribute('aria-hidden', 'true');

      this.appendChild(this._textEl);
      this.appendChild(this._cursorEl);
      this._mounted = true;
    }

    this._cursorEl.textContent = this.getAttribute('cursor') || '|';

    if (prefersReducedMotion.matches) {
      // mostrar texto completo sin animación
      this._textEl.textContent = this._text;
      return;
    }

    this._displayed = 0;
    this._textEl.textContent = '';
    this._state = 'idle';

    const delay = Math.max(0, parseInt(this.getAttribute('delay') || '0', 10));
    this._timeoutId = setTimeout(() => this._startTyping(), delay);
  }

  disconnectedCallback() {
    clearInterval(this._intervalId);
    clearTimeout(this._timeoutId);
    this._intervalId = null;
    this._timeoutId = null;
    this._state = 'idle';
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    if (name === 'cursor' && this._cursorEl) {
      this._cursorEl.textContent = newValue || '|';
    }
    // el resto de atributos (speed, erase-speed, pause) se leen
    // dinámicamente en el siguiente tick — no hace falta reiniciar
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  _startTyping() {
    this.dispatchEvent(new CustomEvent('r-typewriter:start', { bubbles: true }));
    const speed = Math.max(1, parseFloat(this.getAttribute('speed') || '50'));
    const intervalMs = 1000 / speed;
    this._state = 'typing';
    this._intervalId = setInterval(() => {
      if (this._displayed < this._chars.length) {
        this._displayed++;
        this._textEl.textContent = this._chars.slice(0, this._displayed).join('');
      } else {
        clearInterval(this._intervalId);
        this._intervalId = null;
        this._onTypingDone();
      }
    }, intervalMs);
  }

  _onTypingDone() {
    this.dispatchEvent(new CustomEvent('r-typewriter:done', { bubbles: true }));
    if (!this.hasAttribute('loop')) return;
    const pause = Math.max(0, parseInt(this.getAttribute('pause') || '1500', 10));
    this._state = 'pausing';
    this._timeoutId = setTimeout(() => this._startErasing(), pause);
  }

  _startErasing() {
    const eraseSpeed = Math.max(1, parseFloat(this.getAttribute('erase-speed') || '100'));
    const intervalMs = 1000 / eraseSpeed;
    this._state = 'erasing';
    this._intervalId = setInterval(() => {
      if (this._displayed > 0) {
        this._displayed--;
        this._textEl.textContent = this._chars.slice(0, this._displayed).join('');
      } else {
        clearInterval(this._intervalId);
        this._intervalId = null;
        this._startTyping();
      }
    }, intervalMs);
  }
}

customElements.define('r-typewriter', RTypewriter);
