// ============================================================================
// <r-guestbook> — libro de visitas con localStorage o endpoint propio
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// modo default (sin endpoint): las entradas se guardan en localStorage del
// visitante. NO están compartidas entre visitantes — cada uno ve las suyas.
// para un guestbook compartido real, despliega el Worker y usa `endpoint`.
//
// atributos:
//   endpoint   URL del worker CF (opcional) — activa modo compartido.
//   id         identificador del guestbook (default "default")
//   max-chars  límite de caracteres por mensaje (default 280)
//   lang       "es" | "en" | "ca" (default es)
//
// eventos:
//   r-guestbook:submit   — al enviar, detail: { name, message, timestamp }
//
// CSS vars:
//   --r-guestbook-border      borde           (fallback 1px solid --r-fg)
//   --r-guestbook-bg          fondo           (fallback --r-bg)
//   --r-guestbook-entry-bg    fondo entradas  (fallback --r-bg)
//   --r-guestbook-font-size   tamaño fuente   (default 0.9rem)
//   --r-guestbook-radius      radio esquinas  (default 0)
// ============================================================================

const STYLE_ID = 'r-guestbook-styles';

const STRINGS = {
  es: {
    namePlaceholder: 'tu nombre',
    msgPlaceholder:  'deja un mensaje...',
    submit:          'enviar',
    empty:           'sin entradas aún. sé el primero.',
    nojs:            'activa JavaScript para dejar un mensaje.',
    charCount:       (n, max) => `${n}/${max}`,
    tooLong:         'mensaje demasiado largo.',
    nameRequired:    'escribe tu nombre.',
    msgRequired:     'escribe un mensaje.',
  },
  en: {
    namePlaceholder: 'your name',
    msgPlaceholder:  'leave a message...',
    submit:          'send',
    empty:           'no entries yet. be the first.',
    nojs:            'enable JavaScript to leave a message.',
    charCount:       (n, max) => `${n}/${max}`,
    tooLong:         'message too long.',
    nameRequired:    'write your name.',
    msgRequired:     'write a message.',
  },
  ca: {
    namePlaceholder: 'el teu nom',
    msgPlaceholder:  'deixa un missatge...',
    submit:          'enviar',
    empty:           'sense entrades encara. sigues el primer.',
    nojs:            'activa JavaScript per deixar un missatge.',
    charCount:       (n, max) => `${n}/${max}`,
    tooLong:         'missatge massa llarg.',
    nameRequired:    'escriu el teu nom.',
    msgRequired:     'escriu un missatge.',
  },
};

