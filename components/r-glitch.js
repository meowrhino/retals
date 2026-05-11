// ============================================================================
// <r-glitch> — texto con efecto glitch digital
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// atributos:
//   intensity  "low" | "medium" | "high"        (default medium)
//   speed      "slow" | "normal" | "fast"        (default normal)
//   effect     "shift" | "flicker" | "noise"     (default shift)
//   trigger    "auto" | "hover"                  (default auto)
//   lang       "es" | "en" | "ca"               (default es)
//
// shift:   pseudo-elementos con aberración cromática (solo CSS)
// flicker: parpadeo de opacidad (solo CSS)
// noise:   sustitución aleatoria de caracteres (JS interval)
//
// eventos: ninguno
//
// CSS vars:
//   --r-glitch-color-1   color del canal 1  (default coral #ef7d57)
//   --r-glitch-color-2   color del canal 2  (default moss  #5a6a3e)
//   --r-glitch-speed     duración animación (calculado desde speed attr)
//   --r-glitch-offset    desplazamiento     (calculado desde intensity attr)
// ============================================================================

const STYLE_ID = 'r-glitch-styles';

const STRINGS = {
  es: { label: 'texto con efecto glitch' },
  en: { label: 'glitch effect text' },
  ca: { label: 'text amb efecte glitch' },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-glitch {
      display: inline-block;
    }
    .r-glitch__inner {
      display: inline-block;
      position: relative;
      color: inherit;
    }

    /* ——— efecto shift ——— */
    .r-glitch__inner[data-effect="shift"]::before,
    .r-glitch__inner[data-effect="shift"]::after {
      content: attr(data-text);
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
    }
    .r-glitch__inner[data-effect="shift"]::before {
      color: var(--r-glitch-color-1, #ef7d57);
      clip-path: polygon(0 20%, 100% 20%, 100% 45%, 0 45%);
      animation: r-glitch-before var(--r-glitch-speed, 2s) steps(1) infinite;
      left: calc(var(--r-glitch-offset, 3px) * -1);
    }
    .r-glitch__inner[data-effect="shift"]::after {
      color: var(--r-glitch-color-2, #5a6a3e);
      clip-path: polygon(0 55%, 100% 55%, 100% 80%, 0 80%);
      animation: r-glitch-after var(--r-glitch-speed, 2s) steps(1) infinite;
      left: var(--r-glitch-offset, 3px);
    }

    /* ——— efecto flicker ——— */
    .r-glitch__inner[data-effect="flicker"] {
      animation: r-glitch-flicker var(--r-glitch-speed, 2s) steps(1) infinite;
    }

    /* ——— trigger=hover: deshabilitar animación por defecto ——— */
    .r-glitch__inner[data-trigger="hover"][data-effect="shift"]::before,
    .r-glitch__inner[data-trigger="hover"][data-effect="shift"]::after {
      animation: none;
      opacity: 0;
    }
    .r-glitch__inner[data-trigger="hover"][data-effect="flicker"] {
      animation: none;
    }
    /* activar al hover */
    r-glitch.r-glitch--hovering .r-glitch__inner[data-trigger="hover"][data-effect="shift"]::before,
    r-glitch.r-glitch--hovering .r-glitch__inner[data-trigger="hover"][data-effect="shift"]::after {
      animation: r-glitch-before var(--r-glitch-speed, 2s) steps(1) infinite;
      opacity: 1;
    }
    r-glitch.r-glitch--hovering .r-glitch__inner[data-trigger="hover"][data-effect="flicker"] {
      animation: r-glitch-flicker var(--r-glitch-speed, 2s) steps(1) infinite;
    }

    /* ——— keyframes ——— */
    @keyframes r-glitch-before {
      0%, 88%       { transform: translateX(0);    opacity: 0; }
      90%           { transform: translateX(calc(var(--r-glitch-offset, 3px) * -1)); opacity: 1; }
      93%           { transform: translateX(calc(var(--r-glitch-offset, 3px) * 1.5)); opacity: 1; }
      96%, 100%     { transform: translateX(0);    opacity: 0; }
    }
    @keyframes r-glitch-after {
      0%, 85%       { transform: translateX(0);    opacity: 0; }
      87%           { transform: translateX(var(--r-glitch-offset, 3px)); opacity: 1; }
      92%           { transform: translateX(calc(var(--r-glitch-offset, 3px) * -1.2)); opacity: 1; }
      96%, 100%     { transform: translateX(0);    opacity: 0; }
    }
    @keyframes r-glitch-flicker {
      0%, 80%   { opacity: 1; }
      82%       { opacity: 0.2; }
      84%       { opacity: 1; }
      87%       { opacity: 0; }
      89%       { opacity: 0.8; }
      91%       { opacity: 0; }
      93%, 100% { opacity: 1; }
    }

    /* ——— prefers-reduced-motion ——— */
    @media (prefers-reduced-motion: reduce) {
      .r-glitch__inner::before,
      .r-glitch__inner::after {
        animation: none !important;
        opacity: 0 !important;
        transform: none !important;
      }
      .r-glitch__inner[data-effect="flicker"] {
        animation: none !important;
        opacity: 1 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

const INTENSITY_MAP = { low: '1px', medium: '3px', high: '6px' };
const SPEED_MAP     = { slow: '4s', normal: '2s', fast: '0.8s' };
const NOISE_CHARS   = '▒░█▓@#$%!?*&^~';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

class RGlitch extends HTMLElement {
  static observedAttributes = ['intensity', 'speed', 'effect', 'trigger', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._text = '';
    this._chars = [];
    this._innerEl = null;
    this._intervalId = null;
    this._onMouseEnter = this._handleMouseEnter.bind(this);
    this._onMouseLeave = this._handleMouseLeave.bind(this);
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this._text = this.textContent.trim();
      this._chars = [...this._text];
      this.innerHTML = '';
      this._innerEl = document.createElement('span');
      this._innerEl.className = 'r-glitch__inner';
      this._innerEl.textContent = this._text;
      this.appendChild(this._innerEl);
      this._mounted = true;
    }
    this._applyAttrs();
    this._bindHoverIfNeeded();
    if (!prefersReducedMotion.matches) {
      this._startEffect();
    }
  }

  disconnectedCallback() {
    this._stopEffect();
    this.removeEventListener('mouseenter', this._onMouseEnter);
    this.removeEventListener('mouseleave', this._onMouseLeave);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    this._stopEffect();
    this.removeEventListener('mouseenter', this._onMouseEnter);
    this.removeEventListener('mouseleave', this._onMouseLeave);
    this.classList.remove('r-glitch--hovering');
    this._applyAttrs();
    this._bindHoverIfNeeded();
    if (!prefersReducedMotion.matches) {
      this._startEffect();
    }
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  _applyAttrs() {
    const effect    = this.getAttribute('effect')    || 'shift';
    const trigger   = this.getAttribute('trigger')   || 'auto';
    const intensity = this.getAttribute('intensity') || 'medium';
    const speed     = this.getAttribute('speed')     || 'normal';

    const offset   = INTENSITY_MAP[intensity] || INTENSITY_MAP.medium;
    const duration = SPEED_MAP[speed]         || SPEED_MAP.normal;

    this._innerEl.setAttribute('data-text',    this._text);
    this._innerEl.setAttribute('data-effect',  effect);
    this._innerEl.setAttribute('data-trigger', trigger);
    this._innerEl.style.setProperty('--r-glitch-offset', offset);
    this._innerEl.style.setProperty('--r-glitch-speed',  duration);
  }

  _bindHoverIfNeeded() {
    if ((this.getAttribute('trigger') || 'auto') === 'hover') {
      this.addEventListener('mouseenter', this._onMouseEnter);
      this.addEventListener('mouseleave', this._onMouseLeave);
    }
  }

  _startEffect() {
    const effect  = this.getAttribute('effect')  || 'shift';
    const trigger = this.getAttribute('trigger') || 'auto';
    if (effect !== 'noise') return; // shift y flicker son solo CSS
    if (trigger === 'hover') return; // el noise se arranca en el hover

    this._startNoise();
  }

  _stopEffect() {
    clearInterval(this._intervalId);
    this._intervalId = null;
    // restaurar texto original si hay noise
    if (this._innerEl) {
      this._innerEl.textContent = this._text;
    }
  }

  _startNoise() {
    const speed     = this.getAttribute('speed')     || 'normal';
    const intensity = this.getAttribute('intensity') || 'medium';
    const intervalMap = { slow: 200, normal: 80, fast: 30 };
    const countMap    = { low: 1, medium: 2, high: 4 };
    const ms    = intervalMap[speed]     || 80;
    const count = countMap[intensity]    || 2;

    this._intervalId = setInterval(() => {
      if (Math.random() < 0.25) {
        this._innerEl.textContent = this._text;
      } else {
        const chars = [...this._chars];
        for (let i = 0; i < count; i++) {
          const pos = Math.floor(Math.random() * chars.length);
          chars[pos] = NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)];
        }
        this._innerEl.textContent = chars.join('');
      }
    }, ms);
  }

  _handleMouseEnter() {
    this.classList.add('r-glitch--hovering');
    const effect = this.getAttribute('effect') || 'shift';
    if (effect === 'noise' && !prefersReducedMotion.matches) {
      this._startNoise();
    }
  }

  _handleMouseLeave() {
    this.classList.remove('r-glitch--hovering');
    const effect = this.getAttribute('effect') || 'shift';
    if (effect === 'noise') {
      this._stopEffect();
    }
  }
}

customElements.define('r-glitch', RGlitch);
