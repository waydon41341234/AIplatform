/**
 * 平台后端（参考实现）。端口 4400，接口说明见 docs/api.md。
 * 生产环境（NODE_ENV=production）同时托管 dist/ 前端。
 */
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createProject, type Asset, type NewProjectInput, type Project } from '../shared/project/model.ts';
import { LEVELS } from '../shared/catalog/levels.ts';
import { ALLOWED_MIME, ASSETS, ledger, projects, saveAssetFile } from './store.ts';
import { imageSize } from './imageSize.ts';
import { currentProvider } from './ai/index.ts';
import { HttpError, ensureDemoBalance, estimate, submit } from './ai/service.ts';
import type { AiGenerateRequest } from '../shared/ai/contract.ts';

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  const wrap = (fn: (req: Request, res: Response) => unknown) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

  // ---------- 项目 ----------
  app.get('/api/projects', wrap((_req, res) => {
    res.json(projects.list().map((p) => ({ id: p.id, name: p.name, level: p.level, templateId: p.templateId, updatedAt: p.updatedAt, primary: p.theme.base.primary })));
  }));

  app.post('/api/projects', wrap((req, res) => {
    const body = req.body as NewProjectInput;
    if (!body?.name?.trim()) throw new HttpError(400, '请填写品牌名称');
    if (!LEVELS[body.level]) throw new HttpError(400, '请选择定制等级');
    const p = createProject({ ...body, name: body.name.trim().slice(0, 40) }, randomUUID().replace(/-/g, '').slice(0, 16));
    projects.save(p);
    res.status(201).json(p);
  }));

  app.get('/api/projects/:id', wrap((req, res) => {
    const p = projects.get(req.params.id);
    if (!p) throw new HttpError(404, '项目不存在');
    res.json(p);
  }));

  /** 保存整份项目。带 baseUpdatedAt 时做冲突检查（多标签页同时编辑）。 */
  app.put('/api/projects/:id', wrap((req, res) => {
    const cur = projects.get(req.params.id);
    if (!cur) throw new HttpError(404, '项目不存在');
    const { project, baseUpdatedAt } = req.body as { project: Project; baseUpdatedAt?: string };
    if (!project || project.id !== cur.id) throw new HttpError(400, '项目 ID 不匹配');
    if (baseUpdatedAt && baseUpdatedAt !== cur.updatedAt) throw new HttpError(409, '项目已在其他窗口修改，请刷新后再编辑');
    const saved = { ...project, updatedAt: new Date().toISOString() };
    projects.save(saved);
    res.json({ updatedAt: saved.updatedAt });
  }));

  app.post('/api/projects/:id/duplicate', wrap((req, res) => {
    const cur = projects.get(req.params.id);
    if (!cur) throw new HttpError(404, '项目不存在');
    const now = new Date().toISOString();
    const copy = { ...cur, id: randomUUID().replace(/-/g, '').slice(0, 16), name: `${cur.name} 副本`, createdAt: now, updatedAt: now };
    projects.save(copy);
    res.status(201).json(copy);
  }));

  // ---------- 素材 ----------
  app.post('/api/assets', express.raw({ type: () => true, limit: '15mb' }), wrap((req, res) => {
    const mime = String(req.headers['content-type'] ?? '').split(';')[0];
    if (!ALLOWED_MIME.includes(mime)) throw new HttpError(415, '只支持 PNG、JPG、GIF、SVG、WEBP 图片');
    const buf = req.body as Buffer;
    const size = imageSize(buf, mime) ?? { width: Number(req.query.w) || 0, height: Number(req.query.h) || 0 };
    if (!size.width || !size.height) throw new HttpError(400, '无法读取图片尺寸');
    const file = saveAssetFile(buf, mime);
    const name = decodeURIComponent(String(req.headers['x-filename'] ?? 'upload')).slice(0, 80);
    const a: Asset = { id: randomUUID(), name, url: `/api/assets/${file}`, mime, width: size.width, height: size.height, source: 'upload', createdAt: new Date().toISOString() };
    res.status(201).json(a);
  }));

  app.get('/api/assets/:file', (req, res) => {
    const f = req.params.file;
    if (!/^[a-f0-9-]+\.(png|gif|jpg|svg|webp)$/.test(f)) return res.status(400).end();
    const full = path.join(ASSETS, f);
    if (!fs.existsSync(full)) return res.status(404).end();
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    if (f.endsWith('.svg')) res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
    res.sendFile(full);
  });

  // ---------- AI 网关 ----------
  app.get('/api/ai/account', (_req, res) => {
    const p = currentProvider();
    res.json({ currency: p.currency, balance: ledger.balance(), mock: p.mock, providerName: p.name });
  });
  app.post('/api/ai/estimate', (req, res) => res.json(estimate(req.body)));
  app.post('/api/ai/jobs', wrap(async (req, res) => res.status(201).json(await submit(req.body as AiGenerateRequest))));
  app.get('/api/ai/ledger', (_req, res) => res.json(ledger.all().reverse()));

  // ---------- 前端（生产） ----------
  const dist = path.resolve('dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err instanceof HttpError ? err.status : err.status ?? 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? '服务暂时出错，请稍后再试' : err.message });
  });
  return app;
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  ensureDemoBalance();
  const port = Number(process.env.PORT ?? 4400);
  createApp().listen(port, '127.0.0.1', () => console.log(`定制设计平台后端 http://127.0.0.1:${port}`));
}
