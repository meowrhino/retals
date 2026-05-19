// ============================================================================
// editor/js/assets.js — assets en memoria del proyecto.
// ============================================================================
//
// API:
//   const store = createAssetStore({ onChange })
//   store.addFiles(FileList | File[])  → Promise<string[]>  // paths añadidos
//   store.list()                       → [{ path, type, size, blob }]
//   store.get(path)                    → asset or null
//   store.remove(path)
//   store.urlFor(path)                 → object URL (cached)
//   store.cleanup()                    → revoca todos los object URLs
//
// los archivos se guardan en memoria (Blob). para persistir entre sesiones
// se podría volcar a IndexedDB; por ahora no, simplifica el contrato y
// fuerza al user a descargar el ZIP antes de cerrar la pestaña (igual que
// cualquier editor online: si cierras sin guardar, pierdes).
// ============================================================================

const IMG_EXT   = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'bmp'];
const AUDIO_EXT = ['mp3', 'ogg', 'wav', 'm4a', 'flac'];
const VIDEO_EXT = ['mp4', 'webm', 'mov', 'ogv'];
const FONT_EXT  = ['woff', 'woff2', 'ttf', 'otf'];

function folderFor(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (IMG_EXT.includes(ext))   return 'img';
  if (AUDIO_EXT.includes(ext)) return 'audio';
  if (VIDEO_EXT.includes(ext)) return 'video';
  if (FONT_EXT.includes(ext))  return 'fonts';
  return 'assets';
}

function sanitize(name) {
  return name
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-_]/g, '')
    .toLowerCase();
}

export function createAssetStore({ onChange } = {}) {
  const map = new Map();           // path → { path, type, size, blob }
  const urlCache = new Map();      // path → string (object URL)

  function fire() { if (onChange) onChange(list()); }

  function uniquePath(base) {
    let p = base, i = 1;
    while (map.has(p)) {
      const dot = base.lastIndexOf('.');
      if (dot > 0) p = base.slice(0, dot) + '-' + i + base.slice(dot);
      else         p = base + '-' + i;
      i++;
    }
    return p;
  }

  async function addFiles(files) {
    const added = [];
    for (const file of Array.from(files || [])) {
      const safe = sanitize(file.name || 'asset');
      const path = uniquePath(`${folderFor(safe)}/${safe}`);
      map.set(path, {
        path,
        type: file.type || 'application/octet-stream',
        size: file.size,
        blob: file,
      });
      added.push(path);
    }
    if (added.length) fire();
    return added;
  }

  function list() {
    return Array.from(map.values()).slice();
  }

  function get(path) {
    return map.get(path) || null;
  }

  function remove(path) {
    if (!map.has(path)) return;
    map.delete(path);
    if (urlCache.has(path)) {
      URL.revokeObjectURL(urlCache.get(path));
      urlCache.delete(path);
    }
    fire();
  }

  function urlFor(path) {
    if (urlCache.has(path)) return urlCache.get(path);
    const a = map.get(path);
    if (!a) return null;
    const url = URL.createObjectURL(a.blob);
    urlCache.set(path, url);
    return url;
  }

  function cleanup() {
    urlCache.forEach(u => URL.revokeObjectURL(u));
    urlCache.clear();
  }

  return { addFiles, list, get, remove, urlFor, cleanup };
}

// reescribir referencias src=, href= en HTML hacia Object URLs.
// usado para el preview en vivo. NO se usa en el export.
export function rewriteRefsToBlobs(html, store) {
  return html.replace(
    /\b(src|href|data-src)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>"']+))/gi,
    (full, attr, dq, sq, bare) => {
      const v = dq ?? sq ?? bare ?? '';
      // omitir absolutas o data:
      if (/^(?:https?:|data:|blob:|mailto:|tel:|#|\/\/)/i.test(v)) return full;
      if (!v) return full;
      // probar varias normalizaciones de path
      const candidates = [v, v.replace(/^\.\//, ''), v.replace(/^\//, '')];
      for (const cand of candidates) {
        if (store.get(cand)) {
          return `${attr}="${store.urlFor(cand)}"`;
        }
      }
      return full;
    }
  );
}
