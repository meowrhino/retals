// ============================================================================
// editor/js/library.js — biblioteca de bloques con snippets pegables.
// ============================================================================
// cada entrada tiene:
//   tag         tagname del componente (sin <>). también key del archivo.
//   name        nombre legible
//   complexity  "green" | "yellow"  (mismos códigos del ROADMAP)
//   desc        descripción corta (una frase)
//   snippet     HTML listo para pegar en el cursor del code editor
//
// el orden de declaración es el orden en el que aparecen en el panel.
// ============================================================================

export const BLOCKS = [
  {
    tag: 'r-window',
    name: '<r-window>',
    complexity: 'yellow',
    desc: 'ventana arrastrable con tema none/win95/macos.',
    snippet:
`<r-window title="hola" x="40" y="40" w="320" h="200">
  <p>contenido de la ventana.</p>
</r-window>`,
  },
  {
    tag: 'r-divider',
    name: '<r-divider>',
    complexity: 'green',
    desc: 'separador decorativo.',
    snippet: `<r-divider variant="wave"></r-divider>`,
  },
  {
    tag: 'r-marquee',
    name: '<r-marquee>',
    complexity: 'green',
    desc: 'texto en movimiento (sin el <marquee> viejo).',
    snippet: `<r-marquee speed="40">retals · vanilla, forever · meowrhino studio · </r-marquee>`,
  },
  {
    tag: 'r-typewriter',
    name: '<r-typewriter>',
    complexity: 'green',
    desc: 'texto que se escribe solo.',
    snippet: `<r-typewriter speed="60">hola, esto se escribe solo.</r-typewriter>`,
  },
  {
    tag: 'r-clock',
    name: '<r-clock>',
    complexity: 'green',
    desc: 'reloj en vivo con formato.',
    snippet: `<r-clock format="HH:mm:ss"></r-clock>`,
  },
  {
    tag: 'r-glitch',
    name: '<r-glitch>',
    complexity: 'green',
    desc: 'texto glitcheado.',
    snippet: `<r-glitch intensity="0.6">retals</r-glitch>`,
  },
  {
    tag: 'r-cursor',
    name: '<r-cursor>',
    complexity: 'green',
    desc: 'efectos de cursor (sparkle/trail).',
    snippet: `<r-cursor effect="sparkle"></r-cursor>`,
  },
  {
    tag: 'r-tooltip',
    name: '<r-tooltip>',
    complexity: 'yellow',
    desc: 'tooltip que sigue al cursor o anclado.',
    snippet:
`<r-tooltip text="información oculta">
  pasa el cursor por encima
</r-tooltip>`,
  },
  {
    tag: 'r-card',
    name: '<r-card>',
    complexity: 'yellow',
    desc: 'tarjeta con imagen, título, body y link.',
    snippet:
`<r-card>
  <img slot="image" src="img/portada.webp" alt="">
  <h3 slot="title">título</h3>
  <p slot="body">descripción breve.</p>
  <a slot="link" href="#">más →</a>
</r-card>`,
  },
  {
    tag: 'r-tabs',
    name: '<r-tabs>',
    complexity: 'yellow',
    desc: 'tabs accesibles con keyboard nav.',
    snippet:
`<r-tabs>
  <r-tab title="uno">contenido del primer tab.</r-tab>
  <r-tab title="dos">contenido del segundo tab.</r-tab>
  <r-tab title="tres">contenido del tercero.</r-tab>
</r-tabs>`,
  },
  {
    tag: 'r-accordion',
    name: '<r-accordion>',
    complexity: 'yellow',
    desc: 'secciones expandibles.',
    snippet:
`<r-accordion>
  <r-panel title="sección uno">contenido uno.</r-panel>
  <r-panel title="sección dos">contenido dos.</r-panel>
</r-accordion>`,
  },
  {
    tag: 'r-gallery',
    name: '<r-gallery>',
    complexity: 'yellow',
    desc: 'galería con grid/masonry/carousel/stack + lightbox.',
    snippet:
`<r-gallery layout="grid" cols="3">
  <img src="img/1.webp" alt="">
  <img src="img/2.webp" alt="">
  <img src="img/3.webp" alt="">
</r-gallery>`,
  },
  {
    tag: 'r-jukebox',
    name: '<r-jukebox>',
    complexity: 'yellow',
    desc: 'reproductor con playlist <r-track>.',
    snippet:
`<r-jukebox loop="all">
  <r-track src="audio/1.mp3" title="apertura"   artist="tú"></r-track>
  <r-track src="audio/2.mp3" title="intermedio" artist="tú"></r-track>
</r-jukebox>`,
  },
  {
    tag: 'r-counter',
    name: '<r-counter>',
    complexity: 'yellow',
    desc: 'contador local o vía Worker self-hosted.',
    snippet: `<r-counter label="visitas"></r-counter>`,
  },
  {
    tag: 'r-guestbook',
    name: '<r-guestbook>',
    complexity: 'yellow',
    desc: 'libro de visitas local o vía Worker self-hosted.',
    snippet: `<r-guestbook label="déjame un mensaje"></r-guestbook>`,
  },
];

// ── helpers ────────────────────────────────────────────────────────────

// devuelve los tags r-* (únicos) presentes en un HTML
export function tagsInHTML(html) {
  const set = new Set();
  const re = /<\s*(r-[a-z0-9_-]+)\b/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    set.add(m[1].toLowerCase());
  }
  return Array.from(set);
}

// algunos tags hijos no tienen archivo propio (los registra el padre).
// mapea de tag-hijo → tag-padre cuyo archivo hay que cargar.
const CHILD_TO_PARENT = {
  'r-track': 'r-jukebox',
  'r-tab':   'r-tabs',
  'r-panel': 'r-accordion',
};

// dado un set de tags r-*, devuelve los archivos .js únicos que hay que cargar
export function componentFilesFor(tags) {
  const files = new Set();
  tags.forEach(t => {
    const owner = CHILD_TO_PARENT[t] || t;
    files.add(`components/${owner}.js`);
  });
  return Array.from(files);
}

// inserta un snippet en una textarea respetando la posición del cursor
export function insertAtCursor(textarea, snippet) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end   = textarea.selectionEnd   ?? textarea.value.length;
  const v = textarea.value;
  // si el cursor no está al inicio de línea, anteponer \n para no enredar
  const needsNewlineBefore = start > 0 && v[start - 1] !== '\n';
  const needsNewlineAfter  = end   < v.length && v[end] !== '\n';
  const prefix = needsNewlineBefore ? '\n' : '';
  const suffix = needsNewlineAfter  ? '\n' : '';
  const toInsert = prefix + snippet + suffix;
  textarea.value = v.slice(0, start) + toInsert + v.slice(end);
  const caret = start + toInsert.length;
  textarea.selectionStart = textarea.selectionEnd = caret;
  textarea.focus();
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}
