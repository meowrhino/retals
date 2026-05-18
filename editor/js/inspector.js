// ============================================================================
// editor/js/inspector.js — inspector contextual del editor.
// ============================================================================
//
// API:
//   mountInspector({ panel, textarea, onChange }) → { refresh, show, hide }
//
//   panel:    elemento que contiene el inspector
//   textarea: el <textarea> del code editor
//   onChange: callback(newHtml) cuando el user cambia un atributo
//
// estrategia:
// - localizar el tag de apertura que contiene el caret
// - parsear sus atributos
// - renderizar inputs para cada atributo conocido del componente
// - on input change → reescribir el tag con el nuevo valor en el textarea
//
// el catálogo de atributos sugeridos por tag está en library.js#BLOCKS.attrs.
// si un tag no está en el catálogo, se muestran los atributos presentes en
// el HTML actual (modo "edición libre", sin sugerencias de tipo).
// ============================================================================

import { BLOCKS } from './library.js';

const ATTRS_BY_TAG = (() => {
  const map = {};
  BLOCKS.forEach(b => { if (b.attrs) map[b.tag] = b.attrs; });
  return map;
})();

// busca el tag de apertura que contiene la posición `pos` en `text`.
// devuelve { start, end, name, attrsText } o null si no hay tag r-* alrededor.
export function findEnclosingTag(text, pos) {
  // recorrer hacia atrás desde pos hasta encontrar '<' no precedido por '/'
  let i = pos;
  let openIdx = -1;
  while (i > 0) {
    i--;
    const ch = text[i];
    if (ch === '>') return null;       // cerramos un tag antes de encontrar '<'
    if (ch === '<') {
      // si es </ es tag de cierre
      if (text[i + 1] === '/') return null;
      openIdx = i; break;
    }
  }
  if (openIdx < 0) return null;
  // forward hasta '>' o EOF
  let j = openIdx;
  while (j < text.length && text[j] !== '>') j++;
  if (j >= text.length) return null;
  const inner = text.slice(openIdx + 1, j);
  // primer token = nombre
  const m = inner.match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
  if (!m) return null;
  const name = m[1].toLowerCase();
  if (!name.startsWith('r-')) return null;
  const attrsText = inner.slice(m[0].length);
  return { start: openIdx, end: j + 1, name, attrsText };
}

// parser de atributos. soporta: attr="value", attr='value', attr=value, attr
function parseAttrs(attrsText) {
  const out = [];
  const re = /\s*([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s/>]+)))?/g;
  let m;
  while ((m = re.exec(attrsText)) !== null) {
    const name = m[1];
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    const present = m[0].includes('=') ? true : 'bool';
    out.push({ name, value, present });
  }
  return out;
}

// serializa una lista de atributos a texto. respeta orden, comillas dobles.
function serializeAttrs(attrs) {
  return attrs
    .filter(a => a.present !== 'remove')
    .map(a => {
      if (a.present === 'bool') return ` ${a.name}`;
      return ` ${a.name}="${escapeAttr(a.value)}"`;
    })
    .join('');
}
function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export function mountInspector({ panel, textarea, onChange }) {
  const tagEl = panel.querySelector('#ins-tag');
  const bodyEl = panel.querySelector('#ins-body');
  let visible = false;
  let current = null;   // { start, end, name, attrs: [...] }

  function show() { visible = true; panel.hidden = false; refresh(); }
  function hide() { visible = false; panel.hidden = true; }

  function rewriteTag(newAttrs) {
    if (!current) return;
    const v = textarea.value;
    const newTagText = `<${current.name}${serializeAttrs(newAttrs)}${current.selfClosing ? ' />' : '>'}`;
    const next = v.slice(0, current.start) + newTagText + v.slice(current.end);
    // mantener cursor dentro del nuevo tag
    const newPos = current.start + newTagText.length - 1;
    textarea.value = next;
    textarea.setSelectionRange(newPos, newPos);
    current.end = current.start + newTagText.length;
    current.attrs = newAttrs;
    onChange(next);
  }

  function render() {
    bodyEl.innerHTML = '';
    if (!current) {
      tagEl.textContent = '—';
      const p = document.createElement('p');
      p.className = 'r-editor__hint';
      p.textContent = 'coloca el cursor dentro de un <r-…> en el código.';
      bodyEl.appendChild(p);
      return;
    }
    tagEl.textContent = `<${current.name}>`;
    const known = ATTRS_BY_TAG[current.name] || [];
    const knownNames = new Set(known.map(k => k.name));
    // mostrar primero los atributos conocidos (en orden del catálogo)
    const seenNames = new Set();
    const ordered = [];
    known.forEach(spec => {
      const existing = current.attrs.find(a => a.name === spec.name);
      ordered.push({ spec, attr: existing || { name: spec.name, value: '', present: 'remove' } });
      seenNames.add(spec.name);
    });
    // luego los atributos presentes que no estaban en el catálogo
    current.attrs.forEach(a => {
      if (!seenNames.has(a.name)) ordered.push({ spec: null, attr: a });
    });

    ordered.forEach(({ spec, attr }) => {
      const field = document.createElement('div');
      field.className = 'r-ins-field';
      const lab = document.createElement('label');
      lab.textContent = attr.name;
      lab.title = spec?.help || '';
      field.appendChild(lab);

      let input;
      if (spec?.options) {
        input = document.createElement('select');
        const blankOpt = document.createElement('option');
        blankOpt.value = '';
        blankOpt.textContent = '—';
        input.appendChild(blankOpt);
        spec.options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt; o.textContent = opt;
          input.appendChild(o);
        });
        input.value = attr.present === 'remove' ? '' : (attr.value || '');
      } else if (spec?.type === 'bool') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = attr.present !== 'remove';
      } else {
        input = document.createElement('input');
        input.type = spec?.type === 'number' ? 'number' : 'text';
        input.value = attr.present === 'remove' ? '' : (attr.value || '');
        input.placeholder = spec?.placeholder || '';
      }

      input.addEventListener('change', () => {
        const newAttrs = current.attrs.slice();
        const idx = newAttrs.findIndex(a => a.name === attr.name);
        if (spec?.type === 'bool') {
          if (input.checked) {
            if (idx >= 0) newAttrs[idx] = { name: attr.name, value: '', present: 'bool' };
            else newAttrs.push({ name: attr.name, value: '', present: 'bool' });
          } else if (idx >= 0) {
            newAttrs.splice(idx, 1);
          }
        } else {
          const val = input.value;
          if (val === '') {
            if (idx >= 0) newAttrs.splice(idx, 1);
          } else {
            const next = { name: attr.name, value: val, present: true };
            if (idx >= 0) newAttrs[idx] = next; else newAttrs.push(next);
          }
        }
        rewriteTag(newAttrs);
      });
      field.appendChild(input);
      bodyEl.appendChild(field);
    });

    if (!ordered.length) {
      const p = document.createElement('p');
      p.className = 'r-editor__hint';
      p.textContent = 'este componente no tiene atributos.';
      bodyEl.appendChild(p);
    }
  }

  function refresh() {
    if (!visible) return;
    const pos = textarea.selectionStart;
    const found = findEnclosingTag(textarea.value, pos);
    if (!found) { current = null; render(); return; }
    current = {
      start: found.start,
      end: found.end,
      name: found.name,
      attrs: parseAttrs(found.attrsText),
      selfClosing: /\/\s*$/.test(found.attrsText),
    };
    render();
  }

  return { refresh, show, hide };
}
