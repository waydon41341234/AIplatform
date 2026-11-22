/**
 * 演示网关：按目标尺寸生成占位 SVG，不调用任何外部模型，不产生真实费用。
 * 价格为演示值，界面会明确显示“演示”。
 */
import { randomUUID } from 'node:crypto';
import type { AiGenerateRequest } from '../../shared/ai/contract.ts';
import type { AiProvider } from './provider.ts';

const HUES = [210, 260, 330, 20, 140, 190];

function placeholderSvg(req: AiGenerateRequest, i: number): string {
  const h = HUES[(req.prompt.length + i) % HUES.length];
  const { width: w, height: hgt } = req;
  const label = req.prompt.slice(0, 16).replace(/[<>&"']/g, '') || '演示图';
  const fs = Math.max(12, Math.round(Math.min(w, hgt) / 7));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hgt}" viewBox="0 0 ${w} ${hgt}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},80%,58%)"/><stop offset="1" stop-color="hsl(${(h + 50) % 360},75%,42%)"/></linearGradient></defs>
<rect width="${w}" height="${hgt}" fill="url(#g)"/>
<circle cx="${w * 0.78}" cy="${hgt * 0.3}" r="${Math.min(w, hgt) * 0.28}" fill="#fff" fill-opacity="0.15"/>
<text x="${w / 2}" y="${hgt / 2}" font-size="${fs}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="sans-serif">${label}</text>
<text x="${w / 2}" y="${hgt / 2 + fs * 1.2}" font-size="${Math.round(fs * 0.45)}" text-anchor="middle" fill="#fff" fill-opacity="0.8" font-family="sans-serif">演示候选 ${i + 1} · ${w}×${hgt}</text>
</svg>`;
}

export const mockProvider: AiProvider = {
  name: '演示网关（无真实费用）',
  mock: true,
  currency: '点',
  priceVersion: 'mock-2026-11',
  unitPrice: (req) => (req.kind === 'banner' || req.kind === 'background' ? 2 : 1),
  async generate(req) {
    await new Promise((r) => setTimeout(r, Number(process.env.MOCK_AI_DELAY_MS ?? 600)));
    return {
      upstreamId: 'mock-' + randomUUID(),
      cost: this.unitPrice(req) * req.count,
      images: Array.from({ length: req.count }, (_, i) => ({
        mime: 'image/svg+xml',
        data: Buffer.from(placeholderSvg(req, i)),
        width: req.width,
        height: req.height,
      })),
    };
  },
};
