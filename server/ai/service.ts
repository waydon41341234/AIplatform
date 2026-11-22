/**
 * AI 任务服务：估价 → 原子预留 → 调用供应商 → 保存候选素材 → 结算。
 * 单进程参考实现：Node 单线程下同步段即原子。多实例部署需改为数据库事务（见 docs/ai-gateway.md）。
 */
import { randomUUID } from 'node:crypto';
import type { AiEstimate, AiGenerateRequest, AiJob } from '../../shared/ai/contract.ts';
import type { Asset } from '../../shared/project/model.ts';
import { jobs, ledger, saveAssetFile } from '../store.ts';
import { currentProvider } from './index.ts';

export const MAX_BATCH = 4;
const idem = new Map<string, string>();

/** 首次启动给演示账户充值，方便试用。真实网关下不会自动充值。 */
export function ensureDemoBalance() {
  const p = currentProvider();
  if (p.mock && ledger.all().length === 0) ledger.append({ type: 'topup', amount: 100, note: '演示额度' });
}

export function estimate(req: Pick<AiGenerateRequest, 'kind' | 'width' | 'height' | 'count'>): AiEstimate {
  const p = currentProvider();
  const unit = p.unitPrice(req);
  const count = Math.min(Math.max(1, Math.floor(req.count)), MAX_BATCH);
  const total = unit * count;
  const balance = ledger.balance();
  return { currency: p.currency, unitPrice: unit, count, total, reserve: total, balance, enough: balance >= total, priceVersion: p.priceVersion };
}

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function submit(req: AiGenerateRequest): Promise<{ job: AiJob; assets: Asset[] }> {
  if (!req.idempotencyKey) throw new HttpError(400, '缺少 idempotencyKey');
  const existing = idem.get(req.idempotencyKey);
  if (existing) {
    const j = jobs.get(existing);
    if (j) return { job: j, assets: [] };
  }
  const est = estimate(req);
  // —— 同步段：检查余额并预留 ——
  if (!est.enough) throw new HttpError(402, `余额不足：需要 ${est.total}${est.currency}，当前 ${est.balance}${est.currency}`);
  const job: AiJob = {
    id: randomUUID(),
    projectId: req.projectId,
    slot: req.slot,
    status: 'running',
    request: { projectId: req.projectId, kind: req.kind, slot: req.slot, prompt: req.prompt, width: req.width, height: req.height, count: est.count },
    estimate: est,
    charged: 0,
    createdAt: new Date().toISOString(),
    assetIds: [],
  };
  idem.set(req.idempotencyKey, job.id);
  ledger.append({ type: 'reserve', amount: -est.reserve, jobId: job.id, note: '生成前预留' });
  jobs.save(job);
  // —— 异步段 ——
  const provider = currentProvider();
  const assets: Asset[] = [];
  try {
    const res = await provider.generate({ ...req, count: est.count });
    job.upstreamId = res.upstreamId;
    for (const img of res.images) {
      const file = saveAssetFile(img.data, img.mime);
      const a: Asset = { id: randomUUID(), name: `AI-${req.slot}`, url: `/api/assets/${file}`, mime: img.mime, width: img.width, height: img.height, source: 'ai', createdAt: new Date().toISOString(), jobId: job.id };
      assets.push(a);
      job.assetIds.push(a.id);
    }
    ledger.append({ type: 'release', amount: est.reserve, jobId: job.id, note: '释放预留' });
    if (res.cost === undefined) {
      // 上游未返回费用：保留预留，标记待核对，避免直接重试重复收费
      ledger.append({ type: 'reserve', amount: -est.reserve, jobId: job.id, note: '费用待核对，继续预留' });
      job.status = 'needs-review';
    } else {
      ledger.append({ type: 'charge', amount: -res.cost, jobId: job.id, note: `实际扣费（${provider.priceVersion}）` });
      job.charged = res.cost;
      job.status = 'succeeded';
    }
  } catch (e) {
    // 首版假定失败不收费；真实网关需按上游是否计费决定（方案「失败与重试」）
    ledger.append({ type: 'release', amount: est.reserve, jobId: job.id, note: '生成失败，退回预留' });
    job.status = 'failed';
    job.error = (e as Error).message;
  }
  job.finishedAt = new Date().toISOString();
  jobs.save(job);
  return { job, assets };
}
