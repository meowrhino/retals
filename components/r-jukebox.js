// ============================================================================
// <r-jukebox> — reproductor de audio con playlist (children <r-track>)
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// uso:
//   <r-jukebox loop="all" volume="0.7">
//     <r-track src="audio/1.mp3" title="apertura"  artist="meowrhino"></r-track>
//     <r-track src="audio/2.mp3" title="intermedio" artist="meowrhino"></r-track>
//     <r-track src="audio/3.mp3" title="cierre"     artist="meowrhino"></r-track>
//   </r-jukebox>
//
// excepción a "un componente por archivo": <r-track> es un sub-elemento
// estructural de <r-jukebox> y se registra aquí mismo. su única responsabilidad
// fuera de la jukebox es renderizarse como <li><a> de fallback sin JS.
//
// atributos de <r-jukebox>:
//   autoplay     presencia → arranca solo (sujeto a política del navegador)
//   loop         "off" (default) · "one" · "all"
//   shuffle      presencia → orden aleatorio
//   volume       0..1 (default 0.8)
//   start        índice del track inicial (default 0)
//   lang         "es" (default) · "en" · "ca"
//
// atributos de <r-track>:
//   src          URL del audio (obligatorio)
//   title        título del tema
//   artist       autor / artista
//   duration     duración legible (opcional, e.g. "3:24") — se sobrescribe
//                con la duración real cuando se carga
//
// eventos custom (todos bubbles: true, emitidos por <r-jukebox>):
//   r-jukebox:play         detail: { index, src, title }
//   r-jukebox:pause        detail: { index, src, title }
//   r-jukebox:next         detail: { index, src, title }
//   r-jukebox:prev         detail: { index, src, title }
//   r-jukebox:ended        detail: { index, src, title }
//   r-jukebox:timeupdate   detail: { current, duration }   throttled ~1s
//   r-jukebox:error        detail: { index, src, message }
//
// CSS vars (con fallback a globales --r-*):
//   --r-jukebox-bg               fondo del player
//   --r-jukebox-fg               texto general
//   --r-jukebox-accent           color del scrubber/dots/activo
//   --r-jukebox-border           borde del player
//   --r-jukebox-button-size      tamaño de botones de transporte
//   --r-jukebox-progress-height  altura de la barra de progreso
//   --r-jukebox-track-hover      fondo del track al hover
// ============================================================================

const STYLE_ID = 'r-jukebox-styles';

const STRINGS = {
  es: {
    play: 'reproducir', pause: 'pausar',
    prev: 'anterior',   next: 'siguiente',
    volume: 'volumen',  loading: 'cargando…',
    error: 'error al cargar',
    unknown: 'sin título',
    untitled_artist: '—',
  },
  en: {
    play: 'play',       pause: 'pause',
    prev: 'previous',   next: 'next',
    volume: 'volume',   loading: 'loading…',
    error: 'failed to load',
    unknown: 'untitled',
    untitled_artist: '—',
  },
  ca: {
    play: 'reproduir',  pause: 'pausar',
    prev: 'anterior',   next: 'següent',
    volume: 'volum',    loading: 'carregant…',
    error: 'error en carregar',
    unknown: 'sense títol',
    untitled_artist: '—',
  },
};

