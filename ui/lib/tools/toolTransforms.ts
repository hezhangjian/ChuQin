const encoder = new TextEncoder();
const decoder = new TextDecoder();

function rotateLeft(value: number, shift: number) {
  return (value << shift) | (value >>> (32 - shift));
}

function add32(...values: number[]) {
  return values.reduce((sum, value) => (sum + value) >>> 0, 0);
}

export function md5(input: string) {
  const bytes = Array.from(encoder.encode(input));
  const bitLength = bytes.length * 8;
  bytes.push(0x80);

  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }

  for (let index = 0; index < 8; index += 1) {
    bytes.push(Math.floor(bitLength / 2 ** (8 * index)) & 0xff);
  }

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const shifts = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
    21,
  ];
  const constants = Array.from({length: 64}, (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32));

  for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += 64) {
    const words = Array.from({length: 16}, (_, index) => {
      const offset = chunkStart + index * 4;
      return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
    });

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let index = 0; index < 64; index += 1) {
      let f: number;
      let g: number;

      if (index < 16) {
        f = (b & c) | (~b & d);
        g = index;
      } else if (index < 32) {
        f = (d & b) | (~d & c);
        g = (5 * index + 1) % 16;
      } else if (index < 48) {
        f = b ^ c ^ d;
        g = (3 * index + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * index) % 16;
      }

      const nextD = d;
      d = c;
      c = b;
      b = add32(b, rotateLeft(add32(a, f, constants[index], words[g]), shifts[index]));
      a = nextD;
    }

    a0 = add32(a0, a);
    b0 = add32(b0, b);
    c0 = add32(c0, c);
    d0 = add32(d0, d);
  }

  return [a0, b0, c0, d0]
    .flatMap((word) => [word & 0xff, (word >>> 8) & 0xff, (word >>> 16) & 0xff, (word >>> 24) & 0xff])
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function bytesToHex(input: string) {
  return Array.from(encoder.encode(input))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ');
}

export function hexToText(input: string) {
  const normalized = input.replace(/(?:0x|[\s,_-])/gi, '');

  if (normalized.length % 2 !== 0 || /[^0-9a-f]/i.test(normalized)) {
    throw new Error('请输入有效的偶数字节 HEX。');
  }

  const bytes = new Uint8Array(normalized.match(/.{2}/g)?.map((chunk) => Number.parseInt(chunk, 16)) ?? []);
  return decoder.decode(bytes);
}

export function timestampToDate(input: string) {
  const value = Number(input.trim());

  if (!Number.isFinite(value)) {
    throw new Error('请输入有效时间戳。');
  }

  const milliseconds = Math.abs(value) < 10_000_000_000 ? value * 1000 : value;
  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    throw new Error('时间戳超出有效范围。');
  }

  return `${date.toLocaleString()}\n${date.toISOString()}`;
}

export function dateToTimestamp(input: string) {
  const date = new Date(input.trim());

  if (Number.isNaN(date.getTime())) {
    throw new Error('请输入有效日期。');
  }

  return [`秒: ${Math.floor(date.getTime() / 1000)}`, `毫秒: ${date.getTime()}`].join('\n');
}
