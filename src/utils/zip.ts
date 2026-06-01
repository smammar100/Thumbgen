/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const SIG_LOCAL = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
const SIG_CD = new Uint8Array([0x50, 0x4b, 0x01, 0x02]);
const SIG_EOCD = new Uint8Array([0x50, 0x4b, 0x05, 0x06]);
const TEXT_ENC = new TextEncoder();

const CRC32_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    t[i] = c;
  }
  return t;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC32_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function u16(v: number): Uint8Array {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, v, true);
  return b;
}

function u32(v: number): Uint8Array {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, v, true);
  return b;
}

function concat(...chunks: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const c of chunks) {
    total += c.length;
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

function buildLocalEntry(
  nameBytes: Uint8Array,
  raw: Uint8Array,
  crc: number,
  tBytes: Uint8Array,
  dBytes: Uint8Array
): Uint8Array {
  return concat(
    SIG_LOCAL,
    u16(20),
    u16(0),
    u16(0),
    tBytes,
    dBytes,
    u32(crc),
    u32(raw.length),
    u32(raw.length),
    u16(nameBytes.length),
    u16(0),
    nameBytes,
    raw
  );
}

function buildCDEntry(
  nameBytes: Uint8Array,
  crc: number,
  rawLen: number,
  tBytes: Uint8Array,
  dBytes: Uint8Array,
  offset: number
): Uint8Array {
  return concat(
    SIG_CD,
    u16(20),
    u16(20),
    u16(0),
    u16(0),
    tBytes,
    dBytes,
    u32(crc),
    u32(rawLen),
    u32(rawLen),
    u16(nameBytes.length),
    u16(0),
    u16(0),
    u16(0),
    u16(0),
    u32(0),
    u32(offset),
    nameBytes
  );
}

export interface ZipEntry {
  name: string;
  blob: Blob;
}

export async function buildZip(entries: ZipEntry[]): Promise<Blob> {
  const now = new Date();
  const tBytes = u16(
    (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)
  );
  const dBytes = u16(
    ((now.getFullYear() - 1980) << 9) |
      ((now.getMonth() + 1) << 5) |
      now.getDate()
  );
  
  const locals: {
    local: Uint8Array;
    nameBytes: Uint8Array;
    crc: number;
    len: number;
    tBytes: Uint8Array;
    dBytes: Uint8Array;
    offset: number;
  }[] = [];

  let offset = 0;

  for (const { name, blob } of entries) {
    const nameBytes = TEXT_ENC.encode(name);
    const raw = new Uint8Array(await blob.arrayBuffer());
    const crc = crc32(raw);
    const local = buildLocalEntry(nameBytes, raw, crc, tBytes, dBytes);
    locals.push({
      local,
      nameBytes,
      crc,
      len: raw.length,
      tBytes,
      dBytes,
      offset,
    });
    offset += local.length;
  }

  const cdStart = offset;
  const cdParts = locals.map(
    ({ nameBytes, crc, len, tBytes, dBytes, offset: off }) =>
      buildCDEntry(nameBytes, crc, len, tBytes, dBytes, off)
  );

  const cd = concat(...cdParts);
  const eocd = concat(
    SIG_EOCD,
    u16(0), // number of this disk
    u16(0), // disk where CD starts
    u16(locals.length), // number of CD records on this disk
    u16(locals.length), // total number of CD records
    u32(cd.length), // size of CD
    u32(cdStart), // offset of CD start
    u16(0) // comment length
  );

  const finalChunks = [...locals.map((l) => l.local), cd, eocd];
  return new Blob([concat(...finalChunks)], {
    type: "application/zip",
  });
}
