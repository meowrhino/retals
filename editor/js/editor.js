// ============================================================================
// editor/js/editor.js — orquestador del editor.
// ============================================================================

import { BLOCKS, VISIBLE_BLOCKS, insertAtCursor, tagsInHTML, componentFilesFor } from './library.js';
import { createPreview } from './preview.js';
import { exportProject } from './export.js';
import { mountInspector } from './inspector.js';
import { createAssetStore } from './assets.js';

const STORAGE_KEY = 'retals:project';
const DEFAULT_HTML = '';   // por defecto, lienzo limpio

// ── state ──────────────────────────────────────────────────────────────

const state = {
  html: '',
  name: 'mi-retals',
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      html: state.html, name: state.name, savedAt: Date.now(),
    }));
  } catch (_) {}
}

// ── DOM refs ───────────────────────────────────────────────────────────

const $app       = document.getElementById('app');
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
const $insPanel  = document.getElementById('inspector');
const $menuRoot  = document.getElementById('menu');
const $menuTrig  = $menuRoot.querySelector('.r-menu__trigger');
const $menuPanel = $menuRoot.querySelector('.r-menu__panel');

// ── biblioteca ─────────────────────────────────────────────────────────

function renderLibrary(filter = '') {
  const q = filter.trim().toLowerCase();
  $lib.innerHTML = '';
  VISIBLE_BLOCKS
    .filter(b => !q || b.name.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q))
    .forEach(b => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'r-lib-item';
      btn.dataset.complexity = b.complexity;
      btn.dataset.tag = b.tag;
      const strong = document.createElement('strong'); strong.textContent = b.name;
      const small  = document.createElement('small');  small.textContent  = b.desc;
      btn.appendChild(strong); btn.appendChild(small);
      btn.addEventListener('click', () => {
        insertAtCursor($code, b.snippet);
        $code.dispatchEvent(new Event('input', { bubbles: true }));
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
  const start = $code.selectionStart, end = $code.selectionEnd, v = $code.value;
  if (start === end) {
    $code.value = v.slice(0, start) + '  ' + v.slice(end);
    $code.selectionStart = $code.selectionEnd = start + 2;
  } else {
    const lineStart = v.lastIndexOf('\n', start - 1) + 1;
    const block = v.slice(lineStart, end);
    const next = e.shiftKey ? block.replace(/^ {0,2}/gm, '') : block.replace(/^/gm, '  ');
    $code.value = v.slice(0, lineStart) + next + v.slice(end);
    $code.selectionStart = lineStart;
    $code.selectionEnd   = lineStart + next.length;
  }
  $code.dispatchEvent(new Event('input', { bubbles: true }));
});

// ── preview ────────────────────────────────────────────────────────────

// ── assets store + drop zone ───────────────────────────────────────────

const assetStore = createAssetStore({ onChange: () => renderAssets() });

const preview = createPreview(
  $preview,
  () => state.html,
  (tags, files) => {
    const assetCount = assetStore.list().length;
    const compPart = tags.length
      ? `usa: ${tags.join(', ')}  ·  ${files.length} archivo${files.length === 1 ? '' : 's'}`
      : 'HTML puro · 0 componentes';
    $used.textContent = assetCount
      ? `${compPart}  ·  ${assetCount} asset${assetCount === 1 ? '' : 's'}`
      : compPart;
  },
  () => assetStore,
);

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { saveToStorage(); $status.textContent = '· guardado'; }, 1000);
}

$code.addEventListener('input', () => {
  state.html = $code.value;
  $status.textContent = '· editando…';
  preview.refresh();
  scheduleSave();
  inspector.refresh();
});

// ── inspector contextual ───────────────────────────────────────────────

const inspector = mountInspector({
  panel: $insPanel,
  textarea: $code,
  onChange: (newHtml) => {
    state.html = newHtml;
    $code.value = newHtml;
    preview.refresh();
    scheduleSave();
  },
});
$code.addEventListener('click',  () => inspector.refresh());
$code.addEventListener('keyup',  () => inspector.refresh());

