// ============================================================================
// <r-gallery> — galería de imágenes con cuatro layouts y lightbox interno
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// uso:
//   <r-gallery layout="grid" cols="3">
//     <img src="img/1.webp" alt="texto descriptivo">
//     <img src="img/2.webp" alt="…">
//     <a href="img/3-full.webp"><img src="img/3-thumb.webp" alt="…"></a>
//   </r-gallery>
//
// atributos:
//   layout     "grid" (default) · "masonry" · "carousel" · "stack"
//   cols       número de columnas para grid/masonry (default: 3)
//   gap        separación entre items (CSS length, default: 0.5rem)
//   lightbox   "on" (default) · "off" — desactiva el modal al click
//   start      índice inicial del carousel (default: 0)
//   lang       "es" (default) · "en" · "ca"
//
// children admitidos:
//   - <img src alt>                        → caso normal
//   - <a href><img src alt></a>            → si lightbox="off", el <a> actúa
//                                            normal; si lightbox está activo,
//                                            se ignora el <a> y el lightbox
//                                            usa el href del <a> como fuente
//                                            de alta resolución (thumb→full)
//   - <picture> y <figure>                 → no soportados de momento; usa <img>
//
// eventos custom (todos bubbles: true):
//   r-gallery:open     detail: { index, src, alt }  al abrir lightbox o cambio en carousel
//   r-gallery:close    detail: {}                   al cerrar lightbox
//   r-gallery:change   detail: { index, src, alt }  navegación dentro de lightbox/carousel
//
// CSS vars (con fallback a globales --r-*):
//   --r-gallery-gap            separación entre items (fallback al atributo gap)
//   --r-gallery-bg             fondo del contenedor (transparente por defecto)
//   --r-gallery-radius         radio de imagen (default 0)
//   --r-gallery-border         borde de imagen (default ninguno)
//   --r-gallery-shadow         sombra de imagen (default ninguna)
//   --r-gallery-lightbox-bg    fondo del modal (default rgba(0,0,0,0.85))
//   --r-gallery-lightbox-fg    color del texto del modal (default #fff)
//   --r-gallery-control-bg     fondo de botones del modal/carousel
//   --r-gallery-control-fg     texto de botones
// ============================================================================

const STYLE_ID = 'r-gallery-styles';

const STRINGS = {
  es: {
    open: 'abrir imagen',
    close: 'cerrar',
    prev: 'anterior',
    next: 'siguiente',
    counter: (i, n) => `${i + 1} de ${n}`,
  },
  en: {
    open: 'open image',
    close: 'close',
    prev: 'previous',
    next: 'next',
    counter: (i, n) => `${i + 1} of ${n}`,
  },
  ca: {
    open: 'obrir imatge',
    close: 'tancar',
    prev: 'anterior',
    next: 'següent',
    counter: (i, n) => `${i + 1} de ${n}`,
  },
};