function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.es[key];
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '–:––';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* ===== fallback sin JS: lista <li><a> legible ===== */
    r-jukebox {
      display: block;
      margin: 1rem 0;
      padding: 0.75rem 1rem;
      background: var(--r-jukebox-bg, var(--r-bg, #fafafa));
      color: var(--r-jukebox-fg, var(--r-fg, #1a1a1a));
      border: 2px solid var(--r-jukebox-border, var(--r-border, #1a1a1a));
      font-family: var(--r-font, system-ui, sans-serif);
    }
    r-track {
      display: list-item;
      list-style: '♪ ' inside;
      margin: 0.25rem 0;
    }
    r-track a { color: inherit; }

    /* ===== JS-enhanced ===== */
    r-jukebox.r-jukebox--ready { padding: 0; }
    r-jukebox.r-jukebox--ready > r-track,
    r-jukebox.r-jukebox--ready > * { display: none; }
    r-jukebox.r-jukebox--ready > .r-jukebox__shell { display: block; }

    .r-jukebox__shell {
      display: block;
      padding: 0.75rem 1rem;
    }

    .r-jukebox__header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--r-jukebox-border, var(--r-border, #1a1a1a));
    }
    .r-jukebox__now {
      flex: 1 1 auto;
      min-width: 0;
      font-weight: 700;
      font-size: 0.95rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .r-jukebox__now small {
      display: block;
      font-weight: 400;
      font-size: 0.78rem;
      opacity: 0.75;
    }
    .r-jukebox__controls {
      display: inline-flex;
      gap: 0.3rem;
      flex: 0 0 auto;
    }
    .r-jukebox__btn {
      width: var(--r-jukebox-button-size, 2rem);
      height: var(--r-jukebox-button-size, 2rem);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .r-jukebox__btn:hover { background: rgba(0,0,0,0.08); }
    .r-jukebox__btn:focus-visible {
      outline: 2px solid var(--amber, #f5b840);
      outline-offset: 2px;
    }
    .r-jukebox__btn--play {
      background: var(--r-jukebox-accent, var(--r-accent, #ef7d57));
      color: var(--ink, #1a1a1a);
      border-color: currentColor;
    }

    .r-jukebox__progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
      font-variant-numeric: tabular-nums;
      font-size: 0.78rem;
    }
    .r-jukebox__seek {
      flex: 1 1 auto;
      -webkit-appearance: none;
      appearance: none;
      height: var(--r-jukebox-progress-height, 6px);
      background: rgba(0,0,0,0.15);
      outline: none;
      margin: 0;
    }
    .r-jukebox__seek::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--r-jukebox-accent, var(--r-accent, #ef7d57));
      border: 2px solid var(--ink, #1a1a1a);
      cursor: pointer;
    }
    .r-jukebox__seek::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--r-jukebox-accent, var(--r-accent, #ef7d57));
      border: 2px solid var(--ink, #1a1a1a);
      cursor: pointer;
    }
    .r-jukebox__volume {
      width: 80px;
      -webkit-appearance: none;
      appearance: none;
      height: var(--r-jukebox-progress-height, 6px);
      background: rgba(0,0,0,0.15);
    }
    .r-jukebox__volume::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--r-jukebox-accent, var(--r-accent, #ef7d57));
      border: 1px solid var(--ink, #1a1a1a);
      cursor: pointer;
    }
    .r-jukebox__volume::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--r-jukebox-accent, var(--r-accent, #ef7d57));
      border: 1px solid var(--ink, #1a1a1a);
      cursor: pointer;
    }

    .r-jukebox__list {
      margin: 0.4rem 0 0;
      padding: 0;
      list-style: none;
      max-height: 260px;
      overflow: auto;
    }
    .r-jukebox__track {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.4rem 0.5rem;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .r-jukebox__track:hover {
      background: var(--r-jukebox-track-hover, rgba(0,0,0,0.06));
    }
    .r-jukebox__track--active {
      border-color: var(--r-jukebox-accent, var(--r-accent, #ef7d57));
      background: rgba(239,125,87,0.08);
    }
    .r-jukebox__track-glyph {
      width: 1.2rem;
      text-align: center;
      opacity: 0.5;
      flex: 0 0 auto;
    }
    .r-jukebox__track--active .r-jukebox__track-glyph {
      opacity: 1;
      color: var(--r-jukebox-accent, var(--r-accent, #ef7d57));
    }
    .r-jukebox__track-title {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .r-jukebox__track-title small {
      opacity: 0.7;
      margin-left: 0.4rem;
      font-size: 0.78rem;
    }
    .r-jukebox__track-duration {
      flex: 0 0 auto;
      font-variant-numeric: tabular-nums;
      font-size: 0.78rem;
      opacity: 0.8;
    }
    .r-jukebox__track:focus-visible {
      outline: 2px solid var(--amber, #f5b840);
      outline-offset: -2px;
    }
    .r-jukebox__loop {
      font-size: 0.7rem;
      letter-spacing: 0.04em;
      text-transform: lowercase;
    }
    .r-jukebox__loop[data-mode="off"] { opacity: 0.4; }
  `;
  document.head.appendChild(style);
}

// ── <r-track> ────────────────────────────────────────────────────────────
// elemento estructural. en fallback (sin enhancer del padre) se renderiza
// como un <li><a> visible. cuando el padre <r-jukebox> está listo, le pasa
// `data-r-managed` y el track se vacía silenciosamente.

class RTrack extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rManaged === 'true') return;
    if (this._rendered) return;
    this._rendered = true;
    const src    = this.getAttribute('src') || '';
    const title  = this.getAttribute('title')  || src.split('/').pop() || 'audio';
    const artist = this.getAttribute('artist') || '';
    // contenido fallback: link descargable. no se altera si el padre
    // <r-jukebox> ya está enhanced (lo oculta vía CSS).
    if (!this.innerHTML.trim()) {
      const inner = `<a href="${escapeHtml(src)}">${escapeHtml(title)}</a>` +
                    (artist ? ` — <em>${escapeHtml(artist)}</em>` : '');
      this.innerHTML = inner;
    }
  }
}

// ── <r-jukebox> ──────────────────────────────────────────────────────────

class RJukebox extends HTMLElement {
  static observedAttributes = ['loop', 'volume', 'start', 'lang', 'shuffle'];

  constructor() {
    super();
    this._mounted = false;
    this._tracks = [];        // [{ src, title, artist, duration, durationStr }]
    this._index = 0;
    this._playing = false;
    this._audio = new Audio();
    this._audio.preload = 'metadata';
    this._lastTimeEmit = 0;
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
    this._onEnded = this._onEnded.bind(this);
    this._onLoadedMeta = this._onLoadedMeta.bind(this);
    this._onError = this._onError.bind(this);
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this._collectTracks();
      this._buildSkeleton();
      this._mounted = true;
    }
    this.classList.add('r-jukebox--ready');
    this._audio.addEventListener('timeupdate', this._onTimeUpdate);
    this._audio.addEventListener('ended',      this._onEnded);
    this._audio.addEventListener('loadedmetadata', this._onLoadedMeta);
    this._audio.addEventListener('error',      this._onError);
    this._update();
    this._loadIndex(this._index, false);

    if (this.hasAttribute('autoplay')) {
      // sujeto a políticas del navegador: si bloquea, ignoramos
      this._play().catch(() => {});
    }
  }

  disconnectedCallback() {
    this._audio.pause();
    this._audio.removeEventListener('timeupdate', this._onTimeUpdate);
    this._audio.removeEventListener('ended',      this._onEnded);
    this._audio.removeEventListener('loadedmetadata', this._onLoadedMeta);
    this._audio.removeEventListener('error',      this._onError);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    if (name === 'volume') {
      this._audio.volume = this.volumeValue;
      if (this._volEl) this._volEl.value = this.volumeValue;
    } else {
      this._update();
    }
  }

  // ── getters ────────────────────────────────────────────────────────────

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }
  get loopMode() {
    const v = this.getAttribute('loop');
    return ['one', 'all', 'off'].includes(v) ? v : 'off';
  }
  get volumeValue() {
    const v = parseFloat(this.getAttribute('volume'));
    if (!Number.isFinite(v)) return 0.8;
    return Math.max(0, Math.min(1, v));
  }
  get startIndex() {
    const n = parseInt(this.getAttribute('start'), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  get isShuffle() {
    return this.hasAttribute('shuffle');
  }

  // ── extracción de tracks ───────────────────────────────────────────────

  _collectTracks() {
    const list = [];
    Array.from(this.querySelectorAll('r-track')).forEach(el => {
      const src = el.getAttribute('src') || '';
      if (!src) return;
      list.push({
        src,
        title:  el.getAttribute('title')    || src.split('/').pop() || t(this.langCode, 'unknown'),
        artist: el.getAttribute('artist')   || '',
        durationStr: el.getAttribute('duration') || '',
        duration: 0,
      });
      el.dataset.rManaged = 'true';
    });
    this._tracks = list;
    this._index = Math.min(this.startIndex, Math.max(0, list.length - 1));
  }

  _buildSkeleton() {
    this._shell = document.createElement('div');
    this._shell.className = 'r-jukebox__shell';
    this._shell.innerHTML = `
      <div class="r-jukebox__header">
        <div class="r-jukebox__now">
          <span class="r-jukebox__now-title">${escapeHtml(t(this.langCode, 'loading'))}</span>
          <small class="r-jukebox__now-artist"></small>
        </div>
        <div class="r-jukebox__controls">
          <button class="r-jukebox__btn r-jukebox__btn--prev" type="button" aria-label="${escapeHtml(t(this.langCode,'prev'))}">⏮</button>
          <button class="r-jukebox__btn r-jukebox__btn--play" type="button" aria-label="${escapeHtml(t(this.langCode,'play'))}">▶</button>
          <button class="r-jukebox__btn r-jukebox__btn--next" type="button" aria-label="${escapeHtml(t(this.langCode,'next'))}">⏭</button>
          <button class="r-jukebox__btn r-jukebox__loop" type="button" data-mode="off" aria-label="loop">off</button>
        </div>
      </div>
      <div class="r-jukebox__progress">
        <span class="r-jukebox__time-current">0:00</span>
        <input class="r-jukebox__seek" type="range" min="0" max="1000" value="0" step="1" aria-label="progress">
        <span class="r-jukebox__time-total">–:––</span>
        <span aria-hidden="true">·</span>
        <span title="${escapeHtml(t(this.langCode,'volume'))}">♪</span>
        <input class="r-jukebox__volume" type="range" min="0" max="1" step="0.01" value="${this.volumeValue}" aria-label="${escapeHtml(t(this.langCode,'volume'))}">
      </div>
      <ul class="r-jukebox__list"></ul>
    `;
    this.appendChild(this._shell);

    // refs
    this._nowTitle  = this._shell.querySelector('.r-jukebox__now-title');
    this._nowArtist = this._shell.querySelector('.r-jukebox__now-artist');
    this._btnPlay   = this._shell.querySelector('.r-jukebox__btn--play');
    this._btnPrev   = this._shell.querySelector('.r-jukebox__btn--prev');
    this._btnNext   = this._shell.querySelector('.r-jukebox__btn--next');
    this._btnLoop   = this._shell.querySelector('.r-jukebox__loop');
    this._seekEl    = this._shell.querySelector('.r-jukebox__seek');
    this._volEl     = this._shell.querySelector('.r-jukebox__volume');
    this._timeCur   = this._shell.querySelector('.r-jukebox__time-current');
    this._timeTot   = this._shell.querySelector('.r-jukebox__time-total');
    this._listEl    = this._shell.querySelector('.r-jukebox__list');

    // wiring
    this._btnPlay.addEventListener('click', () => this._toggle());
    this._btnPrev.addEventListener('click', () => this._prev());
    this._btnNext.addEventListener('click', () => this._next());
    this._btnLoop.addEventListener('click', () => this._cycleLoop());
    this._seekEl.addEventListener('input', () => this._onSeek());
    this._volEl.addEventListener('input', () => {
      this._audio.volume = parseFloat(this._volEl.value);
    });

    this._audio.volume = this.volumeValue;
    this._renderList();
  }

  // ── render ─────────────────────────────────────────────────────────────

  _update() {
    this._btnPrev.setAttribute('aria-label', t(this.langCode, 'prev'));
    this._btnNext.setAttribute('aria-label', t(this.langCode, 'next'));
    this._btnPlay.setAttribute('aria-label', t(this.langCode, this._playing ? 'pause' : 'play'));
    this._btnPlay.textContent = this._playing ? '⏸' : '▶';

    this._btnLoop.dataset.mode = this.loopMode;
    this._btnLoop.textContent = this.loopMode === 'one' ? 'loop·1'
                              : this.loopMode === 'all' ? 'loop·all'
                              : 'loop·off';

    this._renderList();
    this._renderNow();
  }

  _renderNow() {
    const tr = this._tracks[this._index];
    if (!tr) {
      this._nowTitle.textContent  = t(this.langCode, 'unknown');
      this._nowArtist.textContent = '';
      return;
    }
    this._nowTitle.textContent  = tr.title;
    this._nowArtist.textContent = tr.artist || '';
  }

  _renderList() {
    this._listEl.innerHTML = '';
    this._tracks.forEach((tr, i) => {
      const li = document.createElement('li');
      li.className = 'r-jukebox__track' + (i === this._index ? ' r-jukebox__track--active' : '');
      li.tabIndex = 0;
      li.innerHTML = `
        <span class="r-jukebox__track-glyph">${i === this._index && this._playing ? '▶' : '♪'}</span>
        <span class="r-jukebox__track-title">${escapeHtml(tr.title)}${tr.artist ? `<small>${escapeHtml(tr.artist)}</small>` : ''}</span>
        <span class="r-jukebox__track-duration">${escapeHtml(tr.durationStr || fmtTime(tr.duration))}</span>
      `;
      li.addEventListener('click', () => this._goTo(i, true));
      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._goTo(i, true);
        }
      });
      this._listEl.appendChild(li);
    });
  }

  // ── playback ───────────────────────────────────────────────────────────

  _loadIndex(i, autoplay) {
    const tr = this._tracks[i];
    if (!tr) return;
    this._index = i;
    this._audio.src = tr.src;
    this._audio.currentTime = 0;
    this._renderNow();
    this._renderList();
    if (this._timeCur) this._timeCur.textContent = '0:00';
    if (this._seekEl) this._seekEl.value = 0;
    if (autoplay) this._play();
  }

  _play() {
    return this._audio.play().then(() => {
      this._playing = true;
      this._update();
      this._emit('r-jukebox:play');
    });
  }

  _pause() {
    this._audio.pause();
    this._playing = false;
    this._update();
    this._emit('r-jukebox:pause');
  }

  _toggle() {
    if (!this._tracks.length) return;
    if (this._playing) this._pause();
    else this._play().catch(() => {});
  }

  _next() {
    if (!this._tracks.length) return;
    const next = this._pickNext();
    this._goTo(next, this._playing);
    this._emit('r-jukebox:next');
  }

  _prev() {
    if (!this._tracks.length) return;
    // si llevamos más de 3s en el track actual, primero rebobina
    if (this._audio.currentTime > 3) {
      this._audio.currentTime = 0;
      return;
    }
    const n = this._tracks.length;
    const prev = (this._index - 1 + n) % n;
    this._goTo(prev, this._playing);
    this._emit('r-jukebox:prev');
  }

  _pickNext() {
    const n = this._tracks.length;
    if (this.isShuffle && n > 1) {
      let r;
      do { r = Math.floor(Math.random() * n); } while (r === this._index);
      return r;
    }
    return (this._index + 1) % n;
  }

  _goTo(i, autoplay) {
    this._loadIndex(i, autoplay);
  }

  _cycleLoop() {
    const order = ['off', 'all', 'one'];
    const curr = this.loopMode;
    const next = order[(order.indexOf(curr) + 1) % order.length];
    this.setAttribute('loop', next);
  }

  _onSeek() {
    if (!Number.isFinite(this._audio.duration)) return;
    const pct = parseFloat(this._seekEl.value) / 1000;
    this._audio.currentTime = pct * this._audio.duration;
  }

  _onTimeUpdate() {
    const cur = this._audio.currentTime || 0;
    const dur = this._audio.duration || 0;
    if (this._timeCur) this._timeCur.textContent = fmtTime(cur);
    if (this._seekEl && dur > 0) {
      this._seekEl.value = Math.round((cur / dur) * 1000);
    }
    // throttled emit (~1Hz)
    const now = Date.now();
    if (now - this._lastTimeEmit > 950) {
      this._lastTimeEmit = now;
      this.dispatchEvent(new CustomEvent('r-jukebox:timeupdate', {
        bubbles: true,
        detail: { current: cur, duration: dur },
      }));
    }
  }

  _onLoadedMeta() {
    const tr = this._tracks[this._index];
    if (tr) {
      tr.duration = this._audio.duration || 0;
    }
    if (this._timeTot) this._timeTot.textContent = fmtTime(this._audio.duration);
    this._renderList();
  }

  _onEnded() {
    this._emit('r-jukebox:ended');
    const mode = this.loopMode;
    if (mode === 'one') {
      this._audio.currentTime = 0;
      this._play().catch(() => {});
      return;
    }
    const isLast = this._index === this._tracks.length - 1;
    if (isLast && mode !== 'all') {
      this._pause();
      return;
    }
    const next = this._pickNext();
    this._goTo(next, true);
  }

  _onError() {
    const tr = this._tracks[this._index];
    if (!tr) return;
    this.dispatchEvent(new CustomEvent('r-jukebox:error', {
      bubbles: true,
      detail: { index: this._index, src: tr.src, message: t(this.langCode, 'error') },
    }));
  }

  _emit(name) {
    const tr = this._tracks[this._index];
    this.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail: tr ? { index: this._index, src: tr.src, title: tr.title } : { index: -1 },
    }));
  }
}

if (!customElements.get('r-track'))   customElements.define('r-track', RTrack);
if (!customElements.get('r-jukebox')) customElements.define('r-jukebox', RJukebox);