// ── hamburger menu ─────────────────────────────────────────────────────

function setMenuOpen(open) {
  $menuPanel.hidden = !open;
  $menuTrig.setAttribute('aria-expanded', open ? 'true' : 'false');
}
$menuTrig.addEventListener('click', (e) => {
  e.stopPropagation();
  setMenuOpen($menuPanel.hidden);
});
document.addEventListener('click', (e) => {
  if (!$menuRoot.contains(e.target)) setMenuOpen(false);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenuOpen(false); });

// ── toggles de paneles + splitters ─────────────────────────────────────

const VISIBLE = { library: true, code: true, preview: true, inspector: false };

function applyVisibility() {
  // mostrar/ocultar paneles
  document.querySelectorAll('[data-r-panel]').forEach(p => {
    const name = p.dataset.rPanel;
    if (name === 'library' || name === 'preview') p.hidden = !VISIBLE[name];
  });
  // splitter library↔code → visible solo si la biblioteca está abierta
  document.querySelector('[data-r-splitter="lib-code"]').hidden = !VISIBLE.library;
  // splitter code↔preview → visible solo si el preview está abierto
  document.querySelector('[data-r-splitter="code-preview"]').hidden = !VISIBLE.preview;

  // ajustar columnas
  const root = $app.style;
  root.setProperty('--col-library',     VISIBLE.library ? (savedCols.library + 'px') : '0px');
  root.setProperty('--col-splitter-1',  VISIBLE.library ? '6px' : '0px');
  root.setProperty('--col-code',        '1fr');
  root.setProperty('--col-splitter-2',  VISIBLE.preview ? '6px' : '0px');
  root.setProperty('--col-preview',     VISIBLE.preview ? (savedCols.preview + 'px') : '0px');

  // inspector visible o no
  if (VISIBLE.inspector) inspector.show(); else inspector.hide();

  // sync toggle buttons
  document.querySelectorAll('[data-r-toggle]').forEach(btn => {
    btn.classList.toggle('r-toggle--on', VISIBLE[btn.dataset.rToggle]);
    btn.setAttribute('aria-pressed', VISIBLE[btn.dataset.rToggle] ? 'true' : 'false');
  });
}

const savedCols = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + ':cols');
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { library: 240, preview: 480 };
})();

function persistCols() {
  try { localStorage.setItem(STORAGE_KEY + ':cols', JSON.stringify(savedCols)); } catch (_) {}
}

document.querySelectorAll('[data-r-toggle]').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.rToggle;
    if (name === 'code') return; // el código no se puede ocultar
    VISIBLE[name] = !VISIBLE[name];
    applyVisibility();
  });
});

// drag de splitters
document.querySelectorAll('[data-r-splitter]').forEach(sep => {
  let dragging = null;
  sep.addEventListener('pointerdown', (e) => {
    if (e.button != null && e.button !== 0) return;
    sep.classList.add('r-editor__splitter--dragging');
    sep.setPointerCapture?.(e.pointerId);
    const which = sep.dataset.rSplitter;
    const appRect = $app.getBoundingClientRect();
    dragging = { which, pointerId: e.pointerId, appRect };
    e.preventDefault();
  });
  sep.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== dragging.pointerId) return;
    if (dragging.which === 'lib-code') {
      const w = Math.max(160, Math.min(500, e.clientX - dragging.appRect.left));
      savedCols.library = Math.round(w);
    } else if (dragging.which === 'code-preview') {
      const w = Math.max(220, Math.min(900, dragging.appRect.right - e.clientX));
      savedCols.preview = Math.round(w);
    }
    applyVisibility();
  });
  sep.addEventListener('pointerup', (e) => {
    if (!dragging || e.pointerId !== dragging.pointerId) return;
    sep.classList.remove('r-editor__splitter--dragging');
    sep.releasePointerCapture?.(e.pointerId);
    dragging = null;
    persistCols();
  });
});

