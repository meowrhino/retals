// ============================================================================
// <r-template> — plantilla base para nuevos Web Components de retals
// ============================================================================
// uso:
//   1. cp _template.js r-<nombre>.js
//   2. renombrar la clase y el customElement
//   3. seguir las reglas de CLAUDE.md:
//      - light DOM (no shadow)
//      - clases CSS prefijadas con r-<nombre>__
//      - atributos para config, slots/children para contenido
//      - fallback obligatorio sin JS
//      - CSS vars --r-* respetadas
//      - eventos custom con namespace r-<nombre>:<acción>
// ============================================================================

class RTemplate extends HTMLElement {
  static observedAttributes = [
    // listar atributos que disparan re-render aquí
    // ej: 'title', 'theme', 'cols'
  ];

  constructor() {
    super();
    // estado interno aquí
  }

  connectedCallback() {
    // 1. preservar contenido interno (fallback)
    this._originalContent = this.innerHTML;
    
    // 2. limpiar y construir UI mejorada
    this.innerHTML = '';
    this.render();
    
    // 3. wire up de interacciones
    this.bindEvents();
  }

  disconnectedCallback() {
    // cleanup de listeners globales (window, document) si los hay
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    // reaccionar a cambios sin recargar
    if (this.isConnected) this.render();
  }

  render() {
    // construir el DOM dentro de this (light DOM)
    // usar clases con prefijo r-<nombre>__
    // ejemplo:
    //
    // const wrapper = document.createElement('div');
    // wrapper.className = 'r-template';
    // wrapper.innerHTML = `
    //   <div class="r-template__header">${this.getAttribute('title') || ''}</div>
    //   <div class="r-template__body">${this._originalContent}</div>
    // `;
    // this.appendChild(wrapper);
  }

  bindEvents() {
    // listeners aquí
    // usar event delegation cuando sea posible
    // emitir eventos custom con namespace:
    //   this.dispatchEvent(new CustomEvent('r-template:action', {
    //     bubbles: true,
    //     detail: { ... }
    //   }));
  }
}

customElements.define('r-template', RTemplate);