function t(lang, key, ...args) {
  const dict = STRINGS[lang] || STRINGS.es;
  const v = dict[key] ?? STRINGS.es[key];
  return typeof v === 'function' ? v(...args) : v;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// rotación pseudo-random determinista por índice (para layout=stack)
function seededAngle(i) {
  // genera un ángulo entre -8º y +8º estable por índice
  const x = Math.sin(i * 9301 + 49297) * 233280;
  const frac = x - Math.floor(x);
  return (frac * 16 - 8).toFixed(2);
}

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* ===== fallback sin JS: stream vertical legible ===== */
    r-gallery {
      display: block;
      margin: 1rem 0;
      background: var(--r-gallery-bg, transparent);
    }
    r-gallery > img,
    r-gallery > a > img,
    r-gallery > a {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 0.5rem 0;
    }

    /* ===== JS-enhanced ===== */
    r-gallery.r-gallery--ready {
      position: relative;
    }
    r-gallery.r-gallery--ready > img,
    r-gallery.r-gallery--ready > a {
      display: none; /* se ocultan los originales, render dentro de _viewport */
    }

    .r-gallery__viewport {
      position: relative;
      width: 100%;
    }

    .r-gallery__item {
      display: block;
      cursor: zoom-in;
      border: none;
      padding: 0;
      background: transparent;
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }
    .r-gallery__item img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--r-gallery-radius, 0);
      border: var(--r-gallery-border, none);
      box-shadow: var(--r-gallery-shadow, none);
    }
    .r-gallery__item:focus-visible {
      outline: 2px solid var(--amber, #f5b840);
      outline-offset: 2px;
    }
    .r-gallery--no-lightbox .r-gallery__item { cursor: default; }

    /* ----- layout: grid ----- */
    .r-gallery--grid .r-gallery__viewport {
      display: grid;
      grid-template-columns: repeat(var(--r-gallery-cols, 3), minmax(0, 1fr));
      gap: var(--r-gallery-gap, 0.5rem);
    }
    .r-gallery--grid .r-gallery__item {
      aspect-ratio: 1 / 1;
    }

    /* ----- layout: masonry (true masonry via CSS columns) ----- */
    .r-gallery--masonry .r-gallery__viewport {
      column-count: var(--r-gallery-cols, 3);
      column-gap: var(--r-gallery-gap, 0.5rem);
    }
    .r-gallery--masonry .r-gallery__item {
      width: 100%;
      margin: 0 0 var(--r-gallery-gap, 0.5rem) 0;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .r-gallery--masonry .r-gallery__item img {
      height: auto;
      aspect-ratio: auto;
    }

    /* ----- layout: carousel ----- */
    .r-gallery--carousel .r-gallery__viewport {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 10;
      background: var(--r-gallery-bg, #00000010);
      overflow: hidden;
    }
    .r-gallery--carousel .r-gallery__item {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    .r-gallery--carousel .r-gallery__item--active {
      opacity: 1;
      pointer-events: auto;
    }
    .r-gallery--carousel .r-gallery__item img {
      object-fit: contain;
    }
    .r-gallery__nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: var(--r-gallery-control-bg, rgba(0,0,0,0.55));
      color: var(--r-gallery-control-fg, #fff);
      border: none;
      width: 2.2rem;
      height: 2.2rem;
      font-size: 1.2rem;
      cursor: pointer;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      line-height: 1;
    }
    .r-gallery__nav:hover { background: var(--r-gallery-control-bg-hover, rgba(0,0,0,0.75)); }
    .r-gallery__nav--prev { left: 0.5rem; }
    .r-gallery__nav--next { right: 0.5rem; }
    .r-gallery__nav:focus-visible {
      outline: 2px solid var(--amber, #f5b840);
      outline-offset: 2px;
    }
    .r-gallery__dots {
      position: absolute;
      bottom: 0.5rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.35rem;
      z-index: 2;
    }
    .r-gallery__dot {
      width: 0.6rem;
      height: 0.6rem;
      border-radius: 50%;
      border: 1px solid var(--r-gallery-control-fg, #fff);
      background: transparent;
      cursor: pointer;
      padding: 0;
    }
    .r-gallery__dot--active { background: var(--r-gallery-control-fg, #fff); }

    /* ----- layout: stack ----- */
    .r-gallery--stack .r-gallery__viewport {
      position: relative;
      width: 100%;
      min-height: 320px;
      aspect-ratio: 4 / 3;
    }
    .r-gallery--stack .r-gallery__item {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 60%;
      max-width: 380px;
      aspect-ratio: 4 / 3;
      transform-origin: center center;
      box-shadow: var(--r-gallery-shadow, 0 6px 14px rgba(0,0,0,0.25));
      transition: transform 0.25s ease, z-index 0s 0.25s;
      background: #fff;
      padding: 0.4rem;
    }
    .r-gallery--stack .r-gallery__item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .r-gallery--stack .r-gallery__item:hover,
    .r-gallery--stack .r-gallery__item:focus-visible {
      transform: translate(-50%, -50%) rotate(var(--rot, 0deg)) scale(1.04) !important;
      z-index: 100 !important;
    }

    /* ===== lightbox modal ===== */
    .r-gallery__lightbox {
      position: fixed;
      inset: 0;
      background: var(--r-gallery-lightbox-bg, rgba(0,0,0,0.85));
      color: var(--r-gallery-lightbox-fg, #fff);
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      box-sizing: border-box;
    }
    .r-gallery__lightbox[data-r-open="true"] { display: flex; }
    .r-gallery__lightbox-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      background: transparent;
    }
    .r-gallery__lightbox-close,
    .r-gallery__lightbox-prev,
    .r-gallery__lightbox-next {
      position: absolute;
      background: var(--r-gallery-control-bg, rgba(255,255,255,0.12));
      color: var(--r-gallery-lightbox-fg, #fff);
      border: 1px solid currentColor;
      width: 2.6rem;
      height: 2.6rem;
      cursor: pointer;
      font-size: 1.3rem;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .r-gallery__lightbox-close { top: 1rem; right: 1rem; }
    .r-gallery__lightbox-prev  { top: 50%; left: 1rem;  transform: translateY(-50%); }
    .r-gallery__lightbox-next  { top: 50%; right: 1rem; transform: translateY(-50%); }
    .r-gallery__lightbox-caption {
      position: absolute;
      bottom: 0.75rem;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 0.85rem;
      padding: 0 1rem;
      opacity: 0.9;
    }
    .r-gallery__lightbox-close:focus-visible,
    .r-gallery__lightbox-prev:focus-visible,
    .r-gallery__lightbox-next:focus-visible {
      outline: 2px solid var(--amber, #f5b840);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
}

class RGallery extends HTMLElement {
  static observedAttributes = ['layout', 'cols', 'gap', 'lightbox', 'start', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._items = [];        // [{ src, alt, full }]
    this._index = 0;         // índice activo (carousel/lightbox)
    this._lbOpen = false;
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this._collectItems();
      this._buildSkeleton();
      this._mounted = true;
    }
    this.classList.add('r-gallery--ready');
    this._update();
    document.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  attributeChangedCallback(_, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    this._update();
  }

  // ── getters normalizados ───────────────────────────────────────────────

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return STRINGS[l] ? l : 'es';
  }
  get layoutName() {
    const v = this.getAttribute('layout');
    return ['grid', 'masonry', 'carousel', 'stack'].includes(v) ? v : 'grid';
  }
  get colsValue() {
    const n = parseInt(this.getAttribute('cols'), 10);
    return Number.isFinite(n) && n > 0 ? n : 3;
  }
  get gapValue() {
    return this.getAttribute('gap') || '0.5rem';
  }
  get lightboxOn() {
    return this.getAttribute('lightbox') !== 'off';
  }
  get startIndex() {
    const n = parseInt(this.getAttribute('start'), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  // ── extracción de items (una vez al montar) ────────────────────────────

  _collectItems() {
    const items = [];
    // recorrer los children originales en orden de aparición
    Array.from(this.children).forEach(el => {
      if (el.tagName === 'IMG') {
        items.push({
          src: el.getAttribute('src') || '',
          alt: el.getAttribute('alt') || '',
          full: el.getAttribute('data-full') || el.getAttribute('src') || '',
        });
      } else if (el.tagName === 'A') {
        const img = el.querySelector('img');
        if (img) {
          items.push({
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
            full: el.getAttribute('href') || img.getAttribute('src') || '',
          });
        }
      }
    });
    this._items = items;
    this._index = Math.min(this.startIndex, Math.max(0, items.length - 1));
  }

  _buildSkeleton() {
    this._viewport = document.createElement('div');
    this._viewport.className = 'r-gallery__viewport';

    this._items.forEach((it, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'r-gallery__item';
      btn.setAttribute('aria-label', t(this.langCode, 'open'));
      btn.dataset.index = String(i);
      btn.innerHTML = `<img src="${escapeHtml(it.src)}" alt="${escapeHtml(it.alt)}" loading="lazy">`;
      btn.addEventListener('click', () => this._onItemClick(i));
      this._viewport.appendChild(btn);
    });

    this.appendChild(this._viewport);

    // controles de carousel (creados siempre; solo visibles en layout=carousel)
    this._navPrev = document.createElement('button');
    this._navPrev.type = 'button';
    this._navPrev.className = 'r-gallery__nav r-gallery__nav--prev';
    this._navPrev.innerHTML = '‹';
    this._navPrev.setAttribute('aria-label', t(this.langCode, 'prev'));
    this._navPrev.addEventListener('click', () => this._step(-1));

    this._navNext = document.createElement('button');
    this._navNext.type = 'button';
    this._navNext.className = 'r-gallery__nav r-gallery__nav--next';
    this._navNext.innerHTML = '›';
    this._navNext.setAttribute('aria-label', t(this.langCode, 'next'));
    this._navNext.addEventListener('click', () => this._step(+1));

    this._dots = document.createElement('div');
    this._dots.className = 'r-gallery__dots';

    // lightbox (creado en el body para evitar problemas de stacking)
    this._buildLightbox();
  }

  _buildLightbox() {
    this._lb = document.createElement('div');
    this._lb.className = 'r-gallery__lightbox';
    this._lb.setAttribute('role', 'dialog');
    this._lb.setAttribute('aria-modal', 'true');
    this._lb.dataset.rOpen = 'false';
    this._lb.innerHTML = `
      <img class="r-gallery__lightbox-img" alt="">
      <button class="r-gallery__lightbox-close" type="button" aria-label="${escapeHtml(t(this.langCode, 'close'))}">×</button>
      <button class="r-gallery__lightbox-prev"  type="button" aria-label="${escapeHtml(t(this.langCode, 'prev'))}">‹</button>
      <button class="r-gallery__lightbox-next"  type="button" aria-label="${escapeHtml(t(this.langCode, 'next'))}">›</button>
      <div class="r-gallery__lightbox-caption"></div>
    `;
    this._lbImg = this._lb.querySelector('.r-gallery__lightbox-img');
    this._lbCaption = this._lb.querySelector('.r-gallery__lightbox-caption');
    this._lb.querySelector('.r-gallery__lightbox-close').addEventListener('click', () => this._closeLightbox());
    this._lb.querySelector('.r-gallery__lightbox-prev').addEventListener('click', () => this._step(-1));
    this._lb.querySelector('.r-gallery__lightbox-next').addEventListener('click', () => this._step(+1));
    this._lb.addEventListener('click', (e) => {
      if (e.target === this._lb) this._closeLightbox();
    });
    document.body.appendChild(this._lb);
  }

  // ── render ─────────────────────────────────────────────────────────────

  _update() {
    const layout = this.layoutName;
    ['grid', 'masonry', 'carousel', 'stack'].forEach(l => {
      this.classList.toggle(`r-gallery--${l}`, l === layout);
    });
    this.classList.toggle('r-gallery--no-lightbox', !this.lightboxOn);

    this.style.setProperty('--r-gallery-cols', this.colsValue);
    this.style.setProperty('--r-gallery-gap', this.gapValue);

    // limpieza de controles antes de re-añadir según layout
    if (this._navPrev.parentNode) this._navPrev.remove();
    if (this._navNext.parentNode) this._navNext.remove();
    if (this._dots.parentNode) this._dots.remove();

    if (layout === 'carousel') {
      this._renderCarousel();
    } else if (layout === 'stack') {
      this._renderStack();
    } else {
      this._renderGridLike();
    }

    // actualizar aria-labels (por si cambió lang)
    const items = this._viewport.querySelectorAll('.r-gallery__item');
    items.forEach(b => b.setAttribute('aria-label', t(this.langCode, 'open')));
  }

  _renderGridLike() {
    // grid y masonry usan el layout natural CSS, sólo asegurar que los
    // items no tengan posicionamiento absolute heredado de stack/carousel
    const items = this._viewport.querySelectorAll('.r-gallery__item');
    items.forEach(it => {
      it.style.transform = '';
      it.style.zIndex = '';
      it.style.opacity = '';
      it.classList.remove('r-gallery__item--active');
    });
  }

  _renderCarousel() {
    const items = this._viewport.querySelectorAll('.r-gallery__item');
    items.forEach((it, i) => {
      it.classList.toggle('r-gallery__item--active', i === this._index);
    });

    if (this._items.length > 1) {
      this._viewport.appendChild(this._navPrev);
      this._viewport.appendChild(this._navNext);
      this._dots.innerHTML = '';
      this._items.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'r-gallery__dot' + (i === this._index ? ' r-gallery__dot--active' : '');
        dot.setAttribute('aria-label', `${i + 1}`);
        dot.addEventListener('click', () => this._goTo(i));
        this._dots.appendChild(dot);
      });
      this._viewport.appendChild(this._dots);
    }
  }

  _renderStack() {
    const items = this._viewport.querySelectorAll('.r-gallery__item');
    items.forEach((it, i) => {
      const angle = seededAngle(i);
      it.style.setProperty('--rot', `${angle}deg`);
      it.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      it.style.zIndex = String(i + 1);
      it.style.opacity = '';
      it.classList.remove('r-gallery__item--active');
      it.onclick = (e) => {
        e.preventDefault();
        if (this.lightboxOn) {
          this._openLightbox(i);
        } else {
          // mandar al fondo
          it.style.zIndex = '0';
          items.forEach((other, k) => { if (k !== i) other.style.zIndex = String(k + 2); });
        }
      };
    });
  }

  // ── interacciones ──────────────────────────────────────────────────────

  _onItemClick(i) {
    if (this.layoutName === 'carousel') {
      // dentro del carousel, click sobre la imagen activa abre lightbox
      if (this.lightboxOn && i === this._index) this._openLightbox(i);
      return;
    }
    if (this.layoutName === 'stack') {
      // stack tiene su propio handler; este no se debería llamar
      return;
    }
    if (this.lightboxOn) this._openLightbox(i);
  }

  _step(delta) {
    const n = this._items.length;
    if (!n) return;
    const next = (this._index + delta + n) % n;
    this._goTo(next);
  }

  _goTo(i) {
    this._index = i;
    if (this._lbOpen) this._renderLightbox();
    if (this.layoutName === 'carousel') this._renderCarousel();
    const it = this._items[i];
    this.dispatchEvent(new CustomEvent('r-gallery:change', {
      bubbles: true,
      detail: { index: i, src: it.full, alt: it.alt },
    }));
  }

  _openLightbox(i) {
    if (!this._items.length) return;
    this._index = i;
    this._lbOpen = true;
    this._lb.dataset.rOpen = 'true';
    this._renderLightbox();
    this._lastFocus = document.activeElement;
    this._lb.querySelector('.r-gallery__lightbox-close').focus();
    const it = this._items[i];
    this.dispatchEvent(new CustomEvent('r-gallery:open', {
      bubbles: true,
      detail: { index: i, src: it.full, alt: it.alt },
    }));
  }

  _closeLightbox() {
    if (!this._lbOpen) return;
    this._lbOpen = false;
    this._lb.dataset.rOpen = 'false';
    this.dispatchEvent(new CustomEvent('r-gallery:close', { bubbles: true }));
    if (this._lastFocus && this._lastFocus.focus) this._lastFocus.focus();
  }

  _renderLightbox() {
    const it = this._items[this._index];
    if (!it) return;
    this._lbImg.src = it.full;
    this._lbImg.alt = it.alt;
    this._lbCaption.textContent =
      (it.alt ? it.alt + ' · ' : '') +
      t(this.langCode, 'counter', this._index, this._items.length);
  }

  _onKeyDown(e) {
    if (!this._lbOpen) return;
    if (e.key === 'Escape')      { e.preventDefault(); this._closeLightbox(); }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); this._step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); this._step(+1); }
  }
}

customElements.define('r-gallery', RGallery);