// ── toolbar actions ────────────────────────────────────────────────────

document.querySelectorAll('[data-r-action]').forEach(el => {
  const action = el.dataset.rAction;
  el.addEventListener('click', async () => {
    if (el.tagName === 'LABEL' || el.tagName === 'SELECT') return;
    switch (action) {
      case 'new':            return onNew();
      case 'import':         return onImport();
      case 'export-json':    return onExportJSON();
      case 'media':          return onMediaPlaceholder();
      case 'download':       return onDownload();
      case 'reload-preview': return preview.reload();
      case 'ins-close':      VISIBLE.inspector = false; applyVisibility(); return;
    }
  });
});

$starter.addEventListener('change', async () => {
  const name = $starter.value;
  if (!name) return;
  await onLoadStarter(name);
  $starter.value = '';
  setMenuOpen(false);
});

async function onNew() {
  const proceed = await modalConfirm('nuevo proyecto', '¿descartar el actual y empezar desde cero?');
  if (!proceed) return;
  state.html = DEFAULT_HTML;
  state.name = 'mi-retals';
  $code.value = state.html;
  saveToStorage();
  preview.reload();
  inspector.refresh();
}

async function onLoadStarter(name) {
  try {
    const r = await fetch(`../starters/${name}/index.html`, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const html = await r.text();
    state.html = html;
    state.name = name;
    $code.value = html;
    saveToStorage();
    preview.reload();
    inspector.refresh();
  } catch (err) {
    await modalAlert('no se pudo cargar el starter', `error: ${err.message}\nstarter: ${name}`);
  }
}

function onImport() { $fileImport.click(); }
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
      saveToStorage(); preview.reload(); inspector.refresh();
    } catch (err) {
      modalAlert('importación fallida', `error: ${err.message}`);
    }
  };
  reader.readAsText(file);
  $fileImport.value = '';
});

