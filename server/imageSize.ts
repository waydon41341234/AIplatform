/** 读取 PNG / GIF / JPEG / SVG 的像素尺寸（不依赖第三方库）。 */
export function imageSize(buf: Buffer, mime: string): { width: number; height: number } | null {
  if (mime === 'image/png' && buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (mime === 'image/gif' && buf.toString('ascii', 0, 3) === 'GIF') {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  if (mime === 'image/jpeg') {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
      }
      i += 2 + len;
    }
    return null;
  }
  if (mime === 'image/svg+xml') {
    const s = buf.toString('utf8', 0, Math.min(buf.length, 4000));
    const tag = /<svg\b[^>]*>/i.exec(s)?.[0] ?? '';
    const num = (attr: string) => {
      const m = new RegExp(`\\s${attr}="([\\d.]+)(px)?"`).exec(tag);
      return m ? Math.round(parseFloat(m[1])) : undefined;
    };
    let w = num('width');
    let h = num('height');
    const vb = /viewBox="([\d.\s-]+)"/.exec(tag)?.[1].trim().split(/\s+/).map(Number);
    if ((!w || !h) && vb?.length === 4) { w = Math.round(vb[2]); h = Math.round(vb[3]); }
    return w && h ? { width: w, height: h } : null;
  }
  return null;
}
