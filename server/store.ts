/**
 * 文件存储（参考实现）：项目 JSON、素材文件、AI 账本都写在 DATA_DIR 下。
 * 正式上线需替换为数据库 + 对象存储，并按业主隔离访问（见 docs/architecture.md）。
 * 写入采用“临时文件 + rename”，避免进程中断留下半个文件。
 */
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Project } from '../shared/project/model.ts';
import { migrate } from '../shared/project/model.ts';
import type { AiJob, LedgerEntry } from '../shared/ai/contract.ts';

export const DATA_DIR = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), 'data'));
const PROJECTS = path.join(DATA_DIR, 'projects');
export const ASSETS = path.join(DATA_DIR, 'assets');
const LEDGER = path.join(DATA_DIR, 'ledger.jsonl');
const JOBS = path.join(DATA_DIR, 'jobs');

for (const d of [PROJECTS, ASSETS, JOBS]) fs.mkdirSync(d, { recursive: true });

const safeId = (id: string) => {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) throw Object.assign(new Error('非法 ID'), { status: 400 });
  return id;
};

function writeAtomic(file: string, data: string | Buffer) {
  const tmp = `${file}.${randomUUID()}.tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, file);
}

export const projects = {
  list(): Project[] {
    return fs
      .readdirSync(PROJECTS)
      .filter((f) => f.endsWith('.json'))
      .map((f) => migrate(JSON.parse(fs.readFileSync(path.join(PROJECTS, f), 'utf8'))))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  get(id: string): Project | null {
    const f = path.join(PROJECTS, safeId(id) + '.json');
    return fs.existsSync(f) ? migrate(JSON.parse(fs.readFileSync(f, 'utf8'))) : null;
  },
  save(p: Project) {
    writeAtomic(path.join(PROJECTS, safeId(p.id) + '.json'), JSON.stringify(p, null, 2));
  },
};

const EXT: Record<string, string> = { 'image/png': 'png', 'image/gif': 'gif', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg', 'image/webp': 'webp' };
export const ALLOWED_MIME = Object.keys(EXT);

export function saveAssetFile(data: Buffer, mime: string): string {
  const file = `${randomUUID()}.${EXT[mime]}`;
  writeAtomic(path.join(ASSETS, file), data);
  return file;
}

export const ledger = {
  all(): LedgerEntry[] {
    if (!fs.existsSync(LEDGER)) return [];
    return fs.readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  },
  /** 只追加流水，余额由流水计算，不能直接改余额。 */
  append(e: Omit<LedgerEntry, 'id' | 'at'>): LedgerEntry {
    const entry: LedgerEntry = { ...e, id: randomUUID(), at: new Date().toISOString() };
    fs.appendFileSync(LEDGER, JSON.stringify(entry) + '\n');
    return entry;
  },
  balance(): number {
    // 流水：topup +，reserve −上限，release +上限，charge −实际费用
    return +this.all().reduce((s, e) => s + e.amount, 0).toFixed(4);
  },
};

export const jobs = {
  get(id: string): AiJob | null {
    const f = path.join(JOBS, safeId(id) + '.json');
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  },
  save(j: AiJob) {
    writeAtomic(path.join(JOBS, safeId(j.id) + '.json'), JSON.stringify(j, null, 2));
  },
};
