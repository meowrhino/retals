// ============================================================================
// <r-clock> — reloj en vivo con formato configurable
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// atributos:
//   format     string de formato (default "HH:MM:SS")
//              tokens: YYYY mm dd HH hh MM SS A Mon
//   timezone   IANA timezone string (ej: "America/New_York"). fallback local si inválido.
//   lang       "es" | "en" | "ca" (default es)
//
// eventos:
//   r-clock:tick  — cada segundo, detail: { time: Date }
//
// CSS vars:
//   --r-clock-color           color del texto    (fallback --r-fg)
//   --r-clock-font            fuente             (fallback --r-font, monospace)
//   --r-clock-size            tamaño tipográfico (default 1rem)
//   --r-clock-letter-spacing  espaciado          (default 0.05em)
// ============================================================================

const STYLE_ID = 'r-clock-styles';

const STRINGS = {
  es: {
    label: 'reloj',
    months: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
  },
  en: {
    label: 'clock',
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  },
  ca: {
    label: 'rellotge',
    months: ['gen','feb','mar','abr','mai','jun','jul','ago','set','oct','nov','des'],
  },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-clock {
      display: inline-block;
      font-family: var(--r-clock-font, var(--r-font, 'JetBrains Mono', monospace));
      font-size: var(--r-clock-size, 1rem);
      color: var(--r-clock-color, var(--r-fg, #1a1a1a));
      letter-spacing: var(--r-clock-letter-spacing, 0.05em);
    }
    r-clock time {
      display: block;
    }
  `;
  document.head.appendChild(style);
}

// Extrae las partes de fecha/hora en un timezone dado usando Intl
function getTimeParts(date, timezone) {
  try {
    const opts = {
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    };
    if (timezone) opts.timeZone = timezone;
    const parts = new Intl.DateTimeFormat('en-CA', opts).formatToParts(date);
    const map = {};
    for (const { type, value } of parts) map[type] = value;
    return {
      year:   map.year   || String(date.getFullYear()),
      month:  map.month  || String(date.getMonth() + 1).padStart(2, '0'),
      day:    map.day    || String(date.getDate()).padStart(2, '0'),
      hour:   map.hour   || String(date.getHours()).padStart(2, '0'),
      minute: map.minute || String(date.getMinutes()).padStart(2, '0'),
      second: map.second || String(date.getSeconds()).padStart(2, '0'),
    };
  } catch {
    // timezone inválido → hora local
    return {
      year:   String(date.getFullYear()),
      month:  String(date.getMonth() + 1).padStart(2, '0'),
      day:    String(date.getDate()).padStart(2, '0'),
      hour:   String(date.getHours()).padStart(2, '0'),
      minute: String(date.getMinutes()).padStart(2, '0'),
      second: String(date.getSeconds()).padStart(2, '0'),
    };
  }
}

class RClock extends HTMLElement {
  static observedAttributes = ['format', 'timezone', 'lang'];

  constructor() {
    super();
    this._intervalId = null;
    this._timeEl = null;
    this._mounted = false;
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this.innerHTML = '';
      this._timeEl = document.createElement('time');
      this.appendChild(this._timeEl);
      this._mounted = true;
    }
    this.setAttribute('role', 'timer');
    this.setAttribute('aria-live', 'off');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', t(this.langCode, 'label'));
    }
    this._tick();
    this._intervalId = setInterval(() => this._tick(), 1000);
  }

  disconnectedCallback() {
    clearInterval(this._intervalId);
    this._intervalId = null;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    if (name === 'lang') {
      this.setAttribute('aria-label', t(this.langCode, 'label'));
    }
    this._tick();
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  _tick() {
    const now = new Date();
    const tz = this.getAttribute('timezone') || null;
    const p = getTimeParts(now, tz);
    const lang = this.langCode;
    const format = this.getAttribute('format') || 'HH:MM:SS';

    const hourNum = parseInt(p.hour, 10);
    const hh12 = String(hourNum % 12 || 12).padStart(2, '0');
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const monthIndex = parseInt(p.month, 10) - 1;
    const monShort = t(lang, 'months')[monthIndex] || p.month;

    // sustitución en orden longest-first para evitar sustituciones parciales
    const formatted = format
      .replace('YYYY', p.year)
      .replace('Mon',  monShort)
      .replace('mm',   p.month)
      .replace('dd',   p.day)
      .replace('HH',   p.hour)
      .replace('hh',   hh12)
      .replace('MM',   p.minute)
      .replace('SS',   p.second)
      .replace('A',    ampm);

    this._timeEl.textContent = formatted;
    this._timeEl.setAttribute('datetime', now.toISOString());
    this.dispatchEvent(new CustomEvent('r-clock:tick', {
      bubbles: true,
      detail: { time: now },
    }));
  }
}

customElements.define('r-clock', RClock);
