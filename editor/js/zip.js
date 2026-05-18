// ============================================================================
// editor/js/zip.js — vanilla ZIP (store mode, no compression).
// ============================================================================
//
// API: zipBlob(files) → Promise<Blob>
//   files: [{ path: 'index.html', data: string | Uint8Array }, ...]
//
// limitaciones aceptadas:
// - "store" mode (compression method 0): no comprime. los proyectos retals
//   son texto + tal vez media ya comprimida (webp/mp3), así que el ahorro
//   de deflate sería marginal y nos ahorramos depender de CompressionStream.
// - sin ZIP64, sin AES, sin atributos UNIX. archivos < 4GB, suficiente.
// - los nombres de archivo se codifican en UTF-8 con el bit 11 del general
//   purpose flag (lo soportan los unzippers modernos, incluido el sistema
//   operativo de Mac/Windows/Linux y "Archive Utility").
//
// no exportamos para el output del user: este zip.js vive sólo en el editor.
// ============================================================================

const TEXT_ENC = new TextEncoder();

// CRC-32 table (IEEE 802.3 polynomial), precalculada al cargar el módulo.
const CRC_TABLE = (() => {
  const tbl = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    tbl[n] = c >>> 0;
  }
  return tbl;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function toBytes(data) {
  if (data instanceof Uint8Array) return data;
  if (typeof data === 'string') return TEXT_ENC.encode(data);
  throw new TypeError('zip: data debe ser string o Uint8Array');
}

// DOS time: en zip, dosTime y dosDate son uint16
function dosDateTime(date = new Date()) {
  const t = ((date.getHours() & 0x1f) << 11)
          | ((date.getMinutes() & 0x3f) << 5)
          | (Math.floor(date.getSeconds() / 2) & 0x1f);
  const d = (((date.getFullYear() - 1980) & 0x7f) << 9)
          | (((date.getMonth() + 1) & 0x0f) << 5)
          | (date.getDate() & 0x1f);
  return { time: t, date: d };
}

// helpers de escritura little-endian
function writeU16(view, off, v) { view.setUint16(off, v, true); }
function writeU32(view, off, v) { view.setUint32(off, v >>> 0, true); }

export async function zipBlob(files) {
  const { time, date } = dosDateTime();
  const parts = [];      // Uint8Array[] para el resultado final
  const central = [];    // {nameBytes, crc, size, offset}[] para la central directory
  let offset = 0;

  for (const f of files) {
    const nameBytes = TEXT_ENC.encode(f.path);
    const data = toBytes(f.data);
    const crc = crc32(data);
    const size = data.length;

    // Local File Header (LFH): 30 bytes + filename
    const lfh = new Uint8Array(30 + nameBytes.length);
    const v = new DataView(lfh.buffer);
    writeU32(v, 0,  0x04034b50);     // signature
    writeU16(v, 4,  20);             // version needed
    writeU16(v, 6,  0x0800);         // general purpose: bit 11 (UTF-8 names)
    writeU16(v, 8,  0);              // compression method = 0 (stored)
    writeU16(v, 10, time);
    writeU16(v, 12, date);
    writeU32(v, 14, crc);
    writeU32(v, 18, size);           // compressed size = size (store)
    writeU32(v, 22, size);           // uncompressed size
    writeU16(v, 26, nameBytes.length);
    writeU16(v, 28, 0);              // extra field length
    lfh.set(nameBytes, 30);

    parts.push(lfh, data);
    central.push({ nameBytes, crc, size, offset });
    offset += lfh.length + data.length;
  }

  // Central Directory
  const cdStart = offset;
  let cdSize = 0;
  for (const e of central) {
    const cdh = new Uint8Array(46 + e.nameBytes.length);
    const v = new DataView(cdh.buffer);
    writeU32(v, 0,  0x02014b50);     // central dir signature
    writeU16(v, 4,  20);             // version made by
    writeU16(v, 6,  20);             // version needed
    writeU16(v, 8,  0x0800);         // gp flag (UTF-8)
    writeU16(v, 10, 0);              // compression = stored
    writeU16(v, 12, time);
    writeU16(v, 14, date);
    writeU32(v, 16, e.crc);
    writeU32(v, 20, e.size);
    writeU32(v, 24, e.size);
    writeU16(v, 28, e.nameBytes.length);
    writeU16(v, 30, 0);              // extra
    writeU16(v, 32, 0);              // comment len
    writeU16(v, 34, 0);              // disk start
    writeU16(v, 36, 0);              // internal attrs
    writeU32(v, 38, 0);              // external attrs
    writeU32(v, 42, e.offset);       // offset of LFH
    cdh.set(e.nameBytes, 46);
    parts.push(cdh);
    cdSize += cdh.length;
  }

  // End of Central Directory Record (EOCD)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  writeU32(ev, 0,  0x06054b50);
  writeU16(ev, 4,  0);                // disk
  writeU16(ev, 6,  0);                // disk where CD starts
  writeU16(ev, 8,  central.length);
  writeU16(ev, 10, central.length);
  writeU32(ev, 12, cdSize);
  writeU32(ev, 16, cdStart);
  writeU16(ev, 20, 0);                // comment length
  parts.push(eocd);

  return new Blob(parts, { type: 'application/zip' });
}
