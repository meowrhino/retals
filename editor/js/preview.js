// ============================================================================
// editor/js/preview.js — inyecta el HTML del user en el iframe con scripts r-*.
// ============================================================================
//
// API exportada:
//   createPreview(iframe, getCode, onUsedTags?)  → { refresh(immediate?), reload() }
//
// estrategia:
// - debounce 300ms en cada cambio de código
// - parse del HTML con DOMParser → detectar tags r-*
// - construir un documento HTML completo que carga los <script type="module">
//   de los componentes necesarios desde "../components/r-X.js"
// - escribir todo dentro del iframe con srcdoc (más sandbox-friendly que
//   contentDocument.write y permite el atributo sandbox).
//
// detección de tags:
//   ver `tagsInHTML` y `componentFilesFor` en library.js
// ============================================================================

import { tagsInHTML, componentFilesFor } from './library.js';
import { rewriteRefsToBlobs } from './assets.js';

const DEBOUNCE_MS = 300;

export function createPreview(iframe, getCode, onUsedTags, getAssetStore) {
  let timer = null;
  let lastFingerprint = '';

  function build(html) {
    const tags = tagsInHTML(html);
    const files = componentFilesFor(tags);
    if (onUsedTags) onUsedTags(tags, files);

    // si el código del usuario ya trae <!DOCTYPE> o <html>, lo metemos como
    // documento completo y le inyectamos los scripts en el <head>.
    // si no, lo envolvemos en un esqueleto mínimo.
    const hasDoctype = /<!doctype/i.test(html);
    const hasHtml    = /<html[\s>]/i.test(html);
    const hasHead    = /<head[\s>]/i.test(html);
    const hasBody    = /<body[\s>]/i.test(html);

    const scriptTags = files
      .map(f => `<script type="module" src="../${f}"></script>`)
      .join('\n  ');

    if (hasDoctype || hasHtml) {
      let doc = html;
      // inyectar scripts antes del </head> si existe; si no, antes de </body>; si no, al final
      if (/<\/head>/i.test(doc)) {
        doc = doc.replace(/<\/head>/i, `  ${scriptTags}\n</head>`);
      } else if (/<\/body>/i.test(doc)) {
        doc = doc.replace(/<\/body>/i, `  ${scriptTags}\n</body>`);
      } else {
        doc = doc + scriptTags;
      }
      return doc;
    }

    // fragment — envolver
    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>preview</title>
  <style>
    :root {
      --coral:#ef7d57; --amber:#f5b840; --cream:#fef8e6; --ink:#1a1a1a;
      --paper:#fafafa; --ash:#d4d4d0;
      --r-bg: var(--cream); --r-fg: var(--ink);
      --r-accent: var(--coral); --r-border: var(--ash);
      --r-font: 'JetBrains Mono','Menlo','Consolas',monospace;
    }
    body {
      margin: 0; padding: 1.25rem;
      background: var(--r-bg); color: var(--r-fg);
      font-family: var(--r-font); font-size: 14px; line-height: 1.5;
    }
  </style>
  ${scriptTags}
</head>
<body>
${html}
</body>
</html>`;
  }

  function refresh(immediate) {
    if (timer) clearTimeout(timer);
    const apply = () => {
      let html = getCode();
      // reescribir src/href hacia los Object URLs de los assets locales
      const store = getAssetStore && getAssetStore();
      if (store) html = rewriteRefsToBlobs(html, store);
      const doc = build(html);
      const fp = doc.length + '·' + doc.slice(0, 80);
      // evitar repintar si nada cambió
      if (fp === lastFingerprint) return;
      lastFingerprint = fp;
      // srcdoc respeta sandbox y reinicia el contexto en cada cambio
      iframe.srcdoc = doc;
    };
    if (immediate) apply();
    else timer = setTimeout(apply, DEBOUNCE_MS);
  }

  function reload() {
    lastFingerprint = '';
    refresh(true);
  }

  return { refresh, reload };
}