function t(lang, key, ...args) {
  const s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
  return typeof s === 'function' ? s(...args) : s;
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-guestbook {
      display: block;
      font-family: var(--r-font, monospace);
      font-size: var(--r-guestbook-font-size, 0.9rem);
    }
    .r-guestbook__form {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .r-guestbook__input,
    .r-guestbook__textarea {
      font-family: inherit;
      font-size: inherit;
      padding: 0.4rem 0.6rem;
      border: var(--r-guestbook-border, 1px solid var(--r-fg, #1a1a1a));
      background: var(--r-guestbook-bg, var(--r-bg, #fef8e6));
      color: var(--r-fg, #1a1a1a);
      border-radius: var(--r-guestbook-radius, 0);
      width: 100%;
      box-sizing: border-box;
    }
    .r-guestbook__textarea {
      resize: vertical;
      min-height: 80px;
    }
    .r-guestbook__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }
    .r-guestbook__charcount {
      font-size: 0.75em;
      opacity: 0.6;
    }
    .r-guestbook__submit {
      font-family: inherit;
      font-size: inherit;
      padding: 0.35rem 0.9rem;
      border: var(--r-guestbook-border, 1px solid var(--r-fg, #1a1a1a));
      background: var(--r-fg, #1a1a1a);
      color: var(--r-bg, #fef8e6);
      cursor: pointer;
      border-radius: var(--r-guestbook-radius, 0);
    }
    .r-guestbook__submit:hover { opacity: 0.85; }
    .r-guestbook__submit:focus-visible { outline: 2px solid var(--r-accent, #ef7d57); outline-offset: 2px; }
    .r-guestbook__error {
      font-size: 0.8em;
      color: var(--r-accent, #ef7d57);
      min-height: 1.2em;
    }
    .r-guestbook__entries {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .r-guestbook__entry {
      border: var(--r-guestbook-border, 1px solid var(--r-fg, #1a1a1a));
      background: var(--r-guestbook-entry-bg, var(--r-bg, #fef8e6));
      padding: 0.6rem 0.8rem;
      border-radius: var(--r-guestbook-radius, 0);
    }
    .r-guestbook__entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }
    .r-guestbook__entry-name {
      font-weight: bold;
    }
    .r-guestbook__entry-date {
      font-size: 0.75em;
      opacity: 0.55;
    }
    .r-guestbook__entry-msg {
      margin: 0;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .r-guestbook__empty {
      opacity: 0.5;
      font-size: 0.85em;
    }
  `;
  document.head.appendChild(style);
}

class RGuestbook extends HTMLElement {
  static observedAttributes = ['endpoint', 'id', 'max-chars', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._nameInput = null;
    this._msgInput  = null;
    this._charCount = null;
    this._errorEl   = null;
    this._entriesEl = null;
    this._onSubmit  = this._handleSubmit.bind(this);
    this._onInput   = this._handleInput.bind(this);
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this._render();
      this._mounted = true;
    }
    this._loadEntries();
  }

  disconnectedCallback() {
    const form = this.querySelector('.r-guestbook__form');
    if (form) form.removeEventListener('submit', this._onSubmit);
    if (this._msgInput) this._msgInput.removeEventListener('input', this._onInput);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    this._loadEntries();
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }

  get maxChars() {
    return parseInt(this.getAttribute('max-chars') || '280', 10);
  }

  _storageKey() {
    return `r-guestbook:${this.getAttribute('id') || 'default'}`;
  }

  _render() {
    const lang = this.langCode;
    this.innerHTML = `
      <form class="r-guestbook__form" novalidate>
        <input class="r-guestbook__input" type="text"
          placeholder="${t(lang, 'namePlaceholder')}" autocomplete="name" maxlength="60">
        <textarea class="r-guestbook__textarea"
          placeholder="${t(lang, 'msgPlaceholder')}"></textarea>
        <div class="r-guestbook__footer">
          <span class="r-guestbook__error" aria-live="polite"></span>
          <span class="r-guestbook__charcount">0/${this.maxChars}</span>
          <button type="submit" class="r-guestbook__submit">${t(lang, 'submit')}</button>
        </div>
      </form>
      <div class="r-guestbook__entries" aria-live="polite"></div>
    `;
    this._nameInput = this.querySelector('.r-guestbook__input');
    this._msgInput  = this.querySelector('.r-guestbook__textarea');
    this._charCount = this.querySelector('.r-guestbook__charcount');
    this._errorEl   = this.querySelector('.r-guestbook__error');
    this._entriesEl = this.querySelector('.r-guestbook__entries');

    const form = this.querySelector('.r-guestbook__form');
    form.addEventListener('submit', this._onSubmit);
    this._msgInput.addEventListener('input', this._onInput);
  }

  _handleInput() {
    const len = [...this._msgInput.value].length;
    this._charCount.textContent = t(this.langCode, 'charCount', len, this.maxChars);
  }

  async _handleSubmit(e) {
    e.preventDefault();
    const lang    = this.langCode;
    const name    = this._nameInput.value.trim();
    const message = this._msgInput.value.trim();

    this._errorEl.textContent = '';

    if (!name) { this._errorEl.textContent = t(lang, 'nameRequired'); return; }
    if (!message) { this._errorEl.textContent = t(lang, 'msgRequired'); return; }
    if ([...message].length > this.maxChars) { this._errorEl.textContent = t(lang, 'tooLong'); return; }

    const entry = { name, message, timestamp: new Date().toISOString() };
    const endpoint = this.getAttribute('endpoint');

    if (endpoint) {
      await this._submitRemote(endpoint, entry);
    } else {
      this._submitLocal(entry);
    }

    this._nameInput.value = '';
    this._msgInput.value  = '';
    this._charCount.textContent = `0/${this.maxChars}`;
    this.dispatchEvent(new CustomEvent('r-guestbook:submit', { bubbles: true, detail: entry }));
    this._loadEntries();
  }

  _submitLocal(entry) {
    const key     = this._storageKey();
    const entries = JSON.parse(localStorage.getItem(key) || '[]');
    entries.unshift(entry);
    localStorage.setItem(key, JSON.stringify(entries.slice(0, 50))); // max 50 entradas
  }

  async _submitRemote(endpoint, entry) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch {
      this._errorEl.textContent = '⚠ error al enviar';
    }
  }

  async _loadEntries() {
    const endpoint = this.getAttribute('endpoint');
    let entries = [];
    if (endpoint) {
      try {
        const id  = this.getAttribute('id') || 'default';
        const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`);
        if (res.ok) entries = await res.json();
      } catch { /* muestra vacío */ }
    } else {
      entries = JSON.parse(localStorage.getItem(this._storageKey()) || '[]');
    }
    this._renderEntries(entries);
  }

  _renderEntries(entries) {
    if (!entries.length) {
      this._entriesEl.innerHTML = `<p class="r-guestbook__empty">${t(this.langCode, 'empty')}</p>`;
      return;
    }
    this._entriesEl.innerHTML = entries.map(e => {
      const date = new Date(e.timestamp).toLocaleDateString(this.langCode === 'en' ? 'en-US' : 'es-ES');
      const safe = String(e.message).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const safeName = String(e.name).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `
        <div class="r-guestbook__entry">
          <div class="r-guestbook__entry-header">
            <span class="r-guestbook__entry-name">${safeName}</span>
            <span class="r-guestbook__entry-date">${date}</span>
          </div>
          <p class="r-guestbook__entry-msg">${safe}</p>
        </div>`;
    }).join('');
  }
}

customElements.define('r-guestbook', RGuestbook);
