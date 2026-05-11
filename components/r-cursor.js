// ============================================================================
// <r-cursor> — efectos de cursor personalizados
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// en dispositivos táctiles (pointer: coarse) el componente no hace nada.
//
// atributos:
//   effect      "sparkle" | "trail" | "dot" | "emoji"  (default sparkle)
//   color       color CSS (default var(--coral, #ef7d57))
//   size        tamaño en px (default 12)
//   emoji       carácter/emoji para effect=emoji (default ✦)
//   hide-native atributo booleano — oculta el cursor nativo
//   lang        "es" | "en" | "ca" (default es)
//
// eventos: ninguno
//
// CSS vars:
//   --r-cursor-color  color de los efectos  (default coral)
//   --r-cursor-size   tamaño base en px     (default 12px)
// ============================================================================

const STYLE_ID = 'r-cursor-styles';

// glifos para el efecto sparkle
const SPARKLE_GLYPHS = ['✦', '✺', '✜', '◌', '★'];

const STRINGS = {
  es: {},
  en: {},
  ca: {},
};

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .r-cursor__overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 99999;
      overflow: hidden;
    }
    .r-cursor__dot {
      position: absolute;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      width: var(--r-cursor-size, 12px);
      height: var(--r-cursor-size, 12px);
      background: var(--r-cursor-color, #ef7d57);
    }
    .r-cursor__trail-dot {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
      background: var(--r-cursor-color, #ef7d57);
    }
    .r-cursor__sparkle {
      position: absolute;
      pointer-events: none;
      user-select: none;
      animation: r-cursor-sparkle-pop 0.5s ease-out forwards;
      font-size: var(--r-cursor-size, 12px);
      line-height: 1;
      color: var(--r-cursor-color, #ef7d57);
    }
    .r-cursor__emoji {
      position: absolute;
      pointer-events: none;
      user-select: none;
      transform: translate(-50%, -120%);
      font-size: calc(var(--r-cursor-size, 12px) * 2);
      line-height: 1;
    }
    @keyframes r-cursor-sparkle-pop {
      0%   { opacity: 1; transform: translate(-50%, -50%) scale(0.5); }
      50%  { opacity: 1; transform: translate(-50%, -80%) scale(1.2); }
      100% { opacity: 0; transform: translate(-50%, -120%) scale(0.8); }
    }
    @media (prefers-reduced-motion: reduce) {
      .r-cursor__sparkle { animation: none; opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

class RCursor extends HTMLElement {
  static observedAttributes = ['effect', 'color', 'size', 'emoji', 'hide-native', 'lang'];

  constructor() {
    super();
    this._disabled = false;
    this._overlay = null;
    this._rafId = null;
    this._lastSparkle = 0;
    this._trailEls = [];
    this._trailIndex = 0;
    this._dotEl = null;
    this._emojiEl = null;
    this._onPointerMove = this._handlePointerMove.bind(this);
  }

  connectedCallback() {
    injectStyles();

    // en táctil no hacemos nada — preservar experiencia táctil nativa
    if (window.matchMedia('(pointer: coarse)').matches) {
      this._disabled = true;
      return;
    }

    this._init();
  }

  disconnectedCallback() {
    if (this._disabled) return;
    this._cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || this._disabled) return;
    // reinit completo al cambiar cualquier atributo
    this._cleanup();
    this._init();
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  _init() {
    // crear overlay pegado al body
    this._overlay = document.createElement('div');
    this._overlay.className = 'r-cursor__overlay';

    // aplicar CSS vars del atributo color/size si están presentes
    const color = this.getAttribute('color');
    const size  = this.getAttribute('size');
    if (color) this._overlay.style.setProperty('--r-cursor-color', color);
    if (size)  this._overlay.style.setProperty('--r-cursor-size', `${parseInt(size, 10)}px`);

    document.body.appendChild(this._overlay);

    const effect = this.getAttribute('effect') || 'sparkle';

    if      (effect === 'dot')     this._initDot();
    else if (effect === 'trail')   this._initTrail();
    else if (effect === 'emoji')   this._initEmoji();
    else                           this._initSparkle(); // sparkle default

    if (this.hasAttribute('hide-native')) {
      document.body.style.cursor = 'none';
    }

    document.addEventListener('pointermove', this._onPointerMove, { passive: true });
  }

  _cleanup() {
    document.removeEventListener('pointermove', this._onPointerMove);
    cancelAnimationFrame(this._rafId);
    this._rafId = null;

    if (this._overlay && this._overlay.parentNode) {
      this._overlay.parentNode.removeChild(this._overlay);
    }
    this._overlay = null;
    this._trailEls = [];
    this._dotEl = null;
    this._emojiEl = null;

    // restaurar cursor nativo solo si no hay otro r-cursor[hide-native] activo
    if (this.hasAttribute('hide-native')) {
      const others = document.querySelectorAll('r-cursor[hide-native]');
      const stillActive = Array.from(others).some(el => el !== this && el.isConnected);
      if (!stillActive) {
        document.body.style.cursor = '';
      }
    }
  }

  // ——— efectos ———

  _initDot() {
    this._dotEl = document.createElement('div');
    this._dotEl.className = 'r-cursor__dot';
    this._dotEl.style.left = '-100px';
    this._dotEl.style.top  = '-100px';
    this._overlay.appendChild(this._dotEl);
  }

  _initTrail() {
    const N = 14;
    for (let i = 0; i < N; i++) {
      const dot = document.createElement('div');
      dot.className = 'r-cursor__trail-dot';
      const frac = (N - i) / N;
      const sizePx = Math.max(2, Math.round(12 * frac));
      dot.style.cssText = `left:-100px;top:-100px;width:${sizePx}px;height:${sizePx}px;opacity:${frac.toFixed(2)};`;
      this._overlay.appendChild(dot);
      this._trailEls.push(dot);
    }
  }

  _initEmoji() {
    this._emojiEl = document.createElement('span');
    this._emojiEl.className = 'r-cursor__emoji';
    this._emojiEl.setAttribute('aria-hidden', 'true');
    this._emojiEl.textContent = this.getAttribute('emoji') || '✦';
    this._emojiEl.style.left = '-100px';
    this._emojiEl.style.top  = '-100px';
    this._overlay.appendChild(this._emojiEl);
  }

  _initSparkle() {
    // no hay elemento permanente; se crean al mover
  }

  // ——— handler de movimiento ———

  _handlePointerMove(e) {
    const effect = this.getAttribute('effect') || 'sparkle';
    const x = e.clientX;
    const y = e.clientY;

    if (effect === 'dot') {
      this._dotEl.style.left = `${x}px`;
      this._dotEl.style.top  = `${y}px`;

    } else if (effect === 'trail') {
      const dot = this._trailEls[this._trailIndex % this._trailEls.length];
      dot.style.left = `${x}px`;
      dot.style.top  = `${y}px`;
      this._trailIndex++;

    } else if (effect === 'emoji') {
      this._emojiEl.style.left = `${x}px`;
      this._emojiEl.style.top  = `${y}px`;

    } else {
      // sparkle
      const now = Date.now();
      if (now - this._lastSparkle < 40) return;
      this._lastSparkle = now;
      this._spawnSparkle(x, y);
    }
  }

  _spawnSparkle(x, y) {
    const spark = document.createElement('span');
    spark.className = 'r-cursor__sparkle';
    spark.setAttribute('aria-hidden', 'true');
    spark.textContent = SPARKLE_GLYPHS[Math.floor(Math.random() * SPARKLE_GLYPHS.length)];
    spark.style.left = `${x}px`;
    spark.style.top  = `${y}px`;
    this._overlay.appendChild(spark);

    // limpieza: animationend + timeout fallback (prefers-reduced-motion)
    const remove = () => spark.remove();
    spark.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 600);
  }
}

customElements.define('r-cursor', RCursor);
