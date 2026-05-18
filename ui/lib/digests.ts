export type DigestAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

const md5ShiftAmounts = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4,
  11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

const md5Constants = Array.from({length: 64}, (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32));

function rotateLeft(value: number, amount: number) {
  return (value << amount) | (value >>> (32 - amount));
}

function toHex(value: number) {
  return value.toString(16).padStart(2, '0');
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, toHex).join('');
}

function wordToLittleEndianHex(word: number) {
  return [word, word >>> 8, word >>> 16, word >>> 24].map((byte) => toHex(byte & 0xff)).join('');
}

function createMd5Bytes(bytes: Uint8Array) {
  const bitLength = bytes.length * 8;
  const paddedLength = (((bytes.length + 8) >> 6) + 1) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, bitLength >>> 0, true);
  view.setUint32(paddedLength - 4, Math.floor(bitLength / 2 ** 32), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < paddedLength; offset += 64) {
    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i += 1) {
      let f: number;
      let g: number;

      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      const nextD = c;
      const blockValue = view.getUint32(offset + g * 4, true);
      const sum = (a + f + md5Constants[i] + blockValue) >>> 0;
      c = b;
      b = (b + rotateLeft(sum, md5ShiftAmounts[i])) >>> 0;
      a = d;
      d = nextD;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  return [a0, b0, c0, d0].map(wordToLittleEndianHex).join('');
}

export async function calculateDigest(input: string, algorithm: DigestAlgorithm) {
  const bytes = new TextEncoder().encode(input);

  if (algorithm === 'MD5') {
    return createMd5Bytes(bytes);
  }

  const buffer = await crypto.subtle.digest(algorithm, bytes);
  return bytesToHex(new Uint8Array(buffer));
}

export async function calculateDigests(input: string, algorithms: DigestAlgorithm[]) {
  return Promise.all(
    algorithms.map(async (algorithm) => ({
      algorithm,
      value: await calculateDigest(input, algorithm),
    }))
  );
}
