/** 把整页 SVG 裁成某个区域（布局缩略图用）。 */
import type { Box } from '../../shared/render/layout.ts';

export function cropSvg(svg: string, b: Box, pad = 10): string {
  const vb = `${b.x - pad} ${b.y - pad} ${b.w + pad * 2} ${b.h + pad * 2}`;
  return svg.replace(/<svg([^>]*?) width="\d+" height="\d+" viewBox="[^"]*"/, `<svg$1 width="${b.w + pad * 2}" height="${b.h + pad * 2}" viewBox="${vb}"`);
}
