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

// el campo `attrs` lista atributos editables por el inspector. cada uno:
//   { name, type?, options?, placeholder?, help? }
//   type:    "text" (default) | "number" | "bool"
//   options: array de strings → render como <select>

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
    attrs: [
      { name: 'title' },
      { name: 'x',  type: 'text', placeholder: 'px o longitud CSS' },
      { name: 'y',  type: 'text' },
      { name: 'w',  type: 'text' },
      { name: 'h',  type: 'text' },
      { name: 'theme',       options: ['none','win95','macos'] },
      { name: 'resizable',   options: ['false'] },
      { name: 'closable',    options: ['false'] },
      { name: 'minimizable', options: ['true'] },
      { name: 'lang',        options: ['es','en','ca'] },
    ],
  },
  {
    tag: 'r-divider',
    name: '<r-divider>',
    complexity: 'green',
    desc: 'separador decorativo.',
    snippet: `<r-divider variant="wave"></r-divider>`,
    attrs: [
      { name: 'variant', options: ['wave','dots','dashes','glyph','solid'] },
      { name: 'glyph',   placeholder: '✺ · ◌ ✜' },
      { name: 'lang',    options: ['es','en','ca'] },
    ],
  },
  {
    tag: 'r-marquee',
    name: '<r-marquee>',
    complexity: 'green',
    desc: 'texto en movimiento (sin el <marquee> viejo).',
    snippet: `<r-marquee speed="40">retals · vanilla, forever · meowrhino studio · </r-marquee>`,
    attrs: [
      { name: 'speed',     type: 'number', placeholder: 'px/s' },
      { name: 'direction', options: ['left','right','up','down'] },
      { name: 'pause',     type: 'bool',   help: 'pausa al hover' },
      { name: 'lang',      options: ['es','en','ca'] },
    ],
  },
  {
    tag: 'r-typewriter',
    name: '<r-typewriter>',
    complexity: 'green',
    desc: 'texto que se escribe solo.',
    snippet: `<r-typewriter speed="60">hola, esto se escribe solo.</r-typewriter>`,
    attrs: [
      { name: 'speed', type: 'number', placeholder: 'ms por char' },
      { name: 'delay', type: 'number', placeholder: 'ms antes de empezar' },
      { name: 'loop',  type: 'bool' },
      { name: 'cursor', options: ['true','false'] },
      { name: 'lang',  options: ['es','en','ca'] },
    ],
  },
  {
    tag: 'r-clock',
    name: '<r-clock>',
    complexity: 'green',
    desc: 'reloj en vivo con formato.',
    snippet: `<r-clock format="HH:mm:ss"></r-clock>`,
    attrs: [
      { name: 'format',   placeholder: 'HH:mm:ss · YYYY-MM-DD' },
      { name: 'timezone', placeholder: 'Europe/Madrid' },
      { name: 'lang',     options: ['es','en','ca'] },
    ],
  },
  {
    tag: 'r-glitch',
    name: '<r-glitch>',
    complexity: 'green',
    desc: 'texto glitcheado.',
    snippet: `<r-glitch intensity="0.6">retals</r-glitch>`,
    attrs: [
      { name: 'intensity', type: 'number', placeholder: '0..1' },
      { name: 'speed',     type: 'number', placeholder: 'ms' },
      { name: 'hover',     type: 'bool',   help: 'solo en hover' },
      { name: 'lang',      options: ['es','en','ca'] },
    ],
  },
  {
    tag: 'r-cursor',
    name: '<r-cursor>',
    complexity: 'green',
    desc: 'efectos de cursor (sparkle/trail).',
    snippet: `<r-cursor effect="sparkle"></r-cursor>`,
    attrs: [
      { name: 'effect', options: ['sparkle','trail','custom'] },
      { name: 'glyph',  placeholder: '✺ ✦ ◌' },
      { name: 'color',  placeholder: '#ef7d57' },
      { name: 'lang',   options: ['es','en','ca'] },
    ],
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
    attrs: [
      { name: 'text' },
      { name: 'placement', options: ['top','bottom','left','right','cursor'] },
      { name: 'lang',      options: ['es','en','ca'] },
    ],
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
    attrs: [
      { name: 'variant', options: ['default','outlined','elevated'] },
      { name: 'lang',    options: ['es','en','ca'] },
    ],
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
    attrs: [
      { name: 'active', type: 'number', placeholder: 'índice (0=primero)' },
      { name: 'lang',   options: ['es','en','ca'] },
    ],
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
    attrs: [
      { name: 'single', type: 'bool', help: 'solo un panel abierto a la vez' },
      { name: 'lang',   options: ['es','en','ca'] },
    ],
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
    attrs: [
      { name: 'layout',   options: ['grid','masonry','carousel','stack'] },
      { name: 'cols',     type: 'number' },
      { name: 'gap',      placeholder: '0.5rem · 8px' },
      { name: 'lightbox', options: ['on','off'] },
      { name: 'start',    type: 'number' },
      { name: 'lang',     options: ['es','en','ca'] },
    ],
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
    attrs: [
      { name: 'loop',    options: ['off','one','all'] },
      { name: 'shuffle', type: 'bool' },
      { name: 'autoplay', type: 'bool' },
      { name: 'volume',  type: 'number', placeholder: '0..1' },
      { name: 'start',   type: 'number' },
      { name: 'lang',    options: ['es','en','ca'] },
    ],
  },
  {
    tag: 'r-counter',
    name: '<r-counter>',
    complexity: 'yellow',
    desc: 'contador local o vía Worker self-hosted.',
    snippet: `<r-counter label="visitas"></r-counter>`,
    attrs: [
      { name: 'id' },
      { name: 'label' },
      { name: 'endpoint', placeholder: 'https://… (opcional, Worker)' },
      { name: 'lang',     options: ['es','en','ca'] },
    ],
  },
  {
    tag: 'r-guestbook',
    name: '<r-guestbook>',
    complexity: 'yellow',
    desc: 'libro de visitas local o vía Worker self-hosted.',
    snippet: `<r-guestbook label="déjame un mensaje"></r-guestbook>`,
    attrs: [
      { name: 'id' },
      { name: 'label' },
      { name: 'endpoint', placeholder: 'https://… (opcional, Worker)' },
      { name: 'lang',     options: ['es','en','ca'] },
    ],
  },
  // r-track lo registra r-jukebox pero también queremos atributos en inspector
  {
    tag: 'r-track', name: '<r-track>', complexity: 'green',
    desc: '(hijo de r-jukebox)', snippet: `<r-track src="audio.mp3" title="" artist=""></r-track>`,
    attrs: [
      { name: 'src' },
      { name: 'title' },
      { name: 'artist' },
      { name: 'duration', placeholder: '3:24' },
    ],
  },
  {
    tag: 'r-tab', name: '<r-tab>', complexity: 'green',
    desc: '(hijo de r-tabs)', snippet: `<r-tab title="">contenido</r-tab>`,
    attrs: [{ name: 'title' }],
  },
  {
    tag: 'r-panel', name: '<r-panel>', complexity: 'green',
    desc: '(hijo de r-accordion)', snippet: `<r-panel title="">contenido</r-panel>`,
    attrs: [{ name: 'title' }, { name: 'open', type: 'bool' }],
  },
];

// los tres hijos de arriba no aparecen en la biblioteca visible
// (la lista útil del panel biblioteca son los 15 primeros).
export const VISIBLE_BLOCKS = BLOCKS.slice(0, 15);

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
