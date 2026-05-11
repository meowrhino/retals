// ============================================================================
// <r-marquee> — texto en movimiento con animación CSS
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// atributos:
//   speed          px/s del desplazamiento (default 60)
//   direction      "left" | "right" (default left)
//   pause-on-hover atributo booleano — pausa al hover
//   separator      string entre repeticiones (default " ✦ ")
//   gap            gap entre items (default 2rem, acepta cualquier valor CSS)
//   lang           "es" | "en" | "ca" (default es)
//
// eventos: ninguno
//
// CSS vars:
//   --r-marquee-color    color del texto    (fallback --r-fg)
//   --r-marquee-size     tamaño tipográfico (default inherit)
//   --r-marquee-bg       fondo              (default transparent)
//   --r-marquee-padding  padding vertical   (default 0.25rem 0)
//   --r-marquee-gap      separación entre repeticiones (sobreescribe `gap` attr)
// ============================================================================

const STYLE_ID = 'r-marquee-styles';

const STRINGS = {
  es: { label: 'texto en movimiento' },
  en: { label: 'scrolling text' },
  ca: { label: 'text en moviment' },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-marquee {
      display: block;
      overflow: hidden;
      background: var(--r-marquee-bg, transparent);
      color: var(--r-marquee-color, var(--r-fg, #1a1a1a));
      font-size: var(--r-marquee-size, inherit);
      padding: var(--r-marquee-padding, 0.25rem 0);
      white-space: nowrap;
    }
    .r-marquee__track {
      display: inline-flex;
      align-items: center;
      gap: var(--r-marquee-gap, 0px);
      will-change: transform;
      animation: r-marquee-scroll var(--_r-marquee-dur, 10s) linear infinite;
    }
    .r-marquee__track--right {
      animation-direction: reverse;
    }
    r-marquee[pause-on-hover]:hover .r-marquee__track,
    r-marquee[pause-on-hover]:focus-within .r-marquee__track {
      animation-play-state: paused;
    }
    @keyframes r-marquee-scroll {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @media (prefers-reduced-motion: reduce) {
      .r-marquee__track {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

class RMarquee extends HTMLElement {
  static observedAttributes = ['speed', 'direction', 'pause-on-hover', 'separator', 'gap', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._originalContent = '';
    this._trackEl = null;
    this._rafId = null;
    this._rafRetries = 0;
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this._originalContent = this.innerHTML.trim();
      this.innerHTML = '';
      this._mounted = true;
    }
    this.setAttribute('role', 'marquee');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', t(this.langCode, 'label'));
    }
    this._render();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this._rafId);
    this._rafId = null;
    this._rafRetries = 0;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    if (name === 'lang') {
      this.setAttribute('aria-label', t(this.langCode, 'label'));
    }
    cancelAnimationFrame(this._rafId);
    this._rafRetries = 0;
    this._render();
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  _render() {
    // limpia lo anterior
    this.innerHTML = '';

    const sep = this.getAttribute('separator') ?? ' ✦ ';
    const direction = this.getAttribute('direction') || 'left';
    const gap = this.getAttribute('gap') || '0px';

    const track = document.createElement('div');
    track.className = 'r-marquee__track';
    if (direction === 'right') track.classList.add('r-marquee__track--right');
    // el gap entre spans lo gestionamos con el separator, no con CSS gap
    // para que el 50% de translateX funcione correctamente el track tiene
    // [copy1][sep1][copy2][sep2] — total 2× una repetición

    const makeCopy = () => {
      const span = document.createElement('span');
      span.innerHTML = this._originalContent;
      return span;
    };
    const makeSep = () => {
      const span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = sep;
      return span;
    };

    track.appendChild(makeCopy());
    track.appendChild(makeSep());
    track.appendChild(makeCopy());
    track.appendChild(makeSep());

    this._trackEl = track;
    this.appendChild(track);

    // calcular duración después de que el layout esté disponible
    this._scheduleDuration();
  }

  _scheduleDuration() {
    this._rafId = requestAnimationFrame(() => {
      const halfWidth = this._trackEl ? this._trackEl.scrollWidth / 2 : 0;
      if (halfWidth === 0 && this._rafRetries < 10) {
        this._rafRetries++;
        this._scheduleDuration();
        return;
      }
      this._rafRetries = 0;
      const speed = Math.max(1, parseFloat(this.getAttribute('speed')) || 60);
      const duration = halfWidth > 0 ? halfWidth / speed : 10;
      this._trackEl.style.setProperty('--_r-marquee-dur', `${duration}s`);
    });
  }
}

customElements.define('r-marquee', RMarquee);
