// ============================================================================
// editor/js/builddoc.js — construcción del documento final del proyecto.
// ============================================================================
//
// UN solo camino para montar el HTML completo: preview y export llaman aquí.
// antes cada uno construía el documento por su cuenta y cualquier diferencia
// hacía que el user viera una cosa en el preview y descargara otra.
// regla: lo que ves en el preview ES lo que descargas.
//
// API:
//   buildDoc(userHTML, { scriptPrefix, title }) → { doc, tags, files }
//     scriptPrefix  se antepone a "components/r-X.js" en los <script>.
//                   el preview usa '../' (los resuelve desde /editor/),
//                   el export usa '' (rutas relativas a la raíz del ZIP).
//     title         título del documento si hay que envolver un fragmento.
//   stripComponentScripts(html) → html sin <script src="…components/r-X.js">
// ============================================================================

import { tagsInHTML, componentFilesFor } from './library.js';

// los starters (y los proyectos ya exportados que alguien reimporte) traen sus
// propios <script> de componentes. se quitan siempre antes de inyectar los del
// editor: si se quedaran, el preview pediría rutas que no existen bajo
// /editor/ (404) y el export duplicaría los tags. el editor gestiona los
// scripts automáticamente a partir de los tags r-* presentes en el HTML.
export function stripComponentScripts(html) {
  return html.replace(
    /[ \t]*<script\b[^>]*\bsrc\s*=\s*["'][^"']*components\/r-[a-z0-9_-]+\.js["'][^>]*>\s*<\/script>[ \t]*\r?\n?/gi,
    ''
  );
}

// estilos base para fragmentos (paleta meowrhino). van tanto al preview como
// al documento exportado: si solo los tuviera el preview, el ZIP descargado
// se vería distinto de lo que el user estuvo viendo mientras editaba.
const FRAGMENT_STYLE = `    :root {
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
    }`;

export function buildDoc(userHTML, { scriptPrefix = '', title = 'mi web' } = {}) {
  const clean = stripComponentScripts(userHTML);
  const tags = tagsInHTML(clean);
  const files = componentFilesFor(tags);

  const scriptTags = files
    .map(f => `<script type="module" src="${scriptPrefix}${f}"></script>`)
    .join('\n  ');

  // si el código del user ya trae <!DOCTYPE> o <html>, se respeta como
  // documento completo y solo se inyectan los scripts. si no, se envuelve
  // en un esqueleto mínimo con la paleta por defecto.
  const isFullDoc = /<!doctype/i.test(clean) || /<html[\s>]/i.test(clean);

  let doc;
  if (isFullDoc) {
    doc = clean;
    if (scriptTags) {
      if (/<\/head>/i.test(doc))      doc = doc.replace(/<\/head>/i, `  ${scriptTags}\n</head>`);
      else if (/<\/body>/i.test(doc)) doc = doc.replace(/<\/body>/i, `  ${scriptTags}\n</body>`);
      else                            doc = doc + scriptTags;
    }
  } else {
    doc = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${FRAGMENT_STYLE}
  </style>
  ${scriptTags}
</head>
<body>
${clean}
</body>
</html>
`;
  }

  return { doc, tags, files };
}
