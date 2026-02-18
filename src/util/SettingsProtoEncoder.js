function writeVarint(buf, n) {
  if (typeof n === 'bigint') {
    while (n > 0x7fn) {
      buf.push(Number((n & 0x7fn) | 0x80n));
      n >>= 7n;
    }
    buf.push(Number(n));
    return;
  }
  if (n < 0) n = 0;
  let lo = n >>> 0;
  let hi = Math.floor(n / 0x100000000) >>> 0;
  while (hi > 0 || lo > 0x7f) {
    buf.push((lo & 0x7f) | 0x80);
    lo = ((lo >>> 7) | (hi << 25)) >>> 0;
    hi >>>= 7;
  }
  buf.push(lo);
}

function writeTag(buf, fieldNum, wireType) {
  writeVarint(buf, (fieldNum << 3) | wireType);
}

function writeLengthDelimited(buf, bytes) {
  writeVarint(buf, bytes.length);
  for (let i = 0; i < bytes.length; i++) buf.push(bytes[i]);
}

function encodeUtf8(str) {
  if (typeof str !== 'string' || str.length === 0) return [];
  const arr = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) arr.push(c);
    else if (c < 0x800) {
      arr.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      arr.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      const c2 = str.charCodeAt(++i);
      c = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      arr.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return arr;
}

/**
 * Encodes status + custom_status into the PreloadedUserSettings proto (type 1), then into base64.
 * @param {string} status - "online" | "idle" | "dnd" | "invisible"
 * @param {object} customStatus - { text?: string, emoji?: { id?: string|null, name?: string } }
 * @returns {string} base64
 */
function encodePreloadedUserSettingsProto(status, customStatus) {
  const buf = [];
  const statusValue = typeof status === 'string' && status ? status : 'online';
  const text = (customStatus && customStatus.state) ? String(customStatus.state) : '';
  const emoji = customStatus && customStatus.emoji ? customStatus.emoji : null;
  const emojiName = emoji ? (emoji.name || '') : '';
  const emojiId = emoji && emoji.id ? emoji.id : null;

  const customParts = [];
  if (text.length > 0) {
    const textBytes = encodeUtf8(text);
    customParts.push(0x0a);
    writeVarint(customParts, textBytes.length);
    customParts.push(...textBytes);
  }
  if (emojiName.length > 0) {
    const nameBytes = encodeUtf8(emojiName);
    customParts.push(0x12);
    writeVarint(customParts, nameBytes.length);
    customParts.push(...nameBytes);
  }
  if (emojiId != null && emojiId !== '') {
    const id = BigInt(emojiId);
    customParts.push(0x18);
    writeVarint(customParts, id);
  }

  const statusBlock = [];
  const valueBytes = encodeUtf8(statusValue);
  statusBlock.push(0x0a);
  writeVarint(statusBlock, valueBytes.length);
  statusBlock.push(...valueBytes);
  if (customParts.length > 0) {
    statusBlock.push(0x12);
    writeVarint(statusBlock, customParts.length);
    statusBlock.push(...customParts);
  }

  buf.push(0x2a);
  writeVarint(buf, statusBlock.length);
  buf.push(...statusBlock);

  const uint8 = new Uint8Array(buf);
  const b64 = typeof Buffer !== 'undefined'
    ? Buffer.from(uint8).toString('base64')
    : btoa(String.fromCharCode.apply(null, uint8));
  return b64;
}

module.exports = { encodePreloadedUserSettingsProto };
