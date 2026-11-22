// ============================================================================
// editor/js/collage-drag.js — arrastrar bloques de <r-collage> en el preview.
// ============================================================================
//
// API:
//   markBlocks(html)                  → html con data-r-drag="N" en cada tag
//                                       que lleva x= o y= (solo para el preview)
//   setBlockPlace(html, n, { x, y })  → html con el x/y del bloque N reescritos
//   enableCollageDrag(iframe, onMove) → engancha el arrastre en cada carga del
//                                       iframe. onMove(n, { x, y }) al soltar.
//
// cómo se casa un bloque del preview con su tag en el código:
// los dos lados numeran con la MISMA regex sobre el MISMO texto (el código del
// user): el N-ésimo tag con x= o y=. el preview lleva el número en
// data-r-drag; al soltar, el editor busca el N-ésimo tag y reescribe su x/y.
// el data-r-drag solo existe en el preview: el export no pasa por aquí.
//
// solo ratón y lápiz. con el dedo no hay manera de distinguir "arrastro el
// bloque" de "hago scroll" sin quitarle el scroll al preview.
// ============================================================================

// un tag de apertura entero, con valores entre comillas que pueden llevar '>'
const OPEN_TAG = /<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/"']+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*\/?>/g;
const HAS_PLACE = /\s[xy]\s*=/;

// recorre los tags con x/y; fn(match, n) devuelve el texto que lo sustituye
function eachBlock(html, fn) {
  let n = 0;
  return html.replace(OPEN_TAG, (tag, name, attrs) =>
    HAS_PLACE.test(attrs) ? fn(tag, n++, name) : tag);
}

export function markBlocks(html) {
  return eachBlock(html, (tag, n, name) =>
    tag.replace(`<${name}`, `<${name} data-r-drag="${n}"`));
}

// pone (o añade) un atributo en el texto de un tag de apertura
function setAttr(tag, name, attr, value) {
  const re = new RegExp(`(\\s${attr}\\s*=\\s*)(?:"[^"]*"|'[^']*'|[^\\s"'>]+)`);
  if (re.test(tag)) return tag.replace(re, `$1"${value}"`);
  return tag.replace(`<${name}`, `<${name} ${attr}="${value}"`);
}

export function setBlockPlace(html, target, { x, y }) {
  return eachBlock(html, (tag, n, name) => {
    if (n !== target) return tag;
    // y primero: si falta x, setAttr la pone pegada al nombre, delante de y
    return setAttr(setAttr(tag, name, 'y', y), name, 'x', x);
  });
}

// estilo que solo ve el preview: que se note qué se puede arrastrar
const DRAG_STYLE = `
  .r-collage__item[data-r-drag] { cursor: grab; }
  /* sin esto, enlaces e imágenes arrancan el arrastre nativo del navegador
     y este corta el nuestro (pointercancel) */
  .r-collage__item[data-r-drag], .r-collage__item[data-r-drag] * {
    -webkit-user-drag: none; user-select: none; -webkit-user-select: none;
  }
  .r-collage__item[data-r-drag]:hover { outline: 1px dashed #ef7d57; outline-offset: 2px; }
  .r-collage__item.r-collage-drag--on { cursor: grabbing; outline: 2px solid #ef7d57; outline-offset: 2px; }
`;
const THRESHOLD = 4; // px que hay que mover antes de que cuente como arrastre

export function enableCollageDrag(iframe, onMove) {
  iframe.addEventListener('load', () => {
    const doc = iframe.contentDocument;
    if (!doc) return;
    const style = doc.createElement('style');
    style.textContent = DRAG_STYLE;
    doc.head.appendChild(style);

    let drag = null;

    // en captura: gana a lo que haya dentro del bloque (p.ej. el drag de un
    // r-window). un click sin mover sigue llegando a enlaces y botones.
    doc.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      const el = e.target.closest('.r-collage__item[data-r-drag]');
      const collage = el && el.parentElement;
      if (!collage || collage.localName !== 'r-collage') return;
      const unit = parseFloat(collage.style.getPropertyValue('--r-collage-u')) || 1;
      drag = {
        el, unit, pointerId: e.pointerId, moved: false,
        startX: e.clientX, startY: e.clientY,
        x0: parseFloat(el.getAttribute('x')) || 0,
        y0: parseFloat(el.getAttribute('y')) || 0,
      };
      e.stopPropagation();
      e.preventDefault(); // sin selección de texto
    }, true);

    doc.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < THRESHOLD) return;
      drag.moved = true;
      drag.el.classList.add('r-collage-drag--on');
      // r-collage reacciona al cambio de atributo y recoloca el bloque
      drag.x = Math.round(drag.x0 + dx / drag.unit);
      drag.y = Math.round(drag.y0 + dy / drag.unit);
      drag.el.setAttribute('x', drag.x);
      drag.el.setAttribute('y', drag.y);
    }, true);

    const end = (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const { el, moved, x, y, x0, y0 } = drag;
      drag = null;
      if (!moved) return;
      el.classList.remove('r-collage-drag--on');
      if (e.type === 'pointercancel') {
        // cancelado (cambio de pestaña, etc.): vuelve a su sitio, que el
        // preview no enseñe algo que el código no dice
        el.setAttribute('x', x0);
        el.setAttribute('y', y0);
        return;
      }
      // el click que sigue al soltar no debe seguir un enlace ni pulsar nada
      doc.addEventListener('click', (c) => { c.preventDefault(); c.stopPropagation(); },
        { capture: true, once: true });
      onMove(Number(el.dataset.rDrag), { x, y });
    };
    doc.addEventListener('pointerup', end, true);
    doc.addEventListener('pointercancel', end, true);
    doc.addEventListener('dragstart', (e) => {
      if (e.target.closest?.('.r-collage__item[data-r-drag]')) e.preventDefault();
    }, true);
  });
}

// ── self-check: node editor/js/collage-drag.js ─────────────────────────
// (en el navegador `process` no existe y esto no corre)
if (typeof process !== 'undefined' && process.argv?.[1]?.endsWith('collage-drag.js')) {
  const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
  const src = `<r-collage width="600">
  <!-- <p x="1">en un comentario también cuenta, en los dos lados</p> -->
  <p class="a" x="10" y="20" title="a > b">uno</p>
  <img src="i.webp" alt="" y='5' w="100">
  <div data-x="3" max="4">sin sitio</div>
</r-collage>`;
  const marked = markBlocks(src);
  assert((marked.match(/data-r-drag=/g) || []).length === 3, 'numera 3 tags');
  assert(marked.includes('<p data-r-drag="1" class="a" x="10"'), 'el <p> es el 1');
  assert(marked.includes('<div data-x="3" max="4">'), 'data-x y max no son x');
  const moved = setBlockPlace(src, 1, { x: 300, y: -40 });
  assert(moved.includes('<p class="a" x="300" y="-40" title="a > b">'), 'reescribe x/y');
  const added = setBlockPlace(src, 2, { x: 7, y: 8 });
  assert(added.includes(`<img x="7" src="i.webp" alt="" y="8" w="100">`), 'añade x que faltaba');
  assert(setBlockPlace(src, 9, { x: 1, y: 1 }) === src, 'N fuera de rango no toca nada');
  console.log('collage-drag: ok');
}
