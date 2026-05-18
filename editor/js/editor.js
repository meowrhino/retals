// ============================================================================
// editor/js/editor.js — orquestador del editor.
// ============================================================================
//
// responsabilidades:
// - cargar/guardar el proyecto en localStorage
// - poblar el panel biblioteca con los bloques de library.js
// - wire del textarea: insertar snippet, Tab indenta, debounce → preview
// - tabs móviles (<700px)
// - toolbar: nuevo, starter, importar/exportar .retals.json, descargar ZIP
//
// el "media compress" se deja en placeholder: abre el iframe en pestaña.
// la integración real es Fase 5 del ROADMAP.
// ============================================================================

import { BLOCKS, insertAtCursor, tagsInHTML, componentFilesFor } from './library.js';
import { createPreview } from './preview.js';
import { exportProject } from './export.js';

const STORAGE_KEY = 'retals:project';
const DEFAULT_HTML =
`<!-- bienvenida a retals · arrastra bloques desde la izquierda o teclea HTML aquí -->

<h1>hola mundo</h1>
<p>esta es tu web. todo lo que aparezca aquí se previsualiza al lado.</p>

<r-window title="ventana" x="20" y="120" w="280" h="160">
  <p>arrástrala desde la barra superior.</p>
</r-window>
`;

// ── state ──────────────────────────────────────────────────────────────

const state = {
  html: '',
  name: 'mi-retals',
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      html: state.html,
      name: state.name,
      savedAt: Date.now(),
    }));
  } catch (_) {
    // localStorage lleno o desactivado — no bloqueamos
  }
}

// ── DOM refs ───────────────────────────────────────────────────────────

const $code      = document.getElementById('code');
const $preview   = document.getElementById('preview');
const $lib       = document.getElementById('lib');
const $libSearch = document.getElementById('lib-search');
const $used      = document.getElementById('used-components');
const $status    = document.getElementById('code-status');
const $modal     = document.getElementById('modal');
const $modalTitle= document.getElementById('modal-title');
const $modalBody = document.getElementById('modal-body');
const $starter   = document.getElementById('starter-select');
const $fileImport= document.getElementById('file-import');

// ── biblioteca ─────────────────────────────────────────────────────────

function renderLibrary(filter = '') {
  const q = filter.trim().toLowerCase();
  $lib.innerHTML = '';
  BLOCKS
    .filter(b => !q || b.name.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q))
    .forEach(b => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'r-lib-item';
      btn.dataset.complexity = b.complexity;
      btn.dataset.tag = b.tag;
      const strong = document.createElement('strong');
      strong.textContent = b.name;
      const small = document.createElement('small');
      small.textContent = b.desc;
      btn.appendChild(strong);
      btn.appendChild(small);
      btn.addEventListener('click', () => {
        insertAtCursor($code, b.snippet);
      });
      li.appendChild(btn);
      $lib.appendChild(li);
    });
}

$libSearch.addEventListener('input', () => renderLibrary($libSearch.value));

// ── textarea: Tab para indentar ────────────────────────────────────────

$code.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  const start = $code.selectionStart;
  const end   = $code.selectionEnd;
  const v = $code.value;
  if (start === end) {
    $code.value = v.slice(0, start) + '  ' + v.slice(end);
    $code.selectionStart = $code.selectionEnd = start + 2;
  } else {
    // indent multilinea: añadir/quitar 2 espacios a cada línea seleccionada
    const lineStart = v.lastIndexOf('\n', start - 1) + 1;
    const block = v.slice(lineStart, end);
    let next;
    if (e.shiftKey) {
      next = block.replace(/^ {0,2}/gm, '');
    } else {
      next = block.replace(/^/gm, '  ');
    }
    $code.value = v.slice(0, lineStart) + next + v.slice(end);
    $code.selectionStart = lineStart;
    $code.selectionEnd   = lineStart + next.length;
  }
  $code.dispatchEvent(new Event('input', { bubbles: true }));
});

// ── preview ────────────────────────────────────────────────────────────

const preview = createPreview($preview, () => state.html, (tags, files) => {
  $used.textContent = tags.length
    ? `usa: ${tags.join(', ')}  ·  ${files.length} archivo${files.length === 1 ? '' : 's'}`
    : 'HTML puro · 0 componentes';
});

$code.addEventListener('input', () => {
  state.html = $code.value;
  $status.textContent = '· editando…';
  preview.refresh();
  // throttle de localStorage: 1 segundo
  scheduleSave();
});

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveToStorage();
    $status.textContent = '· guardado';
  }, 1000);
}

// ── toolbar ────────────────────────────────────────────────────────────

