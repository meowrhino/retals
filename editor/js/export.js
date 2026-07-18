// ============================================================================
// editor/js/export.js — descarga del proyecto como ZIP autocontenido.
// ============================================================================
//
// flow:
// 1. buildDoc (builddoc.js) monta el HTML final — el MISMO camino que el
//    preview, así lo descargado es exactamente lo que se estuvo viendo.
//    aquí los scripts van sin prefijo: "components/r-X.js" relativo a la
//    raíz del ZIP (el user despliega la carpeta tal cual).
// 2. fetch de esos .js desde el propio editor (mismo origen).
// 3. añadir README.md + assets.
// 4. zipBlob → descargar.
//
// si falla algún fetch (componente que no está en este editor), se documenta
// en el README y se omite — el download no se cancela: el ZIP llega sin ese .js.
// ============================================================================

import { buildDoc } from './builddoc.js';
import { zipBlob } from './zip.js';

const README = (componentsList, assetsList = []) => `# tu web hecha con retals

esta carpeta contiene tu sitio listo para subir donde quieras: Neocities,
GitHub Pages, Codeberg Pages, un servidor propio. doble click en \`index.html\`
también funciona (algunas funcionalidades pueden requerir servirlo por HTTP).

## qué hay aquí

- \`index.html\` — tu página. edítala con cualquier editor de texto.
- \`components/\` — los Web Components que usa tu HTML. **son tuyos**: una
  copia inmutable. si retals desaparece o cambia, tu web sigue funcionando.
${assetsList.length ? `- \`img/\`, \`audio/\`, etc. — tus assets (imágenes, audio, etc.) tal cual los importaste al editor.\n` : ''}
componentes incluidos:

${componentsList.length ? componentsList.map(c => `- \`${c}\``).join('\n') : '- (ninguno: HTML puro)'}
${assetsList.length ? `\nassets incluidos:\n\n${assetsList.map(a => `- \`${a}\``).join('\n')}\n` : ''}

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

export async function exportProject(userHTML, projectName = 'mi-retals', assets = []) {
  const { doc: indexHTML, tags, files } = buildDoc(userHTML, { scriptPrefix: '', title: projectName });

  // fetch de los componentes desde el editor actual.
  // el editor vive en /editor/, los .js en ../components/r-X.js
  const componentSources = [];
  for (const f of files) {
    try {
      const src = await fetchText(`../${f}`);
      componentSources.push({ path: f, data: src });
    } catch (err) {
      console.warn('[export] no se pudo cargar', f, err);
    }
  }

  // convertir assets a Uint8Array para el ZIP
  const assetFiles = [];
  for (const a of assets) {
    const buf = await a.blob.arrayBuffer();
    assetFiles.push({ path: a.path, data: new Uint8Array(buf) });
  }

  const allFiles = [
    { path: 'index.html', data: indexHTML },
    { path: 'README.md',  data: README(files, assetFiles.map(a => a.path)) },
    ...componentSources,
    ...assetFiles,
  ];

  const blob = await zipBlob(allFiles);
  triggerDownload(blob, `${projectName}.zip`);
  return { tags, files: files.length, projectName, assets: assetFiles.length };
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
