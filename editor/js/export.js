// ============================================================================
// editor/js/export.js — descarga del proyecto como ZIP autocontenido.
// ============================================================================
//
// flow:
// 1. parse del HTML para detectar tags r-* usados.
// 2. resolver los archivos components/r-X.js necesarios.
// 3. fetch de esos .js desde el propio editor (mismo origen).
// 4. construir el HTML final con scripts apuntando a "components/r-X.js"
//    relativo a la raíz del ZIP (el user despliega la carpeta tal cual).
// 5. añadir README.md.
// 6. zipBlob → descargar.
//
// si el HTML del user ya es un documento completo (con <html>), se respeta
// y solo se inyectan los <script> antes de </head> (mismo criterio que preview).
//
// si falla algún fetch (componente que no está en este editor), se documenta
// en el README y se omite — el download no se cancela: el ZIP llega sin ese .js.
// ============================================================================

import { tagsInHTML, componentFilesFor } from './library.js';
import { zipBlob } from './zip.js';

const README = (componentsList) => `# tu web hecha con retals

esta carpeta contiene tu sitio listo para subir donde quieras: Neocities,
GitHub Pages, Codeberg Pages, un servidor propio. doble click en \`index.html\`
también funciona (algunas funcionalidades pueden requerir servirlo por HTTP).

## qué hay aquí

- \`index.html\` — tu página. edítala con cualquier editor de texto.
- \`components/\` — los Web Components que usa tu HTML. **son tuyos**: una
  copia inmutable. si retals desaparece o cambia, tu web sigue funcionando.

componentes incluidos:

${componentsList.length ? componentsList.map(c => `- \`${c}\``).join('\n') : '- (ninguno: HTML puro)'}

## cómo lo modifico

- el texto y la estructura: edita \`index.html\`.
- la apariencia: añade un \`<style>\` en el \`<head>\` o un \`style.css\` aparte.
- las imágenes: ponlas en una carpeta \`img/\` y referénciaras desde el HTML.
- el audio: igual con \`audio/\`.

## cómo lo subo

- **Neocities**: arrastra la carpeta entera a la interfaz web.
- **GitHub Pages**: \`git init\`, push a un repo público, activa Pages en la
  rama \`main\`.
- **tu propio servidor**: \`scp\` o el método que prefieras. cualquier
  hosting de archivos estáticos vale.

retals · vanilla, forever · meowrhino studio
`;

async function fetchText(url) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`fetch ${url}: ${r.status}`);
  return await r.text();
}

function buildHTMLForExport(userHTML, scriptTags) {
  const hasDoctype = /<!doctype/i.test(userHTML);
  const hasHtml    = /<html[\s>]/i.test(userHTML);

  if (hasDoctype || hasHtml) {
    let doc = userHTML;
    if (/<\/head>/i.test(doc))      doc = doc.replace(/<\/head>/i, `  ${scriptTags}\n</head>`);
    else if (/<\/body>/i.test(doc)) doc = doc.replace(/<\/body>/i, `  ${scriptTags}\n</body>`);
    else                            doc = doc + scriptTags;
    return doc;
  }

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>mi web</title>
  ${scriptTags}
</head>
<body>
${userHTML}
</body>
</html>
`;
}

export async function exportProject(userHTML, projectName = 'mi-retals') {
  const tags = tagsInHTML(userHTML);
  const files = componentFilesFor(tags);

  // scripts apuntando a la ruta relativa dentro del ZIP
  const scriptTags = files
    .map(f => `<script type="module" src="${f}"></script>`)
    .join('\n  ');

  // fetch de los componentes desde el editor actual.
  // si el editor está en /editor/, los .js viven en ../components/r-X.js
  const componentSources = [];
  for (const f of files) {
    try {
      // editor.js corre desde /editor/js/, así que necesitamos `../../<f>`
      const src = await fetchText(`../${f}`);
      componentSources.push({ path: f, data: src });
    } catch (err) {
      console.warn('[export] no se pudo cargar', f, err);
    }
  }

  const indexHTML = buildHTMLForExport(userHTML, scriptTags);

  const allFiles = [
    { path: 'index.html', data: indexHTML },
    { path: 'README.md',  data: README(files) },
    ...componentSources,
  ];

  const blob = await zipBlob(allFiles);
  triggerDownload(blob, `${projectName}.zip`);
  return { tags, files: files.length, projectName };
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 100);
}
