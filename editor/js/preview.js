// ============================================================================
// editor/js/preview.js — inyecta el HTML del user en el iframe.
// ============================================================================
//
// API exportada:
//   createPreview(iframe, getCode, onUsedTags?, getAssetStore?)
//     → { refresh(immediate?), reload() }
//
// estrategia:
// - debounce 300ms en cada cambio de código
// - el documento lo monta buildDoc (builddoc.js) — el MISMO camino que usa
//   el export, para que el preview nunca mienta sobre lo que se descarga.
//   aquí solo se añade lo específico del preview: reescribir refs de assets
//   a Object URLs y cargar los scripts con prefijo '../' (viven fuera de
//   /editor/).
// - escribir todo dentro del iframe con srcdoc (más sandbox-friendly que
//   contentDocument.write y permite el atributo sandbox).
// - se repinta siempre: el debounce ya limita la frecuencia, y cualquier
//   atajo para "detectar si cambió algo" (fingerprint por longitud, etc.)
//   acaba saltándose ediciones reales.
// ============================================================================

import { buildDoc } from './builddoc.js';
import { rewriteRefsToBlobs } from './assets.js';

const DEBOUNCE_MS = 300;

export function createPreview(iframe, getCode, onUsedTags, getAssetStore) {
  let timer = null;

  function refresh(immediate) {
    if (timer) clearTimeout(timer);
    const apply = () => {
      let html = getCode();
      // reescribir src/href hacia los Object URLs de los assets locales
      const store = getAssetStore && getAssetStore();
      if (store) html = rewriteRefsToBlobs(html, store);
      const { doc, tags, files } = buildDoc(html, { scriptPrefix: '../', title: 'preview' });
      if (onUsedTags) onUsedTags(tags, files);
      // srcdoc respeta sandbox y reinicia el contexto en cada cambio
      iframe.srcdoc = doc;
    };
    if (immediate) apply();
    else timer = setTimeout(apply, DEBOUNCE_MS);
  }

  function reload() {
    refresh(true);
  }

  return { refresh, reload };
}