function onExportJSON() {
  const blob = new Blob([JSON.stringify({
    version: '0.1', name: state.name, html: state.html, savedAt: Date.now(),
  }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${state.name || 'mi-retals'}.retals.json`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 100);
}

function onMediaPlaceholder() {
  openMediaModal('img');
}

// modal con iframe de imgToWeb / videoToWeb + drop zone hacia el editor.
function openMediaModal(kind) {
  const $m = document.getElementById('media-modal');
  const $iframe = document.getElementById('media-iframe');
  const $title  = document.getElementById('media-title');
  const $drop   = document.getElementById('media-drop');
  const isVideo = kind === 'video';
  $iframe.src = isVideo
    ? 'https://meowrhino.github.io/videoToWeb/'
    : 'https://meowrhino.github.io/imgToWeb/';
  $title.textContent = isVideo ? 'comprimir video' : 'comprimir imágenes';
  $m.hidden = false;
  setupDropTarget($drop, { insertSnippet: true });
}

document.getElementById('media-close')?.addEventListener('click', () => {
  document.getElementById('media-modal').hidden = true;
});
document.getElementById('media-modal')?.addEventListener('click', (e) => {
  if (e.target.id === 'media-modal') document.getElementById('media-modal').hidden = true;
});
document.getElementById('media-toggle')?.addEventListener('click', () => {
  const $iframe = document.getElementById('media-iframe');
  const isVideo = $iframe.src.includes('videoToWeb');
  openMediaModal(isVideo ? 'img' : 'video');
});

async function onDownload() {
  try {
    const r = await exportProject(state.html, state.name || 'mi-retals', assetStore.list());
    const assetsPart = r.assets ? ` + ${r.assets} asset${r.assets === 1 ? '' : 's'}` : '';
    $status.textContent = `· descargado (${r.files} componente${r.files === 1 ? '' : 's'}${assetsPart})`;
  } catch (err) {
    await modalAlert('descarga fallida', `error: ${err.message}`);
  }
}

// ── drop zone global + drop en textarea ────────────────────────────────

function snippetForAsset(path, type) {
  if (type.startsWith('image/')) return `<img src="${path}" alt="">`;
  if (type.startsWith('audio/')) return `<audio controls src="${path}"></audio>`;
  if (type.startsWith('video/')) return `<video controls src="${path}" style="max-width:100%;"></video>`;
  return `<a href="${path}">${path.split('/').pop()}</a>`;
}

async function handleDropFiles(files, opts = {}) {
  if (!files || !files.length) return;
  const paths = await assetStore.addFiles(files);
  if (opts.insertSnippet && paths.length) {
    for (const p of paths) {
      const a = assetStore.get(p);
      if (a) insertAtCursor($code, snippetForAsset(p, a.type));
    }
    $code.dispatchEvent(new Event('input', { bubbles: true }));
  }
  $status.textContent = `· ${paths.length} asset${paths.length === 1 ? '' : 's'} añadido${paths.length === 1 ? '' : 's'}`;
}

function setupDropTarget(el, opts) {
  el.addEventListener('dragover', (e) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    el.classList.add('r-drop-target--active');
  });
  el.addEventListener('dragleave', () => el.classList.remove('r-drop-target--active'));
  el.addEventListener('drop', (e) => {
    el.classList.remove('r-drop-target--active');
    if (!e.dataTransfer?.files?.length) return;
    e.preventDefault();
    handleDropFiles(e.dataTransfer.files, opts);
  });
}

setupDropTarget($code,            { insertSnippet: true });
setupDropTarget(document.body,    { insertSnippet: false });

// ── panel de assets ────────────────────────────────────────────────────

const $assetsPanel = document.getElementById('assets-panel');
const $assetsList  = document.getElementById('assets-list');

function renderAssets() {
  const items = assetStore.list();
  if (!$assetsList) return;
  $assetsPanel.hidden = items.length === 0;
  $assetsList.innerHTML = '';
  items.forEach(a => {
    const li = document.createElement('li');
    li.className = 'r-asset';
    const isImg = a.type.startsWith('image/');
    const thumb = isImg
      ? `<img src="${assetStore.urlFor(a.path)}" alt="" class="r-asset__thumb">`
      : `<span class="r-asset__icon">${a.type.startsWith('audio/') ? '♪' : a.type.startsWith('video/') ? '▶' : '◎'}</span>`;
    li.innerHTML = `
      ${thumb}
      <div class="r-asset__meta">
        <code class="r-asset__path">${a.path}</code>
        <small>${formatSize(a.size)} · ${a.type || 'binario'}</small>
      </div>
      <div class="r-asset__actions">
        <button type="button" class="r-btn r-btn--xs" data-asset-act="insert" data-path="${a.path}">insertar</button>
        <button type="button" class="r-btn r-btn--xs" data-asset-act="remove" data-path="${a.path}" aria-label="quitar">×</button>
      </div>
    `;
    $assetsList.appendChild(li);
  });
  // refrescar el preview por si los URLs cambian
  preview.refresh(true);
}

function formatSize(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-asset-act]');
  if (!btn) return;
  const path = btn.dataset.path;
  if (btn.dataset.assetAct === 'remove') {
    assetStore.remove(path);
  } else if (btn.dataset.assetAct === 'insert') {
    const a = assetStore.get(path);
    if (a) {
      insertAtCursor($code, snippetForAsset(path, a.type));
      $code.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
});

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

// ── modal genérico ─────────────────────────────────────────────────────

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
function modalAlert(t, b)   { return openModal(t, b, false); }
function modalConfirm(t, b) { return openModal(t, b, true); }
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
  applyVisibility();
  preview.refresh(true);
  inspector.refresh();
  $status.textContent = saved ? '· cargado' : '· nuevo';
})();
