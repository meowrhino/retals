// ============================================================================
// <r-counter> — contador de visitas con localStorage o endpoint propio
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// modo default (sin endpoint): cada visitante tiene su propio contador local.
// NO es un contador compartido entre visitantes — cada uno ve el suyo.
// para un contador compartido real, despliega el Worker y usa el attr endpoint.
//
// atributos:
//   id        identificador del contador (default "default")
//             permite varios contadores distintos en la misma página.
//   endpoint  URL del worker CF (opcional) — activa modo compartido.
//             ej: "https://mi-worker.workers.dev/counter"
//   label     texto junto al número (default: "visitas")
//   increment atributo booleano — si está, suma 1 en esta carga de página
//             (por defecto solo muestra el total sin sumar)
//   lang      "es" | "en" | "ca" (default es)
//
// eventos:
//   r-counter:tick   — cada vez que se actualiza, detail: { count }
//
// CSS vars:
//   --r-counter-color      color del número      (fallback --r-fg)
//   --r-counter-font       fuente                (fallback --r-font)
//   --r-counter-size       tamaño               (default 1rem)
//   --r-counter-gap        gap entre nº y label  (default 0.4em)
// ============================================================================

const STYLE_ID = 'r-counter-styles';

const STRINGS = {
  es: { visits: 'visitas', error: 'error' },
  en: { visits: 'visits',  error: 'error' },
  ca: { visits: 'visites', error: 'error' },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-counter {
      display: inline-flex;
      align-items: baseline;
      gap: var(--r-counter-gap, 0.4em);
      font-family: var(--r-counter-font, var(--r-font, monospace));
      font-size: var(--r-counter-size, 1rem);
      color: var(--r-counter-color, var(--r-fg, #1a1a1a));
    }
    .r-counter__num {
      font-weight: bold;
      font-variant-numeric: tabular-nums;
    }
    .r-counter__label {
      opacity: 0.7;
      font-size: 0.85em;
    }
  `;
  document.head.appendChild(style);
}

class RCounter extends HTMLElement {
  static observedAttributes = ['id', 'endpoint', 'label', 'increment', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._numEl   = null;
    this._labelEl = null;
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this.innerHTML = '';
      this._numEl = document.createElement('span');
      this._numEl.className = 'r-counter__num';
      this._numEl.setAttribute('aria-live', 'polite');
      this._labelEl = document.createElement('span');
      this._labelEl.className = 'r-counter__label';
      this.appendChild(this._numEl);
      this.appendChild(this._labelEl);
      this._mounted = true;
    }
    this._labelEl.textContent = this.getAttribute('label') || t(this.langCode, 'visits');
    this._load();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    if (name === 'label') {
      this._labelEl.textContent = newValue || t(this.langCode, 'visits');
    } else {
      this._load();
    }
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  _storageKey() {
    return `r-counter:${this.getAttribute('id') || 'default'}`;
  }

  async _load() {
    const endpoint = this.getAttribute('endpoint');
    const shouldIncrement = this.hasAttribute('increment');

    if (endpoint) {
      await this._loadRemote(endpoint, shouldIncrement);
    } else {
      this._loadLocal(shouldIncrement);
    }
  }

  _loadLocal(increment) {
    const key = this._storageKey();
    let count = parseInt(localStorage.getItem(key) || '0', 10);
    if (increment) {
      count++;
      localStorage.setItem(key, String(count));
    }
    this._display(count);
  }

  async _loadRemote(endpoint, increment) {
    try {
      const counterId = this.getAttribute('id') || 'default';
      const url = `${endpoint}?id=${encodeURIComponent(counterId)}`;
      const method = increment ? 'POST' : 'GET';
      const res = await fetch(url, { method });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._display(data.count ?? data.value ?? 0);
    } catch {
      this._numEl.textContent = '—';
    }
  }

  _display(count) {
    this._numEl.textContent = count.toLocaleString();
    this.dispatchEvent(new CustomEvent('r-counter:tick', {
      bubbles: true,
      detail: { count },
    }));
  }
}

customElements.define('r-counter', RCounter);
