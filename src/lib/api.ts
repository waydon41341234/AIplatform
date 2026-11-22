/** 后端接口客户端。接口契约见 docs/api.md。 */
import type { Asset, NewProjectInput, Project } from '../../shared/project/model.ts';
import type { AiAccount, AiEstimate, AiGenerateRequest, AiJob, LedgerEntry } from '../../shared/ai/contract.ts';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function req<T>(method: string, url: string, body?: unknown, headers: Record<string, string> = {}): Promise<T> {
  const isRaw = body instanceof Blob;
  const res = await fetch(url, {
    method,
    headers: isRaw ? headers : { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : isRaw ? body : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? `请求失败（${res.status}）`);
  return data as T;
}

export interface ProjectSummary { id: string; name: string; level: Project['level']; templateId: string; updatedAt: string; primary: string }

export const api = {
  listProjects: () => req<ProjectSummary[]>('GET', '/api/projects'),
  getProject: (id: string) => req<Project>('GET', `/api/projects/${id}`),
  createProject: (input: NewProjectInput) => req<Project>('POST', '/api/projects', input),
  saveProject: (project: Project, baseUpdatedAt?: string) => req<{ updatedAt: string }>('PUT', `/api/projects/${project.id}`, { project, baseUpdatedAt }),
  duplicateProject: (id: string) => req<Project>('POST', `/api/projects/${id}/duplicate`),
  uploadAsset: (file: Blob, name: string) => req<Asset>('POST', '/api/assets', file, { 'Content-Type': file.type, 'X-Filename': encodeURIComponent(name) }),
  aiAccount: () => req<AiAccount>('GET', '/api/ai/account'),
  aiEstimate: (r: Pick<AiGenerateRequest, 'kind' | 'width' | 'height' | 'count'>) => req<AiEstimate>('POST', '/api/ai/estimate', r),
  aiGenerate: (r: AiGenerateRequest) => req<{ job: AiJob; assets: Asset[] }>('POST', '/api/ai/jobs', r),
  aiLedger: () => req<LedgerEntry[]>('GET', '/api/ai/ledger'),
};
