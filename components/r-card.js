// ============================================================================
// <r-card> — tarjeta con imagen, título, cuerpo y enlace opcional
// ============================================================================
// vanilla forever · light DOM · CSS inyectado en <head> · fallback sin JS
//
// atributos:
//   heading   texto del encabezado de la tarjeta
//   href      URL — convierte toda la tarjeta en enlace (opcional)
//   target    target del enlace (default _self)
//   tag       tag HTML del heading: h2/h3/h4/p (default h3)
//   lang      "es" | "en" | "ca" (default es)
//
// contenido:
//   el primer <img> o <picture> child se usa como imagen de la tarjeta.
//   el resto es el cuerpo de la tarjeta.
//
// eventos:
//   r-card:click   — al hacer click (detail: { href })
//
// CSS vars:
//   --r-card-bg         fondo              (fallback --r-bg)
//   --r-card-border     borde              (fallback --r-border, 1px solid ink)
//   --r-card-padding    padding del cuerpo (default 1rem)
//   --r-card-radius     radio de esquinas  (default 0)
//   --r-card-shadow     sombra             (default 2px 2px 0 ink)
//   --r-card-gap        gap entre imagen y cuerpo (default 0)
//   --r-card-img-ratio  aspect-ratio imagen (default 4/3)
// ============================================================================

const STYLE_ID = 'r-card-styles';

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    r-card {
      display: block;
    }
    .r-card {
      display: flex;
      flex-direction: column;
      background: var(--r-card-bg, var(--r-bg, #fef8e6));
      border: var(--r-card-border, 1px solid var(--r-border, #1a1a1a));
      border-radius: var(--r-card-radius, 0);
      box-shadow: var(--r-card-shadow, 2px 2px 0 var(--r-fg, #1a1a1a));
      overflow: hidden;
      gap: var(--r-card-gap, 0);
      height: 100%;
      text-decoration: none;
      color: inherit;
      transition: box-shadow 0.1s ease, transform 0.1s ease;
    }
    .r-card--link {
      cursor: pointer;
    }
    .r-card--link:hover {
      box-shadow: var(--r-card-shadow-hover, 3px 3px 0 var(--r-fg, #1a1a1a));
      transform: translate(-1px, -1px);
    }
    .r-card--link:focus-visible {
      outline: 2px solid var(--r-accent, #ef7d57);
      outline-offset: 2px;
    }
    .r-card__image {
      aspect-ratio: var(--r-card-img-ratio, 4/3);
      overflow: hidden;
      flex-shrink: 0;
    }
    .r-card__image img,
    .r-card__image picture {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .r-card__body {
      padding: var(--r-card-padding, 1rem);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }
    .r-card__heading {
      margin: 0;
      font-size: var(--r-card-heading-size, 1rem);
      line-height: 1.3;
      color: var(--r-card-heading-color, var(--r-fg, #1a1a1a));
    }
    .r-card__content {
      margin: 0;
      font-size: var(--r-card-content-size, 0.9rem);
      color: var(--r-card-content-color, var(--r-fg, #1a1a1a));
      opacity: 0.85;
      line-height: 1.5;
    }
    .r-card__content > *:first-child { margin-top: 0; }
    .r-card__content > *:last-child  { margin-bottom: 0; }
  `;
  document.head.appendChild(style);
}

class RCard extends HTMLElement {
  static observedAttributes = ['heading', 'href', 'target', 'tag', 'lang'];

  constructor() {
    super();
    this._mounted = false;
    this._originalContent = '';
    this._onClick = this._onClick.bind(this);
  }

  connectedCallback() {
    injectStyles();
    if (!this._mounted) {
      this._originalContent = this.innerHTML;
      this.innerHTML = '';
      this._mounted = true;
    }
    this._render();
  }

  disconnectedCallback() {
    const el = this.querySelector('.r-card');
    if (el) el.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this._mounted) return;
    this._render();
  }

  get langCode() {
    const l = this.getAttribute('lang') || 'es';
    return l;
  }

  _render() {
    // parsear el contenido original para extraer imagen y cuerpo
    const tmp = document.createElement('div');
    tmp.innerHTML = this._originalContent;

    const imgEl = tmp.querySelector('img, picture');
    if (imgEl) imgEl.remove();

    const heading = this.getAttribute('heading') || '';
    const href    = this.getAttribute('href') || '';
    const target  = this.getAttribute('target') || '_self';
    const tag     = ['h2','h3','h4','p'].includes(this.getAttribute('tag'))
      ? this.getAttribute('tag') : 'h3';

    const wrapper = href
      ? document.createElement('a')
      : document.createElement('div');
    wrapper.className = 'r-card' + (href ? ' r-card--link' : '');
    if (href) {
      wrapper.href = href;
      wrapper.target = target;
      if (target === '_blank') wrapper.setAttribute('rel', 'noopener noreferrer');
    }

    // imagen
    if (imgEl) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'r-card__image';
      imgWrap.appendChild(imgEl.cloneNode(true));
      wrapper.appendChild(imgWrap);
    }

    // cuerpo
    const body = document.createElement('div');
    body.className = 'r-card__body';

    if (heading) {
      const h = document.createElement(tag);
      h.className = 'r-card__heading';
      h.textContent = heading;
      body.appendChild(h);
    }

    const content = document.createElement('div');
    content.className = 'r-card__content';
    content.innerHTML = tmp.innerHTML.trim();
    if (content.innerHTML) body.appendChild(content);

    wrapper.appendChild(body);

    if (href) {
      wrapper.addEventListener('click', this._onClick);
    }

    this.innerHTML = '';
    this.appendChild(wrapper);
  }

  _onClick(e) {
    this.dispatchEvent(new CustomEvent('r-card:click', {
      bubbles: true,
      detail: { href: this.getAttribute('href') },
    }));
  }
}

customElements.define('r-card', RCard);
