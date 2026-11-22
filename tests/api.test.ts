import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import type { Server } from 'node:http';

let server: Server;
let base = '';

beforeAll(async () => {
  process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-test-'));
  process.env.AI_PROVIDER = 'mock';
  process.env.MOCK_AI_DELAY_MS = '0';
  const { createApp } = await import('../server/index.ts');
  const { ensureDemoBalance } = await import('../server/ai/service.ts');
  ensureDemoBalance();
  server = createApp().listen(0);
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(() => server.close());

const j = (method: string, url: string, body?: unknown) =>
  fetch(base + url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });

describe('项目接口', () => {
  it('创建、读取、保存、冲突检测', async () => {
    const r = await j('POST', '/api/projects', { name: '测试', level: 'full', templateId: 'classic' });
    expect(r.status).toBe(201);
    const p = await r.json();
    expect(p.level).toBe('full');
    const s = await j('PUT', `/api/projects/${p.id}`, { project: { ...p, name: '改名' }, baseUpdatedAt: p.updatedAt });
    expect(s.status).toBe(200);
    const stale = await j('PUT', `/api/projects/${p.id}`, { project: p, baseUpdatedAt: p.updatedAt });
    expect(stale.status).toBe(409);
    expect((await (await j('GET', `/api/projects/${p.id}`)).json()).name).toBe('改名');
  });
  it('拒绝空名称与非法 ID', async () => {
    expect((await j('POST', '/api/projects', { name: ' ', level: 'normal', templateId: 'classic' })).status).toBe(400);
    expect((await j('GET', '/api/projects/..%2F..%2Fetc')).status).toBe(400);
  });
});

describe('素材接口', () => {
  it('上传 PNG 读取真实像素尺寸', async () => {
    // 1×1 透明 PNG
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    const r = await fetch(base + '/api/assets', { method: 'POST', headers: { 'Content-Type': 'image/png', 'X-Filename': 'a.png' }, body: png });
    expect(r.status).toBe(201);
    const a = await r.json();
    expect([a.width, a.height]).toEqual([1, 1]);
    expect((await fetch(base + a.url)).status).toBe(200);
  });
  it('拒绝非图片', async () => {
    const r = await fetch(base + '/api/assets', { method: 'POST', headers: { 'Content-Type': 'text/html' }, body: '<script>' });
    expect(r.status).toBe(415);
  });
});

describe('AI 网关（演示）', () => {
  it('先估价，再预留并结算；幂等键防止重复扣费', async () => {
    const before = (await (await j('GET', '/api/ai/account')).json()).balance;
    const est = await (await j('POST', '/api/ai/estimate', { kind: 'banner', width: 1020, height: 300, count: 2 })).json();
    expect(est.total).toBeGreaterThan(0);
    const req = { projectId: 'x', kind: 'banner', slot: 'banner.general', prompt: '测试', width: 1020, height: 300, count: 2, idempotencyKey: 'k-1' };
    const r1 = await (await j('POST', '/api/ai/jobs', req)).json();
    expect(r1.job.status).toBe('succeeded');
    expect(r1.assets).toHaveLength(2);
    expect(r1.assets[0].width).toBe(1020);
    await j('POST', '/api/ai/jobs', req); // 重复提交
    const after = (await (await j('GET', '/api/ai/account')).json()).balance;
    expect(after).toBe(before - est.total);
  });
  it('余额不足返回 402 且不扣费', async () => {
    const req = (k: string) => ({ projectId: 'x', kind: 'banner', slot: 's', prompt: 'p', width: 10, height: 10, count: 4, idempotencyKey: k });
    let status = 201;
    for (let i = 0; i < 20 && status === 201; i++) status = (await j('POST', '/api/ai/jobs', req(`drain-${i}`))).status;
    expect(status).toBe(402);
    const bal = (await (await j('GET', '/api/ai/account')).json()).balance;
    expect(bal).toBeGreaterThanOrEqual(0);
    expect(bal).toBeLessThan(8);
  });
});