document.querySelectorAll('[data-r-action]').forEach(el => {
  const action = el.dataset.rAction;
  el.addEventListener('click', async (e) => {
    if (el.tagName === 'LABEL') return; // las labels no disparan, su <select> sí
    switch (action) {
      case 'new':         return onNew();
      case 'import':      return onImport();
      case 'export-json': return onExportJSON();
      case 'media':       return onMediaPlaceholder();
      case 'download':    return onDownload();
      case 'reload-preview': return preview.reload();
    }
  });
});

$starter.addEventListener('change', async () => {
  const name = $starter.value;
  if (!name) return;
  await onLoadStarter(name);
  $starter.value = '';
});

async function onNew() {
  const proceed = await modalConfirm(
    'nuevo proyecto',
    '¿descartar el actual y empezar desde cero? esto borra lo guardado en localStorage.'
  );
  if (!proceed) return;
  state.html = DEFAULT_HTML;
  state.name = 'mi-retals';
  $code.value = state.html;
  saveToStorage();
  preview.reload();
}

async function onLoadStarter(name) {
  try {
    const url = `../starters/${name}/index.html`;
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const html = await r.text();
    state.html = html;
    state.name = name;
    $code.value = html;
    saveToStorage();
    preview.reload();
  } catch (err) {
    await modalAlert('no se pudo cargar el starter', `error: ${err.message}\n\nstarter: ${name}`);
  }
}

function onImport() {
  $fileImport.click();
}
$fileImport.addEventListener('change', () => {
  const file = $fileImport.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (typeof data.html !== 'string') throw new Error('falta campo "html"');
      state.html = data.html;
      state.name = data.name || 'mi-retals';
      $code.value = state.html;
      saveToStorage();
      preview.reload();
    } catch (err) {
      modalAlert('importación fallida', `el archivo no parece un .retals.json válido.\n\ndetalle: ${err.message}`);
    }
  };
  reader.readAsText(file);
  $fileImport.value = '';
});

function onExportJSON() {
  const blob = new Blob([JSON.stringify({
    version: '0.1',
    name: state.name,
    html: state.html,
    savedAt: Date.now(),
  }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.name || 'mi-retals'}.retals.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 100);
}

async function onMediaPlaceholder() {
  await modalAlert(
    'comprimir media (Fase 5)',
    'la integración de imgToWeb / videoToWeb está pendiente en el roadmap.\n\nmientras tanto, comprime tus archivos en sus webs:\n\n• https://meowrhino.github.io/imgToWeb/\n• https://meowrhino.github.io/videoToWeb/\n\ny pégalos en una carpeta /img o /audio dentro del ZIP cuando descargues.'
  );
}

async function onDownload() {
  try {
    const r = await exportProject(state.html, state.name || 'mi-retals');
    $status.textContent = `· descargado (${r.files} componente${r.files === 1 ? '' : 's'})`;
  } catch (err) {
    await modalAlert('descarga fallida', `error: ${err.message}`);
  }
}

// ── tabs móviles ───────────────────────────────────────────────────────

document.querySelectorAll('[data-r-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    const name = tab.dataset.rTab;
    document.querySelectorAll('.r-editor__tab').forEach(t => {
      t.classList.toggle('r-editor__tab--active', t.dataset.rTab === name);
      t.setAttribute('aria-selected', t.dataset.rTab === name ? 'true' : 'false');
    });
    document.querySelectorAll('.r-editor__panel').forEach(p => {
      p.classList.toggle('r-editor__panel--active', p.dataset.rPanel === name);
    });
  });
});

// ── modal ──────────────────────────────────────────────────────────────

let modalResolve = null;
function openModal(title, body, twoButtons) {
  $modalTitle.textContent = title;
  $modalBody.textContent = body;
  $modal.hidden = false;
  $modal.querySelector('[data-r-modal="cancel"]').style.display = twoButtons ? '' : 'none';
  return new Promise(res => { modalResolve = res; });
}
function closeModal(result) {
  $modal.hidden = true;
  if (modalResolve) { modalResolve(result); modalResolve = null; }
}
function modalAlert(title, body)   { return openModal(title, body, false); }
function modalConfirm(title, body) { return openModal(title, body, true); }

$modal.querySelector('[data-r-modal="ok"]').addEventListener('click', () => closeModal(true));
$modal.querySelector('[data-r-modal="cancel"]').addEventListener('click', () => closeModal(false));
$modal.addEventListener('click', (e) => { if (e.target === $modal) closeModal(false); });

// ── arranque ───────────────────────────────────────────────────────────

(function boot() {
  renderLibrary();
  const saved = loadFromStorage();
  state.html = saved?.html ?? DEFAULT_HTML;
  state.name = saved?.name ?? 'mi-retals';
  $code.value = state.html;
  preview.refresh(true);
  $status.textContent = saved ? '· cargado' : '· nuevo';
})();
